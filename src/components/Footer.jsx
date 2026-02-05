import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Footer = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end end"]
    });

    // Parallax effect for the large text
    const y = useTransform(scrollYProgress, [0, 1], [-100, 0]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

    const links = [
        { title: "Shop", items: ["All Cookies", "Gift Boxes", "Merch", "Corporate"] },
        { title: "About", items: ["Our Story", "Ingredients", "Sustainability", "Careers"] },
        { title: "Support", items: ["FAQ", "Shipping", "Returns", "Contact"] },
        { title: "Social", items: ["Instagram", "TikTok", "Twitter", "Pinterest"] },
    ];

    return (
        <footer
            ref={containerRef}
            className="relative bg-[#1a110e] text-cream overflow-hidden pt-32 pb-12 rounded-t-[50px] mt-[-50px] z-30"
        >
            {/* Background Grain/Noise */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Top Section: Links & CTA */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-32 border-b border-white/5 pb-16">

                    {/* Brand CTA */}
                    <div className="md:col-span-5 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-full bg-caramel mb-8 flex items-center justify-center text-chocolate font-serif font-bold text-xl">C</div>
                            <h3 className="text-4xl font-serif leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-cream to-white/60">
                                Freshly baked happiness,<br />delivered to your door.
                            </h3>
                        </div>

                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-transparent border-b border-white/20 py-4 text-xl placeholder-white/20 focus:outline-none focus:border-caramel transition-colors"
                            />
                            <button className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-caramel rounded-full flex items-center justify-center text-chocolate opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
                        {links.map((column, idx) => (
                            <div key={idx}>
                                <h4 className="text-caramel uppercase tracking-widest text-xs font-bold mb-6">{column.title}</h4>
                                <ul className="space-y-4">
                                    {column.items.map((item) => (
                                        <li key={item}>
                                            <a href="#" className="text-white/60 hover:text-white transition-colors text-sm hover:translate-x-1 inline-block duration-300">
                                                {item}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Section: Big Text */}
                <div className="relative overflow-hidden">
                    <motion.h1
                        style={{ y, opacity }}
                        className="text-[13vw] font-serif font-bold leading-none text-center tracking-tighter text-white/5 whitespace-nowrap select-none pointer-events-none"
                    >
                        CORAL COOKIES
                    </motion.h1>

                    <div className="relative mt-12 md:mt-0 md:absolute md:bottom-4 left-0 right-0 flex flex-col md:flex-row justify-between items-center md:items-end text-xs text-white/20 uppercase tracking-widest font-mono gap-4 md:gap-0 z-20">
                        <span>© 2026 Edition</span>
                        <span className="text-caramel text-lg md:text-2xl font-serif capitalize tracking-normal text-center">Designed & Baked with Rishi ❤</span>
                        <span>Privacy • Terms</span>
                    </div>
                </div>
            </div>

            {/* Decorative Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-t from-caramel/10 to-transparent pointer-events-none blur-3xl"></div>
        </footer>
    );
};

export default Footer;
