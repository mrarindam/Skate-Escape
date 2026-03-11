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
  const performanceMode = useStore((state) => state.performanceMode);
  const speed = useStore((state) => state.speed);
  const onCollide = useStore((state) => state.onCollide);
  const applyBoost = useStore((state) => state.applyBoost);
  const updateObstacles = useStore((state) => state.updateObstacles);

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
      
      // Determine obstacle type (add boosts)
      const rand = Math.random();
      let type = 'cone';
      if (rand > 0.8) type = 'boost';
      else if (rand > 0.5) type = 'barrier';
      
      const currentDist = useStore.getState().distance;
      const raceLength = useStore.getState().raceLength;
      
      // Stop spawning obstacles near the finish line
      if (raceLength - currentDist < 150) return;
      
      const spawnZ = performanceMode === 'high' ? -120 : -80; // Spawn closer on low end
      
      setObstacles((obs) => {
        const tooClose = obs.some(o => o.x === randomLane && o.z < spawnZ + 40);
        if (tooClose) return obs;

        return [...obs, { 
          id: Date.now(), 
          x: randomLane, 
          z: spawnZ, 
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

    setObstacles((obs) => {
      const newObs = obs.map((o) => {
        let newZ = o.z + speed * delta;
        let newPassed = o.passed;
        
        if (!o.passed) {
           let collisionW = 1.2, collisionH = 1.5, collisionD = 1.5;
           if (o.type === 'barrier') { collisionW = 3.8; collisionH = 2.5; }
           
           const didCollide = checkCollision(pX, pY, pZ, 1, 1.8, 1.5, o.x, 0.5, newZ, collisionW, collisionH, collisionD);
           
           if (didCollide) {
              if (o.type === 'boost') {
                  applyBoost(2000); // 2 second boost
                  newPassed = true; // Collect it
              } else {
                  onCollide();
              }
           }
        }
        
        if (newZ > pZ + 2 && !o.passed) {
          newPassed = true;
        }
        return { ...o, z: newZ, passed: newPassed };
      });
      
      const filteredObs = newObs.filter((o) => o.z < 25 && !(o.type === 'boost' && o.passed === true)); // Remove collected boosts
      
      updateObstacles(filteredObs); // Share with AI
      return filteredObs;
    });
  });

  return (
    <group>
      {obstacles.map((obs) => (
        <group key={obs.id} position={[obs.x, 0, obs.z]}>
           {obs.type === 'cone' && (
              <mesh position={[0, 0.7, 0]} castShadow={performanceMode === 'high'}>
                <coneGeometry args={[0.6, 1.4, 8]} />
                <meshStandardMaterial color="#f97316" roughness={0.4} />
              </mesh>
           )}
           {obs.type === 'barrier' && (
              <mesh position={[0, 0.9, 0]} castShadow={performanceMode === 'high'}>
                 <boxGeometry args={[4, 1.8, 0.4]} />
                 <meshStandardMaterial color="#ef4444" roughness={0.4} />
              </mesh>
           )}
           {obs.type === 'boost' && !obs.passed && (
              <group position={[0, 0.05, 0]}>
                 <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[2, 2]} />
                    <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
                 </mesh>
                 <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -0.5]}>
                    <planeGeometry args={[1, 1]} />
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} />
                 </mesh>
              </group>
           )}
        </group>
      ))}
    </group>
  );
}
