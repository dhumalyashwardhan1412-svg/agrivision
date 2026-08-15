import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CropFieldsProps {
  growthProgress?: number; // 0 to 1
  harvestProgress?: number; // 0 to 1
  droneScanning?: boolean;
}

export const CropFields: React.FC<CropFieldsProps> = ({
  growthProgress = 0.8,
  harvestProgress = 0,
  droneScanning = false,
}) => {
  const tomatoMeshRef = useRef<THREE.InstancedMesh>(null);
  const fruitMeshRef = useRef<THREE.InstancedMesh>(null);
  const wheatMeshRef = useRef<THREE.InstancedMesh>(null);
  const paddyMeshRef = useRef<THREE.InstancedMesh>(null);
  const maizeMeshRef = useRef<THREE.InstancedMesh>(null);

  // Tomato field instance matrices
  const tomatoInstances = useMemo(() => {
    const rows = 6;
    const cols = 8;
    const count = rows * cols;
    const dummy = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -15 + c * 1.4;
        const z = -2 + r * 2.0;
        dummy.position.set(x, 0, z);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        matrices.push(dummy.matrix.clone());
      }
    }
    return { count, matrices };
  }, []);

  // Wheat field instances
  const wheatInstances = useMemo(() => {
    const count = 120;
    const dummy = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];

    for (let i = 0; i < count; i++) {
      const x = 4 + (i % 12) * 1.0 + (Math.random() - 0.5) * 0.3;
      const z = -2 + Math.floor(i / 12) * 1.4 + (Math.random() - 0.5) * 0.3;
      dummy.position.set(x, 0, z);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return { count, matrices };
  }, []);

  // Paddy field instances
  const paddyInstances = useMemo(() => {
    const count = 80;
    const dummy = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];

    for (let i = 0; i < count; i++) {
      const x = -15 + (i % 10) * 1.2;
      const z = -20 + Math.floor(i / 10) * 1.5;
      dummy.position.set(x, 0, z);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return { count, matrices };
  }, []);

  // Maize field instances
  const maizeInstances = useMemo(() => {
    const count = 60;
    const dummy = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];

    for (let i = 0; i < count; i++) {
      const x = 4 + (i % 8) * 1.6;
      const z = -20 + Math.floor(i / 8) * 1.8;
      dummy.position.set(x, 0, z);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return { count, matrices };
  }, []);

  // Animate wind swaying & growth scale
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const wind = Math.sin(t * 2.2) * 0.08;

    const dummy = new THREE.Object3D();
    const effectiveGrowth = Math.max(0.1, harvestProgress > 0.8 ? 0.2 : growthProgress);

    // Update Tomatoes
    if (tomatoMeshRef.current) {
      tomatoInstances.matrices.forEach((mat, idx) => {
        dummy.matrix.copy(mat);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        dummy.scale.set(effectiveGrowth, effectiveGrowth, effectiveGrowth);
        dummy.rotation.z = Math.sin(t * 2 + idx) * 0.05 + wind;
        dummy.updateMatrix();
        tomatoMeshRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      tomatoMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Tomato Fruits (visible when growth > 0.6)
    if (fruitMeshRef.current) {
      const showFruits = growthProgress > 0.6 && harvestProgress < 0.8;
      const fruitScale = showFruits ? (growthProgress - 0.6) * 2.5 : 0.0001;

      tomatoInstances.matrices.forEach((mat, idx) => {
        dummy.matrix.copy(mat);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        dummy.position.y += 0.45 * effectiveGrowth;
        dummy.scale.set(fruitScale, fruitScale, fruitScale);
        dummy.updateMatrix();
        fruitMeshRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      fruitMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Wheat
    if (wheatMeshRef.current) {
      wheatInstances.matrices.forEach((mat, idx) => {
        dummy.matrix.copy(mat);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        dummy.scale.set(1, effectiveGrowth, 1);
        dummy.rotation.z = Math.sin(t * 3 + idx * 0.5) * 0.12 + wind;
        dummy.updateMatrix();
        wheatMeshRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      wheatMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Paddy
    if (paddyMeshRef.current) {
      paddyInstances.matrices.forEach((mat, idx) => {
        dummy.matrix.copy(mat);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        dummy.scale.set(1, effectiveGrowth, 1);
        dummy.rotation.z = Math.sin(t * 2.5 + idx * 0.3) * 0.08 + wind;
        dummy.updateMatrix();
        paddyMeshRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      paddyMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Maize
    if (maizeMeshRef.current) {
      maizeInstances.matrices.forEach((mat, idx) => {
        dummy.matrix.copy(mat);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        dummy.scale.set(effectiveGrowth, effectiveGrowth, effectiveGrowth);
        dummy.rotation.z = Math.sin(t * 1.8 + idx * 0.4) * 0.06 + wind;
        dummy.updateMatrix();
        maizeMeshRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      maizeMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Tomato Plant Bushes (Instanced) */}
      <instancedMesh
        ref={tomatoMeshRef}
        args={[undefined, undefined, tomatoInstances.count]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial
          color={droneScanning ? '#22c55e' : '#16a34a'}
          roughness={0.75}
        />
      </instancedMesh>

      {/* Ripe Red Tomato Fruit Clusters (Instanced) */}
      <instancedMesh
        ref={fruitMeshRef}
        args={[undefined, undefined, tomatoInstances.count]}
        castShadow
      >
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial
          color="#dc2626"
          roughness={0.3}
          metalness={0.1}
        />
      </instancedMesh>

      {/* 2. Golden Wheat Stalks (Instanced) */}
      <instancedMesh
        ref={wheatMeshRef}
        args={[undefined, undefined, wheatInstances.count]}
        castShadow
      >
        <cylinderGeometry args={[0.02, 0.03, 1.3, 5]} />
        <meshStandardMaterial
          color={droneScanning ? '#eab308' : '#ca8a04'}
          roughness={0.8}
        />
      </instancedMesh>

      {/* 3. Lush Paddy Seedling Tufts (Instanced) */}
      <instancedMesh
        ref={paddyMeshRef}
        args={[undefined, undefined, paddyInstances.count]}
        castShadow
      >
        <coneGeometry args={[0.22, 0.9, 5]} />
        <meshStandardMaterial
          color="#15803d"
          roughness={0.7}
        />
      </instancedMesh>

      {/* 4. Tall Maize Stalks (Instanced) */}
      <instancedMesh
        ref={maizeMeshRef}
        args={[undefined, undefined, maizeInstances.count]}
        castShadow
      >
        <cylinderGeometry args={[0.08, 0.12, 2.4, 6]} />
        <meshStandardMaterial
          color="#65a30d"
          roughness={0.8}
        />
      </instancedMesh>
    </group>
  );
};
