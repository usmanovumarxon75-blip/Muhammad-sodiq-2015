import React from 'react';
import { Play, RotateCcw, Trophy, Smartphone, Laptop, Zap, Volume2, VolumeX } from 'lucide-react';
import { GameStatus } from '../types';

interface GameOverlayProps {
  status: GameStatus;
  score: number;
  highScore: number;
  onStart: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  status,
  score,
  highScore,
  onStart,
  onRestart,
  isMuted,
  onToggleSound,
}) => {
  if (status === 'playing') return null;

  return (
    <div
      id="game-overlay-container"
      className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      {/* Sound toggle top right */}
      <button
        id="btn-toggle-sound-overlay"
        onClick={onToggleSound}
        className="absolute top-4 right-4 p-3 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 shadow-md transition-colors"
        title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
        type="button"
      >
        {isMuted ? <VolumeX className="w-6 h-6 text-red-400" /> : <Volume2 className="w-6 h-6 text-emerald-400" />}
      </button>

      {/* START SCREEN (CAR PLAY in the center) */}
      {status === 'idle' && (
        <div
          id="start-screen-card"
          className="max-w-xs sm:max-w-md w-full bg-slate-900/95 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-[0_0_50px_rgba(37,99,235,0.25)] flex flex-col items-center my-auto"
        >
          {/* Visual icon badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold mb-2 sm:mb-3 tracking-wider uppercase">
            <Zap className="w-3 h-3 fill-amber-400" /> AKMALOV MAXSUS VERSIYASI
          </div>

          {/* Centered Game Name: AKMALOV CAR PLAY */}
          <h1
            id="game-title"
            className="font-display text-3xl sm:text-5xl font-black tracking-wider text-white drop-shadow-[0_4px_12px_rgba(37,99,235,0.8)] mb-1"
          >
            <span className="text-amber-400 block sm:inline sm:mr-2">AKMALOV</span>CAR <span className="text-blue-500">PLAY</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm mb-3 sm:mb-4 max-w-xs leading-relaxed">
            Ko'k mashinani boshqaring va <span className="text-red-400 font-semibold">qizil mashinalardan</span> chaqqonlik bilan qoching!
          </p>

          {/* Visual preview badges */}
          <div className="w-full flex items-center justify-center gap-2 sm:gap-3 py-2 px-3 bg-slate-950/60 rounded-xl border border-slate-800 mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-200">Siz (Ko'k)</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-200">Raqib (Qizil)</span>
            </div>
          </div>

          {/* Start Button */}
          <button
            id="btn-start-game"
            onClick={onStart}
            type="button"
            className="w-full py-3 sm:py-3.5 px-6 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold font-display text-lg sm:text-xl tracking-wider shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-blue-400/40 mb-3"
          >
            <Play className="w-5 h-5 fill-white" />
            O'YINNI BOSHLASH
          </button>

          {/* Control hints */}
          <div className="text-slate-400 text-[11px] flex flex-col gap-0.5 text-center">
            <span>Telefonda: <b>Chap, O'ng, Tepa, Past</b> | Ekranni bosish: <b>Pauza</b></span>
            <span className="hidden sm:inline text-slate-500">Kompda: <b>W, A, S, D</b> | <b>Bo'sh joy (Space)</b>: Pauza</span>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN ("O'yin tugadi" centered) */}
      {status === 'gameover' && (
        <div
          id="gameover-screen-card"
          className="max-w-xs sm:max-w-md w-full bg-slate-900/95 border border-red-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-[0_0_60px_rgba(239,68,68,0.35)] flex flex-col items-center animate-in zoom-in-95 duration-200 my-auto"
        >
          {/* Title explicitly requested: "O'yin tugadi" */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 mb-2 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <span className="text-2xl">💥</span>
          </div>

          <h2
            id="gameover-title"
            className="font-display text-3xl sm:text-4xl font-black tracking-wider text-red-500 mb-1 drop-shadow-[0_2px_10px_rgba(239,68,68,0.6)]"
          >
            O'YIN TUGADI
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4">
            Qizil mashina bilan to'qnashuv yuz berdi!
          </p>

          {/* Scores breakdown */}
          <div className="w-full grid grid-cols-2 gap-2 sm:gap-3 mb-4">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-0.5">
                Ochko
              </span>
              <span className="font-display text-2xl sm:text-3xl font-black text-white">
                {score}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-500/30 text-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-0.5">
                <Trophy className="w-3 h-3" /> Rekord
              </div>
              <span className="font-display text-2xl sm:text-3xl font-black text-amber-300">
                {highScore}
              </span>
              {score >= highScore && score > 0 && (
                <span className="absolute top-1 right-1 text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded-full font-bold">
                  YANGI!
                </span>
              )}
            </div>
          </div>

          {/* Play Again Button */}
          <button
            id="btn-restart-game"
            onClick={onRestart}
            type="button"
            className="w-full py-3 sm:py-3.5 px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-98 text-white font-bold font-display text-lg sm:text-xl tracking-wider shadow-[0_0_30px_rgba(225,29,72,0.5)] flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-rose-400/40"
          >
            <RotateCcw className="w-5 h-5" />
            QAYTA O'YNASH
          </button>
        </div>
      )}
    </div>
  );
};
