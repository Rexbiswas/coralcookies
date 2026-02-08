import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Sparkles, Heart, Leaf, Cookie as CookieIcon, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';

const SectionTitle = ({ children, subtitle }) => (
    <div className="mb-16">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-4"
        >
            <div className="h-px w-8 bg-caramel" />
            <span className="text-caramel uppercase tracking-[0.3em] text-xs font-bold">{subtitle}</span>
        </motion.div>
        <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-cream"
        >
            {children}
        </motion.h2>
    </div>
);

const FeatureCard = ({ icon: Icon, title, description, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="group p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-caramel/20 transition-all duration-500 overflow-hidden relative"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-caramel/5 rounded-full blur-3xl group-hover:bg-caramel/10 transition-colors" />
        <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-caramel/10 flex items-center justify-center text-caramel mb-6 group-hover:scale-110 transition-transform">
                <Icon size={28} />
            </div>
            <h3 className="text-2xl font-serif text-cream mb-4">{title}</h3>
            <p className="text-cream/60 leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

const About = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const textY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);

    return (
        <div ref={containerRef} className="bg-chocolate min-h-screen">
            {/* HERO SECTION */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden isolate">
                <motion.div
                    style={{ scale: heroScale, opacity: heroOpacity }}
                    className="absolute inset-0 z-0"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-chocolate/20 via-chocolate/40 to-chocolate z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1558961776-6f4bb63733a7?q=80&w=2565&auto=format&fit=crop"
                        alt="Artisan kitchen"
                        className="w-full h-full object-cover scale-110"
                    />
                </motion.div>

                <div className="container mx-auto px-6 relative z-20 text-center">
                    <motion.div
                        style={{ y: textY }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
                        >
                            <Sparkles size={14} className="text-caramel" />
                            <span className="text-xs uppercase tracking-[0.2em] text-cream/80">Est. 2024</span>
                        </motion.div>

                        <h1 className="text-7xl md:text-[10rem] font-serif font-bold text-cream leading-[0.8] tracking-tighter mb-8">
                            Our <br />
                            <span className="italic text-caramel">Sweet</span> Story
                        </h1>

                        <p className="text-xl md:text-2xl text-cream/70 max-w-2xl mx-auto font-light leading-relaxed">
                            Crafting digital moments and physical delights, one crumb at a time.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
                >
                    <span className="text-[10px] uppercase tracking-[0.3em] text-cream/30">Scroll to Explore</span>
                    <div className="w-px h-12 bg-gradient-to-b from-caramel to-transparent" />
                </motion.div>
            </section>

            {/* THE MANIFESTO */}
            <section className="py-32 md:py-64 container mx-auto px-6">
                <div className="max-w-5xl">
                    <SectionTitle subtitle="Philosophy">The Manifesto</SectionTitle>
                    <div className="space-y-12">
                        {[
                            "We believe that a cookie is more than just flour and sugar.",
                            "It's a memory of childhood, a moment of solace,",
                            "and a universal language of love. Our mission is to",
                            "blend traditional craftsmanship with modern innovation."
                        ].map((text, i) => (
                            <motion.p
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: i * 0.1, duration: 0.8 }}
                                className="text-3xl md:text-6xl font-serif text-cream leading-tight"
                            >
                                {text}
                            </motion.p>
                        ))}
                    </div>
                </div>
            </section>

            {/* PROCESS SECTION */}
            <section className="py-32 bg-[#1a110e] rounded-[50px] relative z-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <SectionTitle subtitle="Process">From Grain to Gold</SectionTitle>
                            <p className="text-cream/60 text-lg mb-12 max-w-lg leading-relaxed">
                                Every batch is a labor of love. We source the finest ingredients from local farmers and global artisans to ensure every bite is perfection.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FeatureCard
                                    index={0}
                                    icon={Leaf}
                                    title="Organic Only"
                                    description="100% grass-fed butter and organic unbleached flour."
                                />
                                <FeatureCard
                                    index={1}
                                    icon={Heart}
                                    title="Small Batches"
                                    description="Never mass-produced. Always hand-shaped and slow-baked."
                                />
                                <FeatureCard
                                    index={2}
                                    icon={Sparkles}
                                    title="Secret Spices"
                                    description="Infused with our signature blend of aromatic vanillas."
                                />
                                <FeatureCard
                                    index={3}
                                    icon={CookieIcon}
                                    title="Freshness First"
                                    description="Baked within hours of delivery for that perfect crunch."
                                />
                            </div>
                        </div>

                        <div className="relative h-[600px] md:h-[800px] rounded-[3rem] overflow-hidden group">
                            <motion.div
                                initial={{ scale: 1.2 }}
                                whileInView={{ scale: 1 }}
                                transition={{ duration: 1.5 }}
                                className="h-full w-full"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?q=80&w=2574&auto=format&fit=crop"
                                    alt="Cookie process"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                            <div className="absolute inset-0 bg-gradient-to-t from-chocolate/80 to-transparent" />
                            <div className="absolute bottom-10 left-10 right-10 p-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                                <p className="text-cream font-serif text-2xl mb-2">"The crunch is the voice of the cookie."</p>
                                <p className="text-caramel uppercase tracking-widest text-xs font-bold">— Head Baker, Theo Crumb</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* THE CRAFTSMEN */}
            <section className="py-32 md:py-64 container mx-auto px-6 overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                    <SectionTitle subtitle="Team">The Cookie Architects</SectionTitle>
                    <motion.button
                        whileHover={{ gap: "1.5rem" }}
                        className="flex items-center gap-4 bg-caramel text-chocolate px-8 py-4 rounded-full font-bold transition-all"
                    >
                        Meet the Full Team <ArrowRight size={20} />
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            name: "Sofia Valenti",
                            role: "Master Chocolatier",
                            img: "https://images.unsplash.com/photo-1595273670150-db0a3d39074f?q=80&w=2609&auto=format&fit=crop"
                        },
                        {
                            name: "Marcus Thorne",
                            role: "Dough Scientist",
                            img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=2568&auto=format&fit=crop"
                        },
                        {
                            name: "Elena Bloom",
                            role: "Flavor Designer",
                            img: "https://images.unsplash.com/photo-1590577976322-3d2d6e213005?q=80&w=2533&auto=format&fit=crop"
                        }
                    ].map((person, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="group relative"
                        >
                            <div className="relative h-[500px] rounded-[2.5rem] overflow-hidden mb-6">
                                <img
                                    src={person.img}
                                    alt={person.name}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-chocolate via-transparent to-transparent opacity-60" />
                            </div>
                            <h4 className="text-3xl font-serif text-cream mb-1">{person.name}</h4>
                            <p className="text-caramel uppercase tracking-widest text-xs font-bold">{person.role}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section className="py-32 container mx-auto px-6">
                <div className="relative rounded-[4rem] bg-gradient-to-br from-caramel to-chocolate-light p-12 md:p-24 overflow-hidden text-center isolate">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative z-10"
                    >
                        <h2 className="text-5xl md:text-8xl font-serif text-chocolate leading-tight mb-8">
                            Ready to take <br />
                            <span className="italic">the first bite?</span>
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-chocolate text-cream px-12 py-6 rounded-full font-bold text-xl shadow-2xl hover:bg-[#1a110e] transition-colors"
                        >
                            Order Your Batch
                        </motion.button>
                    </motion.div>

                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-chocolate/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;

