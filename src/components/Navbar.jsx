import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Menu, X, ShoppingBag, Search, Sparkles, Plus, Minus, Trash2, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { usePageTransition } from "../context/TransitionContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { cart, removeFromCart, updateQuantity, cartCount, cartTotal, isCartOpen, setIsCartOpen } = useCart();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSearchHovered, setIsSearchHovered] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { scrollY } = useScroll();
    const location = useLocation();
    const { switchPage } = usePageTransition();

    const handleNavigation = (e, path) => {
        e.preventDefault();
        setIsOpen(false);
        if (location.pathname !== path) {
            switchPage(path);
        }
    };

    // Dynamic navbar shape and color based on scroll
    const navWidth = useTransform(scrollY, [0, 100], ["100%", "90%"]);
    const navTop = useTransform(scrollY, [0, 100], ["0%", "2%"]);
    const navBorderRadius = useTransform(scrollY, [0, 100], ["0px", "24px"]);
    const glassEffect = useTransform(scrollY, [0, 100], ["rgba(43, 27, 23, 0)", "rgba(43, 27, 23, 0.8)"]);

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Cookies", path: "/shop" },
        { name: "Our Story", path: "/about" },
        { name: "Contact", path: "/contact" },
    ];

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-150 flex justify-center pointer-events-none">
                <motion.nav
                    style={{
                        width: navWidth,
                        top: navTop,
                        borderRadius: navBorderRadius,
                        backgroundColor: glassEffect,
                    }}
                    className="pointer-events-auto backdrop-blur-xl border border-white/5 shadow-2xl transition-all duration-300 px-6 md:px-8 py-4 flex items-center justify-between max-w-7xl mx-auto"
                >
                    {/* Logo */}
                    <a href="/" onClick={(e) => handleNavigation(e, "/")} className="text-2xl font-serif font-bold tracking-tight flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-caramel to-chocolate-light border-2 border-white/10 flex items-center justify-center text-chocolate font-extrabold text-lg shadow-[0_0_15px_rgba(212,140,69,0.3)] relative overflow-hidden"
                        >
                            C
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)]" />
                        </motion.div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cream via-cookie to-caramel font-serif">
                            CoralCookies
                        </span>
                    </a>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-2 bg-black/20 p-1 rounded-full border border-white/5">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.path}
                                onClick={(e) => handleNavigation(e, link.path)}
                                className="relative px-5 py-2 rounded-full text-sm font-medium transition-colors"
                            >
                                <div className="relative z-10 flex items-center gap-2">
                                    <span className={cn(
                                        "transition-colors duration-300",
                                        location.pathname === link.path ? "text-chocolate font-bold" : "text-neutral-300 hover:text-white"
                                    )}>
                                        {link.name}
                                    </span>
                                </div>
                                {location.pathname === link.path && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute inset-0 bg-gradient-to-r from-cookie to-caramel rounded-full shadow-lg"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </a>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <motion.div
                            initial="collapsed"
                            animate={(isSearchHovered || isSearchFocused) ? "expanded" : "collapsed"}
                            onHoverStart={() => setIsSearchHovered(true)}
                            onHoverEnd={() => setIsSearchHovered(false)}
                            className="relative flex items-center bg-white/5 border border-white/5 rounded-full text-cookie overflow-hidden"
                        >
                            <motion.div
                                variants={{
                                    collapsed: { width: "40px" },
                                    expanded: { width: "180px" }
                                }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="flex items-center h-10 px-3"
                            >
                                <Search size={18} className="min-w-[18px] text-cookie shrink-0" />
                                <motion.input
                                    variants={{
                                        collapsed: { opacity: 0, width: 0, display: "none" },
                                        expanded: { opacity: 1, width: "100%", display: "block" }
                                    }}
                                    transition={{ duration: 0.3 }}
                                    type="text"
                                    placeholder="Search..."
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    className="ml-2 bg-transparent border-none outline-none font-medium text-sm text-caramel placeholder-caramel/50 w-full min-w-[100px]"
                                />
                            </motion.div>
                        </motion.div>

                        <motion.button
                            onClick={() => setIsCartOpen(true)}
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative w-12 h-12 rounded-full bg-gradient-to-b from-caramel to-chocolate-light flex items-center justify-center text-white shadow-lg shadow-caramel/20"
                        >
                            <ShoppingBag size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cream text-chocolate text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-chocolate">
                                    {cartCount}
                                </span>
                            )}
                        </motion.button>
                    </div>

                    {/* Mobile Toggle */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="md:hidden p-2 text-cookie hover:text-caramel transition-colors"
                    >
                        <Menu size={28} />
                    </motion.button>
                </motion.nav>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="fixed inset-0 z-1200 bg-black/60 backdrop-blur-sm md:hidden"
                        />
                        <div className="fixed inset-0 z-1201 pointer-events-none md:hidden overflow-hidden">
                            <motion.div
                                initial={{ top: "2rem", right: "2rem", width: "40px", height: "40px", borderRadius: "50%", scale: 1 }}
                                animate={{ scale: 80, borderRadius: ["50%", "40% 60% 70% 30% / 40% 50% 60% 50%", "50%"] }}
                                exit={{ scale: 0, borderRadius: "50%", transition: { duration: 0.6, ease: "backIn" } }}
                                transition={{ scale: { duration: 0.8, ease: [0.32, 0, 0.67, 0] }, borderRadius: { duration: 0.8, ease: "linear" } }}
                                className="absolute bg-[#1a110e]"
                            />
                        </div>
                        <motion.div className="fixed inset-0 z-1202 flex flex-col justify-center items-center">
                            <motion.button
                                initial={{ opacity: 0, rotate: -90, scale: 0 }}
                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="absolute top-8 right-8 p-4 text-white/50 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-caramel hover:text-chocolate z-50 cursor-pointer pointer-events-auto"
                            >
                                <X size={32} />
                            </motion.button>
                            <div className="flex flex-col gap-8 text-center relative z-10 w-full px-12">
                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -50 }}
                                        transition={{ delay: 0.1 * index }}
                                    >
                                        <a href={link.path} onClick={(e) => handleNavigation(e, link.path)} className="text-5xl font-serif text-white/40 hover:text-white transition-colors">
                                            {link.name}
                                        </a>
                                    </motion.div>
                                ))}
                                <div className="mt-12 flex justify-center gap-8">
                                    <button onClick={() => { setIsOpen(false); setIsSearchOpen(true); }} className="text-white/40 hover:text-caramel transition-colors"><Search size={32} /></button>
                                    <button onClick={() => { setIsOpen(false); setIsCartOpen(true); }} className="relative text-white/40 hover:text-caramel transition-colors">
                                        <ShoppingBag size={32} />
                                        {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-caramel text-chocolate text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{cartCount}</span>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Cart Drawer Overlay */}
            <AnimatePresence>
                {isCartOpen && (
                    <div className="fixed inset-0 z-1000 pointer-events-none">
                        <motion.div
                            key="cart-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCartOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm shadow-[0_0_100px_rgba(0,0,0,0.5)] pointer-events-auto"
                        />
                        <motion.div
                            key="cart-panel"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#1a110e] border-l border-white/10 shadow-2xl flex flex-col pointer-events-auto z-1001"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-3xl font-serif text-cream">Your Bag</h2>
                                <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-caramel hover:text-chocolate transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                        <ShoppingBag size={64} className="mb-4" />
                                        <p className="text-xl">Your bag is empty</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {cart.map((item) => (
                                            <motion.div key={item.id} layout className="flex gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 transition-all">
                                                <div className="w-20 h-20 bg-chocolate rounded-2xl flex items-center justify-center p-2"><img src={item.image} alt="" className="w-full h-full object-contain" /></div>
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div className="flex justify-between items-start">
                                                        <div><h4 className="text-cream font-medium">{item.name}</h4><p className="text-white/30 text-xs">{item.category}</p></div>
                                                        <button onClick={() => removeFromCart(item.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3 bg-black/20 rounded-full px-3 py-1 border border-white/5">
                                                            <button onClick={() => updateQuantity(item.id, -1)} className="text-white/40 hover:text-caramel transition-colors"><Minus size={14} /></button>
                                                            <span className="text-sm font-bold text-cream min-w-[12px] text-center">{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.id, 1)} className="text-white/40 hover:text-caramel transition-colors"><Plus size={14} /></button>
                                                        </div>
                                                        <span className="text-caramel font-serif font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-md">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-cream font-medium opacity-50">Total</span>
                                    <span className="text-3xl font-serif text-caramel font-bold">${cartTotal.toFixed(2)}</span>
                                </div>
                                <button disabled={cart.length === 0} className="w-full py-5 rounded-full font-bold text-lg bg-caramel text-chocolate hover:bg-white transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    Checkout <ChevronRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-1100 bg-[#1a110e]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
                    >
                        <button onClick={() => setIsSearchOpen(false)} className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-caramel hover:text-chocolate transition-colors"><X size={24} /></button>
                        <div className="w-full max-w-3xl">
                            <input type="text" placeholder="Search flavors..." autoFocus className="w-full bg-transparent border-b-2 border-white/10 py-6 text-4xl md:text-7xl font-serif text-cream placeholder-white/5 focus:outline-none focus:border-caramel transition-colors" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
