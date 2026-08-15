import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CameraMode } from '../state/useFarm3DStore';

interface CameraControllerProps {
  targetPos: [number, number, number];
  lookAtTarget: [number, number, number];
  cameraMode: CameraMode;
  freeOrbitEnabled?: boolean;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  targetPos,
  lookAtTarget,
  cameraMode,
  freeOrbitEnabled = false,
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const desiredPos = useRef<THREE.Vector3>(new THREE.Vector3(...targetPos));
  const desiredLookAt = useRef<THREE.Vector3>(new THREE.Vector3(...lookAtTarget));

  useEffect(() => {
    desiredPos.current.set(...targetPos);
    desiredLookAt.current.set(...lookAtTarget);
  }, [targetPos, lookAtTarget]);

  useFrame(() => {
    if (cameraMode === 'CINEMATIC' || cameraMode === 'UNDERGROUND' || cameraMode === 'TOP_DOWN') {
      // Smooth lerp camera position
      camera.position.lerp(desiredPos.current, 0.045);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(desiredLookAt.current, 0.045);
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={cameraMode === 'UNDERGROUND' ? Math.PI : Math.PI / 2 - 0.02}
      minDistance={2}
      maxDistance={90}
      enabled={freeOrbitEnabled || cameraMode === 'FREE_ORBIT'}
    />
  );
};
