import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';
import * as THREE from 'three';

function StreetLight({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[1, 7.8, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.15, 0.15, 2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[2, 7.6, 0]}>
         <sphereGeometry args={[0.35, 16, 16]} />
         <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

function Building({ position, width, height, color, highQuality }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow={highQuality} receiveShadow={highQuality}>
        <boxGeometry args={[width, height, width]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Lights at the base to ground it */}
      <mesh position={[0, 0.1, width/2 + 0.1]}>
        <boxGeometry args={[width * 0.8, 0.2, 0.1]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#e2e8f0" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export default function Track() {
  const trackRef = useRef();
  const speed = useStore((state) => state.speed);
  const gameState = useStore((state) => state.gameState);
  const performanceMode = useStore((state) => state.performanceMode);
  const addDistance = useStore((state) => state.addDistance);
  const recoverSpeed = useStore((state) => state.recoverSpeed);

  useFrame((state, delta) => {
    if (gameState !== 'playing') return;
    
    addDistance(speed * delta);
    recoverSpeed(delta);
    
    if (trackRef.current) {
      trackRef.current.position.z += speed * delta;
      if (trackRef.current.position.z > 100) {
        trackRef.current.position.z -= 100;
      }
    }
  });

  const cityProps = useMemo(() => {
    const p = [];
    for (let i = 0; i < 15; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        p.push({ type: 'building', pos: [side * 20, 0, -i * 15], w: 10 + Math.random() * 5, h: 20 + Math.random() * 40 });
        p.push({ type: 'light', pos: [side * 9, 0, -i * 15 + 7] });
        if (i % 3 === 0) p.push({ type: 'trash', pos: [side * 8, 0, -i * 15 + 10] });
    }
    return p;
  }, []);

  return (
    <group>
      {/* Massive Ground Plane to remove blank gaps */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
         <planeGeometry args={[1000, 1000]} />
         <meshStandardMaterial color="#0f172a" roughness={1} />
      </mesh>

      <group ref={trackRef}>
        {[0, -100, -200].map((zOff) => (
          <group key={zOff} position={[0, 0, zOff]}>
            {/* Road */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={performanceMode === 'high'}>
              <planeGeometry args={[14, 100]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </mesh>
            
            {/* Sidewalks */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-11, 0.05, 0]} receiveShadow={performanceMode === 'high'}>
              <planeGeometry args={[8, 100]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[11, 0.05, 0]} receiveShadow={performanceMode === 'high'}>
              <planeGeometry args={[8, 100]} />
              <meshStandardMaterial color="#475569" />
            </mesh>

            {/* City Lights & Buildings */}
            {cityProps.map((cp, idx) => {
              if (cp.type === 'light') return <StreetLight key={idx} position={cp.pos} />;
              if (cp.type === 'building') return <Building key={idx} position={cp.pos} width={cp.w} height={cp.h} color="#334155" highQuality={performanceMode === 'high'} />;
              if (cp.type === 'trash') return (
                <mesh key={idx} position={[cp.pos[0], 0.6, cp.pos[2]]} castShadow={performanceMode === 'high'}>
                   <cylinderGeometry args={[0.5, 0.5, 1.2, 8]} />
                   <meshStandardMaterial color="#1e293b" />
                </mesh>
              );
              return null;
            })}
          </group>
        ))}
      </group>
    </group>
  );
}
