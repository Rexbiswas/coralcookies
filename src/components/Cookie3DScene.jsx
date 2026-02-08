import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, useTexture, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

const CookieModel = ({ imageUrl }) => {
    const meshRef = useRef();
    const texture = useTexture(imageUrl);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
            meshRef.current.rotation.z = THREE.MathUtils.lerp(
                meshRef.current.rotation.z,
                (state.mouse.x * Math.PI) / 8,
                0.05
            );
            meshRef.current.rotation.x = THREE.MathUtils.lerp(
                meshRef.current.rotation.x,
                (-state.mouse.y * Math.PI) / 8 + Math.PI / 10,
                0.05
            );
        }
    });

    return (
        <group scale={1.2}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh ref={meshRef} castShadow receiveShadow rotation={[Math.PI / 2.5, 0, 0]}>
                    <cylinderGeometry args={[2, 2, 0.4, 64]} />
                    <meshStandardMaterial
                        map={texture}
                        roughness={0.4}
                        metalness={0.1}
                    />
                </mesh>
            </Float>
        </group>
    );
};

const Cookie3DScene = ({ imageUrl }) => {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={35} />
            <ambientLight intensity={1.5} />
            <spotLight position={[10, 10, 10]} angle={0.25} penumbra={1} intensity={2000} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={1000} color="#D48C45" />
            <Environment preset="neutral" intensity={0.5} />

            <Suspense fallback={null}>
                <CookieModel imageUrl={imageUrl} />
            </Suspense>
        </>
    );
};

export default Cookie3DScene;
