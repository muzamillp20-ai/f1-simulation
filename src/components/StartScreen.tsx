import { useState } from 'react';
import { DIFFICULTY_CONFIG, CARS, TRACKS, type Difficulty, type CarId, type TrackId } from '../types';

interface StartScreenProps {
  onStart: (difficulty: Difficulty, car: CarId, track: TrackId) => void;
  highScore: number;
  totalCoins: number;
}

export default function StartScreen({ onStart, highScore, totalCoins }: StartScreenProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [selectedCar, setSelectedCar] = useState<CarId>('red_ferrari');
  const [selectedTrack, setSelectedTrack] = useState<TrackId>('city');
  const [step, setStep] = useState<'main' | 'cars' | 'tracks'>('main');

  if (step === 'cars') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black" />
        <div className="relative z-10 flex flex-col items-center gap-4 px-4 w-full max-w-lg">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">🏎️ SELECT YOUR CAR</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
            {CARS.map((car) => (
              <button
                key={car.id}
                onClick={() => { setSelectedCar(car.id); setStep('main'); }}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  selectedCar === car.id
                    ? 'border-white bg-white/10 shadow-lg'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <div className="text-4xl mb-2">{car.emoji}</div>
                <div
                  className="w-full h-3 rounded-full mb-2"
                  style={{ backgroundColor: car.color }}
                />
                <p className="text-white text-xs font-bold">{car.name}</p>
                <p className="text-gray-400 text-[10px]">Speed: {'⚡'.repeat(Math.round(car.speed * 3))}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('main')}
            className="mt-2 px-8 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-all"
          >
            ← BACK
          </button>
        </div>
      </div>
    );
  }

  if (step === 'tracks') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black" />
        <div className="relative z-10 flex flex-col items-center gap-4 px-4 w-full max-w-lg">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">🗺️ SELECT TRACK</h2>
          <div className="grid grid-cols-2 gap-3 w-full">
            {TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => { setSelectedTrack(track.id); setStep('main'); }}
                className={`p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  selectedTrack === track.id
                    ? 'border-white bg-white/10 shadow-lg'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <div className="text-5xl mb-2">{track.emoji}</div>
                <p className="text-white text-sm font-bold">{track.name}</p>
                <div className="flex gap-1 mt-2 justify-center">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: track.roadColor }} />
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: track.grassColor }} />
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: track.skyColor }} />
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('main')}
            className="mt-2 px-8 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-all"
          >
            ← BACK
          </button>
        </div>
      </div>
    );
  }

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
      <div className="relative z-10 flex flex-col items-center gap-4 px-4 w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-2">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 tracking-tighter animate-pulse">
            F1 NITRO
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-medium mt-2 tracking-widest uppercase">
            Asphalt Rush
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-3 w-full">
          {highScore > 0 && (
            <div className="flex-1 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-3 py-2 backdrop-blur-sm text-center">
              <p className="text-yellow-400 text-[10px] font-semibold">🏆 BEST</p>
              <p className="text-yellow-300 text-lg font-black">{highScore.toLocaleString()}</p>
            </div>
          )}
          <div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 backdrop-blur-sm text-center">
            <p className="text-amber-400 text-[10px] font-semibold">🪙 COINS</p>
            <p className="text-amber-300 text-lg font-black">{totalCoins.toLocaleString()}</p>
          </div>
        </div>

        {/* Car Selection */}
        <button
          onClick={() => setStep('cars')}
          className="w-full bg-gray-800/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-600 hover:border-gray-400 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{CARS.find(c => c.id === selectedCar)?.emoji}</span>
            <div className="text-left">
              <p className="text-gray-400 text-[10px] font-semibold uppercase">Car</p>
              <p className="text-white font-bold text-sm">{CARS.find(c => c.id === selectedCar)?.name}</p>
            </div>
          </div>
          <span className="text-gray-400">→</span>
        </button>

        {/* Track Selection */}
        <button
          onClick={() => setStep('tracks')}
          className="w-full bg-gray-800/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-600 hover:border-gray-400 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{TRACKS.find(t => t.id === selectedTrack)?.emoji}</span>
            <div className="text-left">
              <p className="text-gray-400 text-[10px] font-semibold uppercase">Track</p>
              <p className="text-white font-bold text-sm">{TRACKS.find(t => t.id === selectedTrack)?.name}</p>
            </div>
          </div>
          <span className="text-gray-400">→</span>
        </button>

        {/* Difficulty Selection */}
        <div className="w-full">
          <p className="text-gray-400 text-[10px] font-semibold text-center mb-2 uppercase tracking-wider">
            Difficulty
          </p>
          <div className="flex gap-2 justify-center">
            {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG.easy][]).map(
              ([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDifficulty(key)}
                  className={`flex-1 px-3 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 ${
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
          onClick={() => onStart(selectedDifficulty, selectedCar, selectedTrack)}
          className="mt-2 px-12 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-black text-xl rounded-2xl shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 transform hover:scale-110 active:scale-95 transition-all duration-300 uppercase tracking-wider w-full"
        >
          🏁 START RACE
        </button>

        {/* Controls Info */}
        <div className="mt-2 text-center text-gray-500 text-xs space-y-1">
          <p className="hidden md:block">⌨️ ← → Steer | Space = Jump | P = Pause</p>
          <p className="md:hidden">👆 Swipe to steer | Tap to jump</p>
        </div>
      </div>
    </div>
  );
}
