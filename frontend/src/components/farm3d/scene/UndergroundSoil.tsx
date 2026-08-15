import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface UndergroundSoilProps {
  visible: boolean;
  activeScan?: boolean;
  irrigationFlow?: boolean;
  growthProgress?: number;
}

export const UndergroundSoil: React.FC<UndergroundSoilProps> = ({
  visible = false,
  activeScan = false,
  irrigationFlow = false,
  growthProgress = 0.5,
}) => {
  const nutrientParticlesRef = useRef<THREE.Points>(null);
  const moistureParticlesRef = useRef<THREE.Points>(null);

  // Generate NPK Nutrient Particles
  const nutrientData = useMemo(() => {
    const count = 180;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorN = new THREE.Color('#38bdf8'); // Nitrogen - Sky Blue
    const colorP = new THREE.Color('#fb923c'); // Phosphorus - Amber/Orange
    const colorK = new THREE.Color('#c084fc'); // Potassium - Purple

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = -1.8 - Math.random() * 1.2; // in nutrient zone
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;

      const choice = Math.random();
      const col = choice < 0.4 ? colorN : choice < 0.7 ? colorP : colorK;
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    return { positions, colors };
  }, []);

  // Generate Moisture Flow Particles
  const moistureData = useMemo(() => {
    const count = 140;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = -3.0 - Math.random() * 1.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    return { positions };
  }, []);

  useFrame((state, delta) => {
    if (!visible) return;

    // Animate NPK nutrient particles gentle drift & pulsing
    if (nutrientParticlesRef.current) {
      const pos = nutrientParticlesRef.current.geometry.attributes.position.array as Float32Array;
      const t = state.clock.getElapsedTime();
      for (let i = 0; i < pos.length / 3; i++) {
        pos[i * 3 + 1] += Math.sin(t * 2 + i) * 0.002;
        if (activeScan) {
          // Accelerate nutrient assimilation into roots during scan
          pos[i * 3 + 0] += Math.cos(t * 3 + i) * 0.003;
        }
      }
      nutrientParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Animate Moisture droplets upwards capillary flow
    if (moistureParticlesRef.current) {
      const mPos = moistureParticlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < mPos.length / 3; i++) {
        if (irrigationFlow) {
          mPos[i * 3 + 1] += delta * 0.4;
          if (mPos[i * 3 + 1] > -1.2) {
            mPos[i * 3 + 1] = -4.0;
          }
        }
      }
      moistureParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!visible) return null;

  return (
    <group position={[-10, 0, 4]}>
      {/* Cutaway Stratum 1: Topsoil Surface Layer (0 to -0.6m) */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[14, 0.6, 16]} />
        <meshStandardMaterial color="#3b1d11" roughness={0.98} transparent opacity={0.88} />
      </mesh>

      {/* Cutaway Stratum 2: Rhizosphere / Root Zone (-0.6m to -1.8m) */}
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[14, 1.2, 16]} />
        <meshStandardMaterial color="#451a03" roughness={0.95} transparent opacity={0.82} />
      </mesh>

      {/* Cutaway Stratum 3: Active Nutrient Zone (-1.8m to -3.0m) */}
      <mesh position={[0, -2.4, 0]}>
        <boxGeometry args={[14, 1.2, 16]} />
        <meshStandardMaterial color="#78350f" roughness={0.92} transparent opacity={0.85} />
      </mesh>

      {/* Cutaway Stratum 4: Moisture Table / Water Holding Layer (-3.0m to -4.2m) */}
      <mesh position={[0, -3.6, 0]}>
        <boxGeometry args={[14, 1.2, 16]} />
        <meshStandardMaterial color="#0c4a6e" roughness={0.5} transparent opacity={0.8} />
      </mesh>

      {/* Cutaway Stratum 5: Deep Bedrock Clay (-4.2m to -5.6m) */}
      <mesh position={[0, -4.9, 0]}>
        <boxGeometry args={[14, 1.4, 16]} />
        <meshStandardMaterial color="#1c1917" roughness={0.98} />
      </mesh>

      {/* Holographic Stratum Division Wireframe Grids */}
      {[-0.6, -1.8, -3.0, -4.2].map((y, idx) => (
        <group key={idx} position={[0, y, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[14, 16]} />
            <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.25} />
          </mesh>
        </group>
      ))}

      {/* 3D Root Architecture Expanding Underground */}
      {[-4, -2, 0, 2, 4].map((x, rowIdx) =>
        [-4, 0, 4].map((z, colIdx) => (
          <group key={`${rowIdx}-${colIdx}`} position={[x, -0.6, z]}>
            {/* Main taproot */}
            <mesh position={[0, -0.6 * growthProgress, 0]}>
              <cylinderGeometry args={[0.04, 0.01, 1.2 * growthProgress, 6]} />
              <meshStandardMaterial color="#fef08a" roughness={0.8} />
            </mesh>
            {/* Lateral branch roots */}
            <mesh position={[0.15, -0.35 * growthProgress, 0.1]} rotation={[0.4, 0.5, 0.6]}>
              <cylinderGeometry args={[0.02, 0.005, 0.5 * growthProgress, 4]} />
              <meshStandardMaterial color="#fef08a" roughness={0.8} />
            </mesh>
            <mesh position={[-0.15, -0.5 * growthProgress, -0.1]} rotation={[-0.4, -0.5, -0.6]}>
              <cylinderGeometry args={[0.02, 0.005, 0.5 * growthProgress, 4]} />
              <meshStandardMaterial color="#fef08a" roughness={0.8} />
            </mesh>
            {/* Fine root hairs */}
            <mesh position={[0.08, -0.8 * growthProgress, -0.12]} rotation={[0.3, 0.8, -0.5]}>
              <cylinderGeometry args={[0.015, 0.003, 0.4 * growthProgress, 4]} />
              <meshStandardMaterial color="#fef9c3" roughness={0.8} />
            </mesh>
          </group>
        ))
      )}

      {/* Glowing NPK Nutrient Particle Swarm */}
      <points ref={nutrientParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[nutrientData.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[nutrientData.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Capillary Moisture Particles */}
      <points ref={moistureParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[moistureData.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          color="#38bdf8"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Floating 3D Text Labels on Cross-Section Edge */}
      <group position={[7.1, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Text position={[0, -0.3, 0]} fontSize={0.3} color="#f8fafc" anchorX="left" anchorY="middle">
          🌱 Topsoil Layer (0-20cm)
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.3} color="#fde047" anchorX="left" anchorY="middle">
          🌿 Rhizosphere & Active Roots (20-40cm)
        </Text>
        <Text position={[0, -2.4, 0]} fontSize={0.3} color="#38bdf8" anchorX="left" anchorY="middle">
          🧪 N-P-K Nutrient Horizon (40-60cm)
        </Text>
        <Text position={[0, -3.6, 0]} fontSize={0.3} color="#0284c7" anchorX="left" anchorY="middle">
          💧 Capillary Moisture Table (60-80cm)
        </Text>
        <Text position={[0, -4.9, 0]} fontSize={0.3} color="#94a3b8" anchorX="left" anchorY="middle">
          🪨 Deep Bedrock & Mineral Clay (&gt;80cm)
        </Text>
      </group>
    </group>
  );
};
