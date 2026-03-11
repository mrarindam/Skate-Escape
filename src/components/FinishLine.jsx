import React from 'react';
import { useStore } from '../store';
import Fireworks from './Fireworks';

export default function FinishLine() {
  const distance = useStore((state) => state.distance);
  const raceLength = useStore((state) => state.raceLength);
  const gameState = useStore((state) => state.gameState);
  const placements = useStore((state) => state.placements);
  
  // Z position should start far away and move towards 5 (player pos)
  // Distance remaining = raceLength - distance
  // Visually: Z = 5 - distance_remaining
  const targetZ = 5 - (raceLength - distance);

  // Determine if player has won (1st place)
  const playerWon = gameState === 'finished' && placements.length > 0 && placements[0].id === 'player';

  // Stop moving it way past the camera
  if (targetZ > 20) return null;

  return (
    <group position={[0, 0, targetZ]}>
      {/* Epic Finish Banner Arch */}
      <mesh position={[-6, 4, 0]} castShadow>
         <boxGeometry args={[0.8, 8, 0.8]} />
         <meshStandardMaterial color="#facc15" metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[6, 4, 0]} castShadow>
         <boxGeometry args={[0.8, 8, 0.8]} />
         <meshStandardMaterial color="#facc15" metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[0, 8, 0]} castShadow>
         <boxGeometry args={[12.8, 1.5, 0.8]} />
         <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Checkered pattern strip on the ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow>
         <planeGeometry args={[14, 2]} />
         <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* We can do actual checkered by creating smaller squares, but a simple white band is okay for now,
          or we can map a striped texture. Let's just make smaller black squares overlay. */}
      {[-4, -2, 0, 2, 4].map(x => (
        <group key={x}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.07, -1]} receiveShadow>
             <planeGeometry args={[2, 2]} />
             <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x + 1, 0.07, 1]} receiveShadow>
             <planeGeometry args={[2, 2]} />
             <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
      ))}
      
      {/* Fireworks trigger if player wins */}
      {playerWon && (
        <>
          <Fireworks position={[-5, 10, 0]} />
          <Fireworks position={[5, 12, -2]} />
          <Fireworks position={[0, 15, -4]} />
        </>
      )}
    </group>
  );
}
