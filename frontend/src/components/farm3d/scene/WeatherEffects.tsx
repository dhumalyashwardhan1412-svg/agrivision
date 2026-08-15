import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WeatherType } from '../state/useFarm3DStore';

interface WeatherEffectsProps {
  weather: WeatherType;
}

export const WeatherEffects: React.FC<WeatherEffectsProps> = ({ weather }) => {
  const rainRef = useRef<THREE.Points>(null);
  const lightningLightRef = useRef<THREE.PointLight>(null);

  const isRaining = weather === 'RAIN' || weather === 'STORM';
  const isStorm = weather === 'STORM';

  // Rain particles buffer
  const rainCount = isStorm ? 1200 : 700;
  const rainPositions = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, [rainCount]);

  useFrame((_, delta) => {
    // Animate falling rain streaks
    if (rainRef.current && isRaining) {
      const pos = rainRef.current.geometry.attributes.position.array as Float32Array;
      const speed = isStorm ? 45.0 : 30.0;

      for (let i = 0; i < rainCount; i++) {
        pos[i * 3 + 1] -= delta * speed;
        // slight wind angle
        pos[i * 3 + 0] += delta * (isStorm ? 6.0 : 2.0);

        if (pos[i * 3 + 1] < 0) {
          pos[i * 3 + 1] = 35;
          pos[i * 3 + 0] = (Math.random() - 0.5) * 60;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Thunderstorm Lightning Flash Simulation
    if (lightningLightRef.current && isStorm) {
      if (Math.random() > 0.96) {
        lightningLightRef.current.intensity = 15.0 + Math.random() * 10;
      } else {
        lightningLightRef.current.intensity = 0;
      }
    }
  });

  if (!isRaining) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* Falling Rain Particle Streaks */}
      <points ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[rainPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.18}
          color="#93c5fd"
          transparent
          opacity={isStorm ? 0.8 : 0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Lightning Flash Point Light during Storm */}
      {isStorm && (
        <pointLight
          ref={lightningLightRef}
          position={[0, 25, 0]}
          color="#e0f2fe"
          intensity={0}
          distance={100}
        />
      )}
    </group>
  );
};
