import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';

gsap.registerPlugin(ScrollTrigger);
import Home from './pages/Home';
import Shop from './pages/Shop';
import About from './pages/About';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';

import { TransitionProvider } from './context/TransitionContext';
import { CartProvider } from './context/CartContext';
import CustomCursor from './components/CustomCursor';
import BackToTop from './components/BackToTop';
import ChatbotWidget from './components/ChatbotWidget';


function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const appContainerRef = useRef(null);

  return (
    <CartProvider>
      <TransitionProvider>
        <div ref={appContainerRef} className="app-container relative min-h-screen w-full">
          <CustomCursor />
          <div className="min-h-screen bg-chocolate text-cream font-sans selection:bg-caramel selection:text-chocolate">
            <Navbar />
            <main>
              <AnimatedRoutes />
            </main>
            <ChatbotWidget />
            <BackToTop />
          </div>
        </div>
      </TransitionProvider>
    </CartProvider>
  );
}

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    }
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;