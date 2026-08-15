import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { POIType } from '../state/useFarm3DStore';

interface AutonomousDroneProps {
  scanning?: boolean;
  onSelectPOI?: (poi: POIType) => void;
}

export const AutonomousDrone: React.FC<AutonomousDroneProps> = ({
  scanning = false,
  onSelectPOI,
}) => {
  const droneRef = useRef<THREE.Group>(null);
  const rotorsRef = useRef<THREE.Mesh[]>([]);
  const scanBeamRef = useRef<THREE.Mesh>(null);
  const groundScanGridRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // Autonomous figure-8 flight path over fields
    if (droneRef.current) {
      const t = state.clock.getElapsedTime() * 0.5;
      const x = Math.sin(t) * 12 - 4;
      const z = Math.sin(t * 2) * 6 + 2;
      const y = 8.5 + Math.sin(t * 3) * 0.4;

      droneRef.current.position.set(x, y, z);
      droneRef.current.rotation.z = -Math.cos(t) * 0.15; // banking turn
      droneRef.current.rotation.x = Math.sin(t * 2) * 0.1;
      droneRef.current.rotation.y = Math.atan2(Math.cos(t * 2) * 12, Math.cos(t) * 12) + Math.PI / 2;
    }

    // High speed rotor spin
    rotorsRef.current.forEach((r) => {
      if (r) r.rotation.y += delta * 35.0;
    });

    // Scan beam pulsing
    if (scanBeamRef.current) {
      const beamMat = scanBeamRef.current.material as THREE.MeshBasicMaterial;
      beamMat.opacity = scanning ? 0.3 + Math.sin(state.clock.getElapsedTime() * 6) * 0.15 : 0;
    }

    if (groundScanGridRef.current) {
      groundScanGridRef.current.rotation.z += delta * 0.6;
    }
  });

  return (
    <group
      ref={droneRef}
      position={[-8, 8.5, 2]}
      onClick={(e) => {
        e.stopPropagation();
        onSelectPOI?.('DRONE');
      }}
    >
      {/* Central Aerodynamic Fuselage Pod */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.45, 12, 10]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* 4K Multispectral Gimbal Sensor */}
      <mesh position={[0, -0.35, 0.15]} castShadow>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Carbon Fiber Motor Arms (Hexacopter Configuration) */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * Math.PI) / 3;
        const armLength = 0.9;
        const ax = Math.cos(angle) * armLength;
        const az = Math.sin(angle) * armLength;

        return (
          <group key={i} position={[0, 0, 0]}>
            {/* Tubular Arm */}
            <mesh position={[ax / 2, 0.05, az / 2]} rotation={[0, -angle, 0]}>
              <boxGeometry args={[armLength, 0.04, 0.04]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>

            {/* Motor Pod */}
            <mesh position={[ax, 0.1, az]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.16, 8]} />
              <meshStandardMaterial color="#0284c7" metalness={0.8} />
            </mesh>

            {/* Spinning Rotor Disc */}
            <mesh
              ref={(el) => el && (rotorsRef.current[i] = el)}
              position={[ax, 0.2, az]}
            >
              <cylinderGeometry args={[0.4, 0.4, 0.01, 12]} />
              <meshStandardMaterial
                color="#e2e8f0"
                transparent
                opacity={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Navigation Strobe LEDs on Arm Tips */}
            <mesh position={[ax, 0.0, az]}>
              <sphereGeometry args={[0.03, 6, 6]} />
              <meshBasicMaterial color={i % 2 === 0 ? '#ef4444' : '#22c55e'} />
            </mesh>
          </group>
        );
      })}

      {/* Carbon Landing Skids */}
      <group position={[0, -0.4, 0]}>
        <mesh position={[0.35, 0, 0]}>
          <boxGeometry args={[0.04, 0.04, 0.8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[-0.35, 0, 0]}>
          <boxGeometry args={[0.04, 0.04, 0.8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Conical LiDAR & Multispectral Scanning Projection Beam */}
      <mesh
        ref={scanBeamRef}
        position={[0, -4.2, 0]}
        rotation={[0, 0, 0]}
      >
        <coneGeometry args={[3.8, 8.4, 16, 1, true]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Rotating Ground Reticle Target */}
      {scanning && (
        <group position={[0, -8.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh ref={groundScanGridRef}>
            <ringGeometry args={[3.2, 3.6, 24]} />
            <meshBasicMaterial
              color="#22c55e"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh>
            <circleGeometry args={[3.2, 16]} />
            <meshBasicMaterial
              color="#10b981"
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};
