import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CustomCursor = () => {
    const [mounted, setMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    const springConfig = { damping: 28, stiffness: 450, mass: 0.4 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        setMounted(true);

        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!isVisible) setIsVisible(true);

            // Robust hover detection across standard tags and clickable classes
            const target = e.target;
            if (target instanceof Element) {
                const clickable = target.closest(
                    'a, button, [role="button"], input, select, textarea, label, .cursor-pointer, [data-clickable]'
                );
                setIsHovering(!!clickable);
            }
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);
        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        document.documentElement.addEventListener("mouseleave", handleMouseLeave);
        document.documentElement.addEventListener("mouseenter", handleMouseEnter);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
            document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
        };
    }, [mouseX, mouseY, isVisible]);

    if (!mounted || typeof document === "undefined") return null;

    const cursorContent = (
        <>
            <style>{`
                @media (min-width: 768px) {
                    html, body, a, button, input, select, textarea, [role="button"], .cursor-pointer {
                        cursor: none !important;
                    }
                }
            `}</style>

            {/* Main Center Dot */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999999] hidden md:block rounded-full bg-caramel shadow-[0_0_10px_rgba(212,140,69,0.9),0_0_20px_rgba(212,140,69,0.5)]"
                style={{
                    x: mouseX,
                    y: mouseY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    width: isClicking ? 6 : isHovering ? 8 : 7,
                    height: isClicking ? 6 : isHovering ? 8 : 7,
                    opacity: isVisible ? 1 : 0,
                    scale: isClicking ? 0.75 : 1,
                }}
                transition={{ duration: 0.15 }}
            />

            {/* Smooth Trailing Aureole Ring */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999998] hidden md:block rounded-full border border-caramel/70 shadow-[0_0_20px_rgba(212,140,69,0.25)]"
                style={{
                    x: springX,
                    y: springY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    width: isHovering ? 46 : 32,
                    height: isHovering ? 46 : 32,
                    borderColor: isHovering ? "rgba(238, 172, 105, 0.95)" : "rgba(212, 140, 69, 0.55)",
                    backgroundColor: isHovering ? "rgba(212, 140, 69, 0.14)" : "rgba(212, 140, 69, 0.03)",
                    scale: isClicking ? 0.85 : 1,
                    opacity: isVisible ? 1 : 0,
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
            />
        </>
    );

    return createPortal(cursorContent, document.body);
};

export default CustomCursor;
