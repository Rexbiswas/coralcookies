import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Phone, Send, ArrowUpRight, Instagram, Twitter, MessageCircle, Sparkles } from 'lucide-react';
import Footer from '../components/Footer';
import MagneticButton from '../components/MagneticButton';

const ContactInfoCard = ({ icon: Icon, title, content, link, index }) => (
    <motion.a
        href={link}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.8 }}
        className="group relative block p-8 rounded-4xl bg-white/5 border border-white/5 hover:border-caramel/30 transition-all duration-500 overflow-hidden"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-caramel/5 rounded-full blur-3xl group-hover:bg-caramel/10 transition-colors" />
        <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-caramel/10 flex items-center justify-center text-caramel mb-6 group-hover:scale-110 transition-transform duration-500">
                <Icon size={24} />
            </div>
            <h3 className="text-cream/40 text-xs uppercase tracking-[0.3em] font-bold mb-2">{title}</h3>
            <p className="text-2xl font-serif text-cream group-hover:text-caramel transition-colors">{content}</p>
            <div className="mt-6 flex items-center gap-2 text-white/20 group-hover:text-caramel transition-colors">
                <span className="text-[10px] uppercase tracking-widest font-bold">Open Link</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
        </div>
    </motion.a>
);

const InputField = ({ label, type = "text", placeholder }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <div className="relative mb-8 group">
            <label className={`block text-[10px] uppercase tracking-[0.3em] font-bold mb-3 transition-colors ${isFocused ? 'text-caramel' : 'text-cream/30'}`}>
                {label}
            </label>
            <div className="relative">
                <input
                    type={type}
                    placeholder={placeholder}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full bg-transparent border-b-2 border-white/5 py-4 text-xl text-cream placeholder-white/5 focus:outline-none transition-all duration-500 focus:border-caramel"
                />
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isFocused ? 1 : 0 }}
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-caramel origin-left"
                />
            </div>
        </div>
    );
};

const Contact = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 3000);
    };

    return (
        <div className="min-h-screen bg-chocolate selection:bg-caramel/30">
            {/* HERO SECTION */}
            <section className="relative pt-40 pb-20 px-6 container mx-auto overflow-hidden">
                <div className="max-w-4xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-8"
                    >
                        <div className="w-12 h-px bg-caramel" />
                        <span className="text-caramel uppercase tracking-[0.4em] text-xs font-bold">Inquiries</span>
                    </motion.div>

                    <h1 className="text-6xl md:text-[9rem] font-serif font-bold text-cream leading-[0.8] tracking-tighter mb-12">
                        Let's Talk <br />
                        <span className="italic text-caramel">Cookies.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-white/50 max-w-2xl font-light leading-relaxed">
                        Whether you're planning a corporate event, seeking a custom batch, or just want to say hi, we're here to make life sweeter.
                    </p>
                </div>

                {/* Decorative background blob */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-caramel/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 z-0" />
            </section>

            {/* MAIN CONTENT GRID */}
            <section className="container mx-auto px-6 py-20 pb-40">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

                    {/* INFO COL */}
                    <div className="lg:col-span-5 space-y-8">
                        <ContactInfoCard
                            index={0}
                            icon={Mail}
                            title="Email us at"
                            content="hello@coralcookies.com"
                            link="mailto:hello@coralcookies.com"
                        />
                        <ContactInfoCard
                            index={1}
                            icon={MapPin}
                            title="Visit the Bakery"
                            content="221B Sugar Street, London"
                            link="https://maps.google.com"
                        />
                        <ContactInfoCard
                            index={2}
                            icon={Phone}
                            title="Call us"
                            content="+44 (0) 20 7946 0123"
                            link="tel:+4402079460123"
                        />

                        {/* Social Links */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="pt-12 border-t border-white/5"
                        >
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-cream/30 mb-8 block">Connect with our community</span>
                            <div className="flex gap-6">
                                {[
                                    { icon: Instagram, label: "Instagram" },
                                    { icon: Twitter, label: "Twitter" },
                                    { icon: MessageCircle, label: "Discord" }
                                ].map((social, i) => (
                                    <motion.a
                                        key={i}
                                        href="#"
                                        whileHover={{ scale: 1.1, color: "#D48C45" }}
                                        className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-cream transition-colors duration-300"
                                    >
                                        <social.icon size={20} />
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* FORM COL */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="p-10 md:p-16 rounded-4xl bg-linear-to-br from-white/3 to-white/1 border border-white/5 backdrop-blur-xl relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />

                            <form onSubmit={handleSubmit} className="relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <InputField label="Your Name" placeholder="Jean-Luc Picard" />
                                    <InputField label="Email Address" type="email" placeholder="jean-luc@starfleet.com" />
                                </div>
                                <InputField label="The Occasion" placeholder="Corporate Event / Custom Batch" />

                                <div className="relative mb-12 group">
                                    <label className="block text-[10px] uppercase tracking-[0.3em] font-bold mb-3 text-cream/30 group-focus-within:text-caramel">
                                        Your Message
                                    </label>
                                    <textarea
                                        rows="4"
                                        placeholder="Tell us everything about your cookie dreams..."
                                        className="w-full bg-transparent border-b-2 border-white/5 py-4 text-xl text-cream placeholder-white/5 focus:outline-none transition-all duration-500 focus:border-caramel resize-none"
                                    />
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-3 text-white/30 text-xs">
                                        <div className="w-2 h-2 rounded-full bg-caramel animate-pulse" />
                                        We typically respond within 24 hours.
                                    </div>

                                    <MagneticButton className="group relative w-full md:w-auto px-12 py-6 bg-caramel hover:bg-[#d48c45] text-chocolate rounded-full font-bold text-xl transition-all overflow-hidden flex items-center justify-center gap-3">
                                        <AnimatePresence mode='wait'>
                                            {!isSubmitted ? (
                                                <motion.span
                                                    key="send"
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -20, opacity: 0 }}
                                                    className="flex items-center gap-3"
                                                >
                                                    Send Message <Send size={20} />
                                                </motion.span>
                                            ) : (
                                                <motion.span
                                                    key="success"
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -20, opacity: 0 }}
                                                    className="flex items-center gap-3 text-chocolate font-serif italic"
                                                >
                                                    Message Sent! <Sparkles size={20} />
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </MagneticButton>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ PREVIEW / STRIP */}
            <section className="bg-caramel py-12 -rotate-1 scale-105 border-y-4 border-chocolate z-20 relative">
                <div className="flex whitespace-nowrap overflow-hidden">
                    <motion.div
                        animate={{ x: "-50%" }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="flex gap-12 items-center font-serif text-3xl md:text-5xl font-bold uppercase tracking-tighter text-chocolate opacity-80"
                    >
                        {Array(10).fill("Let's Collaborate • Dream Big • Bake Sweet • ").map((text, i) => (
                            <span key={i}>{text}</span>
                        ))}
                    </motion.div>
                </div>
            </section>

            <div className="mt-20">
                <Footer />
            </div>
        </div>
    );
};

export default Contact;

