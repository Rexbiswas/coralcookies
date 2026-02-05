import React from 'react';
import { motion } from 'framer-motion';

const Shop = () => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen pt-24 px-6 bg-chocolate text-cream flex items-center justify-center font-serif"
    >
        <div className="text-center">
            <h1 className="text-6xl font-bold mb-4">Shop Collection</h1>
            <p className="text-xl font-sans text-cream/70">Coming soon...</p>
        </div>
    </motion.div>
);

export default Shop;
