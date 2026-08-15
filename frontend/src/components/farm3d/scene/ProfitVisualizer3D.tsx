import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface ProfitVisualizer3DProps {
  active?: boolean;
}

export const ProfitVisualizer3D: React.FC<ProfitVisualizer3DProps> = ({ active = false }) => {
  const coinsRef = useRef<THREE.Points>(null);
  const pillarGroupRef = useRef<THREE.Group>(null);

  // Floating gold coin particles
  const coinData = useMemo(() => {
    const count = 100;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = 4 + Math.random() * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return { count, pos };
  }, []);

  useFrame((state, delta) => {
    if (!active) return;

    // Animate floating gold coins
    if (coinsRef.current) {
      const pos = coinsRef.current.geometry.attributes.position.array as Float32Array;
      const t = state.clock.getElapsedTime();
      for (let i = 0; i < coinData.count; i++) {
        pos[i * 3 + 1] += Math.sin(t * 3 + i) * 0.015;
      }
      coinsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Gentle floating bob of the pillar group
    if (pillarGroupRef.current) {
      pillarGroupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.2;
    }
  });

  if (!active) return null;

  return (
    <group ref={pillarGroupRef} position={[0, 0, 0]}>
      {/* Pillar 1: Total Input Cost (INR 65,000) */}
      <group position={[-6, 0, 0]}>
        <mesh position={[0, 2.5, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.4, 5.0, 16]} />
          <meshStandardMaterial color="#f43f5e" metalness={0.7} roughness={0.3} />
        </mesh>
        <Text position={[0, 5.6, 0]} fontSize={0.4} color="#f43f5e" anchorX="center">
          ₹65,000
        </Text>
        <Text position={[0, 5.1, 0]} fontSize={0.25} color="#fda4af" anchorX="center">
          Total Cultivation Cost
        </Text>
      </group>

      {/* Pillar 2: Gross Harvest Revenue (INR 2,10,000) */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 4.5, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.4, 9.0, 16]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
        </mesh>
        <Text position={[0, 9.6, 0]} fontSize={0.45} color="#38bdf8" anchorX="center">
          ₹2,10,000
        </Text>
        <Text position={[0, 9.0, 0]} fontSize={0.26} color="#bae6fd" anchorX="center">
          Gross APMC Revenue
        </Text>
      </group>

      {/* Pillar 3: Net Farmer Profit (INR 1,45,000) - Star Pillar */}
      <group position={[6, 0, 0]}>
        <mesh position={[0, 3.8, 0]} castShadow>
          <cylinderGeometry args={[1.3, 1.5, 7.6, 16]} />
          <meshStandardMaterial color="#16a34a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Crowning Golden Torus */}
        <mesh position={[0, 7.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.4, 0.12, 12, 24]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
        <Text position={[0, 8.8, 0]} fontSize={0.55} color="#4ade80" anchorX="center">
          +₹1,45,000
        </Text>
        <Text position={[0, 8.1, 0]} fontSize={0.28} color="#fef08a" anchorX="center">
          Net Profit (+123% ROI)
        </Text>
        <pointLight position={[0, 8.0, 0]} color="#4ade80" intensity={3.5} distance={8} />
      </group>

      {/* Swarm of Floating Golden Coin Particles */}
      <points ref={coinsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[coinData.pos, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.25}
          color="#facc15"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
