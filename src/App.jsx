import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useStore } from './store';
import Track from './components/Track';
import Player from './components/Player';
import Obstacles from './components/Obstacles';
import UI from './components/UI';
import AudioSystem from './components/AudioSystem';

function CameraSystem() {
  const lastHitTime = useStore((state) => state.lastHitTime);
  const gameState = useStore((state) => state.gameState);
  
  useFrame((state) => {
    const player = state.scene.getObjectByName('player');
    if (!player) return;

    // Follow Logic
    const targetPos = new THREE.Vector3(player.position.x * 0.8, 6, player.position.z + 7);
    state.camera.position.lerp(targetPos, 0.1);
    state.camera.lookAt(player.position.x * 0.5, 2, player.position.z - 5);

    // Dynamic Tilt (Lane Change)
    const tilt = -player.position.x * 0.05;
    state.camera.rotation.z = THREE.MathUtils.lerp(state.camera.rotation.z, tilt, 0.1);

    // Collision Shake
    const timeSinceHit = (Date.now() - lastHitTime) / 1000;
    if (timeSinceHit < 0.4) {
      const intensity = (0.4 - timeSinceHit) * 0.5;
      state.camera.position.x += (Math.random() - 0.5) * intensity;
      state.camera.position.y += (Math.random() - 0.5) * intensity;
    }
  });
  return null;
}

function App() {
  return (
    <>
      <AudioSystem />
      <Canvas shadows camera={{ position: [0, 6, 12], fov: 60 }}>
        <CameraSystem />
        {/* Sunny City Atmosphere */}
        <color attach="background" args={['#94e2fb']} />
        <fog attach="fog" args={['#94e2fb', 10, 100]} />
        
        <ambientLight intensity={0.8} />
        <directionalLight 
           castShadow
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
          <Obstacles />
          
          <EffectComposer>
            <Bloom intensity={0.4} luminanceThreshold={0.4} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      <UI />
    </>
  );
}

export default App;
