import { create } from 'zustand';

export const useStore = create((set, get) => ({
  gameState: 'start', // 'start', 'playing', 'gameover', 'finished'
  distance: 0,
  raceLength: 1500, // ~1 minute at speed 25
  speed: 25,
  lastHitTime: 0,
  lastBotHitTime: 0,
  boostUntil: 0, // When does the player's boost expire
  isMuted: false,
  soundTrigger: null,
  targetX: 0,
  competitors: [],
  placements: [],
  obstacles: [], // Store obstacles so AI can read them
  performanceMode: 'high', // 'high' | 'low'

  startGame: () => {
    const lanes = [-3.5, 0, 3.5];
    const initialCompetitors = [1, 2, 3, 4, 5].map((id) => ({
      id,
      name: `Skater ${id}`,
      distance: 0,
      lane: lanes[Math.floor(Math.random() * lanes.length)],
      speed: 23 + Math.random() * 4, // slightly variable speeds, centered around 25
      baseSpeed: 23 + Math.random() * 4, // Remember their normal speed
      mistakeProbability: 0.05 + Math.random() * 0.15, // 5% to 20% mistake chance
      styleIndex: id,
      targetX: 0,
      isJumping: false,
      lastLaneChange: 0,
      boostUntil: 0, // AI boost tracker
    }));
    initialCompetitors.forEach(c => c.targetX = c.lane);

    set({
      gameState: 'playing',
      distance: 0,
      speed: 25,
      boostUntil: 0,
      targetX: 0,
      competitors: initialCompetitors,
      placements: [],
      obstacles: [],
      soundTrigger: { type: 'start', t: Date.now() }
    });
  },

  gameOver: () => set({
    gameState: 'gameover',
    soundTrigger: { type: 'hit', t: Date.now() }
  }),

  finishRace: () => {
    const state = get();
    if (state.gameState !== 'playing') return;

    const newPlacements = [...state.placements, { id: 'player', name: 'You' }];
    set({
      gameState: 'finished',
      placements: newPlacements,
    });
  },

  addPlacement: (competitorId, name) => set((state) => {
    if (!state.placements.find(p => p.id === competitorId)) {
      return { placements: [...state.placements, { id: competitorId, name }] };
    }
    return state;
  }),

  addDistance: (dist) => set((state) => {
    const newDist = state.distance + dist;
    if (state.gameState === 'playing' && newDist >= state.raceLength) {
      setTimeout(() => state.finishRace(), 0);
    }
    return { distance: newDist };
  }),

  setPerformanceMode: (mode) => set({ performanceMode: mode }),

  updateCompetitors: (newCompetitors) => set({ competitors: newCompetitors }),
  updateObstacles: (obstacles) => set({ obstacles }),

  onCollide: () => set((state) => {
    return {
      lastHitTime: Date.now(),
      speed: Math.max(8, state.speed - 12), // Less harsh penalty for arcade feel
      boostUntil: 0, // Lose boost on hit
      soundTrigger: { type: 'hit', t: Date.now() }
    };
  }),

  onBotCollide: () => set({ lastBotHitTime: Date.now() }),

  applyBoost: (durationMs = 2000) => set((state) => {
    return {
      speed: Math.max(state.speed, 35), // Boost speed
      boostUntil: Date.now() + durationMs,
      soundTrigger: { type: 'jump', t: Date.now() } // Reusing jump sound for now
    };
  }),

  recoverSpeed: (delta) => set((state) => {
    const now = Date.now();
    let targetSpeed = 25;

    // If boosted and boost hasn't expired
    if (state.boostUntil > now) {
      targetSpeed = 35;
    }

    if (state.speed < targetSpeed && state.gameState === 'playing') {
      return { speed: Math.min(targetSpeed, state.speed + 8 * delta) }; // recover speed over time
    } else if (state.speed > targetSpeed && state.gameState === 'playing') {
      return { speed: Math.max(targetSpeed, state.speed - 15 * delta) }; // Decay boost fast when it ends
    }
    return state;
  }),

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
    distance: 0,
    speed: 25,
    targetX: 0,
    lastHitTime: 0,
    boostUntil: 0,
    competitors: [],
    placements: [],
    obstacles: []
  }),
}));
