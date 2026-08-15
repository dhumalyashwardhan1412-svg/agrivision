import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface AIScanningEffectsProps {
  activeScan?: boolean;
}

export const AIScanningEffects: React.FC<AIScanningEffectsProps> = ({ activeScan = false }) => {
  const scanPlaneRef = useRef<THREE.Mesh>(null);
  const aiCoreRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // Sweep laser scanning plane back and forth across farm
    if (scanPlaneRef.current && activeScan) {
      const t = state.clock.getElapsedTime() * 1.5;
      scanPlaneRef.current.position.x = Math.sin(t) * 22;
    }

    // Spin AI Core
    if (aiCoreRef.current) {
      aiCoreRef.current.rotation.y += delta * 0.8;
      aiCoreRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 1.2) * 0.2;
    }

    if (haloRef.current) {
      haloRef.current.rotation.z += delta * 1.4;
    }
  });

  if (!activeScan) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Laser-Cyan Scanning Grid Plane sweeping across farm */}
      <mesh
        ref={scanPlaneRef}
        position={[0, 4, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <planeGeometry args={[12, 45]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 2. Central Floating AI FARM INTELLIGENCE Core Node */}
      <group ref={aiCoreRef} position={[0, 9.5, 0]}>
        {/* Core Crystal Icosahedron */}
        <mesh>
          <icosahedronGeometry args={[1.4, 0]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#38bdf8"
            emissiveIntensity={1.8}
            wireframe
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.9, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>

        {/* Orbiting Holographic Rings */}
        <mesh ref={haloRef} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[2.2, 0.04, 8, 32]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.8} />
        </mesh>
        <mesh rotation={[-Math.PI / 4, 0, 0]}>
          <torusGeometry args={[2.6, 0.04, 8, 32]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} />
        </mesh>

        {/* Floating 3D Title */}
        <Text
          position={[0, 2.2, 0]}
          fontSize={0.45}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          AGRIVISION AI INTELLIGENCE CORE
        </Text>
      </group>

      {/* 3. Floating Crop Recommendation Nodes Materializing in 3D Space */}
      <group position={[0, 6.5, 6]}>
        {/* Top Recommendation (Tomato - 92%) with Glow Highlight */}
        <group position={[-5, 0, 0]}>
          <mesh>
            <boxGeometry args={[3.4, 1.2, 0.2]} />
            <meshStandardMaterial color="#064e3b" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[3.3, 1.1]} />
            <meshBasicMaterial color="#022c22" />
          </mesh>
          <Text position={[0, 0.2, 0.15]} fontSize={0.28} color="#4ade80" anchorX="center">
            🍅 Tomato (Hybrid)
          </Text>
          <Text position={[0, -0.2, 0.15]} fontSize={0.24} color="#fef08a" anchorX="center">
            92% Match • Top Crop
          </Text>
          {/* Subtle glowing halo */}
          <pointLight color="#22c55e" intensity={2.0} distance={5} />
        </group>

        {/* Option 2 (Onion - 86%) */}
        <group position={[0, 0, 0]}>
          <mesh>
            <boxGeometry args={[3.2, 1.0, 0.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          <Text position={[0, 0.15, 0.15]} fontSize={0.24} color="#f8fafc" anchorX="center">
            🧅 Red Onion
          </Text>
          <Text position={[0, -0.2, 0.15]} fontSize={0.2} color="#cbd5e1" anchorX="center">
            86% Match
          </Text>
        </group>

        {/* Option 3 (Maize - 79%) */}
        <group position={[5, 0, 0]}>
          <mesh>
            <boxGeometry args={[3.2, 1.0, 0.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          <Text position={[0, 0.15, 0.15]} fontSize={0.24} color="#f8fafc" anchorX="center">
            🌽 Sweet Corn / Maize
          </Text>
          <Text position={[0, -0.2, 0.15]} fontSize={0.2} color="#cbd5e1" anchorX="center">
            79% Match
          </Text>
        </group>
      </group>
    </group>
  );
};
