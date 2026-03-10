import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';
import * as THREE from 'three';

export default function Player() {
  const playerRef = useRef();
  const groupRef = useRef();
  const gameState = useStore((state) => state.gameState);
  
  const targetX = useStore((state) => state.targetX);
  const moveLeft = useStore((state) => state.moveLeft);
  const moveRight = useStore((state) => state.moveRight);
  const jump = useStore((state) => state.jump);
  
  const [isJumping, setIsJumping] = useState(false);
  const jumpStartTime = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft();
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight();
      if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') && !isJumping) {
        setIsJumping(true);
        jumpStartTime.current = performance.now();
        jump();
        setTimeout(() => setIsJumping(false), 600);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isJumping, moveLeft, moveRight, jump]);

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    // Movement & Leaning
    const currentX = playerRef.current.position.x;
    const lerpX = (targetX - currentX) * 12 * delta;
    playerRef.current.position.x += lerpX;
    
    // Smooth Tilt/Lean
    const tiltTarget = -lerpX * 2; 
    playerRef.current.rotation.z = THREE.MathUtils.lerp(playerRef.current.rotation.z, tiltTarget, 0.1);

    // Jump Logic
    let jumpY = 0;
    if (isJumping) {
      const elapsed = (performance.now() - jumpStartTime.current) / 600;
      jumpY = Math.sin(elapsed * Math.PI) * 2.5;
    }
    
    // Skating Glide Bobbing (Subtler than running)
    const bob = gameState === 'playing' ? Math.sin(state.clock.elapsedTime * 4) * 0.03 : 0;
    playerRef.current.position.y = 0.5 + jumpY + bob;

    // Stable Skating Pose with Moving Hands
    if (groupRef.current && gameState === 'playing' && !isJumping) {
        const leftLeg = groupRef.current.getObjectByName('leftLeg');
        const rightLeg = groupRef.current.getObjectByName('rightLeg');
        const leftArm = groupRef.current.getObjectByName('leftArm');
        const rightArm = groupRef.current.getObjectByName('rightArm');
        
        const swing = Math.sin(state.clock.elapsedTime * 10) * 0.4; // Arm swing frequency
        
        // Legs stay stationary for skating
        if (leftLeg) leftLeg.rotation.x = 0;
        if (rightLeg) rightLeg.rotation.x = 0;
        
        // Hands move!
        if (leftArm) {
          leftArm.rotation.x = swing;
          leftArm.rotation.z = 0.2; // Slight flare for balance
        }
        if (rightArm) {
          rightArm.rotation.x = -swing;
          rightArm.rotation.z = -0.2;
        }
    }
  });

  const skinColor = "#e0ac69";

  return (
    <group ref={playerRef} position={[0, 0.5, 5]} name="player">
      <group ref={groupRef}>
        {/* Realistic Skateboard */}
        <group position={[0, -0.35, 0]}>

          {/* === DECK === */}
          {/* Main board - maple wood color */}
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.85, 0.07, 2.0]} />
            <meshStandardMaterial color="#c8a96e" roughness={0.6} metalness={0.0} />
          </mesh>
          {/* Top grip tape (dark sandpaper look) */}
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[0.83, 0.01, 1.98]} />
            <meshStandardMaterial color="#111827" roughness={1.0} metalness={0.0} />
          </mesh>
          {/* Kick tail - nose */}
          <mesh castShadow position={[0, 0.07, -0.9]} rotation={[-0.22, 0, 0]}>
            <boxGeometry args={[0.82, 0.07, 0.3]} />
            <meshStandardMaterial color="#c8a96e" roughness={0.6} />
          </mesh>
          {/* Kick tail - tail */}
          <mesh castShadow position={[0, 0.07, 0.9]} rotation={[0.22, 0, 0]}>
            <boxGeometry args={[0.82, 0.07, 0.3]} />
            <meshStandardMaterial color="#c8a96e" roughness={0.6} />
          </mesh>
          {/* Neon stripe decoration */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.15, 0.012, 1.6]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1.5} roughness={0.1} />
          </mesh>

          {/* === TRUCK FRONT === */}
          <group position={[0, -0.09, -0.65]}>
            {/* Base plate */}
            <mesh>
              <boxGeometry args={[0.78, 0.06, 0.22]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Axle bar */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 1.1, 12]} />
              <meshStandardMaterial color="#6b7280" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Kingpin / hanger block */}
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[0.2, 0.1, 0.18]} />
              <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>

          {/* === TRUCK REAR === */}
          <group position={[0, -0.09, 0.65]}>
            <mesh>
              <boxGeometry args={[0.78, 0.06, 0.22]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 1.1, 12]} />
              <meshStandardMaterial color="#6b7280" metalness={0.95} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[0.2, 0.1, 0.18]} />
              <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>

          {/* === WHEELS (4 total) ===
               Front-left, Front-right, Rear-left, Rear-right */}
          {[
            [-0.52, -0.15, -0.65],
            [ 0.52, -0.15, -0.65],
            [-0.52, -0.15,  0.65],
            [ 0.52, -0.15,  0.65],
          ].map((pos, i) => (
            <group key={i} position={pos}>
              {/* Urethane wheel body */}
              <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.17, 0.17, 0.18, 20]} />
                <meshStandardMaterial color="#1f2937" roughness={0.9} metalness={0.0} />
              </mesh>
              {/* Hub cap (inner metal disc) */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.09, 0.09, 0.2, 12]} />
                <meshStandardMaterial color="#d1d5db" metalness={1.0} roughness={0.1} />
              </mesh>
              {/* Bearing dot */}
              <mesh position={[i % 2 === 0 ? -0.1 : 0.1, 0, 0]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={2} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Human Character */}
        <mesh name="leftLeg" position={[-0.2, 0.2, 0]} castShadow>
            <boxGeometry args={[0.25, 0.8, 0.25]} />
            <meshStandardMaterial color="#38bdf8" />
        </mesh>
        <mesh name="rightLeg" position={[0.2, 0.2, 0]} castShadow>
            <boxGeometry args={[0.25, 0.8, 0.25]} />
            <meshStandardMaterial color="#38bdf8" />
        </mesh>

        <mesh position={[0, 1, 0]} castShadow>
            <boxGeometry args={[0.75, 0.9, 0.4]} />
            <meshStandardMaterial color="#f8fafc" />
        </mesh>

        <group name="leftArm" position={[-0.45, 1.2, 0]}>
            <mesh position={[0, -0.3, 0]} castShadow>
                <boxGeometry args={[0.18, 0.6, 0.18]} />
                <meshStandardMaterial color="#f1f5f9" />
            </mesh>
            <mesh position={[0, -0.65, 0]} castShadow>
                <boxGeometry args={[0.18, 0.18, 0.18]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>
        </group>

        <group name="rightArm" position={[0.45, 1.2, 0]}>
            <mesh position={[0, -0.3, 0]} castShadow>
                <boxGeometry args={[0.18, 0.6, 0.18]} />
                <meshStandardMaterial color="#f1f5f9" />
            </mesh>
            <mesh position={[0, -0.65, 0]} castShadow>
                <boxGeometry args={[0.18, 0.18, 0.18]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>
        </group>

        <mesh position={[0, 1.7, 0]} castShadow>
            <boxGeometry args={[0.45, 0.45, 0.45]} />
            <meshStandardMaterial color={skinColor} />
        </mesh>

        <group position={[0, 1.9, 0]}>
            <mesh castShadow>
                <boxGeometry args={[0.48, 0.15, 0.48]} />
                <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, -0.05, -0.3]} castShadow>
                <boxGeometry args={[0.45, 0.05, 0.35]} />
                <meshStandardMaterial color="#ef4444" />
            </mesh>
        </group>
      </group>
    </group>
  );
}
