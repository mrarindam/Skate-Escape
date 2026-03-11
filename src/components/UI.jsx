import React from 'react';
import { useStore } from '../store';

export default function UI() {
  const gameState = useStore((state) => state.gameState);
  const startGame = useStore((state) => state.startGame);
  const distance = useStore((state) => state.distance);
  const raceLength = useStore((state) => state.raceLength);
  const competitors = useStore((state) => state.competitors);
  const placements = useStore((state) => state.placements);
  const isMuted = useStore((state) => state.isMuted);
  const toggleMute = useStore((state) => state.toggleMute);
  const moveLeft = useStore((state) => state.moveLeft);
  const moveRight = useStore((state) => state.moveRight);
  const jump = useStore((state) => state.jump);

  // Calculate Rank
  let rank = 1;
  if (gameState === 'playing' || gameState === 'finished') {
    const allRacers = [...competitors, { id: 'player', distance }];
    allRacers.sort((a, b) => b.distance - a.distance);
    rank = allRacers.findIndex(r => r.id === 'player') + 1;
  }

  const getRankSuffix = (r) => {
    if (r === 1) return 'st';
    if (r === 2) return 'nd';
    if (r === 3) return 'rd';
    return 'th';
  };

  const remaining = Math.max(0, Math.floor(raceLength - distance));

  return (
    <div className="ui-overlay">
      {/* Mobile Touch Controls */}
      {gameState === 'playing' && (
        <div className="touch-controls">
          <div 
            className="touch-layer left" 
            onPointerDown={(e) => { e.preventDefault(); moveLeft(); }} 
          />
          <div 
            className="touch-layer right" 
            onPointerDown={(e) => { e.preventDefault(); moveRight(); }} 
          />
          <div 
            className="jump-layer"
            onPointerDown={(e) => { e.preventDefault(); jump(); window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' })); }}
          />
        </div>
      )}

      {/* Sound Toggle */}
      <button className="mute-btn" onClick={toggleMute}>
        {isMuted ? '🔇' : '🔊'}
      </button>

      {(gameState === 'playing' || gameState === 'finished') && (
        <div className="score-display">
          <div className="score-main">
            {rank}{getRankSuffix(rank)} <span style={{ fontSize: '1.2rem', color: '#9ca3af' }}> / {competitors.length + 1}</span>
          </div>
          <div className="distance-sub">{remaining}m REMAINING</div>
        </div>
      )}

      {gameState === 'start' && (
        <div className="screen">
          <div className="screen-container">
            <h1>SKATE ESCAPE</h1>
            <p className="subtitle">Urban Race Championship</p>
            <button
              key="start"
              className="start-button arcade-btn"
              onClick={() => {
                startGame();
              }}
            >
              START RACE
            </button>
            <div className="controls-hint">
              PC: Arrow Keys / WASD<br />
              Jump: Space<br />
              MOBILE: Tap Sides to Turn, Tap Top Half to Jump
            </div>
          </div>
        </div>
      )}

      {/* Fallback for regular game over if needed, though we only use finished now */}
      {gameState === 'gameover' && (
        <div className="screen">
          <div className="screen-container">
            <h1 className="gameOverText">CRASHED OUT!</h1>
            <button
              key="restart"
              className="start-button arcade-btn"
              onClick={() => startGame()}
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="screen" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="screen-container" style={{ minWidth: '350px', background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', padding: '30px', borderRadius: '20px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
            <h1 className="gameOverText" style={{ color: rank === 1 ? '#fcd34d' : '#fff', textShadow: rank === 1 ? '0 0 20px #fcd34d' : '0 0 10px #fff', margin: '0 0 10px 0' }}>
              {rank === 1 ? 'VICTORY!' : 'RACE FINISHED!'}
            </h1>
            <div className="final-stats">
              <div className="stat-label" style={{ color: '#d1d5db' }}>YOUR PLACEMENT</div>
              <div className="stat-value" style={{ fontSize: '3.5rem', color: rank === 1 ? '#fcd34d' : '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                {rank}{getRankSuffix(rank)}
              </div>
            </div>

            <div style={{ marginTop: '20px', marginBottom: '30px', textAlign: 'left', background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '15px', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Leaderboard</h3>
              {placements.map((p, i) => (
                <div
                  key={p.id + i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: p.id === 'player' ? '#111827' : '#fff',
                    background: p.id === 'player' ? 'linear-gradient(90deg, #facc15, #fef08a)' : 'rgba(255,255,255,0.05)',
                    padding: '8px 15px',
                    borderRadius: '8px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    marginTop: '6px',
                    boxShadow: p.id === 'player' ? '0 0 15px rgba(250, 204, 21, 0.5)' : 'none'
                  }}
                >
                  <span>{i + 1}. {p.name} {p.id === 'player' && '(YOU)'}</span>
                </div>
              ))}
              {/* Show anyone who hasn't finished yet */}
              {competitors.filter(c => !placements.find(p => p.id === c.id)).sort((a, b) => b.distance - a.distance).map((c, i) => (
                <div key={c.id + 'dnf'} style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', padding: '8px 15px', fontSize: '1rem', background: 'transparent', marginTop: '6px' }}>
                  <span>{placements.length + i + 1}. {c.name}</span>
                  <span style={{ color: '#ef4444' }}>DNF</span>
                </div>
              ))}
            </div>

            <button
              key="restart"
              className="start-button arcade-btn"
              style={{ width: '100%', padding: '15px', fontSize: '1.2rem', borderRadius: '10px' }}
              onClick={() => {
                startGame();
              }}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
