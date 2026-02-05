import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Menu, X, ShoppingBag, Search, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

import { usePageTransition } from "../context/TransitionContext";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
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
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
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
                                onMouseEnter={(e) => {
                                    // Optional: Add hover sound or slight vibration logic here
                                }}
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
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-cream text-chocolate text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-chocolate">
                                0
                            </span>
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
                        {/* Backdrop Blur Layer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm md:hidden"
                        />

                        {/* Liquid Background Blob layer */}
                        <div className="fixed inset-0 z-[60] pointer-events-none md:hidden overflow-hidden">
                            {/* The blob originates from the button position (approx top-8 right-8) */}
                            <motion.div
                                initial={{
                                    top: "2rem",
                                    right: "2rem",
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    scale: 1
                                }}
                                animate={{
                                    scale: 80,
                                    borderRadius: ["50%", "40% 60% 70% 30% / 40% 50% 60% 50%", "50%"],
                                }}
                                exit={{
                                    scale: 0,
                                    borderRadius: "50%",
                                    transition: { duration: 0.6, ease: "backIn" }
                                }}
                                transition={{
                                    scale: { duration: 0.8, ease: [0.32, 0, 0.67, 0] },
                                    borderRadius: { duration: 0.8, ease: "linear" }
                                }}
                                className="absolute bg-[#1a110e]"
                            />
                        </div>

                        {/* Main Menu Content Container */}
                        <motion.div
                            className="fixed inset-0 z-[60] flex flex-col justify-center items-center overflow-hidden"
                        >
                            {/* Animated Grain Background (Fade in) */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.15 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"
                            />

                            {/* Decorative Floating Blobs (Fade in) */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, rotate: 360 }}
                                exit={{ opacity: 0 }}
                                transition={{ opacity: { delay: 0.4 }, rotate: { duration: 50, repeat: Infinity, ease: "linear" } }}
                                className="absolute -top-[20%] -right-[20%] w-[80vw] h-[80vw] bg-caramel/5 rounded-full blur-[100px]"
                            />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, rotate: -360 }}
                                exit={{ opacity: 0 }}
                                transition={{ opacity: { delay: 0.4 }, rotate: { duration: 40, repeat: Infinity, ease: "linear" } }}
                                className="absolute -bottom-[20%] -left-[20%] w-[60vw] h-[60vw] bg-chocolate/20 rounded-full blur-[80px]"
                            />

                            {/* Close Button */}
                            <motion.button
                                initial={{ opacity: 0, rotate: -90, scale: 0 }}
                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                onClick={() => setIsOpen(false)}
                                className="absolute top-8 right-8 p-4 text-cookie hover:text-white transition-colors bg-white/5 rounded-full hover:bg-caramel hover:text-chocolate z-50"
                            >
                                <X size={32} />
                            </motion.button>

                            {/* Menu Container */}
                            <div className="flex flex-col gap-8 text-center relative z-10 w-full px-12 perspective-1000">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 0.6, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-caramel text-xs tracking-[0.5em] uppercase mb-4"
                                >
                                </motion.span>

                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, y: 100, rotateX: -45 }}
                                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                        exit={{ opacity: 0, y: -50, transition: { duration: 0.3 } }}
                                        transition={{
                                            delay: 0.3 + index * 0.1,
                                            duration: 0.8,
                                            type: "spring",
                                            damping: 20
                                        }}
                                        className="origin-bottom"
                                    >
                                        <a
                                            href={link.path}
                                            onClick={(e) => handleNavigation(e, link.path)}
                                            className="group relative inline-block"
                                        >
                                            <span className={cn(
                                                "text-6xl font-serif font-light tracking-tight transition-all duration-500 block relative z-10",
                                                location.pathname === link.path
                                                    ? "text-transparent bg-clip-text bg-gradient-to-r from-caramel to-cookie scale-110"
                                                    : "text-white/40 hover:text-white"
                                            )}>
                                                {link.name}
                                            </span>

                                            {/* Hover Glow */}
                                            <span className="absolute inset-0 bg-caramel/20 blur-[20px] scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full -z-10" />
                                        </a>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Bottom Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.6 }}
                                className="mt-20 flex gap-8 relative z-10"
                            >
                                <div className="flex flex-col items-center gap-3 group cursor-pointer" onClick={() => { setIsOpen(false); setIsSearchOpen(true); }}>
                                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cream group-hover:bg-caramel group-hover:text-chocolate group-hover:scale-110 transition-all duration-300 shadow-lg">
                                        <Search size={24} />
                                    </div>
                                    <span className="text-[10px] text-white/30 uppercase tracking-widest group-hover:text-caramel transition-colors">Search</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 group cursor-pointer" onClick={() => { setIsOpen(false); setIsCartOpen(true); }}>
                                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cream group-hover:bg-caramel group-hover:text-chocolate group-hover:scale-110 transition-all duration-300 shadow-lg relative">
                                        <ShoppingBag size={24} />
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-caramel text-chocolate text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1a110e]">0</span>
                                    </div>
                                    <span className="text-[10px] text-white/30 uppercase tracking-widest group-hover:text-caramel transition-colors">Cart</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Cart Drawer */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        {/* Cart Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCartOpen(false)}
                            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                        />

                        {/* Cart Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#1a110e] border-l border-white/10 z-[70] shadow-2xl flex flex-col"
                        >
                            {/* Texture Overlay */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />

                            {/* Cart Header */}
                            <div className="relative z-10 p-8 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-3xl font-serif text-cream">Your Bag</h2>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-caramel hover:text-chocolate transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Cart Content (Empty State) */}
                            <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                                    <ShoppingBag size={40} className="text-white/20" />
                                </div>
                                <h3 className="text-xl text-white/80 font-medium mb-2">No cookies yet?</h3>
                                <p className="text-white/40 mb-8 max-w-[200px]">Your jar is looking a little light. Let's fix that.</p>

                                <a
                                    href="/shop"
                                    onClick={(e) => { handleNavigation(e, "/shop"); setIsCartOpen(false); }}
                                    className="px-8 py-3 bg-caramel text-chocolate rounded-full font-bold hover:bg-[#d48c45] transition-colors"
                                >
                                    Start Filling
                                </a>
                            </div>

                            {/* Cart Footer */}
                            <div className="p-8 border-t border-white/5 bg-black/20 relative z-10">
                                <div className="flex justify-between items-center mb-4 text-white/50">
                                    <span>Subtotal</span>
                                    <span>$0.00</span>
                                </div>
                                <button disabled className="w-full py-4 bg-white/10 text-white/30 rounded-full font-bold cursor-not-allowed">
                                    Checkout
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-[80] bg-[#1a110e]/95 backdrop-blur-xl flex flex-col items-center justify-center"
                    >
                        {/* Close Button */}
                        <motion.button
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            onClick={() => { setIsSearchOpen(false); setIsOpen(true); }}
                            className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-caramel hover:text-chocolate transition-colors"
                        >
                            <X size={24} />
                        </motion.button>

                        <div className="w-full max-w-3xl px-6">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="relative group"
                            >
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/20 w-8 h-8 md:w-12 md:h-12 group-focus-within:text-caramel transition-colors duration-300" />
                                <input
                                    type="text"
                                    placeholder="Type to search..."
                                    autoFocus
                                    className="w-full bg-transparent border-b-2 border-white/10 py-6 pl-12 md:pl-20 text-3xl md:text-6xl font-serif text-cream placeholder-white/10 focus:outline-none focus:border-caramel transition-colors duration-300"
                                />
                            </motion.div>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mt-6 text-white/30 text-sm md:text-base text-center md:text-left pl-0 md:pl-20"
                            >
                                Press <span className="text-caramel">Enter</span> to find your flavor.
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
