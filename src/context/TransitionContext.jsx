import React, { createContext, useContext, useRef, useLayoutEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const TransitionContext = createContext();

export const usePageTransition = () => useContext(TransitionContext);

export const TransitionProvider = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const overlayRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const GRID_ROWS = 5;
    const GRID_COLS = 8; // More columns for wider aspect ratios
    const totalBlocks = GRID_ROWS * GRID_COLS;

    // Helper to generate deterministic but random-looking blob shapes & flavors
    const getCookieStyle = (i) => {
        const radii = [
            "40% 60% 70% 30% / 40% 50% 60% 50%",
            "50% 50% 20% 80% / 25% 80% 20% 75%",
            "70% 30% 50% 50% / 30% 30% 70% 70%",
            "60% 40% 30% 70% / 60% 30% 70% 40%"
        ];

        return {
            borderRadius: radii[i % radii.length],
        };
    };

    const switchPage = (to) => {
        if (location.pathname === to || isAnimating) return;

        setIsAnimating(true);
        gsap.set(overlayRef.current, { display: "grid" });

        const tl = gsap.timeline({
            onComplete: () => {
                navigate(to);
            }
        });

        // ANIMATION IN: Cookies scale up to fill screen
        tl.to(".cookie-block", {
            scale: 1.5, // Scale > 1 to ensure overlap/full coverage
            opacity: 1,
            duration: 0.6,
            stagger: {
                amount: 0.4,
                grid: [GRID_ROWS, GRID_COLS],
                from: "center"
            },
            ease: "back.out(1.2)" // Bouncy effect
        });
    };

    useGSAP(() => {
        if (isAnimating) {
            const tl = gsap.timeline({
                onComplete: () => {
                    setIsAnimating(false);
                    gsap.set(overlayRef.current, { display: "none" });
                    // Reset blocks for next time
                    gsap.set(".cookie-block", { scale: 0, opacity: 0 });
                }
            });

            // ANIMATION OUT: Cookies shrink away
            tl.to(".cookie-block", {
                scale: 0,
                opacity: 0,
                duration: 0.6,
                stagger: {
                    amount: 0.3,
                    grid: [GRID_ROWS, GRID_COLS],
                    from: "edges" // Reverse direction for out
                },
                ease: "back.in(1.2)",
                delay: 0.1
            });
        }
    }, [location.pathname]);

    return (
        <TransitionContext.Provider value={{ switchPage, isAnimating }}>
            {children}

            {/* THE COOKIE GRID OVERLAY */}
            <div
                ref={overlayRef}
                className="fixed inset-0 z-100 pointer-events-none"
                style={{
                    display: 'none', // Initially hidden, toggled by GSAP
                    gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`
                }}
            >
                {[...Array(totalBlocks)].map((_, i) => (
                    <div
                        key={i}
                        className="cookie-block w-full h-full bg-[#2b1b17] relative"
                        style={{
                            scale: 0,
                            opacity: 0,
                            ...getCookieStyle(i),
                            transformOrigin: "center center"
                        }}
                    >
                        {/* Optional: Add "Chips" details for texture */}
                        <div className="absolute top-1/4 left-1/4 w-[10%] h-[10%] bg-black/20 rounded-full" />
                        <div className="absolute bottom-1/3 right-1/4 w-[15%] h-[15%] bg-black/20 rounded-full" />
                    </div>
                ))}

                {/* Brand loader centered on top of grid */}
                <div className="fixed inset-0 flex items-center justify-center z-101 pointer-events-none">
                    <h2 className={`text-caramel font-serif text-5xl transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`}>
                        CoralCookies
                    </h2>
                </div>
            </div>
        </TransitionContext.Provider>
    );
};
