import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload, View } from '@react-three/drei';

// This component will be placed once at the top level of the Shop page
const GlobalCanvas = ({ eventSource }) => {
    return (
        <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 0, 6], fov: 40 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 40
            }}
            eventSource={eventSource}
        >
            <Suspense fallback={null}>
                <ambientLight intensity={2} />
                <pointLight position={[10, 10, 10]} intensity={500} />
                <View.Port />
                <Preload all />
            </Suspense>
        </Canvas>
    );
};

export default GlobalCanvas;
