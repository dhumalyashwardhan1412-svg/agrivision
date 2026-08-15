import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface LogisticsAndMarketProps {
  active?: boolean;
}

export const LogisticsAndMarket: React.FC<LogisticsAndMarketProps> = ({ active = false }) => {
  const truckRef = useRef<THREE.Group>(null);
  const routeCurveRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!active) return;

    // Move logistics truck along route
    if (truckRef.current) {
      const t = (state.clock.getElapsedTime() * 0.25) % 1;
      // Parametric curve from Farm (0, 0, 10) to Mandi (20, 0, -20)
      const x = Math.sin(t * Math.PI) * 15 + t * 15;
      const z = 10 - t * 30;
      truckRef.current.position.set(x, 0.4, z);
      truckRef.current.rotation.y = -t * 1.5 - 0.4;
    }
  });

  if (!active) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Glowing 3D Curved Logistics Highway Ribbon */}
      <mesh position={[8, 0.1, -5]} rotation={[-Math.PI / 2, 0, 0.4]}>
        <planeGeometry args={[2.5, 36]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>

      {/* 2. Mini Logistics Transport Truck */}
      <group ref={truckRef} position={[0, 0.4, 10]}>
        {/* Cab */}
        <mesh position={[0, 0.6, 0.8]} castShadow>
          <boxGeometry args={[1.2, 1.0, 1.2]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} />
        </mesh>
        {/* Insulated Cold Storage Box Body */}
        <mesh position={[0, 0.8, -0.6]} castShadow>
          <boxGeometry args={[1.4, 1.4, 2.0]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Wheels */}
        {[-0.65, 0.65].map((wx, i) =>
          [-0.8, 0.8].map((wz, j) => (
            <mesh key={`${i}-${j}`} position={[wx, 0, wz]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.25, 0.25, 0.15, 10]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          ))
        )}
      </group>

      {/* 3. Waypoint Hub 1: Farm Gate Dispatch Hub */}
      <group position={[0, 0, 12]}>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 3.0, 8]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
        <mesh position={[0, 3.2, 0]}>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <Text position={[0, 4.0, 0]} fontSize={0.35} color="#22c55e" anchorX="center">
          🌾 1. Farm Harvest Gate
        </Text>
      </group>

      {/* 4. Waypoint Hub 2: Temperature-Controlled Cold Storage */}
      <group position={[10, 0, -2]}>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 3.0, 8]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[0, 3.2, 0]}>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <Text position={[0, 4.0, 0]} fontSize={0.35} color="#38bdf8" anchorX="center">
          ❄️ 2. Cold Chain Transit
        </Text>
      </group>

      {/* 5. Waypoint Hub 3: APMC Wholesale Mandi & Direct Buyer */}
      <group position={[20, 0, -18]}>
        <mesh position={[0, 2.0, 0]}>
          <boxGeometry args={[5.0, 3.0, 4.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 4.2, 0]}>
          <sphereGeometry args={[0.5, 12, 12]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <Text position={[0, 5.2, 0]} fontSize={0.4} color="#f59e0b" anchorX="center">
          🏪 3. APMC Mandi & Consumer Hub
        </Text>
        <Text position={[0, 4.6, 0]} fontSize={0.28} color="#4ade80" anchorX="center">
          0% Middleman Deduction • Direct Escrow Payout
        </Text>
      </group>
    </group>
  );
};
