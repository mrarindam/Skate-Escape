import React from 'react';
import Track from './Track';
import Player from './Player';
import Obstacles from './Obstacles';
import { useStore } from '../store';

export default function Scene() {
  const gameState = useStore((state) => state.gameState);

  return (
    <group>
      {/* Infinite scrolling grid / track */}
      <Track />
      
      {/* The Player bike/box */}
      <Player />
      
      {/* Dynamically spawned obstacles */}
      {gameState === 'playing' && <Obstacles />}
    </group>
  );
}
