import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. MongoDB Atlas Database Connection
// ==========================================
if (process.env.MONGODB_URI) {
    mongoose
        .connect(process.env.MONGODB_URI, {
            dbName: 'coralcookies',
            serverSelectionTimeoutMS: 5000,
        })
        .then(() => {
            console.log('[DATABASE] Connected to MongoDB Atlas (coraldb.cwbu37z.mongodb.net / coralcookies)');
        })
        .catch((err) => {
            console.error('[DATABASE] MongoDB Atlas connection error:', err.message);
        });
} else {
    console.log('[DATABASE] No MONGODB_URI found in environment variables.');
}

// Order Schema for MongoDB Persistence
const orderSchema = new mongoose.Schema(
    {
        orderId: { type: String, required: true, unique: true },
        customer: {
            fullName: String,
            email: String,
            phone: String,
            address: String,
            city: String,
            state: String,
            zip: String,
        },
        items: [
            {
                id: String,
                name: String,
                price: Number,
                quantity: Number,
                customization: mongoose.Schema.Types.Mixed,
            },
        ],
        subtotal: Number,
        tax: Number,
        deliveryFee: Number,
        total: Number,
        deliveryTier: String,
        scheduleDate: String,
        scheduleTime: String,
        paymentMethod: String,
        status: { type: String, default: 'Confirmed' },
        emailStatus: {
            sent: Boolean,
            messageId: String,
            sentAt: Date,
        },
    },
    { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// ==========================================
// 2. Transporter cache & Nodemailer Setup
// ==========================================
let transporterPromise = null;

async function getTransporter() {
    if (transporterPromise) return transporterPromise;

    transporterPromise = (async () => {
        // 1. If user provided SMTP credentials (e.g. Gmail App Password)
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            console.log(`[Nodemailer] Configuring transporter with user: ${process.env.SMTP_USER}`);
            return nodemailer.createTransport({
                service: process.env.SMTP_SERVICE || 'gmail',
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: Number(process.env.SMTP_PORT) || 465,
                secure: process.env.SMTP_SECURE === 'false' ? false : true,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS.replace(/\s+/g, ''),
                },
            });
        }

        // 2. Automatic Ethereal test inbox fallback if no credentials supplied yet
        console.log('[Nodemailer] No SMTP credentials in .env. Creating instant Ethereal test account...');
        const testAccount = await nodemailer.createTestAccount();
        console.log(`[Nodemailer] Ethereal Test Account ready: ${testAccount.user}`);
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    })();

    return transporterPromise;
}

// Generate luxury patisserie HTML email receipt
function generateOrderHtml(orderData) {
    const itemsHtml = orderData.items
        .map(
            (item) => `
            <tr style="border-bottom: 1px solid #3d2720;">
                <td style="padding: 12px 8px; color: #f5e6d3; font-weight: bold; font-family: 'Georgia', serif;">${item.name}</td>
                <td style="padding: 12px 8px; color: #d48c45; text-align: center; font-family: monospace;">${item.quantity} pck</td>
                <td style="padding: 12px 8px; color: #f5e6d3; text-align: right; font-family: monospace;">₹${item.price.toFixed(2)}</td>
                <td style="padding: 12px 8px; color: #d48c45; text-align: right; font-weight: bold; font-family: monospace;">₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `
        )
        .join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Coral Cookies — Order Confirmed</title>
    </head>
    <body style="margin: 0; padding: 24px; background-color: #1a110e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5e6d3;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #241713 0%, #170e0c 100%); border-radius: 24px; border: 1px solid rgba(212, 140, 69, 0.3); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
            
            <!-- Header Brand Banner -->
            <div style="background-color: #140b08; padding: 32px 24px; text-align: center; border-bottom: 2px solid #d48c45;">
                <h1 style="margin: 0; color: #f5e6d3; font-family: 'Georgia', serif; font-size: 26px; letter-spacing: 3px;">CORAL COOKIES</h1>
                <p style="margin: 6px 0 0 0; color: #d48c45; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Haute Artisanal Patisserie & Bakehouse</p>
            </div>

            <!-- Body -->
            <div style="padding: 32px 24px;">
                <span style="display: inline-block; padding: 4px 12px; background: rgba(212, 140, 69, 0.15); border: 1px solid rgba(212, 140, 69, 0.4); border-radius: 20px; color: #d48c45; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">
                    Order Confirmed & Baking at 185°C
                </span>

                <h2 style="margin: 0 0 12px 0; font-family: 'Georgia', serif; font-size: 22px; color: #ffffff;">
                    Hello, ${orderData.customer.name.split(' ')[0]}!
                </h2>

                <p style="margin: 0 0 24px 0; color: rgba(245, 230, 211, 0.75); font-size: 14px; line-height: 1.6;">
                    Your artisanal small-batch cookies have been queued into our hearth ovens. Below is your official purchase receipt.
                </p>

                <!-- Order Meta Details -->
                <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 16px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 12px; color: rgba(245, 230, 211, 0.5); text-transform: uppercase;">Order Reference:</span>
                        <strong style="font-size: 13px; color: #d48c45; font-family: monospace;">${orderData.orderId}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 12px; color: rgba(245, 230, 211, 0.5); text-transform: uppercase;">Order Date:</span>
                        <span style="font-size: 12px; color: #f5e6d3;">${orderData.date}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 12px; color: rgba(245, 230, 211, 0.5); text-transform: uppercase;">Settled Via:</span>
                        <span style="font-size: 12px; color: #f5e6d3;">${orderData.paymentMethod}</span>
                    </div>
                </div>

                <!-- Items Table -->
                <h3 style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #d48c45;">Artisanal Cookies in your Batch</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
                    <thead>
                        <tr style="background: rgba(212, 140, 69, 0.1); border-bottom: 1px solid rgba(212, 140, 69, 0.3); color: #d48c45; font-size: 11px; text-transform: uppercase;">
                            <th style="padding: 8px; text-align: left;">Flavor</th>
                            <th style="padding: 8px; text-align: center;">Qty</th>
                            <th style="padding: 8px; text-align: right;">Price</th>
                            <th style="padding: 8px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <!-- Summary Numbers -->
                <div style="background: rgba(0, 0, 0, 0.2); border-radius: 16px; padding: 16px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; color: rgba(245, 230, 211, 0.65);">
                        <span>Subtotal:</span>
                        <span>₹${orderData.subtotal.toFixed(2)}</span>
                    </div>
                    ${orderData.discount > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; color: #34d399;">
                        <span>Promo Discount (${orderData.promoCode || 'PROMO'}):</span>
                        <span>-₹${orderData.discount.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; color: rgba(245, 230, 211, 0.65);">
                        <span>Dispatch Speed (${orderData.deliveryMethodLabel || 'Standard'}):</span>
                        <span>${orderData.shipping === 0 ? 'COMPLIMENTARY' : `₹${orderData.shipping.toFixed(2)}`}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px; color: rgba(245, 230, 211, 0.65);">
                        <span>Patisserie Sales Tax (5%):</span>
                        <span>₹${orderData.tax.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 16px; font-weight: bold; color: #d48c45;">
                        <span style="color: #ffffff; font-family: 'Georgia', serif;">Total Settled:</span>
                        <span style="font-family: monospace;">₹${orderData.total.toFixed(2)}</span>
                    </div>
                </div>

                <!-- Destination -->
                <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 16px; margin-bottom: 20px;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #d48c45; font-weight: bold; display: block; margin-bottom: 4px;">Delivering To:</span>
                    <p style="margin: 0; font-size: 13px; color: rgba(245, 230, 211, 0.85);">
                        ${orderData.customer.name}<br>
                        ${orderData.customer.address}<br>
                        ${orderData.customer.city}, ${orderData.customer.state} ${orderData.customer.zip}
                    </p>
                </div>

                ${orderData.giftNote ? `
                <div style="background: #2b1f1a; border: 1px solid rgba(212, 140, 69, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #d48c45; font-weight: bold; display: block; margin-bottom: 4px;">Personalized Calligraphy Note Enclosed:</span>
                    <p style="margin: 0; font-family: 'Georgia', serif; font-style: italic; color: #f5e6d3; font-size: 13px;">
                        "${orderData.giftNote}"
                    </p>
                </div>
                ` : ''}

                <!-- Authenticity note -->
                <p style="margin: 24px 0 0 0; text-align: center; font-style: italic; font-family: 'Georgia', serif; color: rgba(245, 230, 211, 0.5); font-size: 12px;">
                    "Every batch is baked fresh at 185°C with 100% single-origin cacao and grass-fed butter."
                </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #120907; padding: 20px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 11px; color: rgba(255, 255, 255, 0.35);">
                Coral Cookies Haute Artisanal Patisserie • San Francisco, CA<br>
                Questions? Email concierge@coralcookies.com
            </div>
        </div>
    </body>
    </html>
    `;
}

// API Route: Send Order Email
app.post('/api/send-order-email', async (req, res) => {
    try {
        const orderData = req.body;
        if (!orderData || !orderData.customer || !orderData.customer.email) {
            return res.status(400).json({ success: false, error: 'Recipient email is required' });
        }

        const transporter = await getTransporter();
        const fromAddress = process.env.SMTP_FROM || `"Coral Cookies Patisserie" <orders@coralcookies.com>`;
        const recipient = orderData.customer.email.trim();

        const mailOptions = {
            from: fromAddress,
            to: recipient,
            subject: `Order Confirmed! #${orderData.orderId} - Coral Cookies Haute Patisserie`,
            text: `Thank you for your order #${orderData.orderId}! Total: Rs. ${orderData.total.toFixed(2)}. Your cookies are baking fresh.`,
            html: generateOrderHtml(orderData),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[BACKEND]  Email sent in real time to ${recipient} (Message ID: ${info.messageId})`);

        // Save or update order in MongoDB Atlas
        let dbSaved = false;
        try {
            if (mongoose.connection.readyState === 1) {
                await Order.findOneAndUpdate(
                    { orderId: orderData.orderId },
                    {
                        ...orderData,
                        emailStatus: {
                            sent: true,
                            messageId: info.messageId,
                            sentAt: new Date(),
                        },
                    },
                    { upsert: true, new: true }
                );
                dbSaved = true;
                console.log(`[DATABASE] Order #${orderData.orderId} recorded in MongoDB Atlas ('orders' collection)`);
            }
        } catch (dbErr) {
            console.error('[DATABASE] Failed to save order to MongoDB:', dbErr.message);
        }

        let previewUrl = null;
        if (nodemailer.getTestMessageUrl(info)) {
            previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`[BACKEND]  Ethereal live preview URL: ${previewUrl}`);
        }

        return res.json({
            success: true,
            provider: 'Nodemailer',
            recipient,
            messageId: info.messageId,
            previewUrl,
            savedToDatabase: dbSaved,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
    } catch (error) {
        console.error('[BACKEND]  Failed to send email:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Nodemailer dispatch failed',
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        server: 'Express',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        email: 'Nodemailer',
        timestamp: new Date().toISOString(),
    });
});

app.listen(PORT, () => {
    console.log(`[SERVER]   Coral Cookies Express API running on http://localhost:${PORT}`);
    console.log(`[DATABASE] MongoDB Atlas linked: coraldb.cwbu37z.mongodb.net`);
    console.log(`[BACKEND]  Nodemailer Real-time Email Dispatcher active`);
});

