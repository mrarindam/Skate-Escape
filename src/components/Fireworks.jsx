import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';
import * as THREE from 'three';

export default function Fireworks({ position }) {
  const group = useRef();
  const performanceMode = useStore((state) => state.performanceMode);
  
  // Create particles for the explosion
  const particleCount = performanceMode === 'high' ? 100 : 30;
  const dummy = new THREE.Object3D();
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      // Random spherical spread
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      
      const speed = 2 + Math.random() * 4;
      
      temp.push({
        velocity: new THREE.Vector3(
          Math.cos(theta) * Math.sin(phi) * speed,
          Math.sin(theta) * Math.sin(phi) * speed,
          Math.cos(phi) * speed
        ),
        color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
        life: 1.0,
      });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    
    // Animate particles outward and fade them
    particles.forEach((p, i) => {
      p.life -= delta * 0.8;
      
      // Gravity
      p.velocity.y -= delta * 5; 
      
      dummy.position.copy(p.velocity).multiplyScalar(1 - p.life).multiplyScalar(2);
      dummy.scale.setScalar(Math.max(0, p.life));
      dummy.updateMatrix();
      group.current.setMatrixAt(i, dummy.matrix);
      group.current.setColorAt(i, p.color);
    });
    group.current.instanceMatrix.needsUpdate = true;
    if (group.current.instanceColor) group.current.instanceColor.needsUpdate = true;
  });

  return (
    <group position={position}>
      <instancedMesh ref={group} args={[null, null, particleCount]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
