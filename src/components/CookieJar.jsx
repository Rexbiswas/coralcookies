import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { motion } from 'framer-motion';

const COOKIE_IMAGE_URL = "https://www.pngall.com/wp-content/uploads/2016/07/Cookie-Download-PNG.png";

const GlassJar = () => {
    const sceneRef = useRef(null);
    const engineRef = useRef(null);
    const [cookies, setCookies] = useState([]);

    // Config
    const cookieCount = 15; // Increased number of cookies

    useEffect(() => {
        // Module aliases
        const Engine = Matter.Engine,
            World = Matter.World,
            Bodies = Matter.Bodies,
            Mouse = Matter.Mouse,
            MouseConstraint = Matter.MouseConstraint,
            Runner = Matter.Runner;

        // Create engine
        const engine = Engine.create();
        engineRef.current = engine;
        const world = engine.world;

        const width = sceneRef.current.clientWidth;
        const height = sceneRef.current.clientHeight;

        // Create Jar Boundaries (Invisible Static Bodies)
        // Walls kept just off screen or forming a "jar" area
        const ground = Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true, render: { visible: false } });
        const leftWall = Bodies.rectangle(-50, height / 2, 100, height * 2, { isStatic: true, render: { visible: false } });
        const rightWall = Bodies.rectangle(width + 50, height / 2, 100, height * 2, { isStatic: true, render: { visible: false } });

        // Add walls
        World.add(world, [ground, leftWall, rightWall]);

        // Add Cookies
        const initialCookies = [];
        const cookieBodies = [];
        // Fixed radius for the Bodies.circle to match the image size
        const radius = 100;

        for (let i = 0; i < cookieCount; i++) {
            const x = Math.random() * (width - 100) + 50;
            const y = Math.random() * -500 - 50; // Start above screen to fall in

            const body = Bodies.circle(x, y, radius, {
                restitution: 0.5,
                friction: 0.1,
                density: 0.04,
                angle: Math.random() * Math.PI * 2
            });

            initialCookies.push({
                id: i,
                body,
                radius
            });
            cookieBodies.push(body);
        }

        setCookies(initialCookies);
        World.add(world, cookieBodies);

        // Add Mouse Interaction
        const mouse = Mouse.create(sceneRef.current);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });

        // Remove wheel event capture to allow page scrolling
        mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
        mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

        World.add(world, mouseConstraint);

        // Run the engine
        const runner = Runner.create();
        Runner.run(runner, engine);

        // Render Loop for DOM Updates
        let animationFrameId;
        const updateDOM = () => {
            // We can access the cookies state from closure if we are careful, or ref.
            // But simpler is to use the cookieBodies array we created locally for the loop reference?
            // Actually, `initialCookies` contains body references.
            initialCookies.forEach(cookie => {
                const element = document.getElementById(`cookie-${cookie.id}`);
                if (element && cookie.body) {
                    const { x, y } = cookie.body.position;
                    const rotation = cookie.body.angle;
                    // Apply physics transforms to DOM nodes
                    element.style.transform = `translate(${x - cookie.radius}px, ${y - cookie.radius}px) rotate(${rotation}rad)`;
                }
            });
            animationFrameId = requestAnimationFrame(updateDOM);
        };
        updateDOM();

        // Cleanup
        return () => {
            Runner.stop(runner);
            World.clear(world);
            Engine.clear(engine);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <section className="min-h-[100vh] relative py-20 flex items-center justify-center overflow-hidden">
            {/* The Physics Container */}
            <div
                ref={sceneRef}
                className="relative w-full max-w-[800px] h-[600px] mx-auto select-none touch-none"
                style={{ cursor: 'grab' }}
            >


                {/* DOM Elements mapped to Physics Bodies */}
                {cookies.map((cookie) => (
                    <img
                        key={cookie.id}
                        id={`cookie-${cookie.id}`}
                        src={COOKIE_IMAGE_URL}
                        alt="Cookie"
                        className="absolute top-0 left-0 w-auto h-auto select-none pointer-events-auto"
                        style={{
                            width: `${cookie.radius * 2}px`,
                            height: `${cookie.radius * 2}px`,
                            willChange: 'transform',
                            filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))'
                        }}
                        draggable={false}
                    />
                ))}

                {/* Interaction Hint */}
                <div className="absolute top-0 left-0 w-full text-center pointer-events-none opacity-50 text-cream/60">
                    <p className="text-sm uppercase tracking-widest mt-4">Grab & Throw Me!</p>
                </div>
            </div>
        </section>
    );
};

export default GlassJar;
