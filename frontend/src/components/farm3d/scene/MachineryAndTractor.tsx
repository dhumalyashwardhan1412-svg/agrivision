import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { POIType } from '../state/useFarm3DStore';

interface MachineryAndTractorProps {
  tractorActive?: boolean;
  onSelectPOI?: (poi: POIType) => void;
}

export const MachineryAndTractor: React.FC<MachineryAndTractorProps> = ({
  tractorActive = false,
  onSelectPOI,
}) => {
  const tractorGroupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const smokeParticlesRef = useRef<THREE.Points>(null);

  // Smoke particle data
  const smokeCount = 30;
  const smokePositions = new Float32Array(smokeCount * 3);
  for (let i = 0; i < smokeCount; i++) {
    smokePositions[i * 3 + 0] = 0;
    smokePositions[i * 3 + 1] = 2.4 + Math.random() * 1.5;
    smokePositions[i * 3 + 2] = -0.5 - Math.random() * 1.5;
  }

  useFrame((state, delta) => {
    if (tractorGroupRef.current) {
      if (tractorActive) {
        // Drive tractor slowly along the road/field track
        const t = state.clock.getElapsedTime() * 0.8;
        const zPos = -10 + (Math.sin(t) * 16);
        tractorGroupRef.current.position.z = zPos;
        tractorGroupRef.current.position.x = 0.5;

        // Rotate wheels
        wheelsRef.current.forEach((w) => {
          if (w) w.rotation.x += delta * 4.0;
        });
      } else {
        // Parked position
        tractorGroupRef.current.position.set(0.5, 0, 8);
        tractorGroupRef.current.rotation.set(0, 0, 0);
      }
    }

    // Animate exhaust smoke puff
    if (smokeParticlesRef.current) {
      const pos = smokeParticlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < smokeCount; i++) {
        pos[i * 3 + 1] += delta * 0.8;
        pos[i * 3 + 2] -= delta * 0.5;
        if (pos[i * 3 + 1] > 4.5) {
          pos[i * 3 + 1] = 2.4;
          pos[i * 3 + 2] = -0.5;
        }
      }
      smokeParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group
      ref={tractorGroupRef}
      position={[0.5, 0, 8]}
      onClick={(e) => {
        e.stopPropagation();
        onSelectPOI?.('TRACTOR');
      }}
    >
      {/* --- Main Tractor Chassis --- */}
      {/* Engine Bonnet / Hood */}
      <mesh position={[0, 1.1, 0.8]} castShadow>
        <boxGeometry args={[1.2, 0.9, 1.8]} />
        <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Front Radiator Grille */}
      <mesh position={[0, 1.1, 1.72]}>
        <planeGeometry args={[0.9, 0.7]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* Driver Cabin / Mudguard Wings */}
      <mesh position={[0, 1.2, -0.6]} castShadow>
        <boxGeometry args={[1.5, 0.8, 1.1]} />
        <meshStandardMaterial color="#0369a1" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Driver Seat & Steering Wheel */}
      <mesh position={[0, 1.5, -0.6]} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.75, -0.1]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Safety ROPS Roll-bar Frame */}
      <group position={[0, 2.3, -0.7]}>
        <mesh castShadow>
          <boxGeometry args={[1.4, 1.8, 0.1]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} wireframe />
        </mesh>
      </group>

      {/* Vertical Chrome Exhaust Pipe */}
      <group position={[0.45, 1.8, 1.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.4, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Front Headlights */}
      <mesh position={[0.4, 1.3, 1.72]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <mesh position={[-0.4, 1.3, 1.72]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>

      {/* Front Wheels (Small) */}
      <group
        ref={(el) => el && (wheelsRef.current[0] = el)}
        position={[0.75, 0.4, 1.2]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.95} />
      </group>
      <group
        ref={(el) => el && (wheelsRef.current[1] = el)}
        position={[-0.75, 0.4, 1.2]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.95} />
      </group>

      {/* Rear Wheels (Large Heavy Agricultural Tread) */}
      <group
        ref={(el) => el && (wheelsRef.current[2] = el)}
        position={[0.85, 0.75, -0.6]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.75, 0.75, 0.45, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.98} />
      </group>
      <group
        ref={(el) => el && (wheelsRef.current[3] = el)}
        position={[-0.85, 0.75, -0.6]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.75, 0.75, 0.45, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.98} />
      </group>

      {/* --- Towed Agricultural Trailer / Produce Trolley --- */}
      <group position={[0, 0, -2.8]}>
        {/* Hitch Tow Bar */}
        <mesh position={[0, 0.5, 0.9]}>
          <boxGeometry args={[0.15, 0.15, 1.4]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        {/* Trolley Body Wooden Bed */}
        <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.7, 2.4]} />
          <meshStandardMaterial color="#b45309" roughness={0.9} />
        </mesh>
        {/* Trolley Wheels */}
        <group position={[0.95, 0.45, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 0.25, 14]} />
          <meshStandardMaterial color="#0f172a" />
        </group>
        <group position={[-0.95, 0.45, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 0.25, 14]} />
          <meshStandardMaterial color="#0f172a" />
        </group>

        {/* Harvest Produce Crates Loaded Inside */}
        {[-0.4, 0.4].map((cx, i) =>
          [-0.6, 0.6].map((cz, j) => (
            <mesh key={`${i}-${j}`} position={[cx, 1.4, cz]} castShadow>
              <boxGeometry args={[0.65, 0.45, 0.8]} />
              <meshStandardMaterial color="#dc2626" roughness={0.6} />
            </mesh>
          ))
        )}
      </group>

      {/* Exhaust Smoke Puff Particle Stream */}
      <points ref={smokeParticlesRef} position={[0.45, 0, 1.2]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[smokePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.25}
          color="#cbd5e1"
          transparent
          opacity={0.35}
          blending={THREE.NormalBlending}
        />
      </points>
    </group>
  );
};
