import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('coral_cookies_cart');
        if (savedCart) {
            try {
                return JSON.parse(savedCart);
            } catch (e) {
                console.error("Failed to parse cart", e);
                return [];
            }
        }
        return [];
    });
    const [wishlist, setWishlist] = useState(() => {
        const savedWishlist = localStorage.getItem('coral_cookies_wishlist');
        if (savedWishlist) {
            try {
                return JSON.parse(savedWishlist);
            } catch (e) {
                console.error("Failed to parse wishlist", e);
                return [];
            }
        }
        return [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // Save cart to localStorage
    useEffect(() => {
        localStorage.setItem('coral_cookies_cart', JSON.stringify(cart));
    }, [cart]);

    // Save wishlist to localStorage
    useEffect(() => {
        localStorage.setItem('coral_cookies_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const toggleWishlist = (product) => {
        if (!product) return;
        setWishlist((prev) => {
            const exists = prev.some((item) => item.id === product.id);
            if (exists) {
                showNotification(`Removed ${product.name} from wishlist`);
                return prev.filter((item) => item.id !== product.id);
            } else {
                showNotification(`Saved ${product.name} to wishlist!`);
                return [...prev, product];
            }
        });
    };

    const isInWishlist = (productId) => {
        return wishlist.some((item) => item.id === productId);
    };

    const removeFromWishlist = (productId) => {
        setWishlist((prev) => prev.filter((item) => item.id !== productId));
    };

    const addToCart = (product) => {
        if (!product) return;

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === product.id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });

        // Ensure notification and drawer open
        showNotification(`Added ${product.name} to bag!`);
        setTimeout(() => {
            setIsCartOpen(true);
        }, 100);
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart((prevCart) =>
            prevCart.map((item) => {
                if (item.id === productId) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const wishlistCount = wishlist.length;

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                isCartOpen,
                setIsCartOpen,
                wishlist,
                toggleWishlist,
                isInWishlist,
                removeFromWishlist,
                wishlistCount,
                isWishlistOpen,
                setIsWishlistOpen,
                notification
            }}
        >
            {children}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        key="cart-toast"
                        initial={{ opacity: 0, y: 35, x: '-50%', scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
                        exit={{ opacity: 0, y: 20, x: '-50%', scale: 0.92 }}
                        transition={{ type: "spring", stiffness: 450, damping: 28 }}
                        style={{ zIndex: 9999999 }}
                        className="fixed bottom-8 sm:bottom-10 left-1/2 pointer-events-none select-none max-w-[90vw] sm:max-w-md w-auto"
                    >
                        <div className="bg-gradient-to-r from-[#df934c] via-[#e6a25e] to-[#df934c] text-[#24130c] px-6 py-3.5 rounded-full font-bold shadow-[0_15px_45px_rgba(0,0,0,0.7)] border border-amber-200/60 flex items-center gap-3 backdrop-none">
                            <div className="w-6 h-6 rounded-full bg-[#24130c]/15 flex items-center justify-center text-[#24130c] shrink-0 border border-[#24130c]/20">
                                <Check size={14} strokeWidth={3} />
                            </div>
                            <span className="text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-xs">
                                {notification}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </CartContext.Provider>
    );
};
