import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';

export default function AudioSystem() {
  const gameState = useStore((state) => state.gameState);
  const isMuted = useStore((state) => state.isMuted);
  const soundTrigger = useStore((state) => state.soundTrigger);
  
  // Local paths for reliability
  const bgMusic = useRef(new Audio('/assets/bgmusic.mp3'));
  const jumpSfx = useRef(new Audio('/assets/jump.mp3'));
  const hitSfx = useRef(new Audio('/assets/hit.mp3'));

  useEffect(() => {
    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.4;
    
    // Preload
    bgMusic.current.load();
    jumpSfx.current.load();
    hitSfx.current.load();
  }, []);

  useEffect(() => {
    if (isMuted) {
      bgMusic.current.pause();
    } else if (gameState === 'playing') {
      bgMusic.current.play().catch((err) => {
         console.warn("Music play blocked or file missing:", err);
      });
    } else if (gameState === 'gameover' || gameState === 'start') {
      bgMusic.current.pause();
      if (gameState === 'start') bgMusic.current.currentTime = 0;
    }
  }, [gameState, isMuted]);

  useEffect(() => {
    if (!soundTrigger || isMuted) return;

    const playSfx = (audio) => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    switch (soundTrigger.type) {
      case 'jump': playSfx(jumpSfx.current); break;
      case 'hit': playSfx(hitSfx.current); break;
      case 'start': 
        // Optional start sound
        break;
      default: break;
    }
  }, [soundTrigger, isMuted]);

  return null;
}
