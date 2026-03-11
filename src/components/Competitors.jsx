import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';
import Character from './Character';
import * as THREE from 'three';

export default function Competitors() {
    const competitors = useStore((state) => state.competitors);
    const gameState = useStore((state) => state.gameState);
    const onBotCollide = useStore((state) => state.onBotCollide);
    const performanceMode = useStore((state) => state.performanceMode);

    // We use refs to manipulate them directly in the frame loop without forcing a full re-render
    const compRefs = useRef({});
    
    // Throttle AI logic
    const lastLogicUpdate = useRef(0);

    useFrame((state, delta) => {
        if (gameState !== 'playing') return;

        const currentComps = useStore.getState().competitors;
        const playerDistance = useStore.getState().distance;
        const raceLength = useStore.getState().raceLength;
        const addPlacement = useStore.getState().addPlacement;
        const obstacles = useStore.getState().obstacles;

        const lanes = [-3.5, 0, 3.5];
        const now = state.clock.elapsedTime;
        const nowMs = Date.now();
        
        // Throttling: 100ms on high, 200ms on low
        const throttleMs = performanceMode === 'high' ? 0.1 : 0.2;
        const shouldUpdateLogic = now - lastLogicUpdate.current > throttleMs;
        if (shouldUpdateLogic) {
            lastLogicUpdate.current = now;
        }

        // We will build a new array of competitors to update the store
        const newComps = currentComps.map(comp => {
            // Boost decay logic
            let currentSpeed = comp.speed;
            if (comp.boostUntil > nowMs) {
                currentSpeed = 35; // Boosted speed
            } else if (comp.penaltyUntil > nowMs) {
                // In penalty mode, wait for 2 seconds before restoring speed
            } else if (currentSpeed > comp.baseSpeed) {
                currentSpeed = Math.max(comp.baseSpeed, currentSpeed - 15 * delta); // Decay back
            } else if (currentSpeed < comp.baseSpeed) {
                currentSpeed = Math.min(comp.baseSpeed, currentSpeed + 8 * delta); // Recover from crash
            }

            let newDist = comp.distance + currentSpeed * delta;

            if (newDist >= raceLength && comp.distance < raceLength) {
                addPlacement(comp.id, comp.name);
            }

            let newTargetX = comp.targetX;
            let newLastLaneChange = comp.lastLaneChange;
            let newBoostUntil = comp.boostUntil;
            let newPenaltyUntil = comp.penaltyUntil || 0;

            // --- AI Obstacle Avoidance & Collision ---
            const targetZ = 5 - (newDist - playerDistance);
            
            // IF shouldUpdateLogic is false, skip heavy dodge math but KEEP tracking newDist/speed above.
            if (shouldUpdateLogic) {
                // Find obstacles in the AI's current lane that are ahead
                // Obstacle Z calculation is in world space moving towards the camera. 

                const upcomingObstacle = obstacles.find(o =>
                    o.x === comp.targetX &&
                    o.z < targetZ &&
                    o.z > targetZ - 30 // within 30 units ahead
                );

                if (upcomingObstacle) {
                    // We are approaching an obstacle
                    if (upcomingObstacle.z > targetZ - 2 && upcomingObstacle.z < targetZ + 1.5) {
                        // Collision range
                        if (upcomingObstacle.type === 'boost' && !upcomingObstacle.passed) {
                            newBoostUntil = nowMs + 2000;
                            upcomingObstacle.passed = true; // Mark locally gathered
                        } else if (upcomingObstacle.type !== 'boost') {
                            // CRASH!
                            if (!upcomingObstacle.passedAI?.[comp.id]) {
                                currentSpeed = currentSpeed * 0.4;
                                newBoostUntil = 0;
                                newPenaltyUntil = nowMs + 2000;
                                newDist -= 2; // small backward push

                                if (!upcomingObstacle.passedAI) upcomingObstacle.passedAI = {};
                                upcomingObstacle.passedAI[comp.id] = true;
                                
                                // Trigger physical shake effect globally
                                onBotCollide();

                                // Force a lane change to clear the obstacle
                                const availableLanes = lanes.filter(l => l !== comp.targetX);
                                newTargetX = availableLanes[Math.floor(Math.random() * availableLanes.length)];
                                newLastLaneChange = now;
                            }

                            // Enforce never pass through
                            if (comp.targetX === upcomingObstacle.x) {
                                const maxDist = playerDistance + 3.5 - upcomingObstacle.z;
                                if (newDist > maxDist) {
                                    newDist = maxDist;
                                }
                            }
                        }
                    } else if (upcomingObstacle.type !== 'boost' && now - comp.lastLaneChange > 1.0) {
                        // Try to dodge if it's a hazard
                        if (Math.random() > comp.mistakeProbability) {
                            const availableLanes = lanes.filter(l => l !== comp.targetX);
                            newTargetX = availableLanes[Math.floor(Math.random() * availableLanes.length)];
                            newLastLaneChange = now;
                        }
                    }
                }
            }

            // --- Player/Bot Light Collision ---
            // Player is always at X = targetX, Z = 5.
            // If the AI is close to Z = 5 and in the same lane, bump them slightly
            if (Math.abs(targetZ - 5) < 1.0 && Math.abs(comp.targetX - useStore.getState().targetX) < 1.0) {
                // Bump the AI away
                newTargetX = comp.targetX + (Math.random() > 0.5 ? 1 : -1) * 0.5;
                // Cap lane bounds
                newTargetX = Math.max(-3.5, Math.min(3.5, newTargetX));
            }

            // Visual updates
            if (compRefs.current[comp.id]) {
                const mesh = compRefs.current[comp.id];

                // Z position: player is at 5. If AI distance is playerDistance + 10, Z = 5 - 10 = -5 (ahead)
                const targetZ = 5 - (newDist - playerDistance);
                mesh.position.z = targetZ;

                // X position (lane change)
                const lerpX = (newTargetX - mesh.position.x) * 10 * delta;
                mesh.position.x += lerpX;

                // Tilt & Pitch for slowdown animation
                const tiltTarget = -lerpX * 2;
                const isPenalized = comp.penaltyUntil > nowMs;
                const pitchTarget = isPenalized ? -0.4 : 0; // Stumble backward when penalized
                
                mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, tiltTarget, 0.1);
                mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, pitchTarget, 0.15);

                // Bobbing
                mesh.position.y = 0.5 + (isPenalized ? 0 : Math.sin(now * 4 + comp.id) * 0.03);
            }

            return {
                ...comp,
                distance: newDist,
                speed: currentSpeed,
                targetX: newTargetX,
                lastLaneChange: newLastLaneChange,
                boostUntil: newBoostUntil,
                penaltyUntil: newPenaltyUntil
            };
        });

        // Always update visually interpolated data (like distance)
        useStore.setState({ competitors: newComps });
    });

    return (
        <group>
            {competitors.map((comp) => {
                const isBoosted = comp.boostUntil > Date.now();
                const isPenalized = comp.penaltyUntil > Date.now();
                const justHit = isPenalized && (comp.penaltyUntil - Date.now() > 1800); // Only show spark for first 200ms
                
                return (
                    <group
                        key={comp.id}
                        ref={(el) => (compRefs.current[comp.id] = el)}
                        position={[comp.targetX, 0.5, 5]}
                    >
                        <Character groupRef={null} styleIndex={comp.styleIndex} isBoosted={isBoosted} />
                        
                        {/* Collision Spark / Dust */}
                        {justHit && (
                            <mesh position={[0, 0.5, 0.5]}>
                                <sphereGeometry args={[0.8, 8, 8]} />
                                <meshBasicMaterial color="#ffaa00" transparent opacity={0.6} />
                            </mesh>
                        )}
                        {justHit && (
                            <mesh position={[0, 0, 0.5]} scale={[1.5, 0.2, 1.5]}>
                                <sphereGeometry args={[1, 8, 8]} />
                                <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
                            </mesh>
                        )}
                    </group>
                );
            })}
        </group>
    );
}
