import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Menu, X, ShoppingBag, Search, Sparkles, Plus, Minus, Trash2, ChevronRight, Star, ArrowLeft, Heart } from "lucide-react";
import { cn } from "../lib/utils";
import { usePageTransition } from "../context/TransitionContext";
import { useCart } from "../context/CartContext";
import { COOKIES } from "../data/cookies";

const AnimatedMenuIcon = ({ isOpen, className = "" }) => {
    return (
        <div className={cn("w-7 h-5 flex flex-col justify-between items-center relative py-[1.5px] cursor-pointer", className)}>
            {/* Top Bar */}
            <motion.span
                animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="w-6 h-[2.5px] rounded-full bg-caramel block origin-center shadow-[0_0_8px_rgba(212,140,69,0.4)]"
            />
            {/* Middle Bar */}
            <motion.span
                animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-6 h-[2.5px] rounded-full bg-caramel block origin-center shadow-[0_0_8px_rgba(212,140,69,0.4)]"
            />
            {/* Bottom Bar */}
            <motion.span
                animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="w-6 h-[2.5px] rounded-full bg-caramel block origin-center shadow-[0_0_8px_rgba(212,140,69,0.4)]"
            />
        </div>
    );
};

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {
        cart,
        removeFromCart,
        updateQuantity,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        wishlist,
        wishlistCount,
        isWishlistOpen,
        setIsWishlistOpen,
        removeFromWishlist
    } = useCart();
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isMobileMenuSearch, setIsMobileMenuSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchContainerRef = useRef(null);
    const searchInputRef = useRef(null);
    const mobileSearchInputRef = useRef(null);
    const { scrollY } = useScroll();
    const location = useLocation();
    const navigate = useNavigate();
    const { switchPage } = usePageTransition();

    const handleNavigation = (e, path) => {
        e.preventDefault();
        setIsOpen(false);
        setIsMobileMenuSearch(false);
        setSearchQuery("");
        if (location.pathname !== path) {
            switchPage(path);
        }
    };

    const handleSelectCookie = (cookie) => {
        setIsSearchExpanded(false);
        setIsMobileMenuSearch(false);
        setIsOpen(false);
        setSearchQuery("");
        const targetPath = `/shop?cookie=${cookie.id}`;
        if (location.pathname === '/shop') {
            navigate(targetPath);
        } else {
            switchPage(targetPath);
        }
    };

    // Filtered cookies based on search query
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase().trim();
        return COOKIES.filter((cookie) =>
            cookie.name.toLowerCase().includes(q) ||
            cookie.category.toLowerCase().includes(q) ||
            cookie.description.toLowerCase().includes(q)
        );
    }, [searchQuery]);

    // Handle outside click to collapse extended search bar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setIsSearchExpanded(false);
                setSearchQuery("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle Ctrl+K / Cmd+K to toggle search & Escape to collapse
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check for Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
                e.preventDefault();
                setIsSearchExpanded((prev) => {
                    if (!prev) {
                        setTimeout(() => searchInputRef.current?.focus(), 150);
                        return true;
                    } else {
                        setSearchQuery("");
                        return false;
                    }
                });
            }

            // Escape closes the search
            if (e.key === "Escape" && isSearchExpanded) {
                e.preventDefault();
                setIsSearchExpanded(false);
                setSearchQuery("");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSearchExpanded]);

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
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3, type: "spring" }}
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
                    <AnimatePresence>
                        {!isSearchExpanded && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, width: 0 }}
                                animate={{ opacity: 1, scale: 1, width: "auto" }}
                                exit={{ opacity: 0, scale: 0.85, width: 0 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="hidden md:flex items-center gap-2 bg-black/20 p-1 rounded-full border border-white/5 overflow-hidden"
                            >
                                {navLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.path}
                                        onClick={(e) => handleNavigation(e, link.path)}
                                        className="relative px-5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
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
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <div ref={searchContainerRef} className="relative flex items-center">
                            <motion.div
                                animate={{ width: isSearchExpanded ? 360 : 44 }}
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                className={cn(
                                    "h-11 flex items-center rounded-full border border-white/10 bg-white/5 transition-all overflow-hidden",
                                    isSearchExpanded ? "bg-[#1f130f] border-caramel/50 shadow-xl px-3" : "w-11 justify-center hover:bg-white/10 hover:border-caramel/30 cursor-pointer"
                                )}
                                onClick={() => {
                                    if (!isSearchExpanded) {
                                        setIsSearchExpanded(true);
                                        setTimeout(() => searchInputRef.current?.focus(), 150);
                                    }
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        if (!isSearchExpanded) {
                                            e.stopPropagation();
                                            setIsSearchExpanded(true);
                                            setTimeout(() => searchInputRef.current?.focus(), 150);
                                        }
                                    }}
                                    className="flex items-center justify-center text-cookie hover:text-caramel transition-colors shrink-0 cursor-pointer"
                                    aria-label="Search flavors (Ctrl+K)"
                                    title="Search flavors (Ctrl+K)"
                                >
                                    <Search size={18} />
                                </button>

                                {isSearchExpanded && (
                                    <>
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search flavors..."
                                            className="ml-2 bg-transparent border-none outline-none font-medium text-sm text-caramel placeholder-caramel/50 w-full min-w-0"
                                            autoFocus
                                        />
                                        <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono rounded bg-white/10 text-white/40 border border-white/10 mr-1 select-none pointer-events-none">
                                            ESC
                                        </span>
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSearchQuery("");
                                                    searchInputRef.current?.focus();
                                                }}
                                                className="text-white/40 hover:text-white p-1 shrink-0 cursor-pointer"
                                                aria-label="Clear search"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsSearchExpanded(false);
                                                setSearchQuery("");
                                            }}
                                            className="text-white/30 hover:text-white p-1 shrink-0 ml-0.5 cursor-pointer"
                                            aria-label="Collapse search"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                )}
                            </motion.div>

                            {/* Dropdown with live ecommerce search results */}
                            <AnimatePresence>
                                {isSearchExpanded && searchQuery.trim().length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-[#1a110e]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-3 z-50 overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between px-2 py-1 mb-2 border-b border-white/5">
                                            <span className="text-[10px] uppercase tracking-widest text-caramel font-bold">
                                                Results ({searchResults.length})
                                            </span>
                                            <button
                                                onClick={() => setSearchQuery("")}
                                                className="text-[10px] text-white/40 hover:text-caramel transition-colors cursor-pointer"
                                            >
                                                Clear
                                            </button>
                                        </div>

                                        <div className="max-h-72 overflow-y-auto space-y-1.5 no-scrollbar">
                                            {searchResults.length > 0 ? (
                                                searchResults.map((cookie) => (
                                                    <div
                                                        key={cookie.id}
                                                        onClick={() => handleSelectCookie(cookie)}
                                                        className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-caramel/30 transition-all cursor-pointer group"
                                                    >
                                                        <div className="w-12 h-12 bg-[#2b1b17] rounded-lg p-1 shrink-0 flex items-center justify-center">
                                                            <img
                                                                src={cookie.image}
                                                                alt={cookie.name}
                                                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[9px] uppercase tracking-wider text-caramel font-bold">
                                                                    {cookie.category}
                                                                </span>
                                                                <span className="text-[10px] text-white/40 flex items-center gap-0.5">
                                                                    <Star size={9} fill="currentColor" className="text-caramel" />
                                                                    {cookie.rating}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-xs font-serif font-bold text-cream truncate group-hover:text-caramel transition-colors">
                                                                {cookie.name}
                                                            </h4>
                                                            <span className="text-xs font-serif text-caramel font-semibold">
                                                                ${cookie.price.toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                addToCart(cookie);
                                                            }}
                                                            className="w-8 h-8 rounded-lg bg-caramel/15 hover:bg-caramel text-caramel hover:text-chocolate flex items-center justify-center transition-all active:scale-90 shrink-0 cursor-pointer"
                                                            title="Add to Bag"
                                                        >
                                                            <ShoppingBag size={14} />
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-6 text-center text-white/40 text-xs">
                                                    No cookies matching "{searchQuery}"
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Wishlist Button */}
                        <motion.button
                            onClick={() => setIsWishlistOpen(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative w-11 h-11 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-caramel/30 flex items-center justify-center text-cookie hover:text-caramel transition-colors cursor-pointer"
                            aria-label="Wishlist"
                        >
                            <Heart size={19} className={wishlistCount > 0 ? "fill-caramel text-caramel" : ""} />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-caramel text-chocolate text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-chocolate">
                                    {wishlistCount}
                                </span>
                            )}
                        </motion.button>

                        <motion.button
                            onClick={() => setIsCartOpen(true)}
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative w-11 h-11 rounded-full bg-gradient-to-b from-caramel to-chocolate-light flex items-center justify-center text-white shadow-lg shadow-caramel/20 cursor-pointer"
                        >
                            <ShoppingBag size={19} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cream text-chocolate text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-chocolate">
                                    {cartCount}
                                </span>
                            )}
                        </motion.button>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="flex md:hidden items-center gap-2">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                setIsMobileMenuSearch(false);
                                setIsOpen(!isOpen);
                            }}
                            className="p-2 text-cookie hover:text-caramel transition-colors cursor-pointer flex items-center justify-center rounded-lg"
                            aria-label="Toggle Menu"
                        >
                            <AnimatedMenuIcon isOpen={isOpen} />
                        </motion.button>
                    </div>
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
                        <motion.div className="fixed inset-0 z-1202 flex flex-col justify-center items-center px-4 overflow-y-auto">
                            <motion.button
                                initial={{ opacity: 0, rotate: -90, scale: 0 }}
                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsMobileMenuSearch(false);
                                    setSearchQuery("");
                                }}
                                className="absolute top-8 right-8 p-3.5 text-cream transition-colors bg-white/10 hover:bg-caramel/20 border border-white/10 rounded-full z-50 cursor-pointer pointer-events-auto flex items-center justify-center"
                                aria-label="Close Menu"
                            >
                                <AnimatedMenuIcon isOpen={true} />
                            </motion.button>

                            {isMobileMenuSearch ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="relative z-10 w-full max-w-md my-auto py-10 flex flex-col"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsMobileMenuSearch(false)}
                                            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-caramel transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10 cursor-pointer"
                                        >
                                            <ArrowLeft size={14} />
                                            <span>Back to Menu</span>
                                        </button>
                                        <span className="text-xs uppercase tracking-widest text-caramel font-bold">Search Flavors</span>
                                    </div>

                                    {/* Mobile Search Bar */}
                                    <div className="relative w-full mb-3">
                                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-caramel/70" />
                                        <input
                                            ref={mobileSearchInputRef}
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search 7 fresh flavors..."
                                            className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/15 focus:border-caramel rounded-2xl text-cream placeholder-white/40 outline-none text-base transition-all shadow-inner"
                                            autoFocus
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    mobileSearchInputRef.current?.focus();
                                                }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 cursor-pointer"
                                                aria-label="Clear query"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Quick Suggestion Chips */}
                                    {!searchQuery && (
                                        <div className="w-full mb-6">
                                            <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2 font-medium">Quick Flavors</p>
                                            <div className="flex flex-wrap gap-2">
                                                {["Dark Chocolate", "Matcha Bloom", "Red Velvet", "Honeycomb", "Classic"].map((tag) => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => setSearchQuery(tag)}
                                                        className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-caramel/20 hover:text-caramel border border-white/10 text-xs text-white/70 transition-all cursor-pointer"
                                                    >
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Live Search Results */}
                                    {searchQuery.trim().length > 0 && (
                                        <div className="w-full max-h-[50vh] overflow-y-auto space-y-2 pr-1 no-scrollbar">
                                            <div className="flex items-center justify-between px-1 mb-1">
                                                <span className="text-xs text-caramel font-semibold">
                                                    Results ({searchResults.length})
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSearchQuery("")}
                                                    className="text-xs text-white/40 hover:text-white transition-colors"
                                                >
                                                    Clear
                                                </button>
                                            </div>

                                            {searchResults.length > 0 ? (
                                                searchResults.map((cookie) => (
                                                    <div
                                                        key={cookie.id}
                                                        onClick={() => handleSelectCookie(cookie)}
                                                        className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-caramel/40 transition-all cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-[#2b1b17] rounded-xl p-1.5 shrink-0 flex items-center justify-center border border-white/5">
                                                                <img src={cookie.image} alt={cookie.name} className="w-full h-full object-contain" />
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="text-cream text-sm font-bold font-serif leading-tight">{cookie.name}</div>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-[11px] text-caramel">{cookie.category}</span>
                                                                    <span className="text-white/20">•</span>
                                                                    <div className="flex items-center gap-0.5 text-[11px] text-amber-300">
                                                                        <Star size={11} className="fill-amber-300 text-amber-300" />
                                                                        <span>{cookie.rating}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-caramel font-serif font-bold text-sm">${cookie.price.toFixed(2)}</span>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    addToCart(cookie);
                                                                }}
                                                                className="p-2 rounded-xl bg-caramel text-chocolate hover:bg-white transition-all shadow-md cursor-pointer shrink-0"
                                                                aria-label="Add to bag"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-8 text-center bg-white/[0.03] rounded-2xl border border-white/5">
                                                    <p className="text-white/60 text-sm">No cookies matching "{searchQuery}"</p>
                                                    <p className="text-white/30 text-xs mt-1">Try searching for chocolate, velvet, or matcha</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
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
                                    <div className="mt-12 flex justify-center gap-6">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsMobileMenuSearch(true);
                                                setTimeout(() => mobileSearchInputRef.current?.focus(), 150);
                                            }}
                                            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-caramel hover:border-caramel/40 transition-colors cursor-pointer"
                                            aria-label="Search"
                                        >
                                            <Search size={26} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsOpen(false);
                                                setIsWishlistOpen(true);
                                            }}
                                            className="relative w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-caramel hover:border-caramel/40 transition-colors cursor-pointer"
                                            aria-label="Wishlist"
                                        >
                                            <Heart size={26} className={wishlistCount > 0 ? "fill-caramel text-caramel" : ""} />
                                            {wishlistCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-caramel text-chocolate text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                                                    {wishlistCount}
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsOpen(false);
                                                setIsCartOpen(true);
                                            }}
                                            className="relative w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-caramel hover:border-caramel/40 transition-colors cursor-pointer"
                                            aria-label="Cart"
                                        >
                                            <ShoppingBag size={26} />
                                            {cartCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-caramel text-chocolate text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                                                    {cartCount}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
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
                                <button 
                                    disabled={cart.length === 0} 
                                    onClick={(e) => {
                                        setIsCartOpen(false);
                                        handleNavigation(e, '/checkout');
                                    }}
                                    className="w-full py-5 rounded-full font-bold text-lg bg-caramel text-chocolate hover:bg-white transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-caramel/20"
                                >
                                    Checkout <ChevronRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Wishlist Drawer Overlay */}
            <AnimatePresence>
                {isWishlistOpen && (
                    <div className="fixed inset-0 z-1000 pointer-events-none">
                        <motion.div
                            key="wishlist-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsWishlistOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm shadow-[0_0_100px_rgba(0,0,0,0.5)] pointer-events-auto"
                        />
                        <motion.div
                            key="wishlist-panel"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#1a110e] border-l border-white/10 shadow-2xl flex flex-col pointer-events-auto z-1001"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-caramel">
                                        <Heart size={20} className="fill-caramel" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-serif text-cream">Favorites</h2>
                                        <p className="text-white/40 text-xs">{wishlistCount} {wishlistCount === 1 ? 'flavor saved' : 'flavors saved'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsWishlistOpen(false)}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-caramel hover:text-chocolate transition-all cursor-pointer"
                                    aria-label="Close wishlist"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                                {wishlist.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 mb-4">
                                            <Heart size={36} />
                                        </div>
                                        <h3 className="text-xl font-serif text-cream mb-2">No favorites yet</h3>
                                        <p className="text-white/40 text-sm max-w-xs mb-6">
                                            Save your favorite handcrafted cookie flavors to easily find and order them later.
                                        </p>
                                        <button
                                            onClick={(e) => {
                                                setIsWishlistOpen(false);
                                                handleNavigation(e, "/shop");
                                            }}
                                            className="px-6 py-3 rounded-full bg-caramel text-chocolate font-bold text-sm hover:bg-white transition-all cursor-pointer shadow-lg shadow-caramel/20"
                                        >
                                            Explore Flavors
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {wishlist.map((item) => (
                                            <motion.div key={item.id} layout className="flex gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-caramel/20 transition-all">
                                                <div
                                                    onClick={() => {
                                                        setIsWishlistOpen(false);
                                                        handleSelectCookie(item);
                                                    }}
                                                    className="w-20 h-20 bg-chocolate rounded-2xl flex items-center justify-center p-2 cursor-pointer shrink-0"
                                                >
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div className="flex justify-between items-start">
                                                        <div
                                                            onClick={() => {
                                                                setIsWishlistOpen(false);
                                                                handleSelectCookie(item);
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            <h4 className="text-cream font-medium hover:text-caramel transition-colors">{item.name}</h4>
                                                            <p className="text-white/30 text-xs">{item.category}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromWishlist(item.id)}
                                                            className="text-white/20 hover:text-red-400 transition-colors p-1 cursor-pointer"
                                                            aria-label="Remove from favorites"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-3">
                                                        <span className="text-caramel font-serif font-bold">${item.price.toFixed(2)}</span>
                                                        <button
                                                            onClick={() => {
                                                                addToCart(item);
                                                                removeFromWishlist(item.id);
                                                                setIsWishlistOpen(false);
                                                            }}
                                                            className="px-4 py-2 rounded-full bg-caramel text-chocolate hover:bg-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                                                        >
                                                            <Plus size={14} /> Add to Bag
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {wishlist.length > 0 && (
                                <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-md">
                                    <button
                                        onClick={() => {
                                            wishlist.forEach((item) => {
                                                addToCart(item);
                                                removeFromWishlist(item.id);
                                            });
                                            setIsWishlistOpen(false);
                                        }}
                                        className="w-full py-4 rounded-full font-bold text-base bg-caramel text-chocolate hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-caramel/20"
                                    >
                                        <ShoppingBag size={18} /> Move All to Bag
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </>
    );
};

export default Navbar;
