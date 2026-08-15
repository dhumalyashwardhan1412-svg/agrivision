import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { POIType } from '../state/useFarm3DStore';

interface SmartIrrigationSystemProps {
  active?: boolean;
  onSelectPOI?: (poi: POIType) => void;
}

export const SmartIrrigationSystem: React.FC<SmartIrrigationSystemProps> = ({
  active = false,
  onSelectPOI,
}) => {
  const waterFlowRef = useRef<THREE.Mesh>(null);
  const dropletsRef = useRef<THREE.Points>(null);

  // Droplets emitted from drip lateral nozzles
  const dropletData = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // spread across tomato field furrows
      const col = (i % 6);
      const row = Math.floor(i / 6);
      positions[i * 3 + 0] = -15 + col * 2.0 + (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 1] = 0.2 + Math.random() * 0.6;
      positions[i * 3 + 2] = -2 + (row % 10) * 1.6;
    }
    return { count, positions };
  }, []);

  useFrame((state, delta) => {
    // Flow pulsing inside main pipe
    if (waterFlowRef.current) {
      const mat = waterFlowRef.current.material as THREE.MeshStandardMaterial;
      if (active) {
        mat.opacity = 0.7 + Math.sin(state.clock.getElapsedTime() * 6) * 0.2;
      } else {
        mat.opacity = 0.15;
      }
    }

    // Fall animation of water droplets
    if (dropletsRef.current && active) {
      const pos = dropletsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < dropletData.count; i++) {
        pos[i * 3 + 1] -= delta * 1.6;
        if (pos[i * 3 + 1] <= 0.05) {
          pos[i * 3 + 1] = 0.8;
        }
      }
      dropletsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group
      position={[0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelectPOI?.('IRRIGATION');
      }}
    >
      {/* 1. Automated Pressure Booster Pump Station */}
      <group position={[15, 0, -14]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[1.2, 0.8, 1.0]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Electric Motor Housing */}
        <mesh position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.9, 12]} />
          <meshStandardMaterial color="#0369a1" metalness={0.8} />
        </mesh>
        {/* Active Flow Indicator LED */}
        <pointLight
          position={[0, 1.2, 0]}
          color={active ? '#38bdf8' : '#ef4444'}
          intensity={active ? 2.5 : 0.5}
          distance={4}
        />
      </group>

      {/* 2. Main PVC Distribution Manifold Pipeline */}
      {/* From Water Tank / Pump to Central Main Header */}
      <group position={[0, 0.15, 0]}>
        <mesh position={[0, 0, -14]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 30, 8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        {/* Translucent water flow core */}
        <mesh ref={waterFlowRef} position={[0, 0, -14]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.065, 0.065, 29.8, 8]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* 3. In-Line Micro-Drip Lateral Lines Laid along Crop Furrows */}
      <group position={[-10, 0.08, 4]}>
        {[-6, -4, -2, 0, 2, 4, 6].map((z, idx) => (
          <group key={idx} position={[0, 0, z]}>
            {/* Black UV-resistant Drip Lateral Tube */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.025, 0.025, 13.8, 6]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
            {/* Dripper Emitter Nozzles */}
            {[-5, -3, -1, 1, 3, 5].map((x, nIdx) => (
              <mesh key={nIdx} position={[x, 0.02, 0]}>
                <sphereGeometry args={[0.04, 6, 6]} />
                <meshStandardMaterial color="#0284c7" />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* 4. Active Micro Water Droplets Emitters */}
      {active && (
        <points ref={dropletsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[dropletData.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.12}
            color="#38bdf8"
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
};
