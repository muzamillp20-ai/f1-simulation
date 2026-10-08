import { useEffect, useRef, useState, useCallback } from 'react';
import { DIFFICULTY_CONFIG, CAR_COLORS, type Difficulty, type Obstacle, type RoadLine, type Particle } from '../types';

interface GameProps {
  difficulty: Difficulty;
  onGameOver: (score: number) => void;
  onRestart: () => void;
  onMenu: () => void;
  highScore: number;
}

export default function Game({ difficulty, onGameOver, onRestart, onMenu, highScore }: GameProps) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const speedRef = useRef<number>(config.speed);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const roadLinesRef = useRef<RoadLine[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const playerXRef = useRef<number>(0);
  const playerLaneRef = useRef<number>(Math.floor(config.lanes / 2));
  const targetXRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const touchStartRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  const obstacleTimerRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const gameOverRef = useRef<boolean>(false);
  const roadOffsetRef = useRef<number>(0);

  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(config.speed);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [gameOverFlash, setGameOverFlash] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(3);
  const countdownRef = useRef<number | null>(3);
  const [milestone, setMilestone] = useState<string | null>(null);
  const lastMilestoneRef = useRef<number>(0);
  const [nearMiss, setNearMiss] = useState(false);
  const nearMissTimerRef = useRef<number>(0);

  const canvasWidth = 400;
  const canvasHeight = 700;
  const roadWidth = 320;
  const roadLeft = (canvasWidth - roadWidth) / 2;
  const laneWidth = roadWidth / config.lanes;
  const carWidth = 40;
  const carHeight = 70;

  const getLaneX = useCallback((lane: number) => {
    return roadLeft + lane * laneWidth + laneWidth / 2 - carWidth / 2;
  }, [config.lanes, laneWidth, roadLeft]);

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check touch device
    setIsTouchDevice('ontouchstart' in window);

    // Initialize player position
    playerLaneRef.current = Math.floor(config.lanes / 2);
    playerXRef.current = getLaneX(playerLaneRef.current);
    targetXRef.current = playerXRef.current;

    // Initialize road lines
    const lines: RoadLine[] = [];
    for (let i = 0; i < 15; i++) {
      lines.push({ id: i, y: i * 55 });
    }
    roadLinesRef.current = lines;

    // Reset state
    obstaclesRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    speedRef.current = config.speed;
    frameCountRef.current = 0;
    obstacleTimerRef.current = 0;
    gameOverRef.current = false;
    isPausedRef.current = false;
    setScore(0);
    setIsPaused(false);
    setShowPauseMenu(false);

    // Start countdown
    countdownRef.current = 3;
    setCountdown(3);
    isPausedRef.current = true;
    setIsPaused(true);

    const countdownInterval = setInterval(() => {
      countdownRef.current = (countdownRef.current ?? 1) - 1;
      setCountdown(countdownRef.current);
      if (countdownRef.current === 0) {
        clearInterval(countdownInterval);
        setTimeout(() => {
          setCountdown(null);
          countdownRef.current = null;
          isPausedRef.current = false;
          setIsPaused(false);
          lastTimeRef.current = performance.now();
          gameLoopRef.current = requestAnimationFrame(gameLoop);
        }, 500);
      }
    }, 800);

    return () => {
      clearInterval(countdownInterval);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [difficulty, config, getLaneX]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);

      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        togglePause();
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        movePlayer(-1);
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        movePlayer(1);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [config.lanes]);

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      touchStartRef.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touchX = e.touches[0].clientX;
      const diff = touchX - touchStartRef.current;
      if (Math.abs(diff) > 30) {
        movePlayer(diff > 0 ? 1 : -1);
        touchStartRef.current = touchX;
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [config.lanes]);

  const movePlayer = useCallback((direction: number) => {
    if (isPausedRef.current || gameOverRef.current) return;
    const newLane = Math.max(0, Math.min(config.lanes - 1, playerLaneRef.current + direction));
    playerLaneRef.current = newLane;
    targetXRef.current = getLaneX(newLane);
  }, [config.lanes, getLaneX]);

  const togglePause = useCallback(() => {
    if (gameOverRef.current) return;
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
    setShowPauseMenu(isPausedRef.current);
    if (!isPausedRef.current) {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, []);

  const spawnObstacle = useCallback(() => {
    if (obstaclesRef.current.length >= config.maxObstacles) return;

    const lane = Math.floor(Math.random() * config.lanes);
    const types: Array<'car' | 'truck' | 'barrier'> = ['car', 'car', 'car', 'truck', 'barrier'];
    const type = types[Math.floor(Math.random() * types.length)];
    const color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];

    const obstacle: Obstacle = {
      id: Date.now() + Math.random(),
      x: roadLeft + lane * laneWidth + laneWidth / 2 - carWidth / 2,
      y: -carHeight - 20,
      lane,
      type,
      color,
    };

    // Check if there's already an obstacle too close in the same lane
    const tooClose = obstaclesRef.current.some(
      (o) => o.lane === lane && o.y < 100
    );
    if (!tooClose) {
      obstaclesRef.current.push(obstacle);
    }
  }, [config, laneWidth, roadLeft]);

  const createExplosion = useCallback((x: number, y: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      particles.push({
        id: Date.now() + i,
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        color: ['#ef4444', '#f59e0b', '#f97316', '#ffffff'][Math.floor(Math.random() * 4)],
      });
    }
    particlesRef.current = [...particlesRef.current, ...particles];
  }, []);

  const checkCollision = useCallback((obs: Obstacle): boolean => {
    const px = playerXRef.current;
    const py = canvasHeight - carHeight - 30;
    const padding = 8;

    return (
      px + padding < obs.x + carWidth - padding &&
      px + carWidth - padding > obs.x + padding &&
      py + padding < obs.y + carHeight - padding &&
      py + carHeight - padding > obs.y + padding
    );
  }, []);

  const drawCar = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isPlayer: boolean) => {
    const w = carWidth;
    const h = carHeight;

    // Car shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2 + 3, y + h - 5, w / 2 - 2, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Car body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 5, w - 8, h - 10, 8);
    ctx.fill();

    // Car top/cockpit
    const gradient = ctx.createLinearGradient(x, y, x + w, y);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, isPlayer ? '#ffffff40' : '#00000040');
    gradient.addColorStop(1, color);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x + 8, y + 15, w - 16, h - 35, 5);
    ctx.fill();

    // Windshield
    ctx.fillStyle = isPlayer ? '#87ceeb80' : '#33333380';
    ctx.beginPath();
    ctx.roundRect(x + 10, y + (isPlayer ? 18 : 35), w - 20, 18, 3);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y + 10, 6, 16);
    ctx.fillRect(x + w - 6, y + 10, 6, 16);
    ctx.fillRect(x, y + h - 26, 6, 16);
    ctx.fillRect(x + w - 6, y + h - 26, 6, 16);

    // Wheel highlights
    ctx.fillStyle = '#444';
    ctx.fillRect(x + 1, y + 12, 4, 4);
    ctx.fillRect(x + w - 5, y + 12, 4, 4);
    ctx.fillRect(x + 1, y + h - 24, 4, 4);
    ctx.fillRect(x + w - 5, y + h - 24, 4, 4);

    if (isPlayer) {
      // Racing stripes
      ctx.fillStyle = '#ffffff30';
      ctx.fillRect(x + w / 2 - 3, y + 8, 6, h - 16);

      // Front lights
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + 10, y + 8, 3, 0, Math.PI * 2);
      ctx.arc(x + w - 10, y + 8, 3, 0, Math.PI * 2);
      ctx.fill();

      // Rear lights
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x + 10, y + h - 8, 3, 0, Math.PI * 2);
      ctx.arc(x + w - 10, y + h - 8, 3, 0, Math.PI * 2);
      ctx.fill();

      // Speed lines effect
      if (speedRef.current > 4) {
        ctx.strokeStyle = '#ffffff20';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const lx = x + 5 + i * (w / 3);
          ctx.beginPath();
          ctx.moveTo(lx, y + h);
          ctx.lineTo(lx, y + h + 15 + Math.random() * 10);
          ctx.stroke();
        }
      }
    } else {
      // Rear lights for obstacles
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 8, y + h - 10, 6, 4);
      ctx.fillRect(x + w - 14, y + h - 10, 6, 4);
    }
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (isPausedRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const deltaTime = Math.min(timestamp - lastTimeRef.current, 32);
    lastTimeRef.current = timestamp;
    frameCountRef.current++;
    const dtFactor = deltaTime / 16.67;

    // If game over, only update particles
    if (gameOverRef.current) {
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx * dtFactor;
        p.y += p.vy * dtFactor;
        p.vy += 0.3;
        p.life -= 0.015;
        return p.life > 0;
      });

      // Draw particles on existing canvas
      particlesRef.current.forEach((p) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + (1 - p.life) * 8, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      if (particlesRef.current.length > 0) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
      return;
    }

    // dtFactor already declared above

    // Increase speed over time
    speedRef.current = config.speed + Math.floor(scoreRef.current / 500) * 0.5;

    // Update score
    scoreRef.current += Math.floor(speedRef.current * dtFactor);
    if (frameCountRef.current % 10 === 0) {
      setScore(scoreRef.current);
      setSpeed(speedRef.current);

      // Check for milestones
      const milestones = [500, 1000, 2500, 5000, 10000, 25000, 50000];
      const currentMilestone = milestones.find(m => scoreRef.current >= m && m > lastMilestoneRef.current);
      if (currentMilestone) {
        lastMilestoneRef.current = currentMilestone;
        setMilestone(`🔥 ${currentMilestone.toLocaleString()} POINTS!`);
        setTimeout(() => setMilestone(null), 2000);
      }
    }

    // Smooth player movement
    if (Math.abs(playerXRef.current - targetXRef.current) > 1) {
      playerXRef.current += (targetXRef.current - playerXRef.current) * 0.15 * dtFactor;
    } else {
      playerXRef.current = targetXRef.current;
    }

    // Update road offset
    roadOffsetRef.current += speedRef.current * dtFactor;

    // Update road lines
    roadLinesRef.current.forEach((line) => {
      line.y += speedRef.current * dtFactor;
      if (line.y > canvasHeight) {
        line.y -= canvasHeight + 55;
      }
    });

    // Spawn obstacles
    obstacleTimerRef.current += deltaTime;
    if (obstacleTimerRef.current >= config.spawnRate) {
      obstacleTimerRef.current = 0;
      spawnObstacle();
    }

    // Update obstacles
    obstaclesRef.current = obstaclesRef.current.filter((obs) => {
      obs.y += speedRef.current * dtFactor;

      const playerY = canvasHeight - carHeight - 30;

      // Check collision
      if (checkCollision(obs)) {
        createExplosion(playerXRef.current + carWidth / 2, playerY + carHeight / 2);
        gameOverRef.current = true;
        setGameOverFlash(true);
        setTimeout(() => onGameOver(scoreRef.current), 1200);
        return true;
      }

      // Near miss detection - obstacle just passed the player very closely
      if (
        obs.y > playerY && obs.y < playerY + 20 &&
        Math.abs(obs.x - playerXRef.current) < carWidth * 1.5 &&
        Math.abs(obs.x - playerXRef.current) > carWidth * 0.5
      ) {
        if (nearMissTimerRef.current <= 0) {
          nearMissTimerRef.current = 30;
          scoreRef.current += 50; // Bonus points
          setNearMiss(true);
          setTimeout(() => setNearMiss(false), 800);
        }
      }

      return obs.y < canvasHeight + 50;
    });

    // Update near miss timer
    if (nearMissTimerRef.current > 0) {
      nearMissTimerRef.current -= dtFactor;
    }

    // Update particles
    particlesRef.current = particlesRef.current.filter((p) => {
      p.x += p.vx * dtFactor;
      p.y += p.vy * dtFactor;
      p.life -= 0.02 * dtFactor;
      return p.life > 0;
    });

    // === DRAWING ===
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw grass/terrain
    const grassGradient = ctx.createLinearGradient(0, 0, roadLeft, 0);
    grassGradient.addColorStop(0, '#1a3a1a');
    grassGradient.addColorStop(1, '#2d5a2d');
    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, 0, roadLeft, canvasHeight);

    const grassGradient2 = ctx.createLinearGradient(roadLeft + roadWidth, 0, canvasWidth, 0);
    grassGradient2.addColorStop(0, '#2d5a2d');
    grassGradient2.addColorStop(1, '#1a3a1a');
    ctx.fillStyle = grassGradient2;
    ctx.fillRect(roadLeft + roadWidth, 0, canvasWidth - roadLeft - roadWidth, canvasHeight);

    // Draw road
    const roadGradient = ctx.createLinearGradient(roadLeft, 0, roadLeft + roadWidth, 0);
    roadGradient.addColorStop(0, '#2a2a2a');
    roadGradient.addColorStop(0.1, '#3a3a3a');
    roadGradient.addColorStop(0.5, '#4a4a4a');
    roadGradient.addColorStop(0.9, '#3a3a3a');
    roadGradient.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = roadGradient;
    ctx.fillRect(roadLeft, 0, roadWidth, canvasHeight);

    // Road edge lines (white solid)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(roadLeft, 0, 4, canvasHeight);
    ctx.fillRect(roadLeft + roadWidth - 4, 0, 4, canvasHeight);

    // Red-white curbs
    const curbWidth = 8;
    for (let i = 0; i < canvasHeight / 20 + 1; i++) {
      const curbY = (i * 20 + roadOffsetRef.current) % (canvasHeight + 20) - 20;
      ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#ffffff';
      ctx.fillRect(roadLeft - curbWidth, curbY, curbWidth, 20);
      ctx.fillRect(roadLeft + roadWidth, curbY, curbWidth, 20);
    }

    // Lane markings (dashed)
    ctx.fillStyle = '#ffffff80';
    for (let lane = 1; lane < config.lanes; lane++) {
      const lx = roadLeft + lane * laneWidth;
      roadLinesRef.current.forEach((line) => {
        ctx.fillRect(lx - 1.5, line.y, 3, 30);
      });
    }

    // Draw obstacles
    obstaclesRef.current.forEach((obs) => {
      if (obs.type === 'barrier') {
        // Draw barrier
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(obs.x + 5, obs.y + 20, carWidth - 10, carHeight - 40);
        ctx.fillStyle = '#000';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(obs.x + 5, obs.y + 25 + i * 12, carWidth - 10, 4);
        }
      } else {
        const h = obs.type === 'truck' ? carHeight + 20 : carHeight;
        drawCar(ctx, obs.x, obs.y, obs.color, false);
        if (obs.type === 'truck') {
          ctx.fillStyle = obs.color + '80';
          ctx.fillRect(obs.x + 6, obs.y + 5, carWidth - 12, 20);
        }
      }
    });

    // Draw player car
    const playerY = canvasHeight - carHeight - 30;
    drawCar(ctx, playerXRef.current, playerY, '#3b82f6', true);

    // Draw particles
    particlesRef.current.forEach((p) => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 + (1 - p.life) * 5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Speed effect (motion blur lines on sides)
    if (speedRef.current > 5) {
      ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.1, (speedRef.current - 5) * 0.02)})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const sx = roadLeft + Math.random() * roadWidth;
        const sy = Math.random() * canvasHeight;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, sy + 20 + speedRef.current * 3);
        ctx.stroke();
      }
    }

    // Vignette effect
    const vignette = ctx.createRadialGradient(
      canvasWidth / 2, canvasHeight / 2, canvasHeight * 0.3,
      canvasWidth / 2, canvasHeight / 2, canvasHeight * 0.7
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [config, spawnObstacle, checkCollision, createExplosion, drawCar, onGameOver, getLaneX]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 relative">
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-start p-3 md:p-4">
        {/* Score */}
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 md:px-4 md:py-3 border border-gray-700">
          <p className="text-gray-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider">Score</p>
          <p className="text-white text-lg md:text-2xl font-black">{score.toLocaleString()}</p>
        </div>

        {/* Center controls */}
        <div className="flex gap-2 items-center">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-2 py-1 md:px-3 md:py-2 border border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: config.color }}>
              {config.label}
            </span>
          </div>
          <button
            onClick={togglePause}
            className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 md:px-4 md:py-3 border border-gray-700 text-white hover:bg-gray-800 transition-all active:scale-95"
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
        </div>

        {/* High Score */}
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 md:px-4 md:py-3 border border-yellow-600/30">
          <p className="text-yellow-500 text-[10px] md:text-xs font-semibold uppercase tracking-wider">🏆 Best</p>
          <p className="text-yellow-400 text-lg md:text-2xl font-black">{Math.max(highScore, score).toLocaleString()}</p>
        </div>
      </div>

      {/* Speed indicator */}
      <div className="absolute bottom-20 md:bottom-4 left-3 md:left-4 z-20">
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-700">
          <p className="text-gray-400 text-[10px] font-semibold uppercase">Speed</p>
          <p className="text-green-400 text-lg font-black">{Math.floor(speed * 30)} km/h</p>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative flex items-center justify-center" style={{ maxHeight: '85vh' }}>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="max-h-[85vh] md:max-h-[90vh] w-auto rounded-lg shadow-2xl shadow-black/50 border-2 border-gray-700"
          style={{ imageRendering: 'auto' }}
        />
        {/* Nitro boost effect overlay */}
        {speed > 8 && !isPaused && !gameOverFlash && (
          <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-500/10 to-transparent animate-pulse" />
          </div>
        )}
      </div>

      {/* Touch Controls */}
      {isTouchDevice && !isPaused && !showPauseMenu && countdown === null && !gameOverFlash && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4 z-20 md:hidden">
          <button
            onTouchStart={(e) => { e.preventDefault(); movePlayer(-1); }}
            className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl border-2 border-white/30 flex items-center justify-center text-4xl text-white active:bg-white/30 active:scale-90 transition-all shadow-lg"
          >
            ◀
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); movePlayer(1); }}
            className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl border-2 border-white/30 flex items-center justify-center text-4xl text-white active:bg-white/30 active:scale-90 transition-all shadow-lg"
          >
            ▶
          </button>
        </div>
      )}

      {/* Pause Menu Overlay */}
      {showPauseMenu && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-3xl p-8 border border-gray-600 shadow-2xl text-center max-w-xs mx-4 animate-in">
            <h2 className="text-3xl font-black text-white mb-2">⏸️ PAUSED</h2>
            <p className="text-gray-400 mb-6">Take a breather, champion!</p>
            
            <div className="space-y-3">
              <button
                onClick={togglePause}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
              >
                ▶️ RESUME
              </button>
              <button
                onClick={onRestart}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
              >
                🔄 RESTART
              </button>
              <button
                onClick={onMenu}
                className="w-full px-6 py-3 bg-gray-700 text-gray-300 font-bold rounded-xl border border-gray-600 hover:bg-gray-600 hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
              >
                🏠 MENU
              </button>
            </div>

            <div className="mt-4 text-gray-500 text-xs">
              Press Space or Esc to resume
            </div>
          </div>
        </div>
      )}

      {/* Near Miss Notification */}
      {nearMiss && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-cyan-500/90 text-white font-black text-lg md:text-xl px-5 py-2 rounded-xl shadow-lg shadow-cyan-500/30 animate-bounce" style={{ animationDuration: '0.3s' }}>
            ⚡ NEAR MISS! +50
          </div>
        </div>
      )}

      {/* Milestone Notification */}
      {milestone && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-500/90 to-orange-500/90 text-black font-black text-xl md:text-2xl px-6 py-3 rounded-2xl shadow-2xl shadow-yellow-500/30 animate-bounce" style={{ animationDuration: '0.5s' }}>
            {milestone}
          </div>
        </div>
      )}

      {/* Countdown Overlay */}
      {countdown !== null && countdown > 0 && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-gray-300 text-lg font-bold mb-4 uppercase tracking-widest">Get Ready!</p>
            <div className="text-8xl md:text-9xl font-black text-white animate-bounce" style={{ animationDuration: '0.5s' }}>
              {countdown}
            </div>
          </div>
        </div>
      )}
      {countdown === 0 && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="text-6xl md:text-8xl font-black text-green-400 animate-ping" style={{ animationDuration: '0.8s' }}>
            GO!
          </div>
        </div>
      )}

      {/* Game Over flash */}
      {gameOverFlash && (
        <div className="absolute inset-0 z-25 bg-red-500/30 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}
