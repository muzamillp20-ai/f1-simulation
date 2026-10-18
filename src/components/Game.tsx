import { useEffect, useRef, useState, useCallback } from 'react';
import { DIFFICULTY_CONFIG, type Difficulty, type Obstacle, type RoadLine, type Particle, type Coin, type JumpBarrier, type CarConfig, type TrackConfig } from '../types';

interface GameProps {
  difficulty: Difficulty;
  carConfig: CarConfig;
  trackConfig: TrackConfig;
  onGameOver: (score: number, coins: number) => void;
  onRestart: () => void;
  onMenu: () => void;
  highScore: number;
}

export default function Game({ difficulty, carConfig, trackConfig, onGameOver, onRestart, onMenu, highScore }: GameProps) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const coinsRef = useRef<number>(0);
  const speedRef = useRef<number>(config.speed * carConfig.speed);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const coinsObjRef = useRef<Coin[]>([]);
  const jumpBarriersRef = useRef<JumpBarrier[]>([]);
  const roadLinesRef = useRef<RoadLine[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const playerXRef = useRef<number>(0);
  const playerYRef = useRef<number>(0);
  const playerLaneRef = useRef<number>(Math.floor(config.lanes / 2));
  const targetXRef = useRef<number>(0);
  const isJumpingRef = useRef<boolean>(false);
  const jumpVelocityRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const touchStartRef = useRef<{x: number, y: number} | null>(null);
  const isPausedRef = useRef<boolean>(false);
  const obstacleTimerRef = useRef<number>(0);
  const coinTimerRef = useRef<number>(0);
  const barrierTimerRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const gameOverRef = useRef<boolean>(false);
  const roadOffsetRef = useRef<number>(0);

  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
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
  const [coinCollect, setCoinCollect] = useState<{x: number, y: number} | null>(null);

  const canvasWidth = 400;
  const canvasHeight = 700;
  const roadWidth = 320;
  const roadLeft = (canvasWidth - roadWidth) / 2;
  const laneWidth = roadWidth / config.lanes;
  const carWidth = 40;
  const carHeight = 70;
  const groundY = canvasHeight - carHeight - 30;

  const getLaneX = useCallback((lane: number) => {
    return roadLeft + lane * laneWidth + laneWidth / 2 - carWidth / 2;
  }, [config.lanes, laneWidth, roadLeft]);

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsTouchDevice('ontouchstart' in window);

    playerLaneRef.current = Math.floor(config.lanes / 2);
    playerXRef.current = getLaneX(playerLaneRef.current);
    playerYRef.current = groundY;
    targetXRef.current = playerXRef.current;

    const lines: RoadLine[] = [];
    for (let i = 0; i < 15; i++) {
      lines.push({ id: i, y: i * 55 });
    }
    roadLinesRef.current = lines;

    obstaclesRef.current = [];
    coinsObjRef.current = [];
    jumpBarriersRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    coinsRef.current = 0;
    speedRef.current = config.speed * carConfig.speed;
    frameCountRef.current = 0;
    obstacleTimerRef.current = 0;
    coinTimerRef.current = 0;
    barrierTimerRef.current = 0;
    gameOverRef.current = false;
    isPausedRef.current = false;
    isJumpingRef.current = false;
    jumpVelocityRef.current = 0;
    setScore(0);
    setCoins(0);
    setIsPaused(false);
    setShowPauseMenu(false);

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
  }, [difficulty, config, getLaneX, carConfig.speed, groundY]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);

      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        jump();
      }
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
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
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!touchStartRef.current) return;
      const touch = e.touches[0];
      const diffX = touch.clientX - touchStartRef.current.x;
      const diffY = touch.clientY - touchStartRef.current.y;
      
      if (Math.abs(diffX) > 30 && Math.abs(diffX) > Math.abs(diffY)) {
        movePlayer(diffX > 0 ? 1 : -1);
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      } else if (diffY < -50) {
        jump();
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      touchStartRef.current = null;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [config.lanes]);

  const movePlayer = useCallback((direction: number) => {
    if (isPausedRef.current || gameOverRef.current) return;
    const newLane = Math.max(0, Math.min(config.lanes - 1, playerLaneRef.current + direction));
    playerLaneRef.current = newLane;
    targetXRef.current = getLaneX(newLane);
  }, [config.lanes, getLaneX]);

  const jump = useCallback(() => {
    if (isPausedRef.current || gameOverRef.current || isJumpingRef.current) return;
    isJumpingRef.current = true;
    jumpVelocityRef.current = -15;
  }, []);

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
    const color = ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 6)];

    const obstacle: Obstacle = {
      id: Date.now() + Math.random(),
      x: roadLeft + lane * laneWidth + laneWidth / 2 - carWidth / 2,
      y: -carHeight - 20,
      lane,
      type,
      color,
    };

    const tooClose = obstaclesRef.current.some((o) => o.lane === lane && o.y < 100);
    if (!tooClose) {
      obstaclesRef.current.push(obstacle);
    }
  }, [config, laneWidth, roadLeft]);

  const spawnCoin = useCallback(() => {
    if (coinsObjRef.current.length >= 5) return;

    const lane = Math.floor(Math.random() * config.lanes);
    const coin: Coin = {
      id: Date.now() + Math.random(),
      x: roadLeft + lane * laneWidth + laneWidth / 2,
      y: -30,
      lane,
      collected: false,
      rotation: 0,
    };

    const tooClose = coinsObjRef.current.some((c) => c.lane === lane && c.y < 100);
    if (!tooClose) {
      coinsObjRef.current.push(coin);
    }
  }, [config, laneWidth, roadLeft]);

  const spawnJumpBarrier = useCallback(() => {
    if (jumpBarriersRef.current.length >= 2) return;

    const lane = Math.floor(Math.random() * config.lanes);
    const barrier: JumpBarrier = {
      id: Date.now() + Math.random(),
      x: roadLeft + lane * laneWidth + laneWidth / 2 - 30,
      y: -60,
      lane,
      width: 60,
      height: 20,
    };

    const tooClose = jumpBarriersRef.current.some((b) => b.lane === lane && b.y < 150);
    if (!tooClose) {
      jumpBarriersRef.current.push(barrier);
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
    if (isJumpingRef.current && playerYRef.current < groundY - 30) return false;
    
    const px = playerXRef.current;
    const py = playerYRef.current;
    const padding = 8;

    return (
      px + padding < obs.x + carWidth - padding &&
      px + carWidth - padding > obs.x + padding &&
      py + padding < obs.y + carHeight - padding &&
      py + carHeight - padding > obs.y + padding
    );
  }, [groundY]);

  const checkCoinCollection = useCallback((coin: Coin): boolean => {
    const px = playerXRef.current + carWidth / 2;
    const py = playerYRef.current + carHeight / 2;
    const distance = Math.sqrt((px - coin.x) ** 2 + (py - coin.y) ** 2);
    return distance < 35;
  }, []);

  const checkBarrierCollision = useCallback((barrier: JumpBarrier): boolean => {
    if (isJumpingRef.current && playerYRef.current < groundY - 30) return false;
    
    const px = playerXRef.current;
    const py = playerYRef.current;

    return (
      px < barrier.x + barrier.width &&
      px + carWidth > barrier.x &&
      py < barrier.y + barrier.height &&
      py + carHeight > barrier.y
    );
  }, [groundY]);

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

    if (gameOverRef.current) {
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx * dtFactor;
        p.y += p.vy * dtFactor;
        p.vy += 0.3;
        p.life -= 0.015;
        return p.life > 0;
      });

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

    // Update jump
    if (isJumpingRef.current) {
      jumpVelocityRef.current += 0.8 * dtFactor;
      playerYRef.current += jumpVelocityRef.current * dtFactor;
      if (playerYRef.current >= groundY) {
        playerYRef.current = groundY;
        isJumpingRef.current = false;
        jumpVelocityRef.current = 0;
      }
    }

    speedRef.current = config.speed * carConfig.speed + Math.floor(scoreRef.current / 500) * 0.3;

    scoreRef.current += Math.floor(speedRef.current * dtFactor);
    if (frameCountRef.current % 10 === 0) {
      setScore(scoreRef.current);
      setSpeed(speedRef.current);

      const milestones = [500, 1000, 2500, 5000, 10000, 25000, 50000];
      const currentMilestone = milestones.find(m => scoreRef.current >= m && m > lastMilestoneRef.current);
      if (currentMilestone) {
        lastMilestoneRef.current = currentMilestone;
        setMilestone(`🔥 ${currentMilestone.toLocaleString()} POINTS!`);
        setTimeout(() => setMilestone(null), 2000);
      }
    }

    if (Math.abs(playerXRef.current - targetXRef.current) > 1) {
      playerXRef.current += (targetXRef.current - playerXRef.current) * 0.15 * dtFactor;
    } else {
      playerXRef.current = targetXRef.current;
    }

    roadOffsetRef.current += speedRef.current * dtFactor;

    roadLinesRef.current.forEach((line) => {
      line.y += speedRef.current * dtFactor;
      if (line.y > canvasHeight) {
        line.y -= canvasHeight + 55;
      }
    });

    obstacleTimerRef.current += deltaTime;
    if (obstacleTimerRef.current >= config.spawnRate) {
      obstacleTimerRef.current = 0;
      spawnObstacle();
    }

    coinTimerRef.current += deltaTime;
    if (coinTimerRef.current >= 1500) {
      coinTimerRef.current = 0;
      spawnCoin();
    }

    barrierTimerRef.current += deltaTime;
    if (barrierTimerRef.current >= 3000) {
      barrierTimerRef.current = 0;
      spawnJumpBarrier();
    }

    obstaclesRef.current = obstaclesRef.current.filter((obs) => {
      obs.y += speedRef.current * dtFactor;

      if (checkCollision(obs)) {
        createExplosion(playerXRef.current + carWidth / 2, playerYRef.current + carHeight / 2);
        gameOverRef.current = true;
        setGameOverFlash(true);
        setTimeout(() => onGameOver(scoreRef.current, coinsRef.current), 1200);
        return true;
      }

      const playerY = playerYRef.current;
      if (
        obs.y > playerY && obs.y < playerY + 20 &&
        Math.abs(obs.x - playerXRef.current) < carWidth * 1.5 &&
        Math.abs(obs.x - playerXRef.current) > carWidth * 0.5
      ) {
        if (nearMissTimerRef.current <= 0) {
          nearMissTimerRef.current = 30;
          scoreRef.current += 50;
          setNearMiss(true);
          setTimeout(() => setNearMiss(false), 800);
        }
      }

      return obs.y < canvasHeight + 50;
    });

    coinsObjRef.current = coinsObjRef.current.filter((coin) => {
      coin.y += speedRef.current * dtFactor;
      coin.rotation += 5 * dtFactor;

      if (!coin.collected && checkCoinCollection(coin)) {
        coin.collected = true;
        coinsRef.current += 1;
        setCoins(coinsRef.current);
        setCoinCollect({ x: coin.x, y: coin.y });
        setTimeout(() => setCoinCollect(null), 500);
        return false;
      }

      return coin.y < canvasHeight + 50;
    });

    jumpBarriersRef.current = jumpBarriersRef.current.filter((barrier) => {
      barrier.y += speedRef.current * dtFactor;

      if (checkBarrierCollision(barrier)) {
        createExplosion(playerXRef.current + carWidth / 2, playerYRef.current + carHeight / 2);
        gameOverRef.current = true;
        setGameOverFlash(true);
        setTimeout(() => onGameOver(scoreRef.current, coinsRef.current), 1200);
        return true;
      }

      return barrier.y < canvasHeight + 50;
    });

    if (nearMissTimerRef.current > 0) {
      nearMissTimerRef.current -= dtFactor;
    }

    particlesRef.current = particlesRef.current.filter((p) => {
      p.x += p.vx * dtFactor;
      p.y += p.vy * dtFactor;
      p.life -= 0.02 * dtFactor;
      return p.life > 0;
    });

    // DRAWING
    ctx.fillStyle = trackConfig.skyColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const grassGradient = ctx.createLinearGradient(0, 0, roadLeft, 0);
    grassGradient.addColorStop(0, trackConfig.grassColor + '80');
    grassGradient.addColorStop(1, trackConfig.grassColor);
    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, 0, roadLeft, canvasHeight);

    const grassGradient2 = ctx.createLinearGradient(roadLeft + roadWidth, 0, canvasWidth, 0);
    grassGradient2.addColorStop(0, trackConfig.grassColor);
    grassGradient2.addColorStop(1, trackConfig.grassColor + '80');
    ctx.fillStyle = grassGradient2;
    ctx.fillRect(roadLeft + roadWidth, 0, canvasWidth - roadLeft - roadWidth, canvasHeight);

    ctx.fillStyle = trackConfig.roadColor;
    ctx.fillRect(roadLeft, 0, roadWidth, canvasHeight);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(roadLeft, 0, 4, canvasHeight);
    ctx.fillRect(roadLeft + roadWidth - 4, 0, 4, canvasHeight);

    const curbWidth = 8;
    for (let i = 0; i < canvasHeight / 20 + 1; i++) {
      const curbY = (i * 20 + roadOffsetRef.current) % (canvasHeight + 20) - 20;
      ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#ffffff';
      ctx.fillRect(roadLeft - curbWidth, curbY, curbWidth, 20);
      ctx.fillRect(roadLeft + roadWidth, curbY, curbWidth, 20);
    }

    ctx.fillStyle = trackConfig.lineColor + '80';
    for (let lane = 1; lane < config.lanes; lane++) {
      const lx = roadLeft + lane * laneWidth;
      roadLinesRef.current.forEach((line) => {
        ctx.fillRect(lx - 1.5, line.y, 3, 30);
      });
    }

    // Draw jump barriers
    jumpBarriersRef.current.forEach((barrier) => {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
      ctx.fillStyle = '#000';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(barrier.x + 5 + i * 18, barrier.y + 5, 8, barrier.height - 10);
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('JUMP', barrier.x + 10, barrier.y + 14);
    });

    // Draw coins
    coinsObjRef.current.forEach((coin) => {
      if (!coin.collected) {
        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.rotate((coin.rotation * Math.PI) / 180);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
        ctx.restore();
      }
    });

    // Draw obstacles
    obstaclesRef.current.forEach((obs) => {
      drawCar(ctx, obs.x, obs.y, obs.color, false);
    });

    // Draw player car
    drawCar(ctx, playerXRef.current, playerYRef.current, carConfig.color, true);

    // Draw particles
    particlesRef.current.forEach((p) => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 + (1 - p.life) * 5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

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

    const vignette = ctx.createRadialGradient(
      canvasWidth / 2, canvasHeight / 2, canvasHeight * 0.3,
      canvasWidth / 2, canvasHeight / 2, canvasHeight * 0.7
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [config, carConfig, trackConfig, spawnObstacle, spawnCoin, spawnJumpBarrier, checkCollision, checkCoinCollection, checkBarrierCollision, createExplosion, onGameOver, getLaneX, groundY]);

  const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isPlayer: boolean) => {
    const w = carWidth;
    const h = carHeight;

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2 + 3, y + h - 5, w / 2 - 2, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 5, w - 8, h - 10, 8);
    ctx.fill();

    const gradient = ctx.createLinearGradient(x, y, x + w, y);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, isPlayer ? '#ffffff40' : '#00000040');
    gradient.addColorStop(1, color);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x + 8, y + 15, w - 16, h - 35, 5);
    ctx.fill();

    ctx.fillStyle = isPlayer ? '#87ceeb80' : '#33333380';
    ctx.beginPath();
    ctx.roundRect(x + 10, y + (isPlayer ? 18 : 35), w - 20, 18, 3);
    ctx.fill();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y + 10, 6, 16);
    ctx.fillRect(x + w - 6, y + 10, 6, 16);
    ctx.fillRect(x, y + h - 26, 6, 16);
    ctx.fillRect(x + w - 6, y + h - 26, 6, 16);

    if (isPlayer) {
      ctx.fillStyle = '#ffffff30';
      ctx.fillRect(x + w / 2 - 3, y + 8, 6, h - 16);

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + 10, y + 8, 3, 0, Math.PI * 2);
      ctx.arc(x + w - 10, y + 8, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x + 10, y + h - 8, 3, 0, Math.PI * 2);
      ctx.arc(x + w - 10, y + h - 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 relative">
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-start p-3 md:p-4">
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 md:px-4 md:py-3 border border-gray-700">
          <p className="text-gray-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider">Score</p>
          <p className="text-white text-lg md:text-2xl font-black">{score.toLocaleString()}</p>
        </div>

        <div className="flex gap-2 items-center">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-amber-600/30">
            <p className="text-amber-400 text-[10px] font-semibold uppercase">🪙</p>
            <p className="text-amber-300 text-lg font-black">{coins}</p>
          </div>
          <button
            onClick={togglePause}
            className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 md:px-4 md:py-3 border border-gray-700 text-white hover:bg-gray-800 transition-all active:scale-95"
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
        </div>

        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 md:px-4 md:py-3 border border-yellow-600/30">
          <p className="text-yellow-500 text-[10px] md:text-xs font-semibold uppercase tracking-wider">🏆 Best</p>
          <p className="text-yellow-400 text-lg md:text-2xl font-black">{Math.max(highScore, score).toLocaleString()}</p>
        </div>
      </div>

      <div className="absolute bottom-20 md:bottom-4 left-3 md:left-4 z-20">
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-700">
          <p className="text-gray-400 text-[10px] font-semibold uppercase">Speed</p>
          <p className="text-green-400 text-lg font-black">{Math.floor(speed * 30)} km/h</p>
        </div>
      </div>

      <div className="relative flex items-center justify-center" style={{ maxHeight: '85vh' }}>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="max-h-[85vh] md:max-h-[90vh] w-auto rounded-lg shadow-2xl shadow-black/50 border-2 border-gray-700"
          style={{ imageRendering: 'auto' }}
        />
        {speed > 8 && !isPaused && !gameOverFlash && (
          <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-500/10 to-transparent animate-pulse" />
          </div>
        )}
      </div>

      {isTouchDevice && !isPaused && !showPauseMenu && countdown === null && !gameOverFlash && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4 z-20 md:hidden">
          <button
            onTouchStart={(e) => { e.preventDefault(); movePlayer(-1); }}
            className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl border-2 border-white/30 flex items-center justify-center text-3xl text-white active:bg-white/30 active:scale-90 transition-all shadow-lg"
          >
            ◀
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); jump(); }}
            className="w-20 h-20 bg-green-500/20 backdrop-blur-sm rounded-3xl border-2 border-green-400/50 flex items-center justify-center text-2xl text-white font-bold active:bg-green-500/40 active:scale-90 transition-all shadow-lg"
          >
            ⬆️
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); movePlayer(1); }}
            className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl border-2 border-white/30 flex items-center justify-center text-3xl text-white active:bg-white/30 active:scale-90 transition-all shadow-lg"
          >
            ▶
          </button>
        </div>
      )}

      {coinCollect && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-amber-500/90 text-white font-black text-lg px-4 py-2 rounded-xl shadow-lg animate-bounce" style={{ animationDuration: '0.3s' }}>
            🪙 +1 COIN!
          </div>
        </div>
      )}

      {nearMiss && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-cyan-500/90 text-white font-black text-lg md:text-xl px-5 py-2 rounded-xl shadow-lg shadow-cyan-500/30 animate-bounce" style={{ animationDuration: '0.3s' }}>
            ⚡ NEAR MISS! +50
          </div>
        </div>
      )}

      {milestone && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-500/90 to-orange-500/90 text-black font-black text-xl md:text-2xl px-6 py-3 rounded-2xl shadow-2xl shadow-yellow-500/30 animate-bounce" style={{ animationDuration: '0.5s' }}>
            {milestone}
          </div>
        </div>
      )}

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

      {gameOverFlash && (
        <div className="absolute inset-0 z-25 bg-red-500/30 animate-pulse pointer-events-none" />
      )}

      {showPauseMenu && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-3xl p-8 border border-gray-600 shadow-2xl text-center max-w-xs mx-4">
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
              Press Esc or P to resume
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
