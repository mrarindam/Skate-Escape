import React, { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';

function checkCollision(pX, pY, pZ, pW, pH, pD, oX, oY, oZ, oW, oH, oD) {
  return (
    Math.abs(pX - oX) * 2 < (pW + oW) &&
    Math.abs(pY - oY) * 2 < (pH + oH) &&
    Math.abs(pZ - oZ) * 2 < (pD + oD)
  );
}

export default function Obstacles() {
  const [obstacles, setObstacles] = useState([]);
  const gameState = useStore((state) => state.gameState);
  const speed = useStore((state) => state.speed);
  const incrementScore = useStore((state) => state.incrementScore);
  const increaseSpeed = useStore((state) => state.increaseSpeed);
  const gameOver = useStore((state) => state.gameOver);
  const onCollide = useStore((state) => state.onCollide);

  useEffect(() => {
    if (gameState !== 'playing') {
      setObstacles([]);
      return;
    }
    
    let spawnTimer;
    const spawnObstacle = () => {
      if (useStore.getState().gameState !== 'playing') return;
      
      const lanes = [-3.5, 0, 3.5];
      const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
      
      // Only cones and barriers remain as requested (removed 'pit')
      const types = ['cone', 'barrier'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      setObstacles((obs) => {
        const tooClose = obs.some(o => o.x === randomLane && o.z < -80);
        if (tooClose) return obs;

        return [...obs, { 
          id: Date.now(), 
          x: randomLane, 
          z: -120, 
          type, 
          passed: false 
        }];
      });
      
      const currentSpeed = useStore.getState().speed;
      const nextSpawn = Math.max(400, 1800 - (currentSpeed * 40));
      spawnTimer = setTimeout(spawnObstacle, nextSpawn);
    };
    
    spawnObstacle();
    return () => clearTimeout(spawnTimer);
  }, [gameState]);

  useFrame((state, delta) => {
    if (gameState !== 'playing') return;
    const playerMesh = state.scene.getObjectByName('player');
    if (!playerMesh) return;
    
    const pX = playerMesh.position.x;
    const pY = playerMesh.position.y;
    const pZ = playerMesh.position.z;

    setObstacles((obs) => 
      obs.map((o) => {
        let newZ = o.z + speed * delta;
        
        if (!o.passed) {
           let collisionW = 1.2, collisionH = 1.5, collisionD = 1.5;
           if (o.type === 'barrier') { collisionW = 3.8; collisionH = 2.5; }
           
           const didCollide = checkCollision(pX, pY, pZ, 1, 1.8, 1.5, o.x, 0.5, newZ, collisionW, collisionH, collisionD);
           
           if (didCollide) {
              onCollide();
              gameOver();
           }
        }
        
        let newPassed = o.passed;
        if (newZ > pZ + 2 && !o.passed) {
          newPassed = true;
          incrementScore();
        }
        return { ...o, z: newZ, passed: newPassed };
      }).filter((o) => o.z < 25)
    );
  });

  return (
    <group>
      {obstacles.map((obs) => (
        <group key={obs.id} position={[obs.x, 0, obs.z]}>
           {obs.type === 'cone' && (
              <mesh position={[0, 0.7, 0]} castShadow>
                <coneGeometry args={[0.6, 1.4, 8]} />
                <meshStandardMaterial color="#f97316" roughness={0.4} />
              </mesh>
           )}
           {obs.type === 'barrier' && (
              <mesh position={[0, 0.9, 0]} castShadow>
                 <boxGeometry args={[4, 1.8, 0.4]} />
                 <meshStandardMaterial color="#ef4444" roughness={0.4} />
              </mesh>
           )}
           {/* 'pit' rendering logic removed as requested */}
        </group>
      ))}
    </group>
  );
}
