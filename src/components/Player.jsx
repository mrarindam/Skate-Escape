import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';
import * as THREE from 'three';
import Character from './Character';

export default function Player() {
  const playerRef = useRef();
  const groupRef = useRef();
  const gameState = useStore((state) => state.gameState);
  const targetX = useStore((state) => state.targetX);
  const moveLeft = useStore((state) => state.moveLeft);
  const moveRight = useStore((state) => state.moveRight);
  const jump = useStore((state) => state.jump);
  const boostUntil = useStore((state) => state.boostUntil);
  const isBoosted = boostUntil > Date.now();

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

  return (
    <group ref={playerRef} position={[0, 0.5, 5]} name="player">
      <group ref={groupRef}>
        <Character groupRef={groupRef} styleIndex={0} isBoosted={isBoosted} />
      </group>
    </group>
  );
}
