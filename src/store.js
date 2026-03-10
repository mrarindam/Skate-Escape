import { create } from 'zustand';

export const useStore = create((set) => ({
  gameState: 'start', // 'start', 'playing', 'gameover'
  score: 0,
  speed: 10,
  lastHitTime: 0,
  isMuted: false,
  soundTrigger: null, 
  targetX: 0,

  startGame: () => set({
    gameState: 'playing',
    score: 0,
    speed: 10,
    targetX: 0,
    soundTrigger: { type: 'start', t: Date.now() }
  }),

  gameOver: () => set({
    gameState: 'gameover',
    soundTrigger: { type: 'hit', t: Date.now() }
  }),

  incrementScore: () => set((state) => {
    const newScore = state.score + 1;
    return {
      score: newScore,
      speed: 10 + newScore * 0.02, // Gradual linear increase
      soundTrigger: newScore % 10 === 0 ? { type: 'score', t: Date.now() } : state.soundTrigger
    };
  }),

  onCollide: () => set({ lastHitTime: Date.now() }),

  triggerSound: (type) => set({ soundTrigger: { type, t: Date.now() } }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  moveLeft: () => set((state) => ({ 
    targetX: Math.max(state.targetX - 3.5, -3.5) 
  })),

  moveRight: () => set((state) => ({ 
    targetX: Math.min(state.targetX + 3.5, 3.5) 
  })),

  jump: () => set((state) => {
    state.triggerSound('jump');
    return {};
  }),

  reset: () => set({
    gameState: 'start',
    score: 0,
    speed: 10,
    targetX: 0,
    lastHitTime: 0
  }),
}));
