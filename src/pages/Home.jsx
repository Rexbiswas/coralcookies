import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import CookieJar from '../components/CookieJar';
import Footer from '../components/Footer';

const MagneticButton = ({ children, className, onClick }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        x.set((clientX - centerX) * 0.3);
        y.set((clientY - centerY) * 0.3);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
            onClick={onClick}
        >
            {children}
        </motion.button>
    );
};

const Home = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const yHero = useTransform(scrollYProgress, [0, 0.5], [0, 300]);

    // Mouse Parallax for Hero
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const handleMouseMove = ({ clientX, clientY }) => {
        const { innerWidth, innerHeight } = window;
        mouseX.set(clientX / innerWidth - 0.5);
        mouseY.set(clientY / innerHeight - 0.5);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="min-h-screen relative overflow-hidden bg-[#2b1b17] text-cream font-sans selection:bg-caramel/30"
        >
            {/* HER0 SECTION */}
            <section className="relative min-h-screen flex flex-col items-center justify-center isolate">

                {/* Dynamic Background Gradients */}
                <motion.div
                    className="absolute inset-0 pointer-events-none opacity-40"
                    style={{
                        background: useMotionTemplate`radial-gradient(circle at ${useTransform(mouseX, [-0.5, 0.5], ["30%", "70%"])} ${useTransform(mouseY, [-0.5, 0.5], ["30%", "70%"])}, rgba(212, 140, 69, 0.2), transparent 50%)`
                    }}
                />

                {/* Floating Elements (Parallax) */}
                <motion.div style={{ x: useTransform(mouseX, [-0.5, 0.5], [20, -20]), y: useTransform(mouseY, [-0.5, 0.5], [20, -20]) }} className="absolute top-[15%] left-[10%] w-32 h-32 rounded-full bg-caramel/20 blur-[80px]" />
                <motion.div style={{ x: useTransform(mouseX, [-0.5, 0.5], [-30, 30]), y: useTransform(mouseY, [-0.5, 0.5], [-30, 30]) }} className="absolute bottom-[20%] right-[10%] w-64 h-64 rounded-full bg-cookie/10 blur-[100px]" />

                <motion.div style={{ y: yHero }} className="relative z-10 text-center px-4">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md"
                    >
                        <span className="w-2 h-2 rounded-full bg-caramel animate-pulse" />
                        <span className="text-xs uppercase tracking-[0.2em] text-cream/80">Artisanal Bakery</span>
                    </motion.div>

                    {/* Main Title - Split Character Reveal */}
                    <h1 className="text-[15vw] md:text-[11rem] leading-[0.85] font-serif font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-cream via-[#e8dcc6] to-[#cba379] relative">
                        <div className="overflow-hidden inline-flex">
                            {"Coral".split("").map((char, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    transition={{ duration: 0.8, delay: i * 0.05, ease: [0.33, 1, 0.68, 1] }}
                                    className="inline-block"
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </div>
                        <br />
                        <div className="overflow-hidden inline-flex">
                            {"Cookies".split("").map((char, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.1 + i * 0.05, ease: [0.33, 1, 0.68, 1] }}
                                    className="inline-block italic text-caramel opacity-90"
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </div>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="mt-8 text-lg md:text-xl text-white/60 max-w-lg mx-auto font-light leading-relaxed tracking-wide"
                    >
                        Where every crumb is a masterpiece. Hand-mixed, slow-baked, and delivered with unconditional love.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6"
                    >
                        <MagneticButton className="group relative px-8 py-4 bg-caramel hover:bg-[#d48c45] text-[#2b1b17] rounded-full font-bold text-lg tracking-wide transition-all overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2">
                                Order Now
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform">
                                    <path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </MagneticButton>

                        <MagneticButton className="px-8 py-4 border border-white/20 hover:bg-white/5 text-cream rounded-full font-medium text-lg tracking-wide transition-colors">
                            Explore Menu
                        </MagneticButton>
                    </motion.div>

                </motion.div>
            </section>

            {/* Scrolling Marquee Section */}
            <div className="relative py-12 bg-caramel text-[#2b1b17] overflow-hidden rotate-[-2deg] scale-105 z-20 border-y-4 border-[#2b1b17]">
                <div className="flex whitespace-nowrap overflow-hidden">
                    <motion.div
                        animate={{ x: "-50%" }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="flex gap-8 items-center font-serif text-5xl md:text-7xl font-bold uppercase tracking-tighter opacity-90"
                    >
                        {Array(8).fill("Freshly Baked • Pure Joy • ").map((text, i) => (
                            <span key={i}>{text}</span>
                        ))}
                        {Array(8).fill("Freshly Baked • Pure Joy • ").map((text, i) => (
                            <span key={i + 10}>{text}</span>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* 3D Cookie Jar Showcase */}
            <div className="relative z-10 -mt-20 mb-20">
                <CookieJar />
            </div>

            {/* NEW: Bento Grid - Ingredients / philosophy */}
            <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
                <div className="mb-24 relative text-center isolate">
                    {/* Decorative Background */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-caramel/10 blur-[100px] rounded-full -z-10" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-6 backdrop-blur-sm"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-caramel animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-medium">Our Philosophy</span>
                    </motion.div>

                    <h2 className="text-5xl md:text-8xl font-serif text-cream leading-[0.9] tracking-tight mb-8">
                        <motion.span
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="block"
                        >
                            Inside the
                        </motion.span>
                        <motion.span
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="block text-transparent bg-clip-text bg-gradient-to-r from-caramel via-[#f3dba8] to-caramel italic"
                        >
                            Crumb.
                        </motion.span>
                    </h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed font-light"
                    >
                        We don't just bake cookies; we <span className="text-white font-normal border-b border-caramel/30 pb-0.5">engineer happiness</span> using the world's finest, ethically sourced ingredients.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                    {/* Card 1: Large Span */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="md:col-span-2 row-span-1 bg-black rounded-[2rem] relative overflow-hidden group isolate"
                    >
                        {/* Image with tint and scale effect */}
                        <div className="absolute inset-0 z-0 h-full w-full">
                            <motion.img
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPPvfL5pntfhz68eJaGlsyLW187ki2oUFvWg&s"
                                className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2b1b17] via-[#2b1b17]/40 to-transparent opacity-90" />
                        </div>

                        {/* Content Container */}
                        <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-10">
                            {/* Top Badge */}
                            <div className="flex justify-between items-start">
                                <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/5 rounded-full text-[10px] uppercase tracking-widest text-white/70 group-hover:bg-white/20 transition-colors">
                                    Premium Sourcing
                                </div>
                                <motion.div
                                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-caramel group-hover:text-black transition-colors duration-300"
                                >
                                </motion.div>
                            </div>

                            {/* Bottom Text */}
                            <div>
                                <h3 className="text-3xl md:text-4xl font-serif text-cream mb-3 group-hover:text-caramel transition-colors duration-300">Belgian Dark Chocolate</h3>

                                <div className="h-[2px] w-12 bg-white/20 mb-4 group-hover:w-full group-hover:bg-caramel transition-all duration-700 ease-in-out" />

                                <div className="flex items-end justify-between gap-4">
                                    <p className="text-white/70 max-w-sm text-lg leading-relaxed group-hover:text-white transition-colors">
                                        70% cocoa chunks that melt on contact, not before.
                                    </p>

                                    {/* Reveal Arrow */}
                                    <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-white/20 group-hover:border-caramel text-caramel opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Small */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="bg-caramel text-[#2b1b17] rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group"
                    >
                        <h3 className="text-8xl font-serif font-bold opacity-20 absolute -right-4 -bottom-4 rotate-[-15deg]">100%</h3>
                        <div className="relative z-10 block">
                            <h3 className="text-2xl font-bold mb-2 uppercase tracking-wider">Organic Butter</h3>
                            <p className="font-medium opacity-80">Grass-fed, golden, and rich.</p>
                        </div>
                        <div className="w-12 h-12 rounded-full border border-[#2b1b17]/20 flex items-center justify-center group-hover:rotate-45 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                        </div>
                    </motion.div>

                    {/* Card 3: Tall */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="row-span-2 bg-[#3e2723] border border-white/5 rounded-[2rem] p-10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-caramel/20 rounded-full blur-[80px] group-hover:bg-caramel/30 transition-colors" />
                        <h3 className="text-4xl font-serif text-cream mb-6 leading-tight">Zero<br />Preservatives.<br />Zero<br />Regrets.</h3>
                        <p className="text-white/60 text-lg leading-relaxed">
                            Our cookies are baked fresh every morning. If it wasn't in your grandma's kitchen, it's not in our cookies. Pure, simple, and honest ingredients only.
                        </p>
                        <div className="mt-10 flex gap-2">
                            {['No GMO', 'Soy Free'].map((tag, i) => (
                                <span key={i} className="px-4 py-2 rounded-full border border-white/10 text-xs uppercase tracking-widest text-white/50">{tag}</span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Card 4: Medium */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="md:col-span-2 bg-gradient-to-r from-cream to-[#e8dcc6] rounded-[2rem] p-10 flex items-center justify-between relative overflow-hidden group"
                    >
                        <div className="relative z-10 w-1/2">
                            <h3 className="text-3xl font-serif text-[#2b1b17] mb-2">Madagascan Vanilla</h3>
                            <p className="text-[#2b1b17]/70 font-medium">Hand-pollinated pods for that distinct floral aroma.</p>
                        </div>
                        <motion.div
                            className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"
                            style={{ maskImage: 'linear-gradient(to right, transparent, black)' }}
                        />
                    </motion.div>
                </div>
            </section>

            {/* NEW: Stats / Trust Section */}
            <section className="py-20 border-y border-white/5 bg-black/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-10">
                    {[
                        { num: "50k+", label: "Happy Crunchers" },
                        { num: "12", label: "Signature Flavors" },
                        { num: "24h", label: "Delivery Freshness" },
                        { num: "4.9", label: "Star Rating" }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center flex-1 min-w-[200px]"
                        >
                            <h4 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-caramel to-chocolate font-bold mb-2">{stat.num}</h4>
                            <p className="text-white/50 uppercase tracking-widest text-sm">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Footer / End Section */}
            <Footer />

        </div>
    );
};

export default Home;


