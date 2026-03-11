import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useStore } from './store';
import Track from './components/Track';
import Player from './components/Player';
import Competitors from './components/Competitors';
import Obstacles from './components/Obstacles';
import FinishLine from './components/FinishLine';
import UI from './components/UI';
import AudioSystem from './components/AudioSystem';
import Fireworks from './components/Fireworks';
import PerformanceMonitor from './components/PerformanceMonitor';

function CameraSystem() {
  const lastHitTime = useStore((state) => state.lastHitTime);
  const gameState = useStore((state) => state.gameState);

  useFrame((state) => {
    const player = state.scene.getObjectByName('player');
    if (!player) return;

    const isMobile = window.innerWidth < 768;

    // Follow Logic. On mobile, pull the camera further back and slightly higher
    const followZ = isMobile ? player.position.z + 10 : player.position.z + 7;
    const followY = isMobile ? 8 : 6;
    const targetPos = new THREE.Vector3(player.position.x * 0.8, followY, followZ);
    state.camera.position.lerp(targetPos, 0.1);
    
    // Look slightly further ahead on mobile to compensate for height
    const lookZ = isMobile ? player.position.z - 8 : player.position.z - 5;
    state.camera.lookAt(player.position.x * 0.5, 2, lookZ);

    // Dynamic Tilt (Lane Change)
    const tilt = -player.position.x * 0.05;
    state.camera.rotation.z = THREE.MathUtils.lerp(state.camera.rotation.z, tilt, 0.1);

    // Collision Shake
    const timeSinceHit = (Date.now() - lastHitTime) / 1000;
    const lastBotHitTime = useStore.getState().lastBotHitTime;
    const timeSinceBotHit = (Date.now() - lastBotHitTime) / 1000;
    
    let intensity = 0;
    if (timeSinceHit < 0.4) {
      intensity = (0.4 - timeSinceHit) * 0.5;
    } else if (timeSinceBotHit < 0.2) {
      intensity = (0.2 - timeSinceBotHit) * 0.25; // Softer, faster shake for bots
    }

    if (intensity > 0) {
      state.camera.position.x += (Math.random() - 0.5) * intensity;
      state.camera.position.y += (Math.random() - 0.5) * intensity;
    }
  });
  return null;
}

function App() {
  const performanceMode = useStore((state) => state.performanceMode);
  
  // Base FOV calculation. Widen FOV on narrow screens so side lanes fit.
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const cameraFov = isMobile ? 85 : 60;

  return (
    <>
      <AudioSystem />
      <Canvas shadows={performanceMode === 'high'} camera={{ position: [0, 6, 12], fov: cameraFov }}>
        <PerformanceMonitor />
        <CameraSystem />
        {/* Sunny City Atmosphere */}
        <color attach="background" args={['#94e2fb']} />
        <fog attach="fog" args={['#94e2fb', 10, 100]} />

        <ambientLight intensity={0.8} />
        <directionalLight
          castShadow={performanceMode === 'high'}
          position={[40, 60, 40]}
          intensity={2.5}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
          shadow-camera-near={1}
          shadow-camera-far={200}
        />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />

        <Suspense fallback={null}>
          <Track />
          <Player />
          <Competitors />
          <Obstacles />
          <FinishLine />

          {/* Render fireworks in 3D scene if player wins */}
          {useStore.getState().gameState === 'finished' && 
           useStore.getState().placements[0]?.id === 'player' && (
             <>
               <Fireworks position={[-3, 4, 2]} />
               <Fireworks position={[3, 5, 0]} />
               <Fireworks position={[0, 6, -2]} />
             </>
          )}

          {performanceMode === 'high' && (
            <EffectComposer>
              <Bloom intensity={0.4} luminanceThreshold={0.4} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
      <UI />
    </>
  );
}

export default App;
