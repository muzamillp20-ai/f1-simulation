import { useState } from 'react';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import type { Difficulty, GameState, CarId, TrackId } from './types';
import { CARS, TRACKS } from './types';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [selectedCar, setSelectedCar] = useState<CarId>('red_ferrari');
  const [selectedTrack, setSelectedTrack] = useState<TrackId>('city');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('f1racing_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [totalCoins, setTotalCoins] = useState(() => {
    const saved = localStorage.getItem('f1racing_totalcoins');
    return saved ? parseInt(saved, 10) : 0;
  });

  const handleStart = (diff: Difficulty, car: CarId, track: TrackId) => {
    setDifficulty(diff);
    setSelectedCar(car);
    setSelectedTrack(track);
    setScore(0);
    setCoins(0);
    setGameState('playing');
  };

  const handleGameOver = (finalScore: number, finalCoins: number) => {
    setScore(finalScore);
    setCoins(finalCoins);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('f1racing_highscore', finalScore.toString());
    }
    const newTotalCoins = totalCoins + finalCoins;
    setTotalCoins(newTotalCoins);
    localStorage.setItem('f1racing_totalcoins', newTotalCoins.toString());
    setGameState('gameover');
  };

  const handleRestart = () => {
    setScore(0);
    setCoins(0);
    setGameState('playing');
  };

  const handleMenu = () => {
    setGameState('menu');
  };

  const carConfig = CARS.find(c => c.id === selectedCar) || CARS[0];
  const trackConfig = TRACKS.find(t => t.id === selectedTrack) || TRACKS[0];

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-900 relative select-none">
      {gameState === 'menu' && (
        <StartScreen 
          onStart={handleStart} 
          highScore={highScore}
          totalCoins={totalCoins}
        />
      )}
      {gameState === 'playing' && (
        <Game
          difficulty={difficulty}
          carConfig={carConfig}
          trackConfig={trackConfig}
          onGameOver={handleGameOver}
          onRestart={handleRestart}
          onMenu={handleMenu}
          highScore={highScore}
        />
      )}
      {gameState === 'gameover' && (
        <GameOverScreen
          score={score}
          coins={coins}
          highScore={highScore}
          totalCoins={totalCoins}
          onRestart={handleRestart}
          onMenu={handleMenu}
        />
      )}
    </div>
  );
}

export default App;
