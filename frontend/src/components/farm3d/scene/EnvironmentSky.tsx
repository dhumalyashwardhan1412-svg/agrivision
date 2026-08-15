import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WeatherType } from '../state/useFarm3DStore';

interface EnvironmentSkyProps {
  weather: WeatherType;
}

export const EnvironmentSky: React.FC<EnvironmentSkyProps> = ({ weather }) => {
  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const cloudsRef = useRef<THREE.Group>(null);
  const birdsRef = useRef<THREE.Group>(null);

  // Weather-specific parameters
  const weatherConfig = {
    SUNNY: {
      sunColor: '#fff7ed',
      sunIntensity: 2.2,
      sunPos: [25, 30, 20] as [number, number, number],
      ambientColor: '#e0f2fe',
      ambientIntensity: 0.85,
      fogColor: '#cffafe',
      fogNear: 40,
      fogFar: 140,
    },
    PARTLY_CLOUDY: {
      sunColor: '#fef3c7',
      sunIntensity: 1.7,
      sunPos: [20, 28, 22] as [number, number, number],
      ambientColor: '#cbd5e1',
      ambientIntensity: 0.9,
      fogColor: '#cbd5e1',
      fogNear: 35,
      fogFar: 120,
    },
    OVERCAST: {
      sunColor: '#94a3b8',
      sunIntensity: 0.9,
      sunPos: [10, 25, 10] as [number, number, number],
      ambientColor: '#64748b',
      ambientIntensity: 0.95,
      fogColor: '#94a3b8',
      fogNear: 25,
      fogFar: 90,
    },
    RAIN: {
      sunColor: '#475569',
      sunIntensity: 0.6,
      sunPos: [5, 20, 5] as [number, number, number],
      ambientColor: '#334155',
      ambientIntensity: 0.7,
      fogColor: '#475569',
      fogNear: 15,
      fogFar: 75,
    },
    STORM: {
      sunColor: '#1e293b',
      sunIntensity: 0.3,
      sunPos: [0, 20, 0] as [number, number, number],
      ambientColor: '#0f172a',
      ambientIntensity: 0.5,
      fogColor: '#1e293b',
      fogNear: 10,
      fogFar: 60,
    },
  }[weather];

  useFrame((state, delta) => {
    // Slowly drift clouds
    if (cloudsRef.current) {
      cloudsRef.current.position.x += delta * 0.4;
      if (cloudsRef.current.position.x > 80) {
        cloudsRef.current.position.x = -80;
      }
    }

    // Birds flying circle trajectory
    if (birdsRef.current) {
      const t = state.clock.getElapsedTime() * 0.4;
      birdsRef.current.position.x = Math.sin(t) * 35;
      birdsRef.current.position.z = Math.cos(t) * 35 - 10;
      birdsRef.current.rotation.y = t + Math.PI / 2;
    }
  });

  return (
    <>
      {/* Dynamic Fog */}
      <fog attach="fog" args={[weatherConfig.fogColor, weatherConfig.fogNear, weatherConfig.fogFar]} />

      {/* Atmospheric Ambient Lighting */}
      <ambientLight ref={ambientLightRef} color={weatherConfig.ambientColor} intensity={weatherConfig.ambientIntensity} />

      {/* Main Directional Sun Light with Smooth Soft Shadows */}
      <directionalLight
        ref={sunLightRef}
        position={weatherConfig.sunPos}
        color={weatherConfig.sunColor}
        intensity={weatherConfig.sunIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
        shadow-bias={-0.0003}
      />

      {/* Subtle Sky Hemisphere Fill Light */}
      <hemisphereLight
        args={[weatherConfig.ambientColor, '#365314', 0.6]}
      />

      {/* Distant Hills / Himalayan Foothills Horizon Ring */}
      <group position={[0, -2, -50]}>
        {[-40, -20, 0, 20, 40].map((xOffset, i) => (
          <mesh key={i} position={[xOffset * 1.5, 4 + Math.sin(i * 1.2) * 3, -10]} rotation={[0, i * 0.5, 0]}>
            <coneGeometry args={[22 + (i % 3) * 6, 18 + (i % 2) * 5, 7]} />
            <meshStandardMaterial
              color={weather === 'RAIN' || weather === 'STORM' ? '#1e293b' : '#334155'}
              roughness={0.95}
              metalness={0.05}
              flatShading
            />
          </mesh>
        ))}
      </group>

      {/* Floating Volumetric Clouds */}
      <group ref={cloudsRef} position={[-20, 26, -10]}>
        {[-30, -10, 10, 30, 50].map((x, idx) => (
          <group key={idx} position={[x, Math.sin(idx) * 3, (idx % 2) * 15 - 10]}>
            <mesh position={[0, 0, 0]} castShadow={weather === 'SUNNY'}>
              <sphereGeometry args={[4.5, 8, 8]} />
              <meshStandardMaterial
                color={weather === 'RAIN' || weather === 'STORM' ? '#334155' : '#f8fafc'}
                roughness={0.9}
                transparent
                opacity={weather === 'RAIN' || weather === 'STORM' ? 0.95 : 0.85}
              />
            </mesh>
            <mesh position={[3, -0.5, 1]} castShadow={weather === 'SUNNY'}>
              <sphereGeometry args={[3.5, 8, 8]} />
              <meshStandardMaterial
                color={weather === 'RAIN' || weather === 'STORM' ? '#334155' : '#ffffff'}
                roughness={0.9}
                transparent
                opacity={0.8}
              />
            </mesh>
            <mesh position={[-2.5, -0.2, -1]} castShadow={weather === 'SUNNY'}>
              <sphereGeometry args={[3.2, 8, 8]} />
              <meshStandardMaterial
                color={weather === 'RAIN' || weather === 'STORM' ? '#334155' : '#ffffff'}
                roughness={0.9}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Circling Farm Birds in Distance */}
      <group ref={birdsRef} position={[0, 20, 0]}>
        {[0, 1, 2, 3].map((b) => (
          <group key={b} position={[b * 2.5, Math.sin(b) * 1.5, b * 1.5]}>
            {/* Simple bird wing pair */}
            <mesh rotation={[0, 0, 0.2]}>
              <boxGeometry args={[1.2, 0.05, 0.25]} />
              <meshBasicMaterial color="#1e293b" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Dynamic Sun Visual Sphere (during sunny/partly cloudy) */}
      {(weather === 'SUNNY' || weather === 'PARTLY_CLOUDY') && (
        <mesh position={[weatherConfig.sunPos[0] * 1.5, weatherConfig.sunPos[1] * 1.5, weatherConfig.sunPos[2] * 1.5]}>
          <sphereGeometry args={[3.5, 16, 16]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
      )}
    </>
  );
};
