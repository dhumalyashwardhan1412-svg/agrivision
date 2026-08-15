import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { POIType } from '../state/useFarm3DStore';

interface TerrainAndFieldsProps {
  onSelectPOI?: (poi: POIType) => void;
  soilCutawayOpen?: boolean;
}

export const TerrainAndFields: React.FC<TerrainAndFieldsProps> = ({
  onSelectPOI,
  soilCutawayOpen = false,
}) => {
  const waterCanalRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (waterCanalRef.current) {
      // Flowing water offset animation
      const mat = waterCanalRef.current.material as THREE.MeshStandardMaterial;
      if (mat.map) {
        mat.map.offset.x = (state.clock.getElapsedTime() * 0.05) % 1;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Primary Farm Terrain Base Ground */}
      <mesh
        receiveShadow
        position={[0, -0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPOI?.('SOIL');
        }}
      >
        <planeGeometry args={[90, 90, 32, 32]} />
        <meshStandardMaterial
          color="#3f6212"
          roughness={0.9}
          metalness={0.05}
          transparent={soilCutawayOpen}
          opacity={soilCutawayOpen ? 0.35 : 1.0}
        />
      </mesh>

      {/* Tilled Agricultural Field Plots */}
      {/* 1. Tomato Plot (Rich Loamy Soil Furrows) */}
      <group position={[-10, 0, 4]}>
        <mesh
          receiveShadow
          position={[0, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPOI?.('CROP_FIELD');
          }}
        >
          <planeGeometry args={[14, 16]} />
          <meshStandardMaterial
            color="#451a03"
            roughness={0.95}
            transparent={soilCutawayOpen}
            opacity={soilCutawayOpen ? 0.4 : 1.0}
          />
        </mesh>
        {/* Ridge and Furrow Elevation Bars */}
        {[-6, -4, -2, 0, 2, 4, 6].map((z, i) => (
          <mesh key={i} position={[0, 0.08, z]} receiveShadow>
            <boxGeometry args={[13.8, 0.12, 0.7]} />
            <meshStandardMaterial
              color="#542407"
              roughness={0.98}
              transparent={soilCutawayOpen}
              opacity={soilCutawayOpen ? 0.4 : 1.0}
            />
          </mesh>
        ))}
      </group>

      {/* 2. Wheat & Grain Plot (Warm Earth with Drip Lines) */}
      <group position={[10, 0, 4]}>
        <mesh
          receiveShadow
          position={[0, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPOI?.('CROP_FIELD');
          }}
        >
          <planeGeometry args={[14, 16]} />
          <meshStandardMaterial
            color="#78350f"
            roughness={0.9}
            transparent={soilCutawayOpen}
            opacity={soilCutawayOpen ? 0.4 : 1.0}
          />
        </mesh>
        {[-6, -3, 0, 3, 6].map((z, i) => (
          <mesh key={i} position={[0, 0.06, z]} receiveShadow>
            <boxGeometry args={[13.8, 0.08, 0.9]} />
            <meshStandardMaterial color="#854d0e" roughness={0.95} />
          </mesh>
        ))}
      </group>

      {/* 3. Rice / Paddy Plot (Flooded Basin Texture) */}
      <group position={[-10, 0, -14]}>
        <mesh receiveShadow position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 14]} />
          <meshStandardMaterial color="#14532d" roughness={0.8} />
        </mesh>
        {/* Shallow Water Layer */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[13.5, 13.5]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.1}
            metalness={0.8}
            transparent
            opacity={0.65}
          />
        </mesh>
      </group>

      {/* 4. Vegetable & Maize Plot */}
      <group position={[10, 0, -14]}>
        <mesh receiveShadow position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 14]} />
          <meshStandardMaterial color="#365314" roughness={0.9} />
        </mesh>
      </group>

      {/* Rural Dirt Road passing through farm */}
      <group position={[0, 0.03, 0]}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.8, 80]} />
          <meshStandardMaterial color="#a16207" roughness={0.95} />
        </mesh>
        {/* Cross road leading to farmhouse */}
        <mesh receiveShadow position={[-10, 0, 15]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[3.2, 20]} />
          <meshStandardMaterial color="#a16207" roughness={0.95} />
        </mesh>
      </group>

      {/* Irrigation Supply Canal along East Boundary */}
      <group position={[20, 0, 0]}>
        {/* Canal bed ditch */}
        <mesh receiveShadow position={[0, -0.3, 0]}>
          <boxGeometry args={[3.2, 0.6, 75]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        {/* Flowing canal water */}
        <mesh ref={waterCanalRef} position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.8, 74]} />
          <meshStandardMaterial
            color="#0ea5e9"
            roughness={0.1}
            metalness={0.85}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* Natural Perimeter Shade Trees (Neem, Banyan, Mango) */}
      <group position={[0, 0, 0]}>
        {[
          [-22, 12], [-22, -8], [-22, -26],
          [24, 16], [24, -12], [24, -28],
          [-14, 25], [12, 25]
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            {/* Trunk */}
            <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.3, 0.5, 3.6, 7]} />
              <meshStandardMaterial color="#78350f" roughness={0.95} />
            </mesh>
            {/* Foliage Canopy Clusters */}
            <mesh position={[0, 3.8, 0]} castShadow receiveShadow>
              <dodecahedronGeometry args={[2.2 + (i % 3) * 0.4]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#15803d' : '#166534'} roughness={0.85} />
            </mesh>
            <mesh position={[0.7, 4.4, 0.4]} castShadow>
              <dodecahedronGeometry args={[1.5]} />
              <meshStandardMaterial color="#22c55e" roughness={0.85} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
