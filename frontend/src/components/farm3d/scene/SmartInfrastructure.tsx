import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { POIType } from '../state/useFarm3DStore';

interface SmartInfrastructureProps {
  onSelectPOI?: (poi: POIType) => void;
}

export const SmartInfrastructure: React.FC<SmartInfrastructureProps> = ({ onSelectPOI }) => {
  const anemometerRef = useRef<THREE.Group>(null);
  const turbine1Ref = useRef<THREE.Group>(null);
  const turbine2Ref = useRef<THREE.Group>(null);
  const sensorPulseRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // Spin anemometer
    if (anemometerRef.current) {
      anemometerRef.current.rotation.y += delta * 6.0;
    }

    // Spin wind turbines
    if (turbine1Ref.current) {
      turbine1Ref.current.rotation.z += delta * 2.5;
    }
    if (turbine2Ref.current) {
      turbine2Ref.current.rotation.z += delta * 2.8;
    }

    // Pulse IoT soil sensor rings
    if (sensorPulseRef.current) {
      const scale = 1 + (Math.sin(state.clock.getElapsedTime() * 4) + 1) * 0.4;
      sensorPulseRef.current.scale.set(scale, 1, scale);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Traditional/Modern Indian Farmhouse */}
      <group
        position={[-18, 0, 18]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPOI?.('FARMHOUSE');
        }}
      >
        {/* Main House Base Walls */}
        <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.5, 4.0, 6.0]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.9} />
        </mesh>

        {/* Veranda Porch Front */}
        <mesh position={[0, 1.2, 3.8]} castShadow receiveShadow>
          <boxGeometry args={[7.5, 2.4, 1.6]} />
          <meshStandardMaterial color="#fae8ff" roughness={0.9} transparent opacity={0.3} />
        </mesh>
        {/* Veranda Pillars */}
        {[-3.2, 0, 3.2].map((x, i) => (
          <mesh key={i} position={[x, 1.2, 4.5]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 2.4, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
        ))}

        {/* Terracotta Tiled Pitched Roof */}
        <mesh position={[0, 4.8, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[6.2, 2.4, 4]} />
          <meshStandardMaterial color="#c2410c" roughness={0.85} />
        </mesh>

        {/* Solar Water Heater on Roof */}
        <mesh position={[1.5, 4.6, 1.8]} rotation={[-0.4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 2.2, 12]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Wooden Entrance Door & Windows */}
        <mesh position={[0, 1.2, 3.02]}>
          <planeGeometry args={[1.2, 2.2]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
        <mesh position={[-2.2, 1.6, 3.02]}>
          <planeGeometry args={[1.0, 1.0]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* 2. Hi-Tech Controlled Environment Greenhouse */}
      <group
        position={[-18, 0, -18]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPOI?.('GREENHOUSE');
        }}
      >
        {/* Concrete Foundation Kerb */}
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.4, 0.4, 10.4]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>

        {/* Translucent Glass Arch Tunnel */}
        <mesh position={[0, 2.4, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[3.8, 3.8, 10.0, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial
            color="#bae6fd"
            roughness={0.1}
            metalness={0.3}
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Steel Arch Framework Ribs */}
        {[-4.5, -2.25, 0, 2.25, 4.5].map((z, i) => (
          <mesh key={i} position={[0, 2.4, z]} rotation={[0, 0, -Math.PI / 2]}>
            <torusGeometry args={[3.82, 0.08, 6, 16, Math.PI]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}

        {/* Internal Amber Grow Lamp Glow */}
        <pointLight position={[0, 2.8, 0]} color="#f59e0b" intensity={2.5} distance={8} />
      </group>

      {/* 3. Photovoltaic Solar Panel Array */}
      <group
        position={[18, 0, 18]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPOI?.('SOLAR_PANELS');
        }}
      >
        {/* Mounting Frames and Dual-Row Panels */}
        {[-2.5, 0, 2.5].map((x, rowIdx) => (
          <group key={rowIdx} position={[x, 0, 0]}>
            {/* Ground Steel Legs */}
            <mesh position={[0, 0.8, -0.6]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 1.6, 6]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 1.4, 0.6]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 2.8, 6]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Blue Photovoltaic Panel Surface */}
            <mesh position={[0, 1.6, 0]} rotation={[-0.45, 0, 0]} castShadow>
              <boxGeometry args={[1.8, 0.08, 3.2]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.2} metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Solar Inverter Box with Green Telemetry LED */}
        <mesh position={[4.0, 0.9, 0]} castShadow>
          <boxGeometry args={[0.8, 1.8, 0.6]} />
          <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
        </mesh>
        <pointLight position={[4.0, 1.4, 0.35]} color="#22c55e" intensity={1.5} distance={3} />
      </group>

      {/* 4. Water Storage Tank & Pump Station */}
      <group
        position={[18, 0, -18]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPOI?.('WATER_TANK');
        }}
      >
        {/* Concrete Platform Base */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.2, 3.4, 0.8, 16]} />
          <meshStandardMaterial color="#64748b" roughness={0.9} />
        </mesh>
        {/* Galvanized Corrugated Steel Tank */}
        <mesh position={[0, 3.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.8, 2.8, 5.2, 20]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Water Level Gauge Strip */}
        <mesh position={[0, 3.4, 2.82]}>
          <planeGeometry args={[0.2, 4.6]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* 5. Smart IoT Weather Station */}
      <group
        position={[0, 0, -22]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPOI?.('WEATHER_STATION');
        }}
      >
        {/* Vertical Mast Pole */}
        <mesh position={[0, 3.0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 6.0, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Telemetry Electronics Box */}
        <mesh position={[0, 2.2, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.4]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Solar Micro Panel on Mast */}
        <mesh position={[0, 3.2, 0.4]} rotation={[-0.5, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.04, 0.8]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Spinning Anemometer Wind Cups */}
        <group ref={anemometerRef} position={[0, 6.1, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.2, 6]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
            <group key={i} rotation={[0, angle, 0]}>
              <mesh position={[0.4, 0, 0]}>
                <boxGeometry args={[0.8, 0.03, 0.03]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
              <mesh position={[0.8, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <sphereGeometry args={[0.14, 8, 8, 0, Math.PI]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* 6. Hilltop Wind Turbines (Distant Renewable Power) */}
      <group position={[-25, 0, -42]}>
        <mesh position={[0, 8, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.5, 16, 12]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.3} roughness={0.4} />
        </mesh>
        <group position={[0, 16, 0.4]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.6, 12, 12]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <group ref={turbine1Ref}>
            {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
              <mesh key={i} rotation={[0, 0, angle]} position={[0, 3.5, 0]}>
                <boxGeometry args={[0.25, 7.0, 0.08]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      <group position={[25, 0, -42]}>
        <mesh position={[0, 7.5, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.5, 15, 12]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.3} roughness={0.4} />
        </mesh>
        <group position={[0, 15, 0.4]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.6, 12, 12]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <group ref={turbine2Ref}>
            {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
              <mesh key={i} rotation={[0, 0, angle]} position={[0, 3.2, 0]}>
                <boxGeometry args={[0.25, 6.4, 0.08]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* 7. IoT Field Soil Probes with Pulsing Signal Rings */}
      <group position={[-6, 0, 8]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.2, 6]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Pulsing signal ring */}
        <mesh ref={sensorPulseRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.75, 16]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};
