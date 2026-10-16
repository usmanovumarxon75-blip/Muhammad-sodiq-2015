import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameStatus, EnemyCar, Particle, ControlState } from '../types';
import { sounds } from '../utils/audio';
import { drawBluePlayerCar, drawRedEnemyCar, drawShadow } from '../utils/carRenderer';
import { OnScreenControls } from './OnScreenControls';
import { GameOverlay } from './GameOverlay';
import { Trophy, Gauge, Volume2, VolumeX, Pause, Play } from 'lucide-react';

const ROAD_LANE_COUNT = 3;
const CAR_WIDTH = 46;
const CAR_HEIGHT = 80;

export const CarPlayGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game state
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('car_play_highscore');
      return saved ? parseInt(saved, 10) || 0 : 0;
    }
    return 0;
  });
  const [speedKmh, setSpeedKmh] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Controls state
  const controlsRef = useRef<ControlState>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const [activeControls, setActiveControls] = useState<ControlState>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  // Game loop internal refs to prevent stutter/closure issues
  const stateRef = useRef({
    status: 'idle' as GameStatus,
    score: 0,
    highScore: 0,
    canvasWidth: 400,
    canvasHeight: 600,
    roadLeft: 40,
    roadRight: 360,
    roadWidth: 320,
    laneWidth: 106,
    // Player
    player: {
      x: 177,
      y: 480,
      vx: 0,
      vy: 0,
      angle: 0,
    },
    // World scrolling
    roadOffsetY: 0,
    baseSpeed: 5.5,
    speedMultiplier: 1,
    // Enemies
    enemies: [] as EnemyCar[],
    lastSpawnTime: 0,
    spawnInterval: 1400,
    nextEnemyId: 1,
    lastSpawnedLane: -1,
    laneHistory: [1] as number[],
    // Particles & FX
    particles: [] as Particle[],
    screenShake: 0,
    shakeX: 0,
    shakeY: 0,
    passedCars: new Set<number>(),
  });

  // Update high score in local storage
  const updateHighScore = useCallback((newScore: number) => {
    setHighScore((prev) => {
      if (newScore > prev) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('car_play_highscore', newScore.toString());
        }
        stateRef.current.highScore = newScore;
        return newScore;
      }
      return prev;
    });
  }, []);

  // Handle control inputs
  const handleControlChange = useCallback((key: keyof ControlState, active: boolean) => {
    controlsRef.current[key] = active;
    setActiveControls({ ...controlsRef.current });
  }, []);

  // Toggle sound
  const handleToggleSound = useCallback(() => {
    const enabled = sounds.toggleMute();
    setIsMuted(!enabled);
  }, []);

  // Start game
  const startGame = useCallback(() => {
    sounds.playClick();
    const st = stateRef.current;
    st.status = 'playing';
    st.score = 0;
    st.baseSpeed = 5.5;
    st.speedMultiplier = 1;
    st.enemies = [];
    st.particles = [];
    st.passedCars.clear();
    st.screenShake = 0;
    st.shakeX = 0;
    st.shakeY = 0;
    st.lastSpawnedLane = -1;
    st.laneHistory = [1]; // Middle lane primed
    st.lastSpawnTime = performance.now() - 400;

    // Position player in middle bottom
    st.player.x = st.canvasWidth / 2 - CAR_WIDTH / 2;
    st.player.y = st.canvasHeight - CAR_HEIGHT - 60;
    st.player.vx = 0;
    st.player.vy = 0;
    st.player.angle = 0;

    setScore(0);
    setGameStatus('playing');
    sounds.startEngine();
  }, []);

  // Restart game
  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // Pause / Resume game
  const togglePause = useCallback(() => {
    if (stateRef.current.status === 'playing') {
      stateRef.current.status = 'paused';
      setGameStatus('paused');
      sounds.stopEngine();
    } else if (stateRef.current.status === 'paused') {
      stateRef.current.status = 'playing';
      setGameStatus('playing');
      sounds.startEngine();
    }
  }, []);

  // Keyboard controls listener (W, A, S, D & Arrow keys + Space/Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling on game navigation keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.repeat) return;

      const code = e.code;
      const key = e.key.toLowerCase();

      if (code === 'ArrowUp' || key === 'w') {
        handleControlChange('up', true);
      } else if (code === 'ArrowDown' || key === 's') {
        handleControlChange('down', true);
      } else if (code === 'ArrowLeft' || key === 'a') {
        handleControlChange('left', true);
      } else if (code === 'ArrowRight' || key === 'd') {
        handleControlChange('right', true);
      } else if (code === 'Space' || key === ' ') {
        if (stateRef.current.status === 'playing' || stateRef.current.status === 'paused') {
          togglePause();
        } else if (stateRef.current.status === 'idle') {
          startGame();
        } else if (stateRef.current.status === 'gameover') {
          restartGame();
        }
      } else if (code === 'Enter') {
        if (stateRef.current.status === 'idle') {
          startGame();
        } else if (stateRef.current.status === 'gameover') {
          restartGame();
        }
      } else if (key === 'p' || code === 'Escape') {
        togglePause();
      } else if (key === 'm') {
        handleToggleSound();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key.toLowerCase();

      if (code === 'ArrowUp' || key === 'w') {
        handleControlChange('up', false);
      } else if (code === 'ArrowDown' || key === 's') {
        handleControlChange('down', false);
      } else if (code === 'ArrowLeft' || key === 'a') {
        handleControlChange('left', false);
      } else if (code === 'ArrowRight' || key === 'd') {
        handleControlChange('right', false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleControlChange, startGame, restartGame, togglePause, handleToggleSound]);

  // Handle container resizing smoothly
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      canvasRef.current.width = width * dpr;
      canvasRef.current.height = height * dpr;
      canvasRef.current.style.width = `${width}px`;
      canvasRef.current.style.height = `${height}px`;

      const st = stateRef.current;
      st.canvasWidth = width;
      st.canvasHeight = height;

      // Road geometry: Keep road centered with margins
      const maxRoadW = Math.min(width * 0.88, 380);
      st.roadWidth = maxRoadW;
      st.roadLeft = (width - maxRoadW) / 2;
      st.roadRight = st.roadLeft + maxRoadW;
      st.laneWidth = maxRoadW / ROAD_LANE_COUNT;

      // Clamp player within road if resized
      if (st.status === 'idle') {
        st.player.x = width / 2 - CAR_WIDTH / 2;
        st.player.y = height - CAR_HEIGHT - 60;
      } else {
        st.player.x = Math.max(st.roadLeft + 8, Math.min(st.player.x, st.roadRight - CAR_WIDTH - 8));
        st.player.y = Math.max(20, Math.min(st.player.y, height - CAR_HEIGHT - 20));
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Main game animation frame loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const st = stateRef.current;
      const ctrls = controlsRef.current;

      // UPDATE LOGIC (only when playing)
      if (st.status === 'playing') {
        // Player speed tuning
        const speedBoost = ctrls.up ? 1.5 : ctrls.down ? 0.6 : 1.0;
        const currentSpeed = (st.baseSpeed + (st.score / 60)) * speedBoost;

        // Speed in km/h for HUD display
        const displayKmh = Math.round(currentSpeed * 18);
        setSpeedKmh(displayKmh);
        sounds.updateEnginePitch(currentSpeed / 8, ctrls.up);

        // Road scroll offset
        st.roadOffsetY = (st.roadOffsetY + currentSpeed) % 80;

        // Move Player horizontally
        const steerSpeed = 6.2;
        let targetAngle = 0;

        if (ctrls.left) {
          st.player.vx = -steerSpeed;
          targetAngle = -0.15; // tilt left
        } else if (ctrls.right) {
          st.player.vx = steerSpeed;
          targetAngle = 0.15; // tilt right
        } else {
          st.player.vx *= 0.8;
          targetAngle = 0;
        }

        // Move Player vertically
        if (ctrls.up) {
          st.player.vy = -3.8;
        } else if (ctrls.down) {
          st.player.vy = 3.8;
        } else {
          st.player.vy *= 0.8;
        }

        // Apply velocities
        st.player.x += st.player.vx;
        st.player.y += st.player.vy;
        st.player.angle += (targetAngle - st.player.angle) * 0.2;

        // Keep Player inside the road bounds
        const minX = st.roadLeft + 8;
        const maxX = st.roadRight - CAR_WIDTH - 8;
        if (st.player.x < minX) {
          st.player.x = minX;
          st.player.vx = 0;
        }
        if (st.player.x > maxX) {
          st.player.x = maxX;
          st.player.vx = 0;
        }

        const minY = 20;
        const maxY = st.canvasHeight - CAR_HEIGHT - 16;
        if (st.player.y < minY) {
          st.player.y = minY;
          st.player.vy = 0;
        }
        if (st.player.y > maxY) {
          st.player.y = maxY;
          st.player.vy = 0;
        }

        // Player exhaust smoke/dust particles
        if (Math.random() < (ctrls.up ? 0.7 : 0.25)) {
          st.particles.push({
            x: st.player.x + CAR_WIDTH / 2 + (Math.random() * 12 - 6),
            y: st.player.y + CAR_HEIGHT,
            vx: (Math.random() - 0.5) * 1.5,
            vy: currentSpeed * 0.4 + Math.random() * 2,
            size: 3 + Math.random() * 4,
            color: ctrls.up ? '#60a5fa' : '#94a3b8',
            alpha: 0.7,
            life: 0,
            maxLife: 20 + Math.random() * 15,
          });
        }

        // Spawn Oncoming Red Enemy Cars
        // User requirement: "hammayag' dan birdaniga kelmasinu hamayg'dan kelsin o'rta chp ong dan kelsin"
        // 1. "birdaniga kelmasin": Never spawn cars too close vertically or side-by-side.
        // 2. "hammayag'dan kelsin": Rotate smoothly through all 3 lanes (chap, o'rta, o'ng).
        const spawnDelay = Math.max(900, 1500 - Math.min(st.score * 5, 500));
        const carsInUpperZone = st.enemies.filter((e) => e.y < 165);

        if (currentTime - st.lastSpawnTime > spawnDelay && carsInUpperZone.length === 0) {
          const lanes = [0, 1, 2]; // 0: Chap (Left), 1: O'rta (Middle), 2: O'ng (Right)
          const lastLane = st.laneHistory.length > 0 ? st.laneHistory[st.laneHistory.length - 1] : -1;

          // Never spawn in the exact same lane back-to-back (leaves natural reaction time)
          const candidateLanes = lanes.filter((l) => l !== lastLane);

          // Calculate how many times each lane was picked in the last 4 spawns
          const recentSpawns = st.laneHistory.slice(-4);
          const laneFrequency: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
          for (const l of recentSpawns) {
            laneFrequency[l] = (laneFrequency[l] || 0) + 1;
          }

          // Pick the candidate lane that has appeared least recently / least frequently
          candidateLanes.sort((a, b) => {
            const diff = laneFrequency[a] - laneFrequency[b];
            if (diff !== 0) return diff;
            return Math.random() - 0.5;
          });

          const lane = candidateLanes[0];
          st.laneHistory.push(lane);
          if (st.laneHistory.length > 12) {
            st.laneHistory.shift();
          }

          st.lastSpawnedLane = lane;
          const laneCenter = st.roadLeft + lane * st.laneWidth + st.laneWidth / 2;
          const enemyX = laneCenter - CAR_WIDTH / 2;

          // Consistent oncoming speed to prevent cars from catching up and bunching together
          const oncomingSpeed = 3.6 + Math.min(st.score * 0.03, 2.2) + (Math.random() * 0.4 - 0.2);
          const modelType = Math.floor(Math.random() * 3);

          st.enemies.push({
            id: st.nextEnemyId++,
            x: enemyX,
            y: -CAR_HEIGHT - 10,
            width: CAR_WIDTH,
            height: CAR_HEIGHT,
            speed: oncomingSpeed,
            lane,
            modelType,
          });
          st.lastSpawnTime = currentTime;
        }

        // Move and update Red Enemy Cars
        for (let i = st.enemies.length - 1; i >= 0; i--) {
          const enemy = st.enemies[i];
          // Moves downward because it's oncoming towards the blue car
          enemy.y += (enemy.speed + currentSpeed * 0.6);

          // Check if passed player cleanly -> score point
          if (enemy.y > st.player.y + CAR_HEIGHT && !st.passedCars.has(enemy.id)) {
            st.passedCars.add(enemy.id);
            st.score += 10;
            setScore(st.score);
            updateHighScore(st.score);
            sounds.playPass();
          }

          // Remove enemy cars that scrolled past bottom
          if (enemy.y > st.canvasHeight + 100) {
            st.enemies.splice(i, 1);
            continue;
          }

          // COLLISION DETECTION (Player Blue Car vs Oncoming Red Car)
          // Padding of 6px provides a fair hitbox
          const hitPadding = 6;
          const pLeft = st.player.x + hitPadding;
          const pRight = st.player.x + CAR_WIDTH - hitPadding;
          const pTop = st.player.y + hitPadding;
          const pBottom = st.player.y + CAR_HEIGHT - hitPadding;

          const eLeft = enemy.x + hitPadding;
          const eRight = enemy.x + CAR_WIDTH - hitPadding;
          const eTop = enemy.y + hitPadding;
          const eBottom = enemy.y + CAR_HEIGHT - hitPadding;

          if (pRight > eLeft && pLeft < eRight && pBottom > eTop && pTop < eBottom) {
            // Collision occurred!
            sounds.playCrash();

            // Trigger crash particles
            const crashX = (st.player.x + enemy.x) / 2 + CAR_WIDTH / 2;
            const crashY = (st.player.y + enemy.y) / 2 + CAR_HEIGHT / 2;

            for (let p = 0; p < 35; p++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = 2 + Math.random() * 8;
              st.particles.push({
                x: crashX,
                y: crashY,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                size: 2 + Math.random() * 6,
                color: Math.random() > 0.5 ? '#ef4444' : Math.random() > 0.5 ? '#3b82f6' : '#f59e0b',
                alpha: 1,
                life: 0,
                maxLife: 30 + Math.random() * 20,
              });
            }

            st.screenShake = 22;
            st.status = 'gameover';
            setGameStatus('gameover');
            updateHighScore(st.score);
            break;
          }
        }
      }

      // Update screen shake
      if (st.screenShake > 0) {
        st.screenShake -= 1;
        st.shakeX = (Math.random() - 0.5) * st.screenShake * 1.2;
        st.shakeY = (Math.random() - 0.5) * st.screenShake * 1.2;
      } else {
        st.shakeX = 0;
        st.shakeY = 0;
      }

      // Update particles
      for (let i = st.particles.length - 1; i >= 0; i--) {
        const p = st.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        p.alpha = 1 - p.life / p.maxLife;
        if (p.life >= p.maxLife) {
          st.particles.splice(i, 1);
        }
      }

      // DRAWING PASS
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, st.canvasWidth, st.canvasHeight);

      // Apply screen shake offset
      ctx.translate(st.shakeX, st.shakeY);

      // 1. Background / grass & shoulders
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, st.canvasWidth, st.canvasHeight);

      // Grass texture lines on sides
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, st.roadLeft, st.canvasHeight);
      ctx.fillRect(st.roadRight, 0, st.canvasWidth - st.roadRight, st.canvasHeight);

      // 2. Road Asphalt
      const roadGrad = ctx.createLinearGradient(st.roadLeft, 0, st.roadRight, 0);
      roadGrad.addColorStop(0, '#1a2233');
      roadGrad.addColorStop(0.5, '#1e293b');
      roadGrad.addColorStop(1, '#1a2233');
      ctx.fillStyle = roadGrad;
      ctx.fillRect(st.roadLeft, 0, st.roadWidth, st.canvasHeight);

      // 3. Curb rumble strips (red & white alternating curbs)
      const curbWidth = 10;
      const curbSegmentHeight = 24;
      const curbCount = Math.ceil(st.canvasHeight / curbSegmentHeight) + 2;

      for (let i = -1; i < curbCount; i++) {
        const curbY = i * curbSegmentHeight + (st.roadOffsetY % curbSegmentHeight);
        const isRed = (i + Math.floor(st.roadOffsetY / curbSegmentHeight)) % 2 === 0;
        ctx.fillStyle = isRed ? '#ef4444' : '#ffffff';

        // Left curb
        ctx.fillRect(st.roadLeft - curbWidth, curbY, curbWidth, curbSegmentHeight);
        // Right curb
        ctx.fillRect(st.roadRight, curbY, curbWidth, curbSegmentHeight);
      }

      // 4. White Solid Shoulder Edges
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(st.roadLeft, 0, 3, st.canvasHeight);
      ctx.fillRect(st.roadRight - 3, 0, 3, st.canvasHeight);

      // 5. Dashed Lane Lines
      const dashLength = 32;
      const gapLength = 28;
      const totalDashCycle = dashLength + gapLength;

      for (let laneIdx = 1; laneIdx < ROAD_LANE_COUNT; laneIdx++) {
        const laneX = st.roadLeft + laneIdx * st.laneWidth;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 3;
        ctx.setLineDash([dashLength, gapLength]);
        ctx.lineDashOffset = -st.roadOffsetY;

        ctx.beginPath();
        ctx.moveTo(laneX, 0);
        ctx.lineTo(laneX, st.canvasHeight);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 6. Draw Shadows first (for 3D depth)
      // Enemies shadows
      for (const enemy of st.enemies) {
        drawShadow(ctx, enemy.x, enemy.y, enemy.width, enemy.height);
      }
      // Player shadow
      drawShadow(ctx, st.player.x, st.player.y, CAR_WIDTH, CAR_HEIGHT, st.player.angle);

      // 7. Draw Oncoming Red Enemy Cars
      for (const enemy of st.enemies) {
        drawRedEnemyCar(ctx, enemy.x, enemy.y, enemy.width, enemy.height, enemy.modelType);
      }

      // 8. Draw Player Blue Car
      const isBraking = ctrls.down;
      const isAccelerating = ctrls.up;
      drawBluePlayerCar(
        ctx,
        st.player.x,
        st.player.y,
        CAR_WIDTH,
        CAR_HEIGHT,
        st.player.angle,
        isBraking,
        isAccelerating
      );

      // 9. Draw Particles (Smoke, Sparks, Crash fire)
      for (const p of st.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [updateHighScore]);

  return (
    <div
      id="car-play-app-wrapper"
      className="fixed inset-0 w-full h-full max-h-screen flex flex-col items-center justify-between bg-slate-950 overflow-hidden select-none touch-none"
    >
      {/* Top Navigation / Status Header - Sleek, compact and strictly non-scrollable */}
      <header
        id="car-play-header"
        className="w-full max-w-lg shrink-0 z-20 flex items-center justify-between px-3 h-11 bg-slate-900/90 backdrop-blur-md border-b border-slate-800"
      >
        {/* Brand */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="font-display font-black text-base sm:text-lg tracking-wider text-white">
            <span className="text-amber-400">AKMALOV</span> CAR <span className="text-blue-500">PLAY</span>
          </span>
        </div>

        {/* HUD Statistics */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Current Score */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Ochko:
            </span>
            <span className="font-display font-extrabold text-base text-blue-400 leading-none">
              {score}
            </span>
          </div>

          {/* High Score */}
          <div className="flex items-center gap-1 bg-slate-950/70 px-2 py-0.5 rounded-lg border border-amber-500/30">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span className="font-display font-bold text-xs text-amber-300">
              {highScore}
            </span>
          </div>

          {/* Speedometer */}
          <div className="hidden xs:flex items-center gap-1 bg-slate-950/70 px-2 py-0.5 rounded-lg border border-slate-700">
            <Gauge className="w-3 h-3 text-blue-400" />
            <span className="font-display font-semibold text-xs text-slate-300">
              {speedKmh} km/h
            </span>
          </div>

          {/* Pause Button */}
          {gameStatus === 'playing' && (
            <button
              id="btn-pause-game"
              type="button"
              onClick={togglePause}
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="To'xtatib turish"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}

          {gameStatus === 'paused' && (
            <button
              id="btn-resume-game"
              type="button"
              onClick={togglePause}
              className="p-1 rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
              title="Davom ettirish"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
            </button>
          )}

          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle-header"
            type="button"
            onClick={handleToggleSound}
            className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main Canvas Play Area - Automatically fills exact space between header and controls */}
      <main
        id="game-viewport"
        ref={containerRef}
        onClick={(e) => {
          // If user taps/clicks the empty canvas or viewport during gameplay, toggle pause
          if (e.target === canvasRef.current || e.target === containerRef.current) {
            if (stateRef.current.status === 'playing' || stateRef.current.status === 'paused') {
              togglePause();
            }
          }
        }}
        className="relative flex-1 min-h-0 w-full max-w-lg flex items-center justify-center overflow-hidden touch-none my-auto cursor-pointer"
        title="Bo'sh joy: Pauza / Davom ettirish"
      >
        <canvas
          id="game-canvas"
          ref={canvasRef}
          className="block w-full h-full shadow-2xl"
        />

        {/* Paused banner */}
        {gameStatus === 'paused' && (
          <div
            onClick={togglePause}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 p-5 rounded-2xl text-center shadow-xl max-w-xs w-full"
            >
              <h3 className="font-display text-2xl font-bold text-white mb-1">Tanaffus (Pauza)</h3>
              <p className="text-slate-400 text-xs mb-3">
                O'yin to'xtatildi. Bo'sh joy (Space) yoki tugmani bosing.
              </p>
              <button
                type="button"
                onClick={togglePause}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-sm transition-colors shadow-lg"
              >
                Davom ettirish (Space)
              </button>
            </div>
          </div>
        )}

        {/* Start / Game Over Overlays */}
        <GameOverlay
          status={gameStatus}
          score={score}
          highScore={highScore}
          onStart={startGame}
          onRestart={restartGame}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
        />
      </main>

      {/* On-Screen Touch Controls - Compact & firmly anchored within viewport */}
      <footer
        id="car-play-controls-footer"
        className="w-full max-w-lg shrink-0 z-20 bg-slate-950/95 border-t border-slate-900/90 py-1"
      >
        <OnScreenControls
          controls={activeControls}
          onControlChange={handleControlChange}
          disabled={gameStatus !== 'playing'}
        />
      </footer>
    </div>
  );
};
