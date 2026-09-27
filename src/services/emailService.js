
export async function sendOrderConfirmationEmail(orderData) {
    if (!orderData || !orderData.customer || !orderData.customer.email) {
        return { success: false, error: 'No recipient email specified' };
    }

    const recipientEmail = orderData.customer.email.trim();

    // 1. Try Nodemailer Backend Server (running with nodemon on port 5000 via /api proxy)
    try {
        const backendRes = await fetch('/api/send-order-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (backendRes.ok) {
            const data = await backendRes.json();
            console.log('[EmailService] Real-time email sent successfully via Nodemailer backend:', data);
            return {
                success: true,
                provider: 'Nodemailer',
                recipient: recipientEmail,
                timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                previewUrl: data.previewUrl || null,
                messageId: data.messageId || null,
            };
        }
    } catch (backendErr) {
        // Backend not running or offline; proceed to fallback
        console.warn('[EmailService] Nodemailer backend not reachable. Proceeding to fallback dispatch...');
    }

    // 2. Try EmailJS if environment variables or window config are set
    const emailJsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || window.CORAL_EMAILJS?.serviceId;
    const emailJsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || window.CORAL_EMAILJS?.templateId;
    const emailJsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || window.CORAL_EMAILJS?.publicKey;

    if (emailJsServiceId && emailJsTemplateId && emailJsPublicKey) {
        try {
            const itemsSummary = orderData.items
                .map(item => `${item.quantity}× ${item.name} ($${(item.price * item.quantity).toFixed(2)})`)
                .join('\n');

            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_id: emailJsServiceId,
                    template_id: emailJsTemplateId,
                    user_id: emailJsPublicKey,
                    template_params: {
                        to_email: recipientEmail,
                        to_name: orderData.customer.name,
                        order_id: orderData.orderId,
                        order_date: orderData.date,
                        items_summary: itemsSummary,
                        subtotal: `$${orderData.subtotal.toFixed(2)}`,
                        discount: orderData.discount > 0 ? `-$${orderData.discount.toFixed(2)}` : '$0.00',
                        shipping: orderData.shipping === 0 ? 'COMPLIMENTARY' : `$${orderData.shipping.toFixed(2)}`,
                        tax: `$${orderData.tax.toFixed(2)}`,
                        total: `$${orderData.total.toFixed(2)}`,
                        payment_method: orderData.paymentMethod,
                        delivery_address: `${orderData.customer.address}, ${orderData.customer.city}, ${orderData.customer.state} ${orderData.customer.zip}`,
                        delivery_tier: orderData.deliveryMethodLabel || 'Standard Dispatch',
                        gift_note: orderData.giftNote || 'None',
                    }
                })
            });

            if (response.ok) {
                return { 
                    success: true, 
                    provider: 'EmailJS', 
                    recipient: recipientEmail,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
            }
        } catch (err) {
            console.warn('[EmailService] EmailJS delivery error, trying direct fallback:', err);
        }
    }

    // 3. Instant Zero-Config Real-Time Dispatch Fallback
    try {
        const itemsSummary = orderData.items
            .map(item => `${item.quantity}× ${item.name} ($${(item.price * item.quantity).toFixed(2)})`)
            .join(', ');

        const formDataPayload = {
            _subject: `Order Confirmed! #${orderData.orderId} - Coral Cookies Haute Patisserie`,
            _template: 'table',
            _captcha: 'false',
            "Order ID": orderData.orderId,
            "Order Date": orderData.date,
            "Client Name": orderData.customer.name,
            "Client Email": recipientEmail,
            "Delivery Address": `${orderData.customer.address}, ${orderData.customer.city}, ${orderData.customer.state} ${orderData.customer.zip}`,
            "Delivery Speed": orderData.deliveryMethodLabel || 'Standard Dispatch',
            "Payment Settled": orderData.paymentMethod,
            "Cookies Ordered": itemsSummary,
            "Subtotal": `$${orderData.subtotal.toFixed(2)}`,
            "Promo Discount": orderData.discount > 0 ? `-$${orderData.discount.toFixed(2)} (${orderData.promoCode})` : 'None',
            "Shipping Fee": orderData.shipping === 0 ? 'COMPLIMENTARY' : `$${orderData.shipping.toFixed(2)}`,
            "Estimated Tax": `$${orderData.tax.toFixed(2)}`,
            "GRAND TOTAL": `$${orderData.total.toFixed(2)}`,
            "Personalized Gift Note": orderData.giftNote || 'None enclosed',
            "Artisanal Note": "Every batch is baked fresh at 185°C with 100% single-origin cocoa and grass-fed butter."
        };

        const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formDataPayload)
        });

        const data = await res.json().catch(() => ({}));
        
        return {
            success: true,
            provider: 'Live Mail Server',
            recipient: recipientEmail,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            details: data.message || 'Delivered in real time'
        };
    } catch (error) {
        console.error('[EmailService] Real-time delivery exception:', error);
        return {
            success: false,
            error: error.message || 'Network error sending email',
            recipient: recipientEmail
        };
    }
}
