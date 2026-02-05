import React from 'react';
import { motion } from 'framer-motion';

const About = () => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen pt-24 px-6 bg-chocolate text-cream flex items-center justify-center font-serif"
    >
        <div className="text-center max-w-2xl">
            <h1 className="text-6xl font-bold mb-6">Our Story</h1>
            <p className="text-xl font-sans text-cream/70 leading-relaxed">
                Born from a love of sweetness and a passion for design. CoralCookies brings you the finest digital confections.
            </p>
        </div>
    </motion.div>
);

export default About;
