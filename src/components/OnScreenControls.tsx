import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { ControlState } from '../types';

interface OnScreenControlsProps {
  controls: ControlState;
  onControlChange: (key: keyof ControlState, active: boolean) => void;
  disabled?: boolean;
}

export const OnScreenControls: React.FC<OnScreenControlsProps> = ({
  controls,
  onControlChange,
  disabled = false,
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handlePointer = (key: keyof ControlState, active: boolean) => (e: React.PointerEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (active) triggerHaptic();
    onControlChange(key, active);
  };

  return (
    <div
      id="car-play-touch-controls"
      className="w-full select-none touch-none flex items-center justify-between px-3 py-1 max-w-md mx-auto"
    >
      {/* Left/Right Direction Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          id="btn-steer-left"
          aria-label="Chapga burilish"
          onPointerDown={handlePointer('left', true)}
          onPointerUp={handlePointer('left', false)}
          onPointerLeave={handlePointer('left', false)}
          onPointerCancel={handlePointer('left', false)}
          onContextMenu={(e) => e.preventDefault()}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center font-bold transition-all active:scale-95 touch-none border ${
            controls.left
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.7)] scale-95 border-blue-400'
              : 'bg-slate-900/85 hover:bg-slate-800 text-slate-200 border-slate-700/80 shadow backdrop-blur-md'
          }`}
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
          <span className="text-[9px] tracking-wider uppercase text-slate-400 leading-none">Chap</span>
        </button>

        <button
          type="button"
          id="btn-steer-right"
          aria-label="O'ngga burilish"
          onPointerDown={handlePointer('right', true)}
          onPointerUp={handlePointer('right', false)}
          onPointerLeave={handlePointer('right', false)}
          onPointerCancel={handlePointer('right', false)}
          onContextMenu={(e) => e.preventDefault()}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center font-bold transition-all active:scale-95 touch-none border ${
            controls.right
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.7)] scale-95 border-blue-400'
              : 'bg-slate-900/85 hover:bg-slate-800 text-slate-200 border-slate-700/80 shadow backdrop-blur-md'
          }`}
        >
          <ArrowRight className="w-6 h-6" strokeWidth={2.5} />
          <span className="text-[9px] tracking-wider uppercase text-slate-400 leading-none">O'ng</span>
        </button>
      </div>

      {/* Up/Down Speed & Brake Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          id="btn-steer-down"
          aria-label="Tormoz / Pastga"
          onPointerDown={handlePointer('down', true)}
          onPointerUp={handlePointer('down', false)}
          onPointerLeave={handlePointer('down', false)}
          onPointerCancel={handlePointer('down', false)}
          onContextMenu={(e) => e.preventDefault()}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center font-bold transition-all active:scale-95 touch-none border ${
            controls.down
              ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.7)] scale-95 border-amber-400'
              : 'bg-slate-900/85 hover:bg-slate-800 text-slate-200 border-slate-700/80 shadow backdrop-blur-md'
          }`}
        >
          <ArrowDown className="w-6 h-6" strokeWidth={2.5} />
          <span className="text-[9px] tracking-wider uppercase text-slate-400 leading-none">Past</span>
        </button>

        <button
          type="button"
          id="btn-steer-up"
          aria-label="Tezlanish / Tepaga"
          onPointerDown={handlePointer('up', true)}
          onPointerUp={handlePointer('up', false)}
          onPointerLeave={handlePointer('up', false)}
          onPointerCancel={handlePointer('up', false)}
          onContextMenu={(e) => e.preventDefault()}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center font-bold transition-all active:scale-95 touch-none border ${
            controls.up
              ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.7)] scale-95 border-emerald-400'
              : 'bg-slate-900/85 hover:bg-slate-800 text-slate-200 border-slate-700/80 shadow backdrop-blur-md'
          }`}
        >
          <ArrowUp className="w-6 h-6" strokeWidth={2.5} />
          <span className="text-[9px] tracking-wider uppercase text-emerald-400 font-semibold leading-none">Tepa</span>
        </button>
      </div>
    </div>
  );
};
