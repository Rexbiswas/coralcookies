import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Matter from 'matter-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, ChevronLeft, ShoppingBag, RotateCcw, Box, Sparkles, X, Heart } from 'lucide-react';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import { COOKIES } from '../data/cookies';

const getCookieShelfPosition = (index, shelves) => {
    if (!shelves || shelves.length < 3) return null;
    const tastingRack = shelves[0];
    const dailyBatch = shelves[1];
    const mainCounter = shelves[2];

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const offsetSpacing = isMobile ? 80 : 85;

    switch (index) {
        // Tasting Rack: 2 cookies
        case 0:
            return {
                x: tastingRack.x - tastingRack.w * (isMobile ? 0.24 : 0.22),
                y: tastingRack.y - offsetSpacing,
                shelf: tastingRack
            };
        case 1:
            return {
                x: tastingRack.x + tastingRack.w * (isMobile ? 0.24 : 0.22),
                y: tastingRack.y - offsetSpacing,
                shelf: tastingRack
            };

        // Daily Batch: 2 cookies
        case 2:
            return {
                x: dailyBatch.x - dailyBatch.w * (isMobile ? 0.24 : 0.22),
                y: dailyBatch.y - offsetSpacing,
                shelf: dailyBatch
            };
        case 3:
            return {
                x: dailyBatch.x + dailyBatch.w * (isMobile ? 0.24 : 0.22),
                y: dailyBatch.y - offsetSpacing,
                shelf: dailyBatch
            };

        // Main Counter: 3 cookies
        case 4:
            return {
                x: mainCounter.x - mainCounter.w * (isMobile ? 0.30 : 0.28),
                y: mainCounter.y - offsetSpacing,
                shelf: mainCounter
            };
        case 5:
            return {
                x: mainCounter.x,
                y: mainCounter.y - offsetSpacing,
                shelf: mainCounter
            };
        case 6:
            return {
                x: mainCounter.x + mainCounter.w * (isMobile ? 0.30 : 0.28),
                y: mainCounter.y - offsetSpacing,
                shelf: mainCounter
            };

        default:
            return {
                x: mainCounter.x,
                y: mainCounter.y - offsetSpacing,
                shelf: mainCounter
            };
    }
};

const PhysicalCookie = ({ cookie, index, shelves, world, onSelect, onAddToCart }) => {
    const bodyRef = useRef(null);
    const elementRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        const radius = isMobile ? 55 : 75;
        const target = getCookieShelfPosition(index, shelves);
        const x = target ? target.x : Math.random() * (window.innerWidth - radius * 2) + radius;
        const y = target ? -radius * 2 - (index * 60) : -radius * 2 - Math.random() * 500;

        const body = Matter.Bodies.circle(x, y, radius, {
            restitution: 0.4,
            friction: 0.3,
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
                                    <span className="text-cream font-serif font-bold">₹{cookie.price} <span className="text-[10px] text-white/50 font-sans font-normal">/ pck</span></span>
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
    const { addToCart, isCartOpen, setIsCartOpen, toggleWishlist, isInWishlist, removeFromWishlist } = useCart();
    const [world, setWorld] = useState(null);
    const [selectedCookie, setSelectedCookie] = useState(null);
    const [shelves, setShelves] = useState([]);
    const [viewMode, setViewMode] = useState('shelf'); // 'shelf' or 'grid'
    const [resetKey, setResetKey] = useState(0);
    const [isPhysicsEnabled, setIsPhysicsEnabled] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    // Auto-open cookie modal if navigated from search or query param (?cookie=...)
    useEffect(() => {
        const cookieParam = searchParams.get('cookie');
        if (cookieParam) {
            const found = COOKIES.find(c => c.id === Number(cookieParam) || c.name.toLowerCase() === decodeURIComponent(cookieParam).toLowerCase());
            if (found) {
                setSelectedCookie(found);
            }
        }
    }, [searchParams]);

    const currentIndex = selectedCookie ? COOKIES.findIndex(c => c.id === selectedCookie.id) : -1;

    const handleNextCookie = (e) => {
        e?.stopPropagation();
        if (currentIndex === -1) return;
        const nextIdx = (currentIndex + 1) % COOKIES.length;
        setSelectedCookie(COOKIES[nextIdx]);
    };

    const handlePrevCookie = (e) => {
        e?.stopPropagation();
        if (currentIndex === -1) return;
        const prevIdx = (currentIndex - 1 + COOKIES.length) % COOKIES.length;
        setSelectedCookie(COOKIES[prevIdx]);
    };

    // Keyboard navigation and body scroll lock for modal
    useEffect(() => {
        if (!selectedCookie) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedCookie(null);
            } else if (e.key === 'ArrowRight') {
                const nextIdx = (currentIndex + 1) % COOKIES.length;
                setSelectedCookie(COOKIES[nextIdx]);
            } else if (e.key === 'ArrowLeft') {
                const prevIdx = (currentIndex - 1 + COOKIES.length) % COOKIES.length;
                setSelectedCookie(COOKIES[prevIdx]);
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedCookie, currentIndex]);

    // Lock body and html scroll in shelf view so no scrollbar ever appears
    useEffect(() => {
        if (viewMode === 'shelf') {
            document.body.classList.add('shelf-mode');
            document.documentElement.classList.add('shelf-mode');
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            return () => {
                document.body.classList.remove('shelf-mode');
                document.documentElement.classList.remove('shelf-mode');
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
            };
        }
    }, [viewMode]);

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
                { id: 1, x: width * 0.5, y: height * 0.34, w: width * 0.8, label: "Tasting Rack" },
                { id: 2, x: width * 0.5, y: height * 0.52, w: width * 0.8, label: "Daily Batch" },
                { id: 3, x: width * 0.5, y: height * 0.70, w: width * 0.88, label: "Main Counter" }
            ];
        } else {
            shelfData = [
                { id: 1, x: width * 0.68, y: height * 0.30, w: width * 0.35, label: "Tasting Rack" },
                { id: 2, x: width * 0.72, y: height * 0.52, w: width * 0.35, label: "Daily Batch" },
                { id: 3, x: width * 0.52, y: height * 0.74, w: width * 0.64, label: "Main Counter" }
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
        if (!engineRef.current || !shelves || shelves.length < 3) return;
        const bodies = Matter.Composite.allBodies(engineRef.current.world);
        const cookiesInWorld = bodies.filter(b => b.label && b.label.startsWith('cookie-'));

        cookiesInWorld.forEach((body, i) => {
            const target = getCookieShelfPosition(i, shelves);
            if (target) {
                Matter.Body.setPosition(body, {
                    x: target.x,
                    y: target.y
                });
                Matter.Body.setVelocity(body, { x: 0, y: 0 });
                Matter.Body.setAngularVelocity(body, 0);
            }
        });
    };

    return (
        <div className={cn(
            "bg-[#1a110e] relative font-sans selection:bg-caramel selection:text-chocolate",
            viewMode === 'shelf' ? "h-screen h-[100dvh] max-h-screen overflow-hidden" : "min-h-screen overflow-x-hidden"
        )}>
            {viewMode === 'shelf' && (
                <div ref={sceneRef} className="fixed inset-0 z-10 pointer-events-auto touch-none select-none">
                    {shelves.map(shelf => (
                        <BakeryShelf key={shelf.id} shelf={shelf} />
                    ))}

                    {world && shelves.length >= 3 && COOKIES.map((cookie, index) => (
                        <PhysicalCookie
                            key={cookie.id}
                            cookie={cookie}
                            index={index}
                            shelves={shelves}
                            world={world}
                            onSelect={setSelectedCookie}
                            onAddToCart={addToCart}
                        />
                    ))}
                </div>
            )}

            <div className={cn(
                "relative z-30 flex flex-col pointer-events-none",
                viewMode === 'shelf' ? "h-screen h-[100dvh] max-h-screen overflow-hidden justify-between" : "min-h-screen"
            )}>
                <header className={cn(
                    "px-6 container mx-auto transition-all",
                    viewMode === 'shelf' ? "pt-20 md:pt-24 pb-1 md:pb-2" : "pt-28 md:pt-32 pb-4 md:pb-6 flex flex-col items-center text-center"
                )}>
                    <motion.div
                        key={viewMode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("max-w-3xl pointer-events-auto", viewMode === 'grid' && "mx-auto")}
                    >
                        <div className={cn("flex items-center gap-3 mb-2 md:mb-3", viewMode === 'grid' && "justify-center")}>
                            <div className="w-12 h-px bg-caramel" />
                            <span className="text-caramel uppercase tracking-[0.4em] text-xs font-bold">Concept Store</span>
                            {viewMode === 'grid' && <div className="w-12 h-px bg-caramel" />}
                        </div>
                        <h1 className={cn(
                            "font-serif font-bold text-cream leading-[0.95] tracking-tight",
                            viewMode === 'shelf' ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-2 md:mb-3" : "text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-8 md:mb-10"
                        )}>
                            Store <br />
                            <span className="italic text-caramel opacity-85">{viewMode === 'shelf' ? 'Shelves.' : 'Archive.'}</span>
                        </h1>
                    </motion.div>
                </header>

                <div className={cn(
                    "px-6 container mx-auto flex gap-4 relative z-40 pointer-events-auto overflow-x-auto",
                    viewMode === 'shelf' ? "mt-1 md:mt-2 mb-2 md:mb-3" : "mt-2 md:mt-4 mb-12 md:mb-16 justify-center"
                )}>
                    <button
                        onClick={() => setViewMode('shelf')}
                        className={`px-6 md:px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'shelf' ? 'bg-caramel text-chocolate shadow-[0_0_20px_rgba(212,140,69,0.3)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                        Shelf View
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-6 md:px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'grid' ? 'bg-caramel text-chocolate shadow-[0_0_20px_rgba(212,140,69,0.3)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
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
                                <div
                                    className="relative aspect-square mb-8 p-4 cursor-pointer"
                                    onClick={() => setSelectedCookie(cookie)}
                                >
                                    <img src={cookie.image} className="w-full h-full object-contain filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-700" alt={cookie.name} />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="cursor-pointer" onClick={() => setSelectedCookie(cookie)}>
                                            <span className="text-caramel uppercase tracking-widest text-[10px] font-extrabold">{cookie.category}</span>
                                            <h3 className="text-3xl font-serif text-cream hover:text-caramel transition-colors">{cookie.name}</h3>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-serif text-caramel font-bold">₹{cookie.price}</span>
                                            <span className="block text-[11px] text-white/40 font-mono">/ pck</span>
                                        </div>
                                    </div>
                                    <p className="text-white/40 font-light text-sm line-clamp-2">{cookie.description}</p>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => addToCart(cookie)}
                                            className="flex-1 bg-caramel text-chocolate py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#d48c45] active:scale-95 transition-all cursor-pointer"
                                        >
                                            <ShoppingBag size={18} /> Add to Cart
                                        </button>
                                        <button
                                            onClick={() => setSelectedCookie(cookie)}
                                            className="w-14 h-14 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                                            aria-label={`View details for ${cookie.name}`}
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
                    <div className="p-4 md:p-6 container mx-auto mt-auto mb-2 md:mb-4 flex flex-wrap justify-center md:justify-start items-center gap-4 pointer-events-none">
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pointer-events-auto w-full md:w-auto">
                            <button onClick={scatterCookies} className="bg-chocolate/80 hover:bg-caramel hover:text-chocolate transition-all border border-white/10 p-4 md:p-5 rounded-full text-caramel active:scale-90 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md cursor-pointer" disabled={!isPhysicsEnabled}><RotateCcw size={20} /></button>
                            <button onClick={selfOrganize} className="flex items-center gap-3 px-6 md:px-8 py-4 bg-chocolate/80 hover:bg-caramel hover:text-chocolate transition-all border border-white/10 rounded-full text-white/70 font-bold uppercase tracking-widest text-[10px] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md shadow-2xl cursor-pointer" disabled={!isPhysicsEnabled}><Sparkles size={16} /> Self-Organize</button>
                            <button
                                onClick={() => setIsPhysicsEnabled(!isPhysicsEnabled)}
                                className={cn(
                                    "px-6 py-4 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-4 active:scale-95 group transition-all shadow-2xl cursor-pointer",
                                    isPhysicsEnabled ? "bg-chocolate/80 hover:bg-caramel hover:text-chocolate" : "bg-white/10 hover:bg-white/20"
                                )}
                            >
                                <Box size={20} className={cn("transition-colors", isPhysicsEnabled ? "text-caramel group-hover:text-chocolate" : "text-white/40 group-hover:text-white")} />
                                <span className={cn(
                                    "text-xs uppercase tracking-widest font-bold transition-colors",
                                    isPhysicsEnabled ? "text-white/70 group-hover:text-chocolate" : "text-white/40 group-hover:text-white"
                                    )}>
                                    {isPhysicsEnabled ? "Physics Enabled" : "Physics Disabled"}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {viewMode === 'grid' && (
                    <div className="pointer-events-auto">
                        <Footer />
                    </div>
                )}
            </div>

            {/* Cookie Detail Modal */}
            <AnimatePresence>
                {selectedCookie && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md pointer-events-auto overflow-y-auto"
                        onClick={() => setSelectedCookie(null)}
                    >
                        <motion.div
                            key={selectedCookie.id}
                            initial={{ scale: 0.95, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 15 }}
                            transition={{ type: "spring", duration: 0.45, bounce: 0.1 }}
                            className="bg-[#1a110e] w-full max-w-4xl max-h-[90vh] rounded-3xl md:rounded-[40px] border border-white/10 p-6 sm:p-8 md:p-12 relative overflow-y-auto overflow-x-hidden flex flex-col md:flex-row gap-8 md:gap-12 items-center my-auto shadow-[0_25px_70px_rgba(0,0,0,0.85)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative Blur Spheres */}
                            <div className="absolute top-0 right-0 w-72 h-72 bg-caramel/10 blur-[90px] rounded-full pointer-events-none -z-10" />
                            <div className="absolute bottom-0 left-0 w-60 h-60 bg-cookie/5 blur-[80px] rounded-full pointer-events-none -z-10" />

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedCookie(null)}
                                className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-caramel hover:border-caramel hover:text-chocolate transition-all duration-200 z-30 cursor-pointer shadow-lg active:scale-95"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>

                            {/* Cookie Image */}
                            <div className="relative w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 flex-shrink-0 flex items-center justify-center">
                                <div className="absolute inset-0 bg-caramel/10 rounded-full blur-2xl pointer-events-none" />
                                <motion.img
                                    key={selectedCookie.image}
                                    initial={{ scale: 0.85, rotate: -6 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 220, damping: 22 }}
                                    src={selectedCookie.image}
                                    alt={selectedCookie.name}
                                    className="w-full h-full object-contain filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.6)] select-none pointer-events-none"
                                />
                            </div>

                            {/* Cookie Information */}
                            <div className="flex-1 w-full flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="px-3.5 py-1 bg-caramel/15 border border-caramel/25 text-caramel rounded-full text-[11px] uppercase font-bold tracking-widest">
                                        {selectedCookie.category}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-caramel bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                                        <Star size={13} fill="currentColor" />
                                        <span className="text-xs font-bold text-cream">{selectedCookie.rating}</span>
                                    </div>
                                </div>

                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-cream font-bold mb-3 tracking-tight leading-tight">
                                    {selectedCookie.name}
                                </h2>

                                <p className="text-white/60 text-sm sm:text-base md:text-lg font-light leading-relaxed mb-6 italic">
                                    "{selectedCookie.description}"
                                </p>

                                <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/5">
                                    <div>
                                        <span className="text-3xl sm:text-4xl md:text-5xl font-serif text-cream font-bold">
                                            ₹{selectedCookie.price}
                                        </span>
                                        <span className="text-caramel font-mono text-sm ml-2 font-semibold">/ pck</span>
                                    </div>
                                    <div className="h-9 w-px bg-white/10" />
                                    <span className="text-white/40 text-xs uppercase tracking-widest font-medium leading-relaxed">
                                        Handcrafted Pack<br />Baked Fresh
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(selectedCookie);
                                            if (isInWishlist(selectedCookie.id)) {
                                                removeFromWishlist(selectedCookie.id);
                                            }
                                            setSelectedCookie(null);
                                        }}
                                        className="flex-1 bg-caramel text-chocolate py-4 rounded-2xl md:rounded-3xl font-bold text-base md:text-lg hover:bg-[#d48c45] active:scale-98 transition-all flex items-center justify-center gap-3 shadow-lg shadow-caramel/25 cursor-pointer"
                                    >
                                        <ShoppingBag size={20} /> Add to Cart
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleWishlist(selectedCookie);
                                        }}
                                        className={cn(
                                            "w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 shadow-md",
                                            isInWishlist(selectedCookie.id)
                                                ? "bg-caramel/20 border-caramel/40 text-caramel"
                                                : "border-white/10 text-white/50 hover:text-caramel hover:border-caramel/30 bg-white/5"
                                        )}
                                        title={isInWishlist(selectedCookie.id) ? "Remove from Favorites" : "Save to Favorites"}
                                        aria-label="Wishlist toggle"
                                    >
                                        <Heart size={20} className={isInWishlist(selectedCookie.id) ? "fill-caramel text-caramel" : ""} />
                                    </button>

                                    <button
                                        onClick={handlePrevCookie}
                                        className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer shrink-0"
                                        title="Previous Flavor"
                                        aria-label="Previous cookie"
                                    >
                                        <ChevronLeft size={22} />
                                    </button>

                                    <button
                                        onClick={handleNextCookie}
                                        className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer shrink-0"
                                        title="Next Flavor"
                                        aria-label="Next cookie"
                                    >
                                        <ChevronRight size={22} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="fixed inset-0 bg-[#2b1b17]/30 pointer-events-none z-0" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay z-0" />
        </div>
    );
};

export default Shop;
