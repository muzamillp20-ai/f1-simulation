import { useState } from 'react';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import type { Difficulty, GameState } from './types';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('f1racing_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const handleStart = (diff: Difficulty) => {
    setDifficulty(diff);
    setScore(0);
    setGameState('playing');
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('f1racing_highscore', finalScore.toString());
    }
    setGameState('gameover');
  };

  const handleRestart = () => {
    setScore(0);
    setGameState('playing');
  };

  const handleMenu = () => {
    setGameState('menu');
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-900 relative select-none">
      {gameState === 'menu' && (
        <StartScreen onStart={handleStart} highScore={highScore} />
      )}
      {gameState === 'playing' && (
        <Game
          difficulty={difficulty}
          onGameOver={handleGameOver}
          onRestart={handleRestart}
          onMenu={handleMenu}
          highScore={highScore}
        />
      )}
      {gameState === 'gameover' && (
        <GameOverScreen
          score={score}
          highScore={highScore}
          onRestart={handleRestart}
          onMenu={handleMenu}
        />
      )}
    </div>
  );
}

export default App;
