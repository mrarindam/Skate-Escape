import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';

export default function PerformanceMonitor() {
  const setPerformanceMode = useStore((state) => state.setPerformanceMode);
  const currentMode = useStore((state) => state.performanceMode);
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const lowFpsAccumulator = useRef(0);

  // Debug state if we want to render it (optional)
  const [fps, setFps] = useState(60);

  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    const elapsed = now - lastTime.current;

    // Calculate FPS every 1 second
    if (elapsed >= 1000) {
      const currentFps = (frameCount.current * 1000) / elapsed;
      setFps(currentFps);

      frameCount.current = 0;
      lastTime.current = now;

      // If FPS drops below 50, accumulate strikes
      if (currentFps < 50 && currentMode === 'high') {
        lowFpsAccumulator.current += 1;
        // If it happens 3 seconds in a row, drop quality automatically
        if (lowFpsAccumulator.current >= 3) {
          console.warn("[PerformanceMonitor] FPS consistently below 50. Switching to LOW performance mode.");
          setPerformanceMode('low');
        }
      } else {
        // Reset accumulator if we recovered
        lowFpsAccumulator.current = 0;
      }
    }
  });

  return null;
}
