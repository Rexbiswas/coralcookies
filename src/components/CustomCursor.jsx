import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CustomCursor = () => {
    const [isHovering, setIsHovering] = useState(false);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
    const springX = useSpring(cursorX, springConfig);
    const springY = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX - 10);
            cursorY.set(e.clientY - 10);

            // Check if hovering over clickable elements
            const target = e.target;
            const isClickable = target.closest('a, button, [role="button"], input, .clickable');
            setIsHovering(!!isClickable);
        };

        window.addEventListener("mousemove", moveCursor);
        return () => window.removeEventListener("mousemove", moveCursor);
    }, [cursorX, cursorY]);

    return (
        <>
            <style>{`
        body { cursor: none; }
        a, button, input { cursor: none; }
      `}</style>

            {/* Main Cursor (Dot) */}
            <motion.div
                className="fixed top-0 left-0 w-5 h-5 bg-caramel rounded-full pointer-events-none z-[9999] mix-blend-exclusion"
                style={{ x: cursorX, y: cursorY }}
            />

            {/* Trailing Ring */}
            <motion.div
                className="fixed top-0 left-0 w-10 h-10 border border-white/50 rounded-full pointer-events-none z-[9998] mix-blend-difference"
                style={{ x: springX, y: springY, translateX: "-25%", translateY: "-25%" }}
                animate={{
                    scale: isHovering ? 2.5 : 1,
                    opacity: isHovering ? 0.8 : 0.3,
                    backgroundColor: isHovering ? "rgba(212, 140, 69, 0.2)" : "transparent",
                    borderColor: isHovering ? "rgba(212, 140, 69, 0.5)" : "rgba(255, 255, 255, 0.5)"
                }}
                transition={{ duration: 0.2 }}
            />
        </>
    );
};

export default CustomCursor;
