import React, { useState, useEffect, useMemo } from 'react';
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
    Clock, 
    Tag, 
    AlertCircle, 
    HeartHandshake,
    ChevronRight,
    ChevronLeft,
    MapPin,
    Copy,
    Check,
    Gift,
    Flame,
    Plus,
    Minus,
    Trash2,
    Eye,
    Printer,
    Share2,
    User,
    Lock,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { usePageTransition } from '../context/TransitionContext';
import Footer from '../components/Footer';
import { cn } from '../lib/utils';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import { COOKIES } from '../data/cookies';
import { sendOrderConfirmationEmail } from '../services/emailService';

// ============================================================================
// PDF INVOICE GENERATOR (HAUTE ARTISANAL PATISSERIE)
// ============================================================================
const generateInvoicePDF = (orderData) => {
    try {
        const doc = new jsPDF({
            unit: 'mm',
            format: 'a4',
        });

        // Brand Banner Header
        doc.setFillColor(26, 17, 14); // #1a110e
        doc.rect(0, 0, 210, 44, 'F');

        // Gold Trim Line
        doc.setFillColor(212, 140, 69);
        doc.rect(0, 43, 210, 1.2, 'F');

        // Brand Name
        doc.setFont('times', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(245, 230, 211); // cream #f5e6d3
        doc.text('CORAL COOKIES', 18, 20);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(212, 140, 69); // caramel #d48c45
        doc.text('HAUTE ARTISANAL PATISSERIE & HEARTH BAKEHOUSE', 18, 26);
        doc.setTextColor(190, 185, 180);
        doc.text('concierge@coralcookies.com | www.coralcookies.com | +1 (800) 555-BAKE', 18, 33);

        // Invoice Header Information
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('CERTIFIED INVOICE', 192, 18, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(212, 140, 69);
        doc.text(`Reference: ${orderData.orderId}`, 192, 25, { align: 'right' });
        doc.setTextColor(220, 220, 220);
        doc.text(`Date: ${orderData.date}`, 192, 30, { align: 'right' });
        doc.text(`Method: ${orderData.paymentMethod}`, 192, 35, { align: 'right' });

        // Bill To & Delivery Address Section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(43, 27, 23);
        doc.text('CLIENT DETAILS', 18, 54);
        doc.text('DISPATCH DESTINATION', 110, 54);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(70, 70, 70);
        doc.text(orderData.customer.name, 18, 60);
        doc.text(orderData.customer.email, 18, 65);
        doc.text(orderData.customer.phone || 'Phone on file with courier', 18, 70);

        doc.text(orderData.customer.address, 110, 60);
        doc.text(`${orderData.customer.city}, ${orderData.customer.state} ${orderData.customer.zip}`, 110, 65);
        doc.text(`${orderData.customer.country || 'United States'} • Delivery: ${orderData.deliveryMethodLabel}`, 110, 70);

        if (orderData.giftNote) {
            doc.setFillColor(253, 250, 245);
            doc.roundedRect(18, 76, 174, 10, 2, 2, 'F');
            doc.setFont('times', 'italic');
            doc.setFontSize(8.5);
            doc.setTextColor(150, 95, 45);
            doc.text(`Enclosed Gift Note: "${orderData.giftNote.substring(0, 95)}${orderData.giftNote.length > 95 ? '...' : ''}"`, 22, 82.5);
        }

        // Divider
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(18, 90, 192, 90);

        // Items Table Header
        doc.setFillColor(246, 240, 232);
        doc.rect(18, 94, 174, 8, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(43, 27, 23);
        doc.text('ARTISANAL SELECTION', 22, 99.5);
        doc.text('COLLECTION', 95, 99.5);
        doc.text('QTY (PCK)', 135, 99.5, { align: 'center' });
        doc.text('UNIT PRICE', 160, 99.5, { align: 'right' });
        doc.text('AMOUNT', 188, 99.5, { align: 'right' });

        // Itemized Rows
        let y = 108;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);

        orderData.items.forEach((item, index) => {
            if (index % 2 === 1) {
                doc.setFillColor(252, 250, 246);
                doc.rect(18, y - 4.5, 174, 7.5, 'F');
            }
            doc.setTextColor(40, 40, 40);
            doc.text(item.name, 22, y);
            doc.setTextColor(130, 120, 115);
            doc.text(item.category || 'Hearth Baked', 95, y);
            doc.setTextColor(40, 40, 40);
            doc.text(`${item.quantity} pck`, 135, y, { align: 'center' });
            doc.text(`Rs. ${item.price.toFixed(2)}`, 160, y, { align: 'right' });
            doc.text(`Rs. ${(item.price * item.quantity).toFixed(2)}`, 188, y, { align: 'right' });
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

        printSummaryLine('Subtotal:', `Rs. ${orderData.subtotal.toFixed(2)}`);
        if (orderData.discount > 0) {
            printSummaryLine(`Promo Discount (${orderData.promoCode}):`, `-Rs. ${orderData.discount.toFixed(2)}`);
        }
        printSummaryLine('Shipping & Packaging:', orderData.shipping === 0 ? 'COMPLIMENTARY' : `Rs. ${orderData.shipping.toFixed(2)}`);
        printSummaryLine('Patisserie Sales Tax (5%):', `Rs. ${orderData.tax.toFixed(2)}`);

        doc.setDrawColor(212, 140, 69);
        doc.setLineWidth(0.6);
        doc.line(120, y - 1.5, 192, y - 1.5);
        y += 3;
        printSummaryLine('TOTAL PAID:', `Rs. ${orderData.total.toFixed(2)}`, true);

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
        doc.text('Thank you for savoring Coral Cookies. Certified Digital Receipt & Official Tax Invoice.', 105, 271, { align: 'center' });
        doc.text(`Official Order Authenticator: ${orderData.orderId} • Questions? orders@coralcookies.com`, 105, 276, { align: 'center' });

        doc.save(`CoralCookies-Invoice-${orderData.orderId}.pdf`);
    } catch (err) {
        console.error("PDF generation failed:", err);
    }
};

// ============================================================================
// LUXURY 3D INTERACTIVE CREDIT CARD VISUALIZER
// ============================================================================
const LuxuryCardPreview = ({ cardNumber, cardExp, cardCvc, cardName, isCvcFocused }) => {
    // Detect card brand
    const cleanNumber = cardNumber.replace(/\s/g, '');
    let brand = 'Coral Black';
    let brandLogo = 'CORAL';
    if (cleanNumber.startsWith('4')) {
        brand = 'Visa Infinite';
        brandLogo = 'VISA';
    } else if (cleanNumber.startsWith('5')) {
        brand = 'Mastercard World';
        brandLogo = 'MASTERCARD';
    } else if (cleanNumber.startsWith('3')) {
        brand = 'Amex Centurion';
        brandLogo = 'AMEX';
    }

    return (
        <div className="relative w-full max-w-sm mx-auto h-52 sm:h-56 rounded-3xl p-6 text-cream shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-500 border border-amber-400/30 select-none group perspective-1000">
            {/* Background Luxury Hologram Mesh */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#160d0a] via-[#2c1b16] to-[#120b08] z-0" />
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-radial from-caramel/30 via-cookie/10 to-transparent blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-radial from-accent/20 via-transparent to-transparent blur-xl pointer-events-none" />
            
            {/* Micro gold wave lines */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d48c45_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="relative z-10 h-full flex flex-col justify-between">
                {/* Card Top: Brand & Chip */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Metallic EMV Chip */}
                        <div className="w-10 h-8 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-100/50 p-1 flex flex-col justify-between shadow-sm">
                            <div className="h-0.5 bg-amber-800/40 rounded-full" />
                            <div className="h-0.5 bg-amber-800/40 rounded-full" />
                            <div className="h-0.5 bg-amber-800/40 rounded-full" />
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="font-serif font-black tracking-widest text-sm bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-cream to-caramel">
                            {brandLogo}
                        </span>
                        <span className="block text-[9px] uppercase tracking-widest text-amber-200/60 font-mono">
                            {brand}
                        </span>
                    </div>
                </div>

                {/* Card Middle: 16-Digit Number */}
                <div className="py-2">
                    <p className="font-mono text-lg sm:text-xl tracking-[0.22em] text-cream drop-shadow-md">
                        {cardNumber || '•••• •••• •••• ••••'}
                    </p>
                </div>

                {/* Card Bottom: Holder Name, Expiry, CVV Glow */}
                <div className="flex items-end justify-between text-xs pt-1 border-t border-white/10">
                    <div>
                        <span className="text-[9px] uppercase tracking-widest text-cream/50 block font-semibold">Cardholder</span>
                        <span className="font-serif font-semibold tracking-wider text-cream uppercase text-xs sm:text-sm drop-shadow">
                            {cardName.trim() ? cardName : 'YOUR NAME'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div>
                            <span className="text-[9px] uppercase tracking-widest text-cream/50 block font-semibold">Expires</span>
                            <span className="font-mono text-cream font-semibold text-xs sm:text-sm">
                                {cardExp ? cardExp : 'MM/YY'}
                            </span>
                        </div>

                        <div className={cn(
                            "px-2 py-0.5 rounded-lg border transition-all duration-300 text-center",
                            isCvcFocused 
                                ? "bg-amber-400/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/30 scale-105" 
                                : "bg-black/20 border-white/10 text-cream/70"
                        )}>
                            <span className="text-[8px] uppercase tracking-wider block text-white/50">CVC</span>
                            <span className="font-mono text-xs font-bold">
                                {cardCvc ? cardCvc : '•••'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT: NEXT-LEVEL CHECKOUT
// ============================================================================
export default function Checkout() {
    const { cart, cartTotal, clearCart, updateQuantity, removeFromCart, addToCart } = useCart();
    const { switchPage } = usePageTransition();
    const navigate = useNavigate();

    // Multi-step Checkout navigation: 1: Delivery & Contact, 2: Experience & Packaging, 3: Payment
    const [currentStep, setCurrentStep] = useState(1);

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
        deliveryMethod: 'standard', // 'standard' | 'express' | 'luxury_concierge'
        bakeTimeSlot: 'afternoon', // 'immediate' | 'afternoon' | 'evening' | 'tomorrow'
        paymentMethod: 'card', // 'card' | 'cod'
        cardNumber: '',
        cardExp: '',
        cardCvc: '',
        cardName: '',
        giftNote: '',
        isGift: false,
    });

    const [isCvcFocused, setIsCvcFocused] = useState(false);
    const [errors, setErrors] = useState({});
    const [promoCode, setPromoCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [promoError, setPromoError] = useState('');
    const [promoSuccess, setPromoSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [deliveryEtaCounter, setDeliveryEtaCounter] = useState(38); // live countdown in minutes
    const [emailSendStatus, setEmailSendStatus] = useState({ sending: false, success: false, error: null, timestamp: null });

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    // Hide Navbar when actual invoice bill modal is shown
    useEffect(() => {
        const navbar = document.getElementById('main-navbar') || document.querySelector('nav');
        if (showInvoiceModal) {
            if (navbar) navbar.style.display = 'none';
            document.body.classList.add('invoice-modal-active');
        } else {
            if (navbar) navbar.style.display = '';
            document.body.classList.remove('invoice-modal-active');
        }
        return () => {
            if (navbar) navbar.style.display = '';
            document.body.classList.remove('invoice-modal-active');
        };
    }, [showInvoiceModal]);

    // Recommended items from catalogue not currently in cart
    const suggestedCookies = useMemo(() => {
        const cartIds = new Set(cart.map(item => item.id));
        return COOKIES.filter(c => !cartIds.has(c.id)).slice(0, 2);
    }, [cart]);

    // Delivery fee calculation
    const shippingFee = useMemo(() => {
        if (formData.deliveryMethod === 'express') return 149;
        if (formData.deliveryMethod === 'luxury_concierge') return 249;
        return 0; // Standard is complimentary
    }, [formData.deliveryMethod]);

    const deliveryMethodLabel = useMemo(() => {
        if (formData.deliveryMethod === 'express') return 'Warm Oven Express Courier (45-60 mins)';
        if (formData.deliveryMethod === 'luxury_concierge') return 'Artisanal Velvet Box Concierge Delivery';
        return 'Standard Heritage Insulated Box Dispatch (Complimentary)';
    }, [formData.deliveryMethod]);

    const discountAmount = appliedDiscount > 0 ? (cartTotal * appliedDiscount) : 0;
    const taxAmount = Math.max(0, (cartTotal - discountAmount) * 0.05);
    const finalTotal = Math.max(0, cartTotal - discountAmount + shippingFee + taxAmount);

    // Free shipping threshold logic (₹999 gets free luxury packaging upgrade)
    const luxuryPackagingThreshold = 999;
    const remainingForPerk = Math.max(0, luxuryPackagingThreshold - cartTotal);

    // Promo code handler
    const handleApplyPromo = (codeToApply) => {
        const code = (codeToApply || promoCode).trim().toUpperCase();
        setPromoError('');
        setPromoSuccess('');
        
        if (code === 'CORAL10' || code === 'SWEET10') {
            setAppliedDiscount(0.10);
            setPromoCode(code);
            setPromoSuccess('10% Confectioners Treat Discount applied!');
        } else if (code === 'VIP20') {
            setAppliedDiscount(0.20);
            setPromoCode(code);
            setPromoSuccess('20% Haute VIP Gourmet Patron applied!');
        } else if (code === 'FREESHIP') {
            setAppliedDiscount(0.05);
            setPromoCode(code);
            setPromoSuccess('Free Express Upgrade & 5% Courtesy applied!');
        } else if (!code) {
            setPromoError('Please enter a promo code');
        } else {
            setPromoError('Invalid promotional code');
        }
    };


    // Card formatters
    const handleCardNumberChange = (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        val = val.replace(/(.{4})/g, '$1 ').trim();
        setFormData({ ...formData, cardNumber: val });
    };

    const handleCardExpChange = (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 2) {
            val = `${val.substring(0, 2)}/${val.substring(2)}`;
        }
        setFormData({ ...formData, cardExp: val });
    };

    // Step-by-step validation
    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name required';
        if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid email required for confirmation & invoice';
        if (!formData.address.trim()) newErrors.address = 'Delivery address required';
        if (!formData.city.trim()) newErrors.city = 'City required';
        if (!formData.zip.trim()) newErrors.zip = 'ZIP code required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (formData.paymentMethod === 'card') {
            if (!formData.cardNumber.trim() || formData.cardNumber.replace(/\s/g, '').length < 15) {
                newErrors.cardNumber = 'Valid 15-16 digit card number required';
            }
            if (!formData.cardExp.trim() || formData.cardExp.length < 5) {
                newErrors.cardExp = 'Valid MM/YY required';
            }
            if (!formData.cardCvc.trim() || formData.cardCvc.length < 3) {
                newErrors.cardCvc = '3 or 4-digit security CVC required';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (validateStep1()) {
                setCurrentStep(2);
            }
        } else if (currentStep === 2) {
            setCurrentStep(3);
        }
    };

    const handleFinalSubmit = (e) => {
        if (e) e.preventDefault();

        if (!validateStep3()) {
            return;
        }

        executeOrderCreation();
    };

    const executeOrderCreation = () => {
        setIsSubmitting(true);

        setTimeout(() => {
            const orderId = `CR-${Math.floor(100000 + Math.random() * 900000)}`;
            const now = new Date();
            const dateStr = now.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            let displayPayment = 'Card ending in •••• ' + (formData.cardNumber ? formData.cardNumber.slice(-4) : '4242');
            if (formData.paymentMethod === 'cod') displayPayment = 'Cash on Oven Delivery';

            const orderDetails = {
                orderId,
                date: dateStr,
                items: [...cart],
                subtotal: cartTotal,
                discount: discountAmount,
                promoCode: appliedDiscount > 0 ? (promoCode || 'PROMO') : null,
                shipping: shippingFee,
                deliveryMethodLabel,
                bakeTimeSlot: formData.bakeTimeSlot,
                tax: taxAmount,
                total: finalTotal,
                paymentMethod: displayPayment,
                giftNote: formData.isGift ? formData.giftNote : null,
                customer: {
                    name: `${formData.firstName || 'Guest'} ${formData.lastName || 'Customer'}`.trim(),
                    email: formData.email || 'customer@coralcookies.com',
                    phone: formData.phone || '+91 98765 43210',
                    address: `${formData.address || 'Marine Drive'}${formData.apartment ? ', ' + formData.apartment : ''}`,
                    city: formData.city || 'Mumbai',
                    state: formData.state || 'Maharashtra',
                    zip: formData.zip || '400020',
                    country: 'India',
                }
            };

            setCompletedOrder(orderDetails);
            setIsSubmitting(false);

            // Real-Time Email Dispatch to Customer Inbox
            handleSendLiveEmail(orderDetails);

            // Celebration Confetti Explosion
            confetti({
                particleCount: 140,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#d48c45', '#f5e6d3', '#ffffff', '#FF7F50', '#2b1b17']
            });

            // Second wave
            setTimeout(() => {
                confetti({
                    particleCount: 60,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#d48c45', '#f5e6d3']
                });
                confetti({
                    particleCount: 60,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#d48c45', '#f5e6d3']
                });
            }, 300);

            // Auto-generate PDF Invoice
            setTimeout(() => {
                generateInvoicePDF(orderDetails);
            }, 900);

            // Clear the user's cart
            clearCart();
        }, 1600);
    };

    const handleSendLiveEmail = async (orderInfo) => {
        if (!orderInfo || !orderInfo.customer || !orderInfo.customer.email) return;
        setEmailSendStatus({ sending: true, success: false, error: null, timestamp: null });
        try {
            const res = await sendOrderConfirmationEmail(orderInfo);
            if (res.success) {
                setEmailSendStatus({
                    sending: false,
                    success: true,
                    error: null,
                    timestamp: res.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    provider: res.provider
                });
            } else {
                setEmailSendStatus({
                    sending: false,
                    success: false,
                    error: res.error || 'Could not deliver email',
                    timestamp: null
                });
            }
        } catch (e) {
            setEmailSendStatus({
                sending: false,
                success: false,
                error: e.message || 'Delivery error',
                timestamp: null
            });
        }
    };

    // ========================================================================
    // ORDER CONFIRMATION & LIVE BAKE TRACKER SCREEN
    // ========================================================================
    if (completedOrder) {
        return (
            <div className="min-h-screen bg-chocolate text-cream pt-28 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col selection:bg-caramel selection:text-chocolate">
                <div className="max-w-4xl mx-auto w-full flex-1">
                    {/* Hero Confirmed Badge Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="rounded-3xl bg-gradient-to-b from-[#251713] via-[#1d120f] to-[#140b08] border border-amber-500/30 p-6 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden text-center mb-8"
                    >
                        <div className="absolute top-0 right-0 w-80 h-80 bg-caramel/15 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
                        
                        {/* Animated Baking Badge Icon */}
                        <div className="relative w-24 h-24 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full bg-caramel/20 animate-ping opacity-30" />
                            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-caramel via-[#b37032] to-[#452718] border-2 border-amber-300/60 flex items-center justify-center text-cream shadow-2xl shadow-caramel/30">
                                <Flame size={44} className="text-amber-200 animate-pulse" />
                            </div>
                        </div>

                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-caramel/20 border border-caramel/40 text-caramel text-xs font-bold uppercase tracking-widest mb-4">
                            <Sparkles size={14} /> Artisanal Order Confirmed & Baking
                        </span>

                        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-cream mb-3">
                            Magnifique, {completedOrder.customer.name.split(' ')[0]}!
                        </h1>
                        <p className="text-cream/70 text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
                            Your small-batch cookies have entered our hearth ovens. An official tax invoice and confirmation package have been dispatched to <strong className="text-caramel">{completedOrder.customer.email}</strong>.
                        </p>

                        {/* Real-Time Email Dispatch Status Live Card (Commented Out)
                        <div className="my-6 max-w-lg mx-auto">
                            {emailSendStatus.sending ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm shadow-md"
                                >
                                    <div className="w-4 h-4 border-2 border-caramel border-t-transparent rounded-full animate-spin shrink-0" />
                                    <span>Dispatching confirmation receipt to <strong className="text-white">{completedOrder.customer.email}</strong> in real time...</span>
                                </motion.div>
                            ) : emailSendStatus.success ? (
                                <motion.div 
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm text-left flex items-start justify-between gap-3 shadow-lg shadow-emerald-500/5"
                                >
                                    <div className="flex items-start gap-2.5">
                                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-white block">Real-Time Email Dispatched!</span>
                                            <span className="text-white/70 text-xs">Official tax receipt & order summary delivered to <strong className="text-emerald-200">{completedOrder.customer.email}</strong> at {emailSendStatus.timestamp}.</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSendLiveEmail(completedOrder)}
                                        className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-[11px] font-semibold transition-colors cursor-pointer"
                                        title="Send another copy to this email"
                                    >
                                        Resend
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70 flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-2">
                                        <Mail size={16} className="text-caramel" />
                                        <span>Sent to <strong className="text-white">{completedOrder.customer.email}</strong></span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleSendLiveEmail(completedOrder)}
                                        className="px-2.5 py-1 rounded-lg bg-caramel/20 hover:bg-caramel text-caramel hover:text-chocolate font-bold text-[11px] transition-colors cursor-pointer"
                                    >
                                        Retry Send
                                    </button>
                                </div>
                            )}
                        </div>
                        */}

                        {/* Interactive CTAs */}
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => generateInvoicePDF(completedOrder)}
                                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-cookie via-caramel to-[#bf7733] text-chocolate font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-caramel/25 cursor-pointer active:scale-95"
                            >
                                <Download size={16} />
                                <span>Download Official PDF Invoice</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowEmailModal(true)}
                                className="px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-cream font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                <Mail size={16} className="text-caramel" />
                                <span>Preview Email Dispatch</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowInvoiceModal(true)}
                                className="px-4 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-cream/70 hover:text-white transition-all cursor-pointer group relative"
                                title="View & Print Official Invoice Bill"
                            >
                                <Printer size={16} className="group-hover:scale-110 transition-transform text-caramel" />
                            </button>
                        </div>
                    </motion.div>

                    {/* LIVE HEARTH-TO-DOORSTEP TRACKER */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="rounded-3xl bg-gradient-to-br from-[#211411] to-[#170d0b] border border-amber-500/25 p-6 sm:p-8 backdrop-blur-md mb-8 shadow-xl"
                    >
                        <div className="flex items-center justify-between pb-6 border-b border-white/10">
                            <div>
                                <span className="text-xs text-caramel uppercase tracking-widest font-bold block mb-1">Live Hearth Status</span>
                                <h3 className="text-xl font-serif font-bold text-cream">Fresh Oven Dispatch Station</h3>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-white/50 block">Estimated Arrival</span>
                                <span className="font-mono font-bold text-caramel text-base flex items-center gap-1.5 justify-end">
                                    <Clock size={16} /> Today, in ~{deliveryEtaCounter} minutes
                                </span>
                            </div>
                        </div>

                        {/* Interactive Step Progress Milestones */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-6">
                            <div className="p-4 rounded-2xl bg-caramel/10 border border-caramel/30 relative">
                                <div className="w-7 h-7 rounded-full bg-caramel text-chocolate font-bold flex items-center justify-center text-xs mb-2">
                                    <Check size={14} className="stroke-[3]" />
                                </div>
                                <h4 className="font-bold text-sm text-cream">1. Small-Batch Prep</h4>
                                <p className="text-xs text-white/50 mt-1">Dough crafted with 74% single-origin cacao.</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 relative overflow-hidden">
                                <div className="absolute top-2 right-2">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                    </span>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-amber-500 text-chocolate font-bold flex items-center justify-center text-xs mb-2 animate-pulse">
                                    <Flame size={14} />
                                </div>
                                <h4 className="font-bold text-sm text-amber-200">2. Hearth Bake 185°C</h4>
                                <p className="text-xs text-white/60 mt-1">Active now: Golden crust caramelization.</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                <div className="w-7 h-7 rounded-full bg-white/10 text-white/40 font-bold flex items-center justify-center text-xs mb-2">
                                    3
                                </div>
                                <h4 className="font-bold text-sm text-white/60">3. Insulated Packaging</h4>
                                <p className="text-xs text-white/30 mt-1">Sealed in gold insulated aroma chambers.</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                <div className="w-7 h-7 rounded-full bg-white/10 text-white/40 font-bold flex items-center justify-center text-xs mb-2">
                                    4
                                </div>
                                <h4 className="font-bold text-sm text-white/60">4. Courier Delivery</h4>
                                <p className="text-xs text-white/30 mt-1">Warm handoff straight to your doorstep.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Order Details Breakdown Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-md mb-8"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-3">
                            <div>
                                <span className="text-xs text-cream/40 uppercase tracking-widest block font-bold">Patisserie Order No.</span>
                                <span className="text-2xl font-mono font-bold text-caramel">{completedOrder.orderId}</span>
                            </div>
                            <div className="sm:text-right">
                                <span className="text-xs text-cream/40 uppercase tracking-widest block font-bold">Payment Method</span>
                                <span className="text-sm font-semibold text-cream flex items-center gap-1.5 sm:justify-end">
                                    <ShieldCheck size={16} className="text-caramel" />
                                    <span>{completedOrder.paymentMethod}</span>
                                </span>
                            </div>
                        </div>

                        {/* Items list */}
                        <div className="py-6 space-y-4 border-b border-white/10">
                            <h4 className="text-xs uppercase tracking-widest text-caramel font-bold">Artisanal Cookies in this Batch</h4>
                            {completedOrder.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/[0.02]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 bg-white/5 rounded-xl p-1 shrink-0 flex items-center justify-center border border-white/5">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <h5 className="font-serif font-bold text-cream text-base">{item.name}</h5>
                                            <span className="text-xs text-white/40">Qty: {item.quantity} pck × ₹{item.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <span className="font-serif font-bold text-caramel text-base">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Gift Note Display if present */}
                        {completedOrder.giftNote && (
                            <div className="my-6 p-4 rounded-2xl bg-[#2b1f1a] border border-amber-500/25 flex items-start gap-3">
                                <Gift size={20} className="text-caramel shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-xs font-bold text-amber-200 uppercase tracking-wider block mb-1">Complimentary Handwritten Gift Note Enclosed:</span>
                                    <p className="font-serif italic text-cream/90 text-sm">"{completedOrder.giftNote}"</p>
                                </div>
                            </div>
                        )}

                        {/* Summary Numbers */}
                        <div className="pt-6 space-y-2 text-xs">
                            <div className="flex justify-between text-cream/60">
                                <span>Subtotal</span>
                                <span>₹{completedOrder.subtotal.toFixed(2)}</span>
                            </div>
                            {completedOrder.discount > 0 && (
                                <div className="flex justify-between text-caramel font-semibold">
                                    <span>Discount ({completedOrder.promoCode})</span>
                                    <span>-₹{completedOrder.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-cream/60">
                                <span>Shipping & Packaging</span>
                                <span>{completedOrder.shipping === 0 ? 'COMPLIMENTARY' : `₹${completedOrder.shipping.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between text-cream/60">
                                <span>Patisserie Tax (5%)</span>
                                <span>₹{completedOrder.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-white/10 text-base">
                                <span className="font-serif font-bold text-cream">Grand Total Paid</span>
                                <span className="text-3xl font-serif font-bold text-caramel">₹{completedOrder.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Delivery address info */}
                        <div className="mt-6 pt-6 border-t border-white/10 flex items-start gap-3 text-xs text-cream/70">
                            <MapPin size={18} className="text-caramel shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold text-cream block text-sm">Dispatching To:</span>
                                <span className="text-white/80">{completedOrder.customer.address}, {completedOrder.customer.city}, {completedOrder.customer.state} {completedOrder.customer.zip}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Back to Home CTA */}
                    <div className="text-center pt-4">
                        <button
                            type="button"
                            onClick={() => switchPage('/shop')}
                            className="inline-flex items-center gap-2 text-sm text-caramel hover:text-amber-300 font-semibold cursor-pointer transition-colors"
                        >
                            <ArrowLeft size={16} />
                            <span>Return to Cookies Bakery</span>
                        </button>
                    </div>
                </div>

                {/* Email Preview Modal */}
                <AnimatePresence>
                    {showEmailModal && (
                        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#1e1310] border border-amber-500/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto no-scrollbar"
                            >
                                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-caramel/20 flex items-center justify-center text-caramel">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-bold text-cream text-base">Customer Dispatch Dispatch</h4>
                                            <span className="text-xs text-white/40">From: concierge@coralcookies.com</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmailModal(false)}
                                        className="text-white/40 hover:text-white p-2 cursor-pointer rounded-lg"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="bg-[#120a08] rounded-2xl p-6 border border-white/5 space-y-4 text-xs font-sans">
                                    <div className="space-y-1 pb-3 border-b border-white/10 text-cream/70">
                                        <p><strong className="text-white">To:</strong> {completedOrder.customer.name} &lt;{completedOrder.customer.email}&gt;</p>
                                        <p><strong className="text-white">Subject:</strong> Order Confirmed! #{completedOrder.orderId} — Coral Cookies Haute Receipt</p>
                                    </div>

                                    <div className="py-2 space-y-3 text-cream/80 leading-relaxed text-sm">
                                        <p>Dear {completedOrder.customer.name.split(' ')[0]},</p>
                                        <p>
                                            We are delighted to confirm your artisanal order <strong>#{completedOrder.orderId}</strong>. Our pastry master has prepared your ingredients and your cookies are baking at our signature 185°C hearth.
                                        </p>

                                        <div className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5">
                                            <p className="font-bold text-caramel uppercase text-xs">Selection Breakdown:</p>
                                            {completedOrder.items.map(item => (
                                                <div key={item.id} className="flex justify-between text-xs">
                                                    <span>{item.quantity} pck × {item.name}</span>
                                                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-cream">
                                                <span>Total Settled:</span>
                                                <span className="text-caramel">₹{completedOrder.total.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-cream/60">
                                            Your official Tax Invoice PDF has been generated and is ready for download.
                                        </p>
                                        <p className="font-serif italic text-caramel">
                                            With warm regards,<br />
                                            The Coral Cookies Patisserie Team
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                        <span className="text-[10px] text-white/30">Attachment: CoralCookies-Invoice-{completedOrder.orderId}.pdf</span>
                                        <button
                                            type="button"
                                            onClick={() => generateInvoicePDF(completedOrder)}
                                            className="px-3.5 py-1.5 rounded-lg bg-caramel/20 text-caramel hover:bg-caramel hover:text-chocolate font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <Download size={12} />
                                            <span>Download Attachment</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Actual Confectionery Tax Invoice Bill Modal */}
                    {showInvoiceModal && completedOrder && (
                        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
                            <style>{`
                                #main-navbar, .main-navbar, nav, header {
                                    display: none !important;
                                }
                                @media print {
                                    body * {
                                        visibility: hidden !important;
                                    }
                                    #actual-invoice-bill, #actual-invoice-bill * {
                                        visibility: visible !important;
                                    }
                                    #actual-invoice-bill {
                                        position: fixed !important;
                                        left: 0 !important;
                                        top: 0 !important;
                                        width: 100% !important;
                                        height: auto !important;
                                        margin: 0 !important;
                                        padding: 24px !important;
                                        background: white !important;
                                        color: #1a1a1a !important;
                                        box-shadow: none !important;
                                        border: none !important;
                                        z-index: 999999 !important;
                                    }
                                    .no-print {
                                        display: none !important;
                                    }
                                }
                            `}</style>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                className="max-w-3xl w-full my-auto flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-amber-500/25 bg-[#170e0b] relative text-cream"
                            >
                                {/* Top Modal Header / Action Bar */}
                                <div className="flex items-center justify-between px-6 py-4 bg-[#1f120e] border-b border-white/10 no-print">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-caramel/20 flex items-center justify-center text-caramel">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-serif font-bold text-cream text-base leading-tight">Official Confectionery Invoice Bill</h3>
                                            <p className="text-[11px] text-white/50">Tax Invoice & Delivery Receipt • #{completedOrder.orderId}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => window.print()}
                                            className="px-3.5 py-1.5 rounded-xl bg-caramel text-chocolate hover:brightness-110 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-caramel/20 cursor-pointer active:scale-95"
                                            title="Print Physical Receipt"
                                        >
                                            <Printer size={14} />
                                            <span>Print Bill</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => generateInvoicePDF(completedOrder)}
                                            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-cream font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                            title="Download PDF Invoice"
                                        >
                                            <Download size={14} />
                                            <span>PDF</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowInvoiceModal(false)}
                                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
                                            aria-label="Close"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Bill Scrollable Body */}
                                <div className="p-4 sm:p-8 overflow-y-auto max-h-[80vh] no-scrollbar">
                                    {/* ACTUAL INVOICE SHEET (Paper Bill Look) */}
                                    <div 
                                        id="actual-invoice-bill" 
                                        className="bg-[#fcfaf7] text-[#2c1a14] rounded-2xl p-6 sm:p-10 shadow-lg border border-[#e8dfd5] font-sans selection:bg-[#ebd5bd] selection:text-[#2c1a14]"
                                    >
                                        {/* Invoice Header */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-[#d48c45]/30">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-serif font-black tracking-[0.2em] text-2xl text-[#2b170e]">
                                                        CORAL COOKIES
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-serif uppercase tracking-[0.25em] text-[#d48c45] font-bold">
                                                    Haute Artisanal Patisserie & Confectionery
                                                </p>
                                                <p className="text-xs text-[#705e56] mt-2 leading-relaxed">
                                                    14 Heritage Promenade, Connaught Place<br />
                                                    New Delhi, DL 110001, India<br />
                                                    <span className="font-mono text-[11px]">GSTIN: 07AAACC4918K1Z5 • FSSAI: 10022011000492</span>
                                                </p>
                                            </div>

                                            <div className="text-left sm:text-right bg-[#f4ece3] p-3.5 rounded-xl border border-[#dfd2c4] min-w-[220px]">
                                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#2b170e] text-[#f5e6d3] text-[10px] font-bold tracking-widest uppercase mb-1.5">
                                                    TAX INVOICE / CASH BILL
                                                </span>
                                                <p className="text-xs font-bold text-[#2b170e]">
                                                    Invoice #: <span className="font-mono font-bold text-[#d48c45]">INV-{completedOrder.orderId}</span>
                                                </p>
                                                <p className="text-xs text-[#5c4941]">
                                                    Order ID: <strong className="font-mono text-[#2b170e]">#{completedOrder.orderId}</strong>
                                                </p>
                                                <p className="text-xs text-[#5c4941] mt-0.5">
                                                    Date: <strong className="text-[#2b170e]">{completedOrder.date}</strong>
                                                </p>
                                                <p className="text-[11px] text-[#806f67] mt-0.5">
                                                    Status: <strong className="text-emerald-700 font-bold uppercase">PAID & CONFIRMED</strong>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Customer & Delivery Metadata */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-[#ebdcd0] text-xs">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#a48e83] block mb-1">
                                                    BILLED & DELIVERED TO
                                                </span>
                                                <p className="font-bold text-sm text-[#2b170e]">{completedOrder.customer.name}</p>
                                                <p className="text-[#5c4941] mt-0.5">{completedOrder.customer.address}</p>
                                                <p className="text-[#5c4941]">{completedOrder.customer.city}, {completedOrder.customer.state} {completedOrder.customer.zip}</p>
                                                <p className="text-[#5c4941]">{completedOrder.customer.country || 'India'}</p>
                                                <p className="text-[#5c4941] mt-1 font-mono">{completedOrder.customer.phone} • {completedOrder.customer.email}</p>
                                            </div>

                                            <div className="sm:text-right">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#a48e83] block mb-1">
                                                    DISPATCH & PAYMENT PARTICULARS
                                                </span>
                                                <p className="text-[#5c4941]">
                                                    Payment Method: <strong className="text-[#2b170e]">{completedOrder.paymentMethod}</strong>
                                                </p>
                                                <p className="text-[#5c4941] mt-0.5">
                                                    Delivery Tier: <strong className="text-[#2b170e]">{completedOrder.deliveryMethodLabel || 'Standard Delivery'}</strong>
                                                </p>
                                                <p className="text-[#5c4941] mt-0.5">
                                                    Hearth Bake Slot: <strong className="text-[#2b170e] capitalize">{completedOrder.bakeTimeSlot || 'Immediate Batch'}</strong>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Items Table */}
                                        <div className="py-6 overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b-2 border-[#2b170e] text-[#2b170e] font-serif uppercase tracking-wider text-[11px]">
                                                        <th className="pb-2 text-center w-8">#</th>
                                                        <th className="pb-2">Cookie Selection</th>
                                                        <th className="pb-2 text-center">Packaging</th>
                                                        <th className="pb-2 text-center">Qty</th>
                                                        <th className="pb-2 text-right">Unit Price</th>
                                                        <th className="pb-2 text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#ebdcd0]">
                                                    {completedOrder.items.map((item, idx) => (
                                                        <tr key={item.id || idx} className="hover:bg-[#f5ece3]/50">
                                                            <td className="py-3 text-center text-[#9c8a81] font-mono">{idx + 1}</td>
                                                            <td className="py-3 font-semibold text-[#2b170e]">
                                                                {item.name}
                                                                {item.customization && (
                                                                    <span className="block text-[10px] font-normal text-[#806f67]">Custom artisanal craft</span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 text-center text-[#705e56] font-mono">1 pck</td>
                                                            <td className="py-3 text-center font-bold text-[#2b170e] font-mono">{item.quantity}</td>
                                                            <td className="py-3 text-right text-[#5c4941] font-mono">₹{item.price.toFixed(2)}</td>
                                                            <td className="py-3 text-right font-bold text-[#2b170e] font-mono">
                                                                ₹{(item.price * item.quantity).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Bottom Financial Summary & Stamp */}
                                        <div className="pt-4 border-t-2 border-[#d48c45]/30 grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
                                            {/* Left: Gift Note & Stamp */}
                                            <div className="sm:col-span-7 space-y-4">
                                                {completedOrder.giftNote && (
                                                    <div className="p-3.5 bg-[#f5ece3] border border-[#d8c5b5] rounded-xl text-xs">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#d48c45] block mb-1">
                                                            Handwritten Calligraphy Gift Inscription:
                                                        </span>
                                                        <p className="font-serif italic text-[#3d271e]">"{completedOrder.giftNote}"</p>
                                                    </div>
                                                )}

                                                {/* Luxury Authenticity Verified Badge */}
                                                <div className="inline-flex items-center gap-3 p-2.5 rounded-xl border border-emerald-600/30 bg-emerald-50 text-emerald-900">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                                                        <Check size={16} />
                                                    </div>
                                                    <div className="text-[11px] leading-tight">
                                                        <p className="font-bold uppercase tracking-wider text-emerald-800">Authentic Confectionery Invoice</p>
                                                        <p className="text-emerald-700 text-[10px]">Baked Fresh at 185°C • 100% Single-Origin Cacao</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Calculations */}
                                            <div className="sm:col-span-5 space-y-1.5 text-xs text-[#5c4941]">
                                                <div className="flex justify-between py-0.5">
                                                    <span>Subtotal</span>
                                                    <span className="font-mono font-semibold text-[#2b170e]">₹{completedOrder.subtotal.toFixed(2)}</span>
                                                </div>
                                                {completedOrder.discount > 0 && (
                                                    <div className="flex justify-between py-0.5 text-emerald-700">
                                                        <span>Discount ({completedOrder.promoCode || 'PROMO'})</span>
                                                        <span className="font-mono font-semibold">-₹{completedOrder.discount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between py-0.5">
                                                    <span>Shipping & Packaging</span>
                                                    <span className="font-mono font-semibold text-[#2b170e]">
                                                        {completedOrder.shipping === 0 ? 'COMPLIMENTARY' : `₹${completedOrder.shipping.toFixed(2)}`}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-0.5">
                                                    <span>CGST (2.5%)</span>
                                                    <span className="font-mono font-semibold text-[#2b170e]">₹{(completedOrder.tax / 2).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between py-0.5">
                                                    <span>SGST (2.5%)</span>
                                                    <span className="font-mono font-semibold text-[#2b170e]">₹{(completedOrder.tax / 2).toFixed(2)}</span>
                                                </div>

                                                <div className="pt-2 border-t-2 border-[#2b170e] flex justify-between items-center text-sm font-bold text-[#2b170e]">
                                                    <span>TOTAL PAID</span>
                                                    <span className="font-mono text-base text-[#9e571c]">₹{completedOrder.total.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Invoice Footer Notes */}
                                        <div className="mt-8 pt-4 border-t border-[#ebdcd0] text-center text-[10px] text-[#8f7e76] space-y-1">
                                            <p>This is a computer-generated authorized confectionery invoice and requires no physical seal.</p>
                                            <p className="font-serif italic text-[#705e56]">Thank you for ordering with Coral Cookies Haute Patisserie.</p>
                                        </div>
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

    // ========================================================================
    // EMPTY CART STATE
    // ========================================================================
    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-chocolate text-cream pt-40 pb-24 px-4 flex flex-col items-center justify-center text-center">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-full bg-caramel/10 border border-caramel/20 flex items-center justify-center text-caramel mb-6 shadow-2xl"
                >
                    <ShoppingBag size={44} />
                </motion.div>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-cream mb-3">Your Cookie Bag is Empty</h1>
                <p className="text-cream/60 max-w-md mb-8 text-sm sm:text-base leading-relaxed">
                    Our hearth is warm and cookies are baking fresh. Select a few small-batch cookies from our bakery counter to begin checkout.
                </p>
                <button
                    type="button"
                    onClick={() => switchPage('/shop')}
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-cookie via-caramel to-[#bf7733] text-chocolate font-bold text-base hover:brightness-110 transition-all shadow-xl shadow-caramel/25 cursor-pointer active:scale-95"
                >
                    Explore Cookie Bakery
                </button>
            </div>
        );
    }

    // ========================================================================
    // MAIN CHECKOUT FORM & INTERACTIVE WORKBENCH
    // ========================================================================
    return (
        <div className="min-h-screen bg-chocolate text-cream flex flex-col selection:bg-caramel selection:text-chocolate">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-10 left-1/4 w-[600px] h-[500px] bg-radial from-caramel/15 via-cookie/5 to-transparent blur-3xl opacity-50" />
                <div className="absolute top-[60%] right-10 w-[550px] h-[550px] bg-radial from-accent/10 via-caramel/5 to-transparent blur-3xl opacity-40" />
            </div>

            <div className="relative z-10 flex-1 pt-32 md:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Top Nav */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => switchPage('/shop')}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm text-cream/70 hover:text-caramel transition-colors cursor-pointer group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Return to Cookie Selection</span>
                    </button>
                </div>

                {/* Page Title */}
                <div className="pb-8 mb-8 border-b border-white/10">
                    <span className="text-xs uppercase tracking-[0.25em] text-caramel font-bold block mb-1">HAUTE CONFECTIONERY</span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-cream">
                        Artisanal <span className="bg-clip-text text-transparent bg-gradient-to-r from-cream via-cookie to-caramel">Checkout</span>
                    </h1>
                </div>

                {/* STEPPER PROGRESS BAR */}
                <div className="mb-10">
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl">
                        {[
                            { step: 1, label: '1. Shipping & Contact' },
                            { step: 2, label: '2. Delivery & Packaging' },
                            { step: 3, label: '3. Haute Payment' },
                        ].map((s) => {
                            const isActive = currentStep === s.step;
                            const isCompleted = currentStep > s.step;
                            return (
                                <button
                                    key={s.step}
                                    type="button"
                                    onClick={() => {
                                        // Allow navigating back to completed steps
                                        if (s.step < currentStep) setCurrentStep(s.step);
                                    }}
                                    className={cn(
                                        "py-3 px-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer text-center",
                                        isActive
                                            ? "bg-caramel/20 border-caramel text-caramel shadow-lg shadow-caramel/10"
                                            : isCompleted
                                            ? "bg-white/5 border-emerald-500/40 text-emerald-400 hover:border-emerald-500"
                                            : "bg-white/[0.02] border-white/10 text-white/40"
                                    )}
                                >
                                    {isCompleted ? <Check size={14} /> : <span>{s.step}.</span>}
                                    <span className="hidden sm:inline">{s.label.split('. ')[1]}</span>
                                    <span className="sm:hidden">Step {s.step}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* MAIN GRID: Steps Flow on Left, Sticky Summary on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* LEFT COLUMN: ACTIVE STEP FORM */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* =================================================== */}
                        {/* STEP 1: CONTACT & DELIVERY ADDRESS */}
                        {/* =================================================== */}
                        {currentStep === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 15 }}
                                className="space-y-6"
                            >
                                <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-9 h-9 rounded-full bg-caramel/20 flex items-center justify-center text-caramel font-bold text-sm">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-serif font-bold text-cream">Recipient & Contact</h2>
                                            <p className="text-xs text-white/50">Where should we deliver confirmation and status alerts?</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-cream/70 font-semibold mb-1.5">First Name *</label>
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className={cn(
                                                    "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm text-cream outline-none transition-all",
                                                    errors.firstName ? "border-red-500 bg-red-500/10" : "border-white/10 focus:border-caramel focus:bg-white/[0.08]"
                                                )}
                                            />
                                            {errors.firstName && <p className="text-red-400 text-[11px] mt-1">{errors.firstName}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-cream/70 font-semibold mb-1.5">Last Name *</label>
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className={cn(
                                                    "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm text-cream outline-none transition-all",
                                                    errors.lastName ? "border-red-500 bg-red-500/10" : "border-white/10 focus:border-caramel focus:bg-white/[0.08]"
                                                )}
                                            />
                                            {errors.lastName && <p className="text-red-400 text-[11px] mt-1">{errors.lastName}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-cream/70 font-semibold mb-1.5">Email Address * (For Invoice & Tracking)</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className={cn(
                                                    "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm text-cream outline-none transition-all",
                                                    errors.email ? "border-red-500 bg-red-500/10" : "border-white/10 focus:border-caramel focus:bg-white/[0.08]"
                                                )}
                                            />
                                            {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-cream/70 font-semibold mb-1.5">Phone (SMS Delivery Alerts)</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-caramel focus:bg-white/[0.08] rounded-xl text-sm text-cream outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-9 h-9 rounded-full bg-caramel/20 flex items-center justify-center text-caramel font-bold text-sm">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-serif font-bold text-cream">Shipping Destination</h2>
                                            <p className="text-xs text-white/50">Hand-delivered direct from our ovens to your door</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-cream/70 font-semibold mb-1.5">Street Address *</label>
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className={cn(
                                                    "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm text-cream outline-none transition-all",
                                                    errors.address ? "border-red-500 bg-red-500/10" : "border-white/10 focus:border-caramel focus:bg-white/[0.08]"
                                                )}
                                            />
                                            {errors.address && <p className="text-red-400 text-[11px] mt-1">{errors.address}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-cream/70 font-semibold mb-1.5">Apartment, Suite, Unit (Optional)</label>
                                            <input
                                                type="text"
                                                value={formData.apartment}
                                                onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-caramel rounded-xl text-sm text-cream outline-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs uppercase tracking-wider text-cream/70 font-semibold mb-1.5">City *</label>
                                                <input
                                                    type="text"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className={cn(
                                                        "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm text-cream outline-none transition-all",
                                                        errors.city ? "border-red-500 bg-red-500/10" : "border-white/10 focus:border-caramel focus:bg-white/[0.08]"
                                                    )}
                                                />
                                                {errors.city && <p className="text-red-400 text-[11px] mt-1">{errors.city}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase tracking-wider text-cream/70 font-semibold mb-1.5">State</label>
                                                <input
                                                    type="text"
                                                    value={formData.state}
                                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-caramel rounded-xl text-sm text-cream outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase tracking-wider text-cream/70 font-semibold mb-1.5">ZIP Code *</label>
                                                <input
                                                    type="text"
                                                    value={formData.zip}
                                                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                                    className={cn(
                                                        "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm text-cream outline-none transition-all",
                                                        errors.zip ? "border-red-500 bg-red-500/10" : "border-white/10 focus:border-caramel focus:bg-white/[0.08]"
                                                    )}
                                                />
                                                {errors.zip && <p className="text-red-400 text-[11px] mt-1">{errors.zip}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action to Step 2 */}
                                    <div className="pt-8 mt-6 border-t border-white/10 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-cookie via-caramel to-[#bf7733] text-chocolate font-bold text-sm flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-caramel/25 cursor-pointer active:scale-95"
                                        >
                                            <span>Continue to Delivery & Packaging</span>
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* =================================================== */}
                        {/* STEP 2: DELIVERY TIERS, BAKE TIMING & GIFT NOTE */}
                        {/* =================================================== */}
                        {currentStep === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 15 }}
                                className="space-y-6"
                            >
                                {/* Delivery Speed Selection */}
                                <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-9 h-9 rounded-full bg-caramel/20 flex items-center justify-center text-caramel font-bold text-sm">
                                            <Truck size={18} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-serif font-bold text-cream">Select Delivery Speed</h2>
                                            <p className="text-xs text-white/50">Each order is protected in gold-embossed thermal insulation</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Standard Heritage Dispatch */}
                                        <div
                                            onClick={() => setFormData({ ...formData, deliveryMethod: 'standard' })}
                                            className={cn(
                                                "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4",
                                                formData.deliveryMethod === 'standard'
                                                    ? "border-caramel bg-caramel/15 shadow-lg shadow-caramel/10 ring-1 ring-caramel/50"
                                                    : "border-white/10 bg-white/5 hover:border-white/20"
                                            )}
                                        >
                                            <div className="flex items-start gap-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-caramel shrink-0 mt-0.5">
                                                    <Truck size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-serif font-bold text-base text-cream">Standard Heritage Dispatch</span>
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Complimentary</span>
                                                    </div>
                                                    <p className="text-xs text-white/50 mt-0.5">
                                                        Insulated gold foil box with sealed freshness locks (1-2 days).
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-caramel text-sm uppercase">FREE</span>
                                        </div>

                                        {/* Warm Oven Express Courier */}
                                        <div
                                            onClick={() => setFormData({ ...formData, deliveryMethod: 'express' })}
                                            className={cn(
                                                "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4",
                                                formData.deliveryMethod === 'express'
                                                    ? "border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/15 ring-1 ring-amber-400"
                                                    : "border-white/10 bg-white/5 hover:border-white/20"
                                            )}
                                        >
                                            <div className="flex items-start gap-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                                                    <Flame size={20} className="animate-pulse" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-serif font-bold text-base text-cream">Warm Oven Express Courier</span>
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">Most Popular</span>
                                                    </div>
                                                    <p className="text-xs text-white/50 mt-0.5">
                                                        Heated thermal pouch hand-off within 45-60 mins of hearth baking.
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="font-mono font-bold text-amber-300 text-sm">+₹149</span>
                                        </div>

                                        {/* Luxury Concierge & Velvet Box */}
                                        <div
                                            onClick={() => setFormData({ ...formData, deliveryMethod: 'luxury_concierge' })}
                                            className={cn(
                                                "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4",
                                                formData.deliveryMethod === 'luxury_concierge'
                                                    ? "border-caramel bg-caramel/15 shadow-lg shadow-caramel/10 ring-1 ring-caramel/50"
                                                    : "border-white/10 bg-white/5 hover:border-white/20"
                                            )}
                                        >
                                            <div className="flex items-start gap-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-caramel shrink-0 mt-0.5">
                                                    <Gift size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-serif font-bold text-base text-cream">Grand Velvet Box Concierge</span>
                                                        <span className="px-2 py-0.5 rounded-full bg-caramel/20 text-caramel text-[10px] font-bold uppercase tracking-wider">Gift Edition</span>
                                                    </div>
                                                    <p className="text-xs text-white/50 mt-0.5">
                                                        Handcrafted rigid gift box, satin ribbon, wax seal & gourmet menu booklet.
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="font-mono font-bold text-caramel text-sm">+₹249</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Fresh Hearth Baking Time Slot */}
                                <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-9 h-9 rounded-full bg-caramel/20 flex items-center justify-center text-caramel font-bold text-sm">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-serif font-bold text-cream">Select Baking Batch</h2>
                                            <p className="text-xs text-white/50">When would you like our master bakers to load your batch?</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { id: 'immediate', title: 'Earliest Hearth Batch', desc: 'Baking right now (Warm in ~40m)' },
                                            { id: 'afternoon', title: 'Afternoon Tea Batch', desc: '2:30 PM - 4:00 PM Warm Dispatch' },
                                            { id: 'evening', title: 'Golden Hour Supper', desc: '6:00 PM - 7:30 PM Warm Dispatch' },
                                        ].map(slot => (
                                            <div
                                                key={slot.id}
                                                onClick={() => setFormData({ ...formData, bakeTimeSlot: slot.id })}
                                                className={cn(
                                                    "p-3.5 rounded-2xl border transition-all cursor-pointer text-left",
                                                    formData.bakeTimeSlot === slot.id
                                                        ? "border-caramel bg-caramel/15 shadow-md"
                                                        : "border-white/10 bg-white/5 hover:border-white/20"
                                                )}
                                            >
                                                <span className="font-bold text-sm text-cream block">{slot.title}</span>
                                                <span className="text-[11px] text-white/50 block mt-1">{slot.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Complimentary Handwritten Gift Parchment */}
                                <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Gift size={20} className="text-caramel" />
                                            <h3 className="font-serif font-bold text-lg text-cream">Complimentary Gift Card</h3>
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-caramel">
                                            <input
                                                type="checkbox"
                                                checked={formData.isGift}
                                                onChange={(e) => setFormData({ ...formData, isGift: e.target.checked })}
                                                className="accent-caramel rounded w-4 h-4"
                                            />
                                            <span>Include Handwritten Note</span>
                                        </label>
                                    </div>

                                    {formData.isGift && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-4 pt-2"
                                        >
                                            <textarea
                                                value={formData.giftNote}
                                                onChange={(e) => setFormData({ ...formData, giftNote: e.target.value })}
                                                rows={3}
                                                maxLength={180}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-caramel rounded-xl text-sm text-cream outline-none"
                                            />
                                            
                                            {/* Vintage Parchment Preview */}
                                            {formData.giftNote && (
                                                <div className="p-5 rounded-2xl bg-[#f5e7d3] text-[#2b1b17] border border-[#d48c45]/40 shadow-inner relative overflow-hidden">
                                                    <div className="text-[10px] uppercase tracking-widest text-[#8a5d30] font-mono mb-2 flex items-center justify-between">
                                                        <span>Calligraphy Parchment Preview</span>
                                                        <span>Seal: Coral Patisserie</span>
                                                    </div>
                                                    <p className="font-serif italic text-base text-[#2b1b17] leading-relaxed">
                                                        "{formData.giftNote}"
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </div>

                                {/* Step Navigation Buttons */}
                                <div className="flex items-center justify-between pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="inline-flex items-center gap-1.5 px-6 py-3.5 rounded-full border border-white/15 text-cream/70 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all cursor-pointer"
                                    >
                                        <ChevronLeft size={16} />
                                        <span>Back to Address</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        className="px-8 py-3.5 rounded-full bg-gradient-to-r from-cookie via-caramel to-[#bf7733] text-chocolate font-bold text-sm flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-caramel/25 cursor-pointer active:scale-95"
                                    >
                                        <span>Proceed to Payment</span>
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* =================================================== */}
                        {/* STEP 3: LUXURY PAYMENT & CARDS */}
                        {/* =================================================== */}
                        {currentStep === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 15 }}
                                className="space-y-6"
                            >
                                <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-9 h-9 rounded-full bg-caramel/20 flex items-center justify-center text-caramel font-bold text-sm">
                                            <CreditCard size={18} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-serif font-bold text-cream">Select Payment Method</h2>
                                            <p className="text-xs text-white/50">All payment tokens are encrypted and handled securely</p>
                                        </div>
                                    </div>

                                    {/* Payment Method Selector Tabs */}
                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                                            className={cn(
                                                "py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 border transition-all cursor-pointer",
                                                formData.paymentMethod === 'card'
                                                    ? "border-caramel bg-caramel/15 text-caramel ring-1 ring-caramel"
                                                    : "border-white/10 bg-white/5 text-cream/70 hover:text-white"
                                            )}
                                        >
                                            <CreditCard size={18} />
                                            <span>Credit / Debit Card</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                                            className={cn(
                                                "py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 border transition-all cursor-pointer",
                                                formData.paymentMethod === 'cod'
                                                    ? "border-caramel bg-caramel/15 text-caramel ring-1 ring-caramel"
                                                    : "border-white/10 bg-white/5 text-cream/70 hover:text-white"
                                            )}
                                        >
                                            <HeartHandshake size={18} />
                                            <span>Cash on Delivery</span>
                                        </button>
                                    </div>

                                    {/* CREDIT CARD INTERACTIVE DISPLAY & FIELDS */}
                                    {formData.paymentMethod === 'card' && (
                                        <div className="space-y-6">
                                            {/* 3D Holographic Card Visualizer */}
                                            <div className="py-2">
                                                <LuxuryCardPreview
                                                    cardNumber={formData.cardNumber}
                                                    cardExp={formData.cardExp}
                                                    cardCvc={formData.cardCvc}
                                                    cardName={formData.cardName || `${formData.firstName} ${formData.lastName}`}
                                                    isCvcFocused={isCvcFocused}
                                                />
                                            </div>

                                            <div className="space-y-4 pt-2">
                                                <div>
                                                    <label className="block text-xs uppercase tracking-wider text-cream/70 font-semibold mb-1.5">Name on Card *</label>
                                                    <input
                                                        type="text"
                                                        value={formData.cardName}
                                                        onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-caramel rounded-xl text-sm uppercase tracking-wider text-cream outline-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs uppercase tracking-wider text-cream/70 font-semibold mb-1.5">Card Number *</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={formData.cardNumber}
                                                            onChange={handleCardNumberChange}
                                                            maxLength={19}
                                                            className={cn(
                                                                "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm font-mono text-cream outline-none transition-all pl-11",
                                                                errors.cardNumber ? "border-red-500 bg-red-500/10" : "border-white/10 focus:border-caramel"
                                                            )}
                                                        />
                                                        <CreditCard size={18} className="absolute left-3.5 top-3.5 text-white/40" />
                                                    </div>
                                                    {errors.cardNumber && <p className="text-red-400 text-[11px] mt-1">{errors.cardNumber}</p>}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs uppercase tracking-wider text-cream/70 font-semibold mb-1.5">Expiry Date *</label>
                                                        <input
                                                            type="text"
                                                            value={formData.cardExp}
                                                            onChange={handleCardExpChange}
                                                            maxLength={5}
                                                            className={cn(
                                                                "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm font-mono text-cream outline-none transition-all",
                                                                errors.cardExp ? "border-red-500 bg-red-500/10" : "border-white/10 focus:border-caramel"
                                                            )}
                                                        />
                                                        {errors.cardExp && <p className="text-red-400 text-[11px] mt-1">{errors.cardExp}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs uppercase tracking-wider text-cream/70 font-semibold mb-1.5">CVC / CVV *</label>
                                                        <input
                                                            type="password"
                                                            value={formData.cardCvc}
                                                            onFocus={() => setIsCvcFocused(true)}
                                                            onBlur={() => setIsCvcFocused(false)}
                                                            onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value.substring(0, 4) })}
                                                            maxLength={4}
                                                            className={cn(
                                                                "w-full px-4 py-3 bg-white/5 border rounded-xl text-sm font-mono text-cream outline-none transition-all",
                                                                errors.cardCvc ? "border-red-500 bg-red-500/10" : "border-white/10 focus:border-caramel"
                                                            )}
                                                        />
                                                        {errors.cardCvc && <p className="text-red-400 text-[11px] mt-1">{errors.cardCvc}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}



                                    {/* CASH ON DELIVERY DESCRIPTION */}
                                    {formData.paymentMethod === 'cod' && (
                                        <div className="p-6 rounded-2xl bg-caramel/10 border border-caramel/25 text-center space-y-2">
                                            <HeartHandshake size={28} className="mx-auto text-caramel" />
                                            <h4 className="font-serif font-bold text-cream text-lg">Cash on Hearth Delivery</h4>
                                            <p className="text-xs text-cream/70 max-w-sm mx-auto">
                                                Settle in cash directly with our white-glove courier when your warm cookies reach your door.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Step Navigation Buttons */}
                                <div className="flex items-center justify-between pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(2)}
                                        className="inline-flex items-center gap-1.5 px-6 py-3.5 rounded-full border border-white/15 text-cream/70 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all cursor-pointer"
                                    >
                                        <ChevronLeft size={16} />
                                        <span>Back to Delivery</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleFinalSubmit}
                                        disabled={isSubmitting}
                                        className="px-8 py-3.5 rounded-full bg-gradient-to-r from-cookie via-caramel to-[#bf7733] text-chocolate font-bold text-sm flex items-center gap-2 hover:brightness-110 transition-all shadow-xl shadow-caramel/30 cursor-pointer active:scale-95"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-chocolate border-t-transparent rounded-full animate-spin" />
                                                <span>Authorizing Order...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Complete Order & Bake</span>
                                                <ChevronRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: STICKY ARTISANAL ORDER SUMMARY */}
                    <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
                        <div className="rounded-3xl bg-gradient-to-b from-[#241613] via-[#1c110e] to-[#140b08] border border-amber-500/20 p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
                            {/* Ambient shimmer */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-caramel/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                                <h3 className="font-serif font-bold text-2xl text-cream">Order Summary</h3>
                                <span className="text-xs px-3 py-1 rounded-full bg-caramel/20 text-caramel font-semibold">
                                    {cart.length} {cart.length === 1 ? 'Selection' : 'Selections'}
                                </span>
                            </div>

                            {/* Free Luxury Packaging Progress Bar */}
                            <div className="mb-6 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                                <div className="flex justify-between items-center text-xs mb-2">
                                    <span className="text-cream/80 font-medium flex items-center gap-1.5">
                                        <Sparkles size={13} className="text-amber-300" />
                                        {remainingForPerk === 0 
                                            ? 'Complimentary Gold Gift Seal Unlocked!' 
                                            : `Add ₹${remainingForPerk.toFixed(2)} for VIP Packaging`}
                                    </span>
                                    <span className="text-caramel font-mono font-bold">
                                        {Math.min(100, Math.round((cartTotal / luxuryPackagingThreshold) * 100))}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-cookie via-caramel to-amber-400 transition-all duration-500"
                                        style={{ width: `${Math.min(100, (cartTotal / luxuryPackagingThreshold) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Cart Items with Inline Quantity Controls */}
                            <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1 no-scrollbar mb-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-chocolate/50 p-1 flex items-center justify-center shrink-0 border border-white/5">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <h4 className="font-serif font-bold text-cream text-xs line-clamp-1">{item.name}</h4>
                                                <span className="text-[11px] text-caramel font-semibold block">₹{item.price} / pck</span>
                                            </div>
                                        </div>

                                        {/* Inline Quantity Modifier */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-xl border border-white/10">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="text-white/60 hover:text-white p-0.5 cursor-pointer"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="font-mono text-xs px-1 text-cream font-bold">{item.quantity} <span className="text-[10px] text-white/40 font-normal">pck</span></span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="text-white/60 hover:text-white p-0.5 cursor-pointer"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>

                                            <span className="font-serif font-bold text-cream text-xs w-16 text-right">
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-white/30 hover:text-red-400 p-1 cursor-pointer transition-colors"
                                                title="Remove item"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Chef Recommendations Pairing Drawer */}
                            {suggestedCookies.length > 0 && (
                                <div className="mb-6 pt-4 border-t border-white/10">
                                    <span className="text-[11px] font-bold text-caramel uppercase tracking-wider block mb-2 flex items-center gap-1">
                                        <Sparkles size={12} /> Master Baker's Recommended Pairing:
                                    </span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {suggestedCookies.map(cookie => (
                                            <div key={cookie.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <img src={cookie.image} alt={cookie.name} className="w-8 h-8 object-contain shrink-0" />
                                                    <div className="truncate">
                                                        <span className="block text-[11px] font-serif font-bold text-cream truncate">{cookie.name}</span>
                                                        <span className="text-[10px] text-caramel">₹{cookie.price} / pck</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => addToCart(cookie)}
                                                    className="px-2 py-1 rounded-lg bg-caramel/20 hover:bg-caramel hover:text-chocolate text-caramel text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                                                >
                                                    + Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Promo Code Input & Quick Tags */}
                            <div className="pt-4 border-t border-white/10 mb-6">
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="Enter promo code"
                                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 focus:border-caramel rounded-xl text-xs text-cream uppercase tracking-wider placeholder-white/30 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleApplyPromo()}
                                        className="px-4 py-2.5 rounded-xl bg-caramel/20 hover:bg-caramel hover:text-chocolate text-caramel font-bold text-xs transition-all cursor-pointer shrink-0"
                                    >
                                        Apply
                                    </button>
                                </div>

                                {promoError && <p className="text-red-400 text-[11px] mt-1.5">{promoError}</p>}
                                {promoSuccess && <p className="text-emerald-400 text-[11px] mt-1.5 font-semibold">{promoSuccess}</p>}
                            </div>

                            {/* Calculations Breakdown */}
                            <div className="space-y-3 text-xs mb-6">
                                <div className="flex justify-between text-cream/70">
                                    <span>Bag Subtotal</span>
                                    <span>₹{cartTotal.toFixed(2)}</span>
                                </div>
                                {appliedDiscount > 0 && (
                                    <div className="flex justify-between text-emerald-400 font-semibold">
                                        <span>Promo Discount</span>
                                        <span>-₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-cream/70">
                                    <span>Shipping & Packaging</span>
                                    <span>{shippingFee === 0 ? 'COMPLIMENTARY' : `₹${shippingFee.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-cream/70">
                                    <span>Patisserie Sales Tax (5%)</span>
                                    <span>₹{taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-baseline pt-4 border-t border-white/10">
                                    <span className="font-serif font-bold text-base text-cream">Grand Total</span>
                                    <div className="text-right">
                                        <span className="text-3xl font-serif font-bold text-caramel drop-shadow">
                                            ₹{finalTotal.toFixed(2)}
                                        </span>
                                        <span className="block text-[10px] text-white/40 mt-0.5">Taxes & insured dispatch included</span>
                                    </div>
                                </div>
                            </div>

                            {/* Big Action Submit CTA Button */}
                            <button
                                type="button"
                                onClick={handleFinalSubmit}
                                disabled={isSubmitting}
                                className={cn(
                                    "w-full py-4 rounded-full font-bold text-base flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 cursor-pointer",
                                    isSubmitting 
                                        ? "bg-caramel/50 text-chocolate cursor-wait" 
                                        : "bg-gradient-to-r from-cookie via-caramel to-[#bf7733] text-chocolate hover:shadow-[0_0_30px_rgba(212,140,69,0.5)] hover:brightness-110"
                                )}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-chocolate border-t-transparent rounded-full animate-spin" />
                                        <span>Baking & Confirming Order...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Place Order & Bake Fresh</span>
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>

                            {/* Trust badges */}
                            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-center gap-4 text-[11px] text-cream/50">
                                <span className="flex items-center gap-1">
                                    <ShieldCheck size={14} className="text-caramel" /> 100% Freshness Guarantee
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <FileText size={14} className="text-caramel" /> Official Tax PDF Bill
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            <Footer />
        </div>
    );
}
