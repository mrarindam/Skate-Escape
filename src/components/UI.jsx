import React from 'react';
import { useStore } from '../store';

export default function UI() {
  const gameState = useStore((state) => state.gameState);
  const startGame = useStore((state) => state.startGame);
  const score = useStore((state) => state.score);
  const isMuted = useStore((state) => state.isMuted);
  const toggleMute = useStore((state) => state.toggleMute);

  const moveLeft = useStore((state) => state.moveLeft);
  const moveRight = useStore((state) => state.moveRight);

  return (
    <div className="ui-overlay">
      {/* Mobile Touch Controls */}
      {gameState === 'playing' && (
        <div className="touch-controls">
          <div className="touch-layer left" onClick={moveLeft} />
          <div className="touch-layer right" onClick={moveRight} />
        </div>
      )}

      {/* Sound Toggle */}
      <button className="mute-btn" onClick={toggleMute}>
        {isMuted ? '🔇' : '🔊'}
      </button>

      <div className="score-display">
        <div className="score-main">{score}</div>
        <div className="distance-sub">{Math.floor(score * 12.5)}M</div>
      </div>

      {gameState === 'start' && (
        <div className="screen">
          <div className="screen-container">
            <h1>SKATE ESCAPE</h1>
            <p className="subtitle">Ultimate City Skater</p>
            <button 
              key="start" 
              className="start-button arcade-btn" 
              onClick={() => {
                console.log("Starting Game...");
                startGame();
              }}
            >
              START GAME
            </button>
            <div className="controls-hint">
              PC: Arrow Keys / WASD<br/>  
              MOBILE: Tap Screen
            </div>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="screen">
          <div className="screen-container">
            <h1 className="gameOverText">CRASH !</h1>
            <div className="final-stats">
               <div className="stat-label">FINAL SCORE</div>
               <div className="stat-value">{score}</div>
            </div>
            <button 
              key="restart" 
              className="start-button arcade-btn" 
              onClick={() => {
                console.log("Restarting Game...");
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
