import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, 
    ShieldCheck, 
    CreditCard, 
    Truck, 
    Package, 
    Sparkles, 
    ArrowLeft, 
    Download, 
    Mail, 
    FileText, 
    ShoppingBag, 
    ExternalLink, 
    Clock, 
    Tag, 
    AlertCircle, 
    HeartHandshake,
    ChevronRight,
    MapPin,
    Copy,
    Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { usePageTransition } from '../context/TransitionContext';
import Footer from '../components/Footer';
import { cn } from '../lib/utils';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';

// Generate Branded PDF Invoice
const generateInvoicePDF = (orderData) => {
    try {
        const doc = new jsPDF({
            unit: 'mm',
            format: 'a4',
        });

        // Brand Banner Header
        doc.setFillColor(26, 17, 14); // #1a110e
        doc.rect(0, 0, 210, 42, 'F');

        // Brand Name
        doc.setFont('times', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(245, 230, 211); // cream #f5e6d3
        doc.text('CORAL COOKIES', 18, 20);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(212, 140, 69); // caramel #d48c45
        doc.text('HAUTE ARTISANAL PATISSERIE', 18, 26);
        doc.setTextColor(200, 200, 200);
        doc.text('contact@coralcookies.com | www.coralcookies.com', 18, 32);

        // Invoice Header Information
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('OFFICIAL INVOICE', 192, 18, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(212, 140, 69);
        doc.text(`Invoice No: ${orderData.orderId}`, 192, 25, { align: 'right' });
        doc.text(`Date: ${orderData.date}`, 192, 30, { align: 'right' });
        doc.setTextColor(220, 220, 220);
        doc.text(`Payment: ${orderData.paymentMethod}`, 192, 35, { align: 'right' });

        // Bill To & Delivery Address Section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(43, 27, 23);
        doc.text('CUSTOMER DETAILS:', 18, 52);
        doc.text('DELIVERY ADDRESS:', 110, 52);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(70, 70, 70);
        doc.text(orderData.customer.name, 18, 58);
        doc.text(orderData.customer.email, 18, 63);
        doc.text(orderData.customer.phone || 'Phone not provided', 18, 68);

        doc.text(orderData.customer.address, 110, 58);
        doc.text(`${orderData.customer.city}, ${orderData.customer.state} ${orderData.customer.zip}`, 110, 63);
        doc.text(orderData.customer.country || 'United States', 110, 68);

        // Divider
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(18, 76, 192, 76);

        // Items Table Header
        doc.setFillColor(248, 244, 238);
        doc.rect(18, 81, 174, 8, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(43, 27, 23);
        doc.text('COOKIE FLAVOR', 22, 86.5);
        doc.text('CATEGORY', 95, 86.5);
        doc.text('QTY', 135, 86.5, { align: 'center' });
        doc.text('PRICE', 160, 86.5, { align: 'right' });
        doc.text('TOTAL', 188, 86.5, { align: 'right' });

        // Itemized Rows
        let y = 95;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);

        orderData.items.forEach((item, index) => {
            if (index % 2 === 1) {
                doc.setFillColor(252, 250, 246);
                doc.rect(18, y - 4.5, 174, 7.5, 'F');
            }
            doc.setTextColor(40, 40, 40);
            doc.text(item.name, 22, y);
            doc.setTextColor(120, 120, 120);
            doc.text(item.category || 'Artisanal', 95, y);
            doc.setTextColor(40, 40, 40);
            doc.text(String(item.quantity), 135, y, { align: 'center' });
            doc.text(`$${item.price.toFixed(2)}`, 160, y, { align: 'right' });
            doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 188, y, { align: 'right' });
            y += 7.5;
        });

        // Totals Calculation Section
        y += 4;
        doc.setDrawColor(210, 210, 210);
        doc.line(120, y, 192, y);
        y += 6;

        const printSummaryLine = (label, val, isBold = false) => {
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            doc.setFontSize(isBold ? 11 : 9);
            doc.setTextColor(isBold ? 43 : 90, isBold ? 27 : 90, isBold ? 23 : 90);
            doc.text(label, 140, y, { align: 'right' });
            doc.text(val, 188, y, { align: 'right' });
            y += isBold ? 8 : 5.5;
        };

        printSummaryLine('Subtotal:', `$${orderData.subtotal.toFixed(2)}`);
        if (orderData.discount > 0) {
            printSummaryLine(`Promo Discount (${orderData.promoCode}):`, `-$${orderData.discount.toFixed(2)}`);
        }
        printSummaryLine('Shipping & Packaging:', orderData.shipping === 0 ? 'FREE' : `$${orderData.shipping.toFixed(2)}`);
        printSummaryLine('Estimated Tax (5%):', `$${orderData.tax.toFixed(2)}`);

        doc.setDrawColor(212, 140, 69);
        doc.setLineWidth(0.6);
        doc.line(120, y - 1.5, 192, y - 1.5);
        y += 3;
        printSummaryLine('GRAND TOTAL:', `$${orderData.total.toFixed(2)}`, true);

        // Footer Notice & Authenticity Guarantee
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.3);
        doc.line(18, 258, 192, 258);

        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(110, 110, 110);
        doc.text('"Every batch is baked fresh at 185°C with 100% single-origin cocoa and grass-fed butter."', 105, 265, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(140, 140, 140);
        doc.text('Thank you for savoring with Coral Cookies! Questions? Email orders@coralcookies.com', 105, 271, { align: 'center' });
        doc.text(`Order Reference: ${orderData.orderId} • Certified Patisserie Bill & Digital Tax Invoice`, 105, 276, { align: 'center' });

        doc.save(`CoralCookies-Invoice-${orderData.orderId}.pdf`);
    } catch (err) {
        console.error("PDF generation failed:", err);
    }
};

export default function Checkout() {
    const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
    const { switchPage } = usePageTransition();
    const navigate = useNavigate();

    // Form fields
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        zip: '',
        deliveryMethod: 'standard', // 'standard' | 'express' | 'pickup'
        paymentMethod: 'card', // 'card' | 'applepay' | 'cod'
        cardNumber: '',
        cardExp: '',
        cardCvc: '',
        cardName: '',
        giftNote: '',
    });

    const [errors, setErrors] = useState({});
    const [promoCode, setPromoCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [promoError, setPromoError] = useState('');
    const [promoSuccess, setPromoSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Delivery fee calculation
    const shippingFee = formData.deliveryMethod === 'express' ? 4.99 : 0;
    const discountAmount = appliedDiscount > 0 ? (cartTotal * appliedDiscount) : 0;
    const taxAmount = (cartTotal - discountAmount) * 0.05;
    const finalTotal = Math.max(0, cartTotal - discountAmount + shippingFee + taxAmount);

    const handleApplyPromo = () => {
        setPromoError('');
        setPromoSuccess('');
        const code = promoCode.trim().toUpperCase();
        if (code === 'CORAL10' || code === 'SWEET10') {
            setAppliedDiscount(0.10);
            setPromoSuccess('10% off Sweet Confection Discount applied!');
        } else if (code === 'VIP20') {
            setAppliedDiscount(0.20);
            setPromoSuccess('20% VIP Gourmet Discount applied!');
        } else if (!code) {
            setPromoError('Please enter a promo code');
        } else {
            setPromoError('Invalid promo code. Try "CORAL10"');
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name required';
        if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid email required';
        if (!formData.address.trim()) newErrors.address = 'Delivery address required';
        if (!formData.city.trim()) newErrors.city = 'City required';
        if (!formData.zip.trim()) newErrors.zip = 'ZIP code required';

        if (formData.paymentMethod === 'card') {
            if (!formData.cardNumber.trim() || formData.cardNumber.replace(/\s/g, '').length < 15) {
                newErrors.cardNumber = 'Valid 16-digit card required';
            }
            if (!formData.cardExp.trim()) newErrors.cardExp = 'MM/YY required';
            if (!formData.cardCvc.trim() || formData.cardCvc.length < 3) newErrors.cardCvc = 'CVC required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            window.scrollTo({ top: 200, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);

        // Simulate baking/payment authorization latency
        setTimeout(() => {
            const orderId = `CR-${Math.floor(100000 + Math.random() * 900000)}`;
            const dateStr = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const orderDetails = {
                orderId,
                date: dateStr,
                items: [...cart],
                subtotal: cartTotal,
                discount: discountAmount,
                promoCode: appliedDiscount > 0 ? (promoCode || 'PROMO') : null,
                shipping: shippingFee,
                tax: taxAmount,
                total: finalTotal,
                paymentMethod: formData.paymentMethod === 'card' ? 'Credit Card (**** 4242)' : (formData.paymentMethod === 'applepay' ? 'Apple Pay' : 'Cash on Delivery'),
                customer: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone,
                    address: `${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}`,
                    city: formData.city,
                    state: formData.state || 'CA',
                    zip: formData.zip,
                    country: 'United States',
                }
            };

            setCompletedOrder(orderDetails);
            setIsSubmitting(false);

            // Trigger celebration confetti
            confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#d48c45', '#f5e6d3', '#ffffff', '#2b1b17']
            });

            // Auto-generate & download PDF Invoice
            setTimeout(() => {
                generateInvoicePDF(orderDetails);
            }, 800);

            // Empty the cart
            clearCart();
        }, 1800);
    };

    // Format card number with spaces
    const handleCardNumberChange = (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        val = val.replace(/(.{4})/g, '$1 ').trim();
        setFormData({ ...formData, cardNumber: val });
    };

    // Format card expiration
    const handleCardExpChange = (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 2) {
            val = `${val.substring(0, 2)}/${val.substring(2)}`;
        }
        setFormData({ ...formData, cardExp: val });
    };

    // ==============================================================
    // ORDER CONFIRMATION SCREEN
    // ==============================================================
    if (completedOrder) {
        return (
            <div className="min-h-screen bg-chocolate text-cream pt-32 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col selection:bg-caramel selection:text-chocolate">
                <div className="max-w-3xl mx-auto w-full flex-1">
                    {/* Success Header Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-3xl bg-gradient-to-b from-[#241713] to-[#1a110e] border border-caramel/40 p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center mb-8"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-caramel/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="w-20 h-20 mx-auto rounded-full bg-caramel/20 border-2 border-caramel flex items-center justify-center text-caramel mb-6 shadow-lg shadow-caramel/20">
                            <CheckCircle2 size={42} className="animate-bounce" />
                        </div>

                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-caramel/15 border border-caramel/30 text-caramel text-xs font-semibold uppercase tracking-wider mb-3">
                            <Sparkles size={13} /> Order Confirmed & In Oven
                        </span>

                        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-cream mb-3">
                            Thank You, {completedOrder.customer.name.split(' ')[0]}!
                        </h1>
                        <p className="text-cream/70 text-sm sm:text-base max-w-lg mx-auto mb-6 leading-relaxed">
                            Your artisanal cookies are now queued for our next fresh batch bake. An official confirmation email and invoice have been dispatched to:
                        </p>

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-caramel font-semibold text-sm mb-6">
                            <Mail size={16} />
                            <span>{completedOrder.customer.email}</span>
                        </div>

                        {/* Action Buttons: Download PDF and View Email */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => generateInvoicePDF(completedOrder)}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-r from-cookie to-caramel text-chocolate font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-caramel/25 cursor-pointer active:scale-95"
                            >
                                <Download size={16} />
                                <span>Download Invoice Bill (PDF)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowEmailModal(true)}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-cream font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                <Mail size={16} className="text-caramel" />
                                <span>Preview Sent Email Receipt</span>
                            </button>
                        </div>
                    </motion.div>

                    {/* Order Details Breakdown Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-md mb-8"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-3">
                            <div>
                                <span className="text-xs text-cream/40 uppercase tracking-widest block font-bold">Order Number</span>
                                <span className="text-xl font-mono font-bold text-caramel">{completedOrder.orderId}</span>
                            </div>
                            <div className="sm:text-right">
                                <span className="text-xs text-cream/40 uppercase tracking-widest block font-bold">Estimated Delivery</span>
                                <span className="text-sm font-semibold text-cream flex items-center gap-1.5 sm:justify-end">
                                    <Clock size={14} className="text-caramel" />
                                    <span>Today, within 2 - 3 hours (Warm)</span>
                                </span>
                            </div>
                        </div>

                        {/* Items list */}
                        <div className="py-6 space-y-4 border-b border-white/10">
                            <h4 className="text-xs uppercase tracking-widest text-caramel font-bold">Ordered Cookies</h4>
                            {completedOrder.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl p-1 shrink-0 flex items-center justify-center border border-white/5">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <h5 className="font-serif font-bold text-cream text-sm">{item.name}</h5>
                                            <span className="text-xs text-white/40">Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <span className="font-serif font-bold text-caramel text-sm">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Summary Numbers */}
                        <div className="pt-6 space-y-2 text-xs">
                            <div className="flex justify-between text-cream/60">
                                <span>Subtotal</span>
                                <span>${completedOrder.subtotal.toFixed(2)}</span>
                            </div>
                            {completedOrder.discount > 0 && (
                                <div className="flex justify-between text-caramel">
                                    <span>Discount ({completedOrder.promoCode})</span>
                                    <span>-${completedOrder.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-cream/60">
                                <span>Delivery Fee</span>
                                <span>{completedOrder.shipping === 0 ? 'FREE' : `$${completedOrder.shipping.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between text-cream/60">
                                <span>Tax (5%)</span>
                                <span>${completedOrder.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-white/10 text-base">
                                <span className="font-serif font-bold text-cream">Total Paid</span>
                                <span className="text-2xl font-serif font-bold text-caramel">${completedOrder.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Delivery address info */}
                        <div className="mt-6 pt-6 border-t border-white/10 flex items-start gap-3 text-xs text-cream/70">
                            <MapPin size={16} className="text-caramel shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold text-cream block">Shipping To:</span>
                                <span>{completedOrder.customer.address}, {completedOrder.customer.city}, {completedOrder.customer.state} {completedOrder.customer.zip}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Back to Home CTA */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => switchPage('/shop')}
                            className="inline-flex items-center gap-2 text-sm text-caramel hover:underline font-semibold cursor-pointer"
                        >
                            <ArrowLeft size={16} />
                            <span>Return to Cookies Bakery</span>
                        </button>
                    </div>
                </div>

                {/* Email Preview Modal */}
                <AnimatePresence>
                    {showEmailModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#1f1411] border border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto no-scrollbar"
                            >
                                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-caramel/20 flex items-center justify-center text-caramel">
                                            <Mail size={16} />
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-bold text-cream text-base">Customer Email Dispatched</h4>
                                            <span className="text-[11px] text-white/40">From: orders@coralcookies.com</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmailModal(false)}
                                        className="text-white/40 hover:text-white p-2 cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Mock Email Client UI */}
                                <div className="bg-[#140b08] rounded-2xl p-5 border border-white/5 space-y-4 text-xs font-sans">
                                    <div className="space-y-1 pb-3 border-b border-white/10 text-cream/70">
                                        <p><strong className="text-white">To:</strong> {completedOrder.customer.name} &lt;{completedOrder.customer.email}&gt;</p>
                                        <p><strong className="text-white">Subject:</strong> Order Confirmed! #{completedOrder.orderId} — Coral Cookies Artisanal Receipt</p>
                                    </div>

                                    <div className="py-2 space-y-3 text-cream/80 leading-relaxed text-sm">
                                        <p>Dear {completedOrder.customer.name.split(' ')[0]},</p>
                                        <p>
                                            Thank you for choosing Coral Cookies! We have received your order <strong>#{completedOrder.orderId}</strong> and our master bakers have begun preheating the hearth.
                                        </p>

                                        <div className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5">
                                            <p className="font-bold text-caramel uppercase text-xs">Summary Breakdown:</p>
                                            {completedOrder.items.map(item => (
                                                <div key={item.id} className="flex justify-between text-xs">
                                                    <span>{item.quantity}× {item.name}</span>
                                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-cream">
                                                <span>Total:</span>
                                                <span className="text-caramel">${completedOrder.total.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-cream/60">
                                            Your official Tax Invoice Bill PDF has been attached to this email and downloaded automatically.
                                        </p>
                                        <p className="font-serif italic text-caramel">
                                            Warmest regards,<br />
                                            The Coral Cookies Patisserie Team
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                        <span className="text-[10px] text-white/30">Attachment: CoralCookies-Invoice-{completedOrder.orderId}.pdf (48 KB)</span>
                                        <button
                                            type="button"
                                            onClick={() => generateInvoicePDF(completedOrder)}
                                            className="px-3 py-1.5 rounded-lg bg-caramel/20 text-caramel hover:bg-caramel hover:text-chocolate font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <Download size={12} />
                                            <span>Download Attachment</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <Footer />
            </div>
        );
    }

    // ==============================================================
    // EMPTY CART STATE
    // ==============================================================
    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-chocolate text-cream pt-40 pb-24 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-caramel/10 border border-caramel/20 flex items-center justify-center text-caramel mb-6 shadow-xl">
                    <ShoppingBag size={44} />
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-cream mb-3">Your Shopping Bag is Empty</h1>
                <p className="text-cream/60 max-w-md mb-8 text-sm sm:text-base leading-relaxed">
                    Select a few of our freshly baked small-batch cookies before proceeding to checkout.
                </p>
                <button
                    type="button"
                    onClick={() => switchPage('/shop')}
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-cookie to-caramel text-chocolate font-bold text-base hover:brightness-110 transition-all shadow-xl shadow-caramel/25 cursor-pointer"
                >
                    Browse Our Cookie Bakery
                </button>
            </div>
        );
    }

    // ==============================================================
    // MAIN CHECKOUT FORM & ORDER SUMMARY
    // ==============================================================
    return (
        <div className="min-h-screen bg-chocolate text-cream flex flex-col selection:bg-caramel selection:text-chocolate">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-10 left-1/4 w-[600px] h-[500px] bg-radial from-caramel/15 via-cookie/5 to-transparent blur-3xl opacity-50" />
                <div className="absolute top-[50%] right-10 w-[500px] h-[500px] bg-radial from-caramel/10 via-transparent to-transparent blur-3xl opacity-40" />
            </div>

            <div className="relative z-10 flex-1 pt-32 md:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Navigation Back */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => switchPage('/shop')}
                        className="inline-flex items-center gap-2 text-xs text-cream/60 hover:text-caramel transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={14} />
                        <span>Return to Cookies</span>
                    </button>
                </div>

                {/* Page Title & Security Pill */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 mb-8 border-b border-white/10 gap-4">
                    <div>
                        <span className="text-xs uppercase tracking-[0.25em] text-caramel font-bold block mb-1">Secure Ordering</span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-cream">
                            Artisanal <span className="bg-clip-text text-transparent bg-gradient-to-r from-cream via-cookie to-caramel">Checkout</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium self-start sm:self-auto">
                        <ShieldCheck size={16} />
                        <span>256-bit Encrypted Checkout</span>
                    </div>
                </div>

                {/* Grid Layout: Form on Left, Sticky Summary on Right */}
                <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* LEFT COLUMN: Customer & Payment Details */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Section 1: Customer Contact */}
                        <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-caramel/20 flex items-center justify-center text-caramel text-sm font-bold">
                                    1
                                </div>
                                <h2 className="text-xl font-serif font-bold text-cream">Contact Information</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-cream/60 font-semibold mb-1.5">First Name *</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="Jane"
                                        className={cn(
                                            "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm text-cream placeholder-white/20 outline-none transition-all",
                                            errors.firstName ? "border-red-500/80 bg-red-500/5" : "border-white/10 focus:border-caramel"
                                        )}
                                    />
                                    {errors.firstName && <p className="text-red-400 text-[11px] mt-1">{errors.firstName}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-cream/60 font-semibold mb-1.5">Last Name *</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Doe"
                                        className={cn(
                                            "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm text-cream placeholder-white/20 outline-none transition-all",
                                            errors.lastName ? "border-red-500/80 bg-red-500/5" : "border-white/10 focus:border-caramel"
                                        )}
                                    />
                                    {errors.lastName && <p className="text-red-400 text-[11px] mt-1">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-cream/60 font-semibold mb-1.5">Email Address * (For Invoice)</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="jane.doe@example.com"
                                        className={cn(
                                            "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm text-cream placeholder-white/20 outline-none transition-all",
                                            errors.email ? "border-red-500/80 bg-red-500/5" : "border-white/10 focus:border-caramel"
                                        )}
                                    />
                                    {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-cream/60 font-semibold mb-1.5">Phone (SMS Delivery Updates)</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-caramel rounded-xl text-sm text-cream placeholder-white/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Shipping & Delivery Method */}
                        <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-caramel/20 flex items-center justify-center text-caramel text-sm font-bold">
                                    2
                                </div>
                                <h2 className="text-xl font-serif font-bold text-cream">Delivery Address & Method</h2>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-cream/60 font-semibold mb-1.5">Street Address *</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="123 Artisan Bakery Way"
                                        className={cn(
                                            "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm text-cream placeholder-white/20 outline-none transition-all",
                                            errors.address ? "border-red-500/80 bg-red-500/5" : "border-white/10 focus:border-caramel"
                                        )}
                                    />
                                    {errors.address && <p className="text-red-400 text-[11px] mt-1">{errors.address}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="sm:col-span-1">
                                        <label className="block text-xs uppercase tracking-wider text-cream/60 font-semibold mb-1.5">City *</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="San Francisco"
                                            className={cn(
                                                "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm text-cream placeholder-white/20 outline-none transition-all",
                                                errors.city ? "border-red-500/80 bg-red-500/5" : "border-white/10 focus:border-caramel"
                                            )}
                                        />
                                        {errors.city && <p className="text-red-400 text-[11px] mt-1">{errors.city}</p>}
                                    </div>
                                    <div className="sm:col-span-1">
                                        <label className="block text-xs uppercase tracking-wider text-cream/60 font-semibold mb-1.5">State</label>
                                        <input
                                            type="text"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            placeholder="CA"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-caramel rounded-xl text-sm text-cream placeholder-white/20 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <label className="block text-xs uppercase tracking-wider text-cream/60 font-semibold mb-1.5">ZIP Code *</label>
                                        <input
                                            type="text"
                                            value={formData.zip}
                                            onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                            placeholder="94103"
                                            className={cn(
                                                "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm text-cream placeholder-white/20 outline-none transition-all",
                                                errors.zip ? "border-red-500/80 bg-red-500/5" : "border-white/10 focus:border-caramel"
                                            )}
                                        />
                                        {errors.zip && <p className="text-red-400 text-[11px] mt-1">{errors.zip}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Options Selection */}
                            <label className="block text-xs uppercase tracking-wider text-cream/60 font-semibold mb-3">Choose Delivery Speed</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div
                                    onClick={() => setFormData({ ...formData, deliveryMethod: 'standard' })}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between",
                                        formData.deliveryMethod === 'standard'
                                            ? "border-caramel bg-caramel/10 shadow-lg shadow-caramel/10"
                                            : "border-white/10 bg-white/5 hover:border-white/20"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Truck size={18} className="text-caramel" />
                                            <span className="font-semibold text-sm text-cream">Standard Dispatch</span>
                                        </div>
                                        <span className="text-xs font-bold text-caramel uppercase">FREE</span>
                                    </div>
                                    <p className="text-xs text-white/50">Packaged in insulated gold foil boxes (2-3 days)</p>
                                </div>

                                <div
                                    onClick={() => setFormData({ ...formData, deliveryMethod: 'express' })}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between",
                                        formData.deliveryMethod === 'express'
                                            ? "border-caramel bg-caramel/10 shadow-lg shadow-caramel/10"
                                            : "border-white/10 bg-white/5 hover:border-white/20"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={18} className="text-caramel" />
                                            <span className="font-semibold text-sm text-cream">Warm Oven Express</span>
                                        </div>
                                        <span className="text-xs font-bold text-caramel">$4.99</span>
                                    </div>
                                    <p className="text-xs text-white/50">Same-day courier directly from oven to doorstep</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Payment Method */}
                        <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-caramel/20 flex items-center justify-center text-caramel text-sm font-bold">
                                    3
                                </div>
                                <h2 className="text-xl font-serif font-bold text-cream">Payment Method</h2>
                            </div>

                            {/* Payment Tabs */}
                            <div className="grid grid-cols-3 gap-2.5 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                                    className={cn(
                                        "py-3 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 border transition-all cursor-pointer",
                                        formData.paymentMethod === 'card'
                                            ? "border-caramel bg-caramel/15 text-caramel"
                                            : "border-white/10 bg-white/5 text-cream/60 hover:text-white"
                                    )}
                                >
                                    <CreditCard size={18} />
                                    <span>Credit / Debit</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentMethod: 'applepay' })}
                                    className={cn(
                                        "py-3 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 border transition-all cursor-pointer",
                                        formData.paymentMethod === 'applepay'
                                            ? "border-caramel bg-caramel/15 text-caramel"
                                            : "border-white/10 bg-white/5 text-cream/60 hover:text-white"
                                    )}
                                >
                                    <span className="font-bold text-base leading-none">Pay</span>
                                    <span>Apple Pay</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                                    className={cn(
                                        "py-3 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 border transition-all cursor-pointer",
                                        formData.paymentMethod === 'cod'
                                            ? "border-caramel bg-caramel/15 text-caramel"
                                            : "border-white/10 bg-white/5 text-cream/60 hover:text-white"
                                    )}
                                >
                                    <HeartHandshake size={18} />
                                    <span>Cash on Delivery</span>
                                </button>
                            </div>

                            {/* Credit Card Fields */}
                            {formData.paymentMethod === 'card' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-cream/60 font-semibold mb-1.5">Card Number *</label>
                                        <input
                                            type="text"
                                            value={formData.cardNumber}
                                            onChange={handleCardNumberChange}
                                            placeholder="4532 •••• •••• 4242"
                                            maxLength={19}
                                            className={cn(
                                                "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm font-mono text-cream placeholder-white/20 outline-none transition-all",
                                                errors.cardNumber ? "border-red-500/80 bg-red-500/5" : "border-white/10 focus:border-caramel"
                                            )}
                                        />
                                        {errors.cardNumber && <p className="text-red-400 text-[11px] mt-1">{errors.cardNumber}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-cream/60 font-semibold mb-1.5">Expiry Date *</label>
                                            <input
                                                type="text"
                                                value={formData.cardExp}
                                                onChange={handleCardExpChange}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                className={cn(
                                                    "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm font-mono text-cream placeholder-white/20 outline-none transition-all",
                                                    errors.cardExp ? "border-red-500/80 bg-red-500/5" : "border-white/10 focus:border-caramel"
                                                )}
                                            />
                                            {errors.cardExp && <p className="text-red-400 text-[11px] mt-1">{errors.cardExp}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-cream/60 font-semibold mb-1.5">CVC / CVV *</label>
                                            <input
                                                type="password"
                                                value={formData.cardCvc}
                                                onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value.substring(0, 4) })}
                                                placeholder="•••"
                                                maxLength={4}
                                                className={cn(
                                                    "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm font-mono text-cream placeholder-white/20 outline-none transition-all",
                                                    errors.cardCvc ? "border-red-500/80 bg-red-500/5" : "border-white/10 focus:border-caramel"
                                                )}
                                            />
                                            {errors.cardCvc && <p className="text-red-400 text-[11px] mt-1">{errors.cardCvc}</p>}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {formData.paymentMethod === 'applepay' && (
                                <div className="p-5 rounded-2xl bg-white/5 text-center text-xs text-cream/70 border border-white/10">
                                    Apple Pay biometric verification will appear once you confirm the order.
                                </div>
                            )}

                            {formData.paymentMethod === 'cod' && (
                                <div className="p-5 rounded-2xl bg-caramel/10 text-center text-xs text-caramel border border-caramel/20">
                                    Pay with cash upon receipt. Exact change is appreciated by our couriers.
                                </div>
                            )}
                        </div>

                        {/* Gift Note Option */}
                        <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-sm">
                            <label className="block text-xs uppercase tracking-wider text-caramel font-semibold mb-2 flex items-center gap-1.5">
                                <Sparkles size={14} /> Handwritten Gift Note (Optional)
                            </label>
                            <textarea
                                value={formData.giftNote}
                                onChange={(e) => setFormData({ ...formData, giftNote: e.target.value })}
                                placeholder="E.g., Happy Birthday Sarah! Savor every warm, chocolatey crumb..."
                                rows={2}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-caramel rounded-xl text-sm text-cream placeholder-white/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sticky Order Summary & Submit CTA */}
                    <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
                        <div className="rounded-3xl bg-gradient-to-b from-[#211411] to-[#180e0c] border border-white/15 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
                            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                                <h3 className="font-serif font-bold text-2xl text-cream">Order Summary</h3>
                                <span className="text-xs px-2.5 py-1 rounded-full bg-caramel/15 text-caramel font-semibold">
                                    {cart.length} {cart.length === 1 ? 'flavor' : 'flavors'}
                                </span>
                            </div>

                            {/* Itemized Cart List */}
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-1 no-scrollbar mb-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-chocolate/50 p-1 flex items-center justify-center shrink-0 border border-white/5">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <h4 className="font-serif font-bold text-cream text-xs line-clamp-1">{item.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[11px] text-white/40">Qty: {item.quantity}</span>
                                                    <span className="text-white/20">•</span>
                                                    <span className="text-[11px] text-caramel font-semibold">${item.price.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="font-serif font-bold text-cream text-xs shrink-0">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Promo Code Input */}
                            <div className="pt-4 border-t border-white/10 mb-6">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="Promo code (e.g. CORAL10)"
                                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 focus:border-caramel rounded-xl text-xs text-cream uppercase tracking-wider placeholder-white/30 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyPromo}
                                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-caramel hover:text-chocolate text-cream font-bold text-xs transition-all cursor-pointer shrink-0"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {promoError && <p className="text-red-400 text-[11px] mt-1.5">{promoError}</p>}
                                {promoSuccess && <p className="text-emerald-400 text-[11px] mt-1.5 font-semibold">{promoSuccess}</p>}
                            </div>

                            {/* Calculations list */}
                            <div className="space-y-3 text-xs mb-6">
                                <div className="flex justify-between text-cream/70">
                                    <span>Bag Subtotal</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                {appliedDiscount > 0 && (
                                    <div className="flex justify-between text-caramel font-semibold">
                                        <span>Promo Discount</span>
                                        <span>-${discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-cream/70">
                                    <span>Delivery Fee</span>
                                    <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-cream/70">
                                    <span>Estimated Sales Tax (5%)</span>
                                    <span>${taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-baseline pt-4 border-t border-white/10">
                                    <span className="font-serif font-bold text-base text-cream">Order Total</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-serif font-bold text-caramel">
                                            ${finalTotal.toFixed(2)}
                                        </span>
                                        <span className="block text-[10px] text-white/40">Includes all taxes & delivery</span>
                                    </div>
                                </div>
                            </div>

                            {/* Place Order CTA Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={cn(
                                    "w-full py-4 sm:py-4.5 rounded-full font-bold text-base flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 cursor-pointer",
                                    isSubmitting 
                                        ? "bg-caramel/50 text-chocolate cursor-wait" 
                                        : "bg-gradient-to-r from-cookie to-caramel text-chocolate hover:shadow-[0_0_25px_rgba(212,140,69,0.4)] hover:brightness-110"
                                )}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-chocolate border-t-transparent rounded-full animate-spin" />
                                        <span>Baking & Confirming Order...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Place Order & Generate Invoice</span>
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>

                            {/* Trust Guarantee Notes */}
                            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-center gap-4 text-[11px] text-cream/50">
                                <span className="flex items-center gap-1">
                                    <ShieldCheck size={14} className="text-caramel" /> 100% Guaranteed Fresh
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <FileText size={14} className="text-caramel" /> PDF Bill Auto-Generated
                                </span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
}
