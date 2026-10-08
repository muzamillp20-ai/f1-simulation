import { useState } from 'react';
import { DIFFICULTY_CONFIG, type Difficulty } from '../types';

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void;
  highScore: number;
}

export default function StartScreen({ onStart, highScore }: StartScreenProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 bg-white/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                height: `${20 + Math.random() * 40}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        {/* Road lines animation */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-12 bg-yellow-400/40 rounded-full"
              style={{
                left: '-4px',
                top: `${i * 14}%`,
                animation: 'roadLineMove 1.5s linear infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4">
        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 tracking-tighter animate-pulse">
            F1 NITRO
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-medium mt-2 tracking-widest uppercase">
            Asphalt Rush
          </p>
        </div>

        {/* F1 Car Icon */}
        <div className="relative my-4">
          <div className="text-6xl md:text-8xl animate-bounce" style={{ animationDuration: '2s' }}>
            🏎️
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-red-500/30 rounded-full blur-md" />
        </div>

        {/* High Score */}
        {highScore > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-6 py-3 backdrop-blur-sm">
            <p className="text-yellow-400 text-sm font-semibold">🏆 HIGH SCORE</p>
            <p className="text-yellow-300 text-2xl font-black">{highScore.toLocaleString()}</p>
          </div>
        )}

        {/* Difficulty Selection */}
        <div className="w-full max-w-sm">
          <p className="text-gray-400 text-sm font-semibold text-center mb-3 uppercase tracking-wider">
            Select Difficulty
          </p>
          <div className="flex gap-3 justify-center">
            {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG.easy][]).map(
              ([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDifficulty(key)}
                  className={`px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    selectedDifficulty === key
                      ? 'shadow-lg scale-105'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                  style={
                    selectedDifficulty === key
                      ? { backgroundColor: config.color + '20', color: config.color, border: `2px solid ${config.color}` }
                      : {}
                  }
                >
                  {config.label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => onStart(selectedDifficulty)}
          className="mt-4 px-12 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-black text-xl rounded-2xl shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 transform hover:scale-110 active:scale-95 transition-all duration-300 uppercase tracking-wider"
        >
          🏁 START RACE
        </button>

        {/* Controls Info */}
        <div className="mt-6 text-center text-gray-500 text-xs space-y-1">
          <p className="hidden md:block">⌨️ Arrow Keys / A,D to steer | Space to pause</p>
          <p className="md:hidden">👆 Swipe or use on-screen buttons to steer</p>
        </div>
      </div>
    </div>
  );
}
