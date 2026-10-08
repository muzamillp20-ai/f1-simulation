interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  onMenu: () => void;
}

export default function GameOverScreen({ score, highScore, onRestart, onMenu }: GameOverScreenProps) {
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/40 via-gray-900 to-black" />
      
      {/* Explosion effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 bg-red-500/10 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute w-48 h-48 bg-orange-500/10 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4">
        {/* Crash Icon */}
        <div className="text-7xl md:text-8xl animate-bounce" style={{ animationDuration: '1s' }}>
          💥
        </div>

        {/* Game Over Text */}
        <h1 className="text-4xl md:text-6xl font-black text-red-500 tracking-tight">
          CRASHED!
        </h1>

        {/* New High Score Badge */}
        {isNewHighScore && (
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black px-6 py-2 rounded-full text-sm uppercase tracking-wider animate-pulse shadow-lg shadow-yellow-500/30">
            🎉 NEW HIGH SCORE! 🎉
          </div>
        )}

        {/* Score Display */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 min-w-[280px]">
          <div className="text-center mb-4">
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Your Score</p>
            <p className="text-4xl md:text-5xl font-black text-white mt-1">{score.toLocaleString()}</p>
          </div>
          <div className="border-t border-gray-700 pt-4 text-center">
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">🏆 Best Score</p>
            <p className="text-2xl font-black text-yellow-400 mt-1">{highScore.toLocaleString()}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
          <button
            onClick={onRestart}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transform hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-wider"
          >
            🔄 RACE AGAIN
          </button>
          <button
            onClick={onMenu}
            className="px-8 py-3 bg-gray-800 text-gray-300 font-bold text-base rounded-2xl border border-gray-600 hover:bg-gray-700 transform hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-wider"
          >
            🏠 MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
