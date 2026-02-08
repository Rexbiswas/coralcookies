import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, ShoppingBag, RotateCcw, Box, Sparkles } from 'lucide-react';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';

const COOKIES = [
    {
        id: 1,
        name: "Midnight Noir",
        category: "Dark Chocolate",
        price: 4.50,
        rating: 4.9,
        image: "https://www.pngall.com/wp-content/uploads/2016/07/Cookie-Download-PNG.png",
        description: "Ultra-dark 74% Venezuelan cocoa with a whisper of espresso."
    },
    {
        id: 2,
        name: "Sea Salt Obsidian",
        category: "Dark Chocolate",
        price: 4.25,
        rating: 4.8,
        image: "https://www.pngall.com/wp-content/uploads/2016/07/Cookie-Download-PNG.png",
        description: "Intense dark chocolate chunks topped with Maldon sea salt."
    },
    {
        id: 3,
        name: "Amber Glow",
        category: "Signature",
        price: 3.75,
        rating: 5.0,
        image: "https://www.pngall.com/wp-content/uploads/2016/07/Cookie-Download-PNG.png",
        description: "Buttery dough infused with artisanal burnt sugar caramel."
    },
    {
        id: 4,
        name: "Velvet Rouge",
        category: "Specialty",
        price: 4.00,
        rating: 4.7,
        image: "https://www.pngall.com/wp-content/uploads/2016/07/Cookie-Download-PNG.png",
        description: "Velvety red cocoa dough with a signature white chocolate core."
    },
    {
        id: 5,
        name: "Matcha Zen",
        category: "Artisan",
        price: 4.50,
        rating: 4.6,
        image: "https://www.pngall.com/wp-content/uploads/2016/07/Cookie-Download-PNG.png",
        description: "Ceremonial grade Uji Matcha balanced with smooth white chocolate."
    },
    {
        id: 6,
        name: "Nutty Nirvana",
        category: "Hazelnut",
        price: 4.25,
        rating: 4.9,
        image: "https://www.pngall.com/wp-content/uploads/2016/07/Cookie-Download-PNG.png",
        description: "Slow-roasted Piedmont hazelnuts paired with milk chocolate ganache."
    }
];

const PhysicalCookie = ({ cookie, world, onSelect, onAddToCart }) => {
    const bodyRef = useRef(null);
    const elementRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        const radius = isMobile ? 55 : 75;
        const x = Math.random() * (window.innerWidth - radius * 2) + radius;
        const y = -radius * 2 - Math.random() * 500;

        const body = Matter.Bodies.circle(x, y, radius, {
            restitution: 0.5,
            friction: 0.2,
            frictionAir: 0.02,
            density: 0.1,
            label: `cookie-${cookie.id}`,
            render: { fillStyle: 'transparent' }
        });

        Matter.World.add(world, body);
        bodyRef.current = body;

        return () => {
            Matter.World.remove(world, body);
        };
    }, [world, cookie.id]);

    useEffect(() => {
        let animationFrame;
        const update = () => {
            if (bodyRef.current && elementRef.current) {
                const { x, y } = bodyRef.current.position;
                const angle = bodyRef.current.angle;
                const isMobile = window.innerWidth < 768;
                const offset = isMobile ? 55 : 75;
                elementRef.current.style.transform = `translate3d(${x - offset}px, ${y - offset}px, 0) rotate(${angle}rad)`;
            }
            animationFrame = requestAnimationFrame(update);
        };
        animationFrame = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationFrame);
    }, [world]); // Re-run when world changes to ensure we track the new body

    return (
        <div
            ref={elementRef}
            className="absolute top-0 left-0 pointer-events-auto cursor-grab active:cursor-grabbing will-change-transform z-20 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onSelect(cookie)}
        >
            <div className="relative w-[110px] h-[110px] md:w-[150px] md:h-[150px]">
                <img
                    src={cookie.image}
                    alt={cookie.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)] group-hover:drop-shadow-[0_20px_40px_rgba(212,140,69,0.3)] transition-all duration-300 group-active:scale-95"
                    draggable={false}
                />

                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            className="absolute -top-24 left-1/2 -translate-x-1/2 bg-chocolate/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-2xl z-30 pointer-events-auto min-w-[140px]"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-caramel text-[10px] uppercase font-bold tracking-widest leading-tight">{cookie.name}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-cream font-serif font-bold">${cookie.price.toFixed(2)}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddToCart(cookie);
                                        }}
                                        className="bg-caramel text-chocolate p-1.5 rounded-lg hover:bg-white transition-colors"
                                    >
                                        <ShoppingBag size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const BakeryShelf = ({ shelf }) => {
    return (
        <div
            className="absolute pointer-events-none border-b-8 border-chocolate-light bg-linear-to-r from-transparent via-white/5 to-transparent backdrop-blur-[2px] z-10"
            style={{
                left: `${shelf.x - (shelf.w / 2)}px`,
                top: `${shelf.y - 5}px`,
                width: `${shelf.w}px`,
                height: `10px`,
                borderRadius: '4px'
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
            <div className="absolute -bottom-6 left-0 right-0 text-center">
                <span className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-bold">{shelf.label}</span>
            </div>
        </div>
    );
};

const Shop = () => {
    const sceneRef = useRef(null);
    const engineRef = useRef(null);
    const { addToCart, isCartOpen, setIsCartOpen } = useCart();
    const [world, setWorld] = useState(null);
    const [selectedCookie, setSelectedCookie] = useState(null);
    const [shelves, setShelves] = useState([]);
    const [viewMode, setViewMode] = useState('shelf'); // 'shelf' or 'grid'
    const [resetKey, setResetKey] = useState(0);
    const [isPhysicsEnabled, setIsPhysicsEnabled] = useState(true);

    // Toggle Physics Effect
    useEffect(() => {
        if (!engineRef.current) return;

        const bodies = Matter.Composite.allBodies(engineRef.current.world);
        const cookiesInWorld = bodies.filter(b => b.label.startsWith('cookie-'));

        cookiesInWorld.forEach(body => {
            Matter.Body.setStatic(body, !isPhysicsEnabled);
            if (!isPhysicsEnabled) {
                // If disabling, ensure they stop moving and wake up to be repositioned if needed
                Matter.Body.setVelocity(body, { x: 0, y: 0 });
                Matter.Body.setAngularVelocity(body, 0);
            }
        });

        if (!isPhysicsEnabled) {
            selfOrganize();
        }
    }, [isPhysicsEnabled, world]); // Run when toggle changes or world is rebuilt

    useEffect(() => {
        let timeoutId;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setResetKey(prev => prev + 1);
            }, 500);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        if (viewMode !== 'shelf') {
            if (engineRef.current) {
                Matter.Engine.clear(engineRef.current);
                engineRef.current = null;
            }
            return;
        }

        const { Engine, World, Bodies, Runner, Mouse, MouseConstraint } = Matter;
        const engine = Engine.create();
        engineRef.current = engine;
        setWorld(engine.world);

        const width = window.innerWidth;
        const height = window.innerHeight;
        const isMobile = width < 768;

        const wallOptions = { isStatic: true, render: { visible: false }, friction: 1, label: 'wall' };
        const ground = Bodies.rectangle(width / 2, height + 50, width, 100, wallOptions);
        const leftWall = Bodies.rectangle(-50, height / 2, 100, height * 2, wallOptions);
        const rightWall = Bodies.rectangle(width + 50, height / 2, 100, height * 2, wallOptions);

        let shelfData;
        if (isMobile) {
            shelfData = [
                { id: 1, x: width * 0.5, y: height * 0.3, w: width * 0.8, label: "Tasting Rack" },
                { id: 2, x: width * 0.5, y: height * 0.55, w: width * 0.8, label: "Daily Batch" },
                { id: 3, x: width * 0.5, y: height * 0.85, w: width * 0.9, label: "Main Counter" }
            ];
        } else {
            shelfData = [
                { id: 1, x: width * 0.25, y: height * 0.45, w: width * 0.35, label: "Tasting Rack" },
                { id: 2, x: width * 0.75, y: height * 0.35, w: width * 0.35, label: "Daily Batch" },
                { id: 3, x: width * 0.5, y: height * 0.8, w: width * 0.6, label: "Main Counter" }
            ];
        }

        const shelfBodies = shelfData.map(s =>
            Bodies.rectangle(s.x, s.y, s.w, 10, {
                isStatic: true,
                friction: 1,
                label: `shelf-${s.id}`,
                chamfer: { radius: 5 }
            })
        );

        setShelves(shelfData);
        World.add(engine.world, [ground, leftWall, rightWall, ...shelfBodies]);

        // Add Mouse Control
        const mouse = Mouse.create(sceneRef.current);
        mouse.pixelRatio = window.devicePixelRatio || 1;

        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });

        // Prevent scrolling when interacting with physics
        mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
        mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

        World.add(engine.world, mouseConstraint);

        const runner = Runner.create();
        Runner.run(runner, engine);

        return () => {
            Runner.stop(runner);
            Engine.clear(engine);
            World.clear(engine.world);
            engineRef.current = null;
            setWorld(null);
        };
    }, [viewMode, resetKey]);

    const scatterCookies = () => {
        if (!engineRef.current) return;
        const bodies = Matter.Composite.allBodies(engineRef.current.world);
        bodies.forEach(body => {
            if (!body.isStatic) {
                Matter.Body.applyForce(body, body.position, {
                    x: (Math.random() - 0.5) * 0.5,
                    y: -0.5 - Math.random() * 0.5
                });
            }
        });
    };

    const selfOrganize = () => {
        if (!engineRef.current) return;
        const bodies = Matter.Composite.allBodies(engineRef.current.world);
        const cookiesInWorld = bodies.filter(b => !b.isStatic);

        cookiesInWorld.forEach((body, i) => {
            const shelf = shelves[i % shelves.length];
            Matter.Body.setPosition(body, {
                x: shelf.x + (Math.random() - 0.5) * (shelf.w * 0.8),
                y: shelf.y - 100
            });
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
        });
    };

    return (
        <div className="min-h-screen bg-[#1a110e] overflow-hidden relative font-sans selection:bg-caramel selection:text-chocolate">
            {viewMode === 'shelf' && (
                <div ref={sceneRef} className="fixed inset-0 z-10 pointer-events-auto touch-none select-none">
                    {shelves.map(shelf => (
                        <BakeryShelf key={shelf.id} shelf={shelf} />
                    ))}

                    {world && COOKIES.map((cookie) => (
                        <PhysicalCookie
                            key={cookie.id}
                            cookie={cookie}
                            world={world}
                            onSelect={setSelectedCookie}
                            onAddToCart={addToCart}
                        />
                    ))}
                </div>
            )}

            <div className="relative z-30 flex flex-col min-h-screen pointer-events-none">
                <header className={cn("pt-32 pb-8 md:pb-12 px-6 container mx-auto transition-all", viewMode === 'grid' && "flex flex-col items-center text-center")}>
                    <motion.div
                        key={viewMode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("max-w-3xl pointer-events-auto", viewMode === 'grid' && "mx-auto")}
                    >
                        <div className={cn("flex items-center gap-3 mb-6", viewMode === 'grid' && "justify-center")}>
                            <div className="w-12 h-px bg-caramel" />
                            <span className="text-caramel uppercase tracking-[0.4em] text-xs font-bold">Concept Store</span>
                            {viewMode === 'grid' && <div className="w-12 h-px bg-caramel" />}
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-9xl font-serif font-bold text-cream leading-[0.9] tracking-tighter mb-8">
                            Store <br />
                            <span className="italic text-caramel opacity-80">{viewMode === 'shelf' ? 'Shelves.' : 'Archive.'}</span>
                        </h1>
                        <p className={cn("text-lg md:text-xl text-white/30 max-w-lg font-light leading-relaxed", viewMode === 'grid' && "mx-auto")}>
                            {viewMode === 'shelf'
                                ? "A physical interaction space where cookies rest on architectural shelves. Throw, catch, and taste the digital craft."
                                : "A curated gallery of our finest creations. Browse, select, and build your perfect collection."}
                        </p>
                    </motion.div>
                </header>

                <div className={cn("px-6 container mx-auto flex gap-4 mb-12 md:mb-20 relative z-40 pointer-events-auto overflow-x-auto", viewMode === 'grid' && "justify-center")}>
                    <button
                        onClick={() => setViewMode('shelf')}
                        className={`px-6 md:px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'shelf' ? 'bg-caramel text-chocolate shadow-[0_0_20px_rgba(212,140,69,0.3)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                        Shelf View
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-6 md:px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'grid' ? 'bg-caramel text-chocolate shadow-[0_0_20px_rgba(212,140,69,0.3)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                        Grid View
                    </button>
                </div>

                {viewMode === 'grid' && (
                    <section className="px-6 container mx-auto pb-40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pointer-events-auto">
                        {COOKIES.map((cookie, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={cookie.id}
                                className="group bg-white/5 border border-white/5 rounded-[40px] p-8 hover:border-caramel/30 transition-all duration-500 overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-caramel/5 rounded-full blur-3xl pointer-events-none" />
                                <div className="relative aspect-square mb-8 p-4">
                                    <img src={cookie.image} className="w-full h-full object-contain filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-700" alt={cookie.name} />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-caramel uppercase tracking-widest text-[10px] font-extrabold">{cookie.category}</span>
                                            <h3 className="text-3xl font-serif text-cream">{cookie.name}</h3>
                                        </div>
                                        <span className="text-2xl font-serif text-caramel">${cookie.price.toFixed(2)}</span>
                                    </div>
                                    <p className="text-white/40 font-light text-sm line-clamp-2">{cookie.description}</p>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => addToCart(cookie)}
                                            className="flex-1 bg-caramel text-chocolate py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#d48c45] active:scale-95 transition-all"
                                        >
                                            <ShoppingBag size={18} /> Add to Cart
                                        </button>
                                        <button
                                            onClick={() => setSelectedCookie(cookie)}
                                            className="w-14 h-14 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:bg-white/5 hover:text-white transition-all"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </section>
                )}

                {viewMode === 'shelf' && (
                    <div className="p-4 md:p-6 container mx-auto mt-auto mb-24 md:mb-20 flex flex-wrap justify-center md:justify-between items-end gap-6 md:gap-10 pointer-events-none">
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pointer-events-auto w-full md:w-auto">
                            <button onClick={scatterCookies} className="bg-white/5 border border-white/10 p-5 rounded-full text-caramel hover:bg-caramel hover:text-chocolate transition-all active:scale-90 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm" disabled={!isPhysicsEnabled}><RotateCcw size={24} /></button>
                            <button onClick={selfOrganize} className="flex items-center gap-3 px-6 md:px-8 bg-chocolate/80 hover:bg-caramel hover:text-chocolate transition-all border border-white/5 rounded-full text-white/60 font-bold uppercase tracking-widest text-[10px] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm" disabled={!isPhysicsEnabled}><Sparkles size={16} /> Self-Organize</button>
                            <button
                                onClick={() => setIsPhysicsEnabled(!isPhysicsEnabled)}
                                className={cn(
                                    "px-6 py-4 backdrop-blur-md rounded-full border border-white/5 flex items-center gap-4 active:scale-95 group transition-all",
                                    isPhysicsEnabled ? "bg-chocolate/80 hover:bg-caramel hover:text-chocolate" : "bg-white/10 hover:bg-white/20"
                                )}
                            >
                                <Box size={20} className={cn("transition-colors", isPhysicsEnabled ? "text-caramel group-hover:text-chocolate" : "text-white/40 group-hover:text-white")} />
                                <span className={cn(
                                    "text-xs uppercase tracking-widest font-bold transition-colors",
                                    isPhysicsEnabled ? "text-white/40 group-hover:text-chocolate" : "text-white/40 group-hover:text-white"
                                )}>
                                    {isPhysicsEnabled ? "Physics Enabled" : "Physics Disabled"}
                                </span>
                            </button>
                        </div>

                        <div className="hidden md:block text-right pointer-events-none opacity-20">
                            <span className="text-[12rem] font-serif font-bold leading-none select-none">BAKERY</span>
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {selectedCookie && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md pointer-events-auto" onClick={() => setSelectedCookie(null)}>
                            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[#1a110e] w-full max-w-4xl rounded-[40px] border border-white/10 p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row gap-12 items-center" onClick={e => e.stopPropagation()}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-caramel/10 blur-[100px] rounded-full -z-10" />
                                <div className="w-64 h-64 md:w-80 md:h-80 flex-shrink-0"><img src={selectedCookie.image} alt="" className="w-full h-full object-contain filter drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)]" /></div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4"><span className="px-3 py-1 bg-caramel/20 text-caramel rounded-full text-[10px] uppercase font-bold tracking-widest">{selectedCookie.category}</span><div className="flex items-center gap-1 text-caramel"><Star size={14} fill="currentColor" /><span className="text-sm font-bold">{selectedCookie.rating}</span></div></div>
                                    <h2 className="text-5xl md:text-7xl font-serif text-cream mb-6 tracking-tight">{selectedCookie.name}</h2>
                                    <p className="text-white/40 text-xl font-light leading-relaxed mb-10 italic">"{selectedCookie.description}"</p>
                                    <div className="flex items-center gap-8 mb-10"><span className="text-5xl font-serif text-cream">${selectedCookie.price.toFixed(2)}</span><div className="h-10 w-px bg-white/10" /><span className="text-white/20 text-sm uppercase tracking-widest">Handmade<br />On Order</span></div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(selectedCookie);
                                                setSelectedCookie(null);
                                            }}
                                            className="flex-1 bg-caramel text-chocolate py-6 rounded-3xl font-bold text-xl hover:bg-[#d48c45] transition-all flex items-center justify-center gap-4 active:scale-95"
                                        >
                                            <ShoppingBag size={24} /> Add to Cart
                                        </button>
                                        <button onClick={() => setSelectedCookie(null)} className="px-8 flex items-center justify-center border border-white/10 text-white/40 rounded-3xl hover:text-white hover:bg-white/5 transition-all"><ChevronRight size={32} /></button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="pointer-events-auto">
                    <Footer />
                </div>
            </div>
            <div className="fixed inset-0 bg-[#2b1b17]/30 pointer-events-none z-0" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay z-0" />
        </div>
    );
};

export default Shop;
