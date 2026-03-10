import React from 'react';
import { useStore } from '../store';

export default function UIOverlay() {
  const { gameState, score, startGame } = useStore();

  const handleTouch = (direction) => {
    if (gameState === 'playing') {
      window.dispatchEvent(new CustomEvent('touch-move-player', { detail: { direction } }));
    }
  };

  return (
    <div className="ui-overlay">
      {gameState === 'playing' && (
        <>
          <div className="score-display">SCORE: {Math.floor(score)}</div>
          <div className="touch-controls">
            <div className="touch-layer" onTouchStart={() => handleTouch('left')} onMouseDown={() => handleTouch('left')} />
            <div className="touch-layer" onTouchStart={() => handleTouch('right')} onMouseDown={() => handleTouch('right')} />
          </div>
        </>
      )}

      {gameState === 'start' && (
        <div className="screen-container">
          <h1>RUSH: WEB</h1>
          <div className="subtitle">Xtreme Cyber Racing</div>
          <button onClick={startGame}>Start Engine</button>
          <div className="controls-hint">
            PC: Arrow Keys / A & D<br/>
            Mobile: Tap Left/Right Screen
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="screen-container">
          <h1 style={{ color: '#f00', textShadow: '0 0 10px #f00' }}>CRASH !</h1>
          <div className="score-display" style={{ position: 'relative', top: 0, right: 0, marginBottom: '20px' }}>
            FINAL SCORE: {Math.floor(score)}
          </div>
          <button onClick={startGame}>Play Again</button>
        </div>
      )}
    </div>
  );
}
