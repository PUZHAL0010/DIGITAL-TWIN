import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { CameraPreset } from '../../types/simulation';
import { 
  Camera, 
  ChevronDown, 
  RotateCw, 
  Play, 
  Pause, 
  Compass, 
  Crosshair, 
  RotateCcw,
  Navigation,
  Sparkles
} from 'lucide-react';

export const CameraControlsMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const cameraPreset = useSimulationStore(state => state.cameraPreset);
  const setCameraPreset = useSimulationStore(state => state.setCameraPreset);
  const resetCamera = useSimulationStore(state => state.resetCamera);
  const focusComponent = useSimulationStore(state => state.focusComponent);
  const auto360Config = useSimulationStore(state => state.auto360Config);
  const toggleAuto360 = useSimulationStore(state => state.toggleAuto360);
  const setAuto360Speed = useSimulationStore(state => state.setAuto360Speed);
  const toggleAuto360Direction = useSimulationStore(state => state.toggleAuto360Direction);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const presetLabels: Record<CameraPreset, string> = {
    DEFAULT: 'ISOMETRIC',
    ISOMETRIC: 'ISOMETRIC (7)',
    TOP: 'TOP (5)',
    BOTTOM: 'BOTTOM (6)',
    FRONT: 'FRONT (1)',
    BACK: 'BACK (2)',
    LEFT: 'LEFT (3)',
    RIGHT: 'RIGHT (4)',
    UNDER_DECK: 'UNDER-DECK (8)',
    UNDER_BRIDGE: 'UNDER-BRIDGE',
    WATER_LEVEL: 'WATER LEVEL',
    UNDERWATER: 'UNDERWATER (9)',
    FREE: 'FREE ORBIT (0)',
    AUTO_360: '360° ORBIT',
    DRONE_INSPECTION: 'DRONE FLIGHT',
    COMPONENT: 'FOCUS COMP (F)',
    CINEMATIC: 'CINEMATIC',
  };

  const handleSelect = (preset: CameraPreset) => {
    setCameraPreset(preset);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-bold transition-all shadow-sm"
        title="Quick 3D Camera Angles & Orbit Controls"
      >
        <Camera size={13} className="text-cyan-400" />
        <span className="truncate max-w-[110px]">
          {presetLabels[cameraPreset] || 'CAMERA'}
        </span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-9 left-0 sm:right-0 sm:left-auto w-64 bg-[#05070A]/95 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-3 shadow-2xl z-50 text-slate-200 font-mono text-xs select-none animate-in fade-in zoom-in-95 duration-150 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-[10px] font-bold text-slate-400 uppercase">
            <span>Camera Angles & Orbit</span>
            <span className="text-cyan-400">Keys 1–0</span>
          </div>

          {/* Group 1: Standard Engineering Views */}
          <div className="space-y-1">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider px-1">
              Standard Views
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => handleSelect('ISOMETRIC')}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] transition-colors ${
                  cameraPreset === 'ISOMETRIC' || cameraPreset === 'DEFAULT'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>Isometric</span>
                <span className="text-[9px] opacity-70">7</span>
              </button>

              <button
                onClick={() => handleSelect('TOP')}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] transition-colors ${
                  cameraPreset === 'TOP'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>Top Plan</span>
                <span className="text-[9px] opacity-70">5</span>
              </button>

              <button
                onClick={() => handleSelect('FRONT')}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] transition-colors ${
                  cameraPreset === 'FRONT'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>Front</span>
                <span className="text-[9px] opacity-70">1</span>
              </button>

              <button
                onClick={() => handleSelect('BACK')}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] transition-colors ${
                  cameraPreset === 'BACK'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>Back</span>
                <span className="text-[9px] opacity-70">2</span>
              </button>

              <button
                onClick={() => handleSelect('LEFT')}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] transition-colors ${
                  cameraPreset === 'LEFT'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>Left (West)</span>
                <span className="text-[9px] opacity-70">3</span>
              </button>

              <button
                onClick={() => handleSelect('RIGHT')}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] transition-colors ${
                  cameraPreset === 'RIGHT'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>Right (East)</span>
                <span className="text-[9px] opacity-70">4</span>
              </button>
            </div>
          </div>

          {/* Group 2: Structural & Environmental Under-Deck */}
          <div className="space-y-1">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider px-1">
              Structural & Environmental
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => handleSelect('UNDER_DECK')}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] transition-colors ${
                  cameraPreset === 'UNDER_DECK'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                }`}
                title="Inspect girders and cross beams below deck"
              >
                <span>Under-Deck</span>
                <span className="text-[9px] opacity-70">8</span>
              </button>

              <button
                onClick={() => handleSelect('BOTTOM')}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] transition-colors ${
                  cameraPreset === 'BOTTOM'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                }`}
                title="Look directly straight up at deck underside"
              >
                <span>Bottom Up</span>
                <span className="text-[9px] opacity-70">6</span>
              </button>

              <button
                onClick={() => handleSelect('WATER_LEVEL')}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] transition-colors ${
                  cameraPreset === 'WATER_LEVEL'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>Water Level</span>
              </button>

              <button
                onClick={() => handleSelect('UNDERWATER')}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] transition-colors ${
                  cameraPreset === 'UNDERWATER'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                }`}
                title="Submerge camera to view piles & scour hole"
              >
                <span>Underwater</span>
                <span className="text-[9px] opacity-70">9</span>
              </button>
            </div>
          </div>

          {/* Group 3: Automated Modes (Drone Inspection & 360 Turntable) */}
          <div className="space-y-1.5">
            <button
              onClick={() => handleSelect('DRONE_INSPECTION')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                cameraPreset === 'DRONE_INSPECTION'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-glow-cyan'
                  : 'bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border-cyan-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Navigation size={13} className={cameraPreset === 'DRONE_INSPECTION' ? 'text-slate-950' : 'text-cyan-400'} />
                <span>Simulated Drone Inspection Flight</span>
              </div>
              <Sparkles size={11} />
            </button>

            {/* 360° Automated Turntable Orbit */}
            <div className="p-2 rounded-xl bg-[#080B10] border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white flex items-center gap-1.5">
                  <RotateCw size={11} className="text-cyan-400" />
                  <span>360° Turntable</span>
                </span>
                <button
                  onClick={() => toggleAuto360()}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                    cameraPreset === 'AUTO_360' && auto360Config.isPlaying
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-cyan-500 text-slate-950'
                  }`}
                >
                  {cameraPreset === 'AUTO_360' && auto360Config.isPlaying ? (
                    <>
                      <Pause size={10} />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={10} />
                      <span>Start 360°</span>
                    </>
                  )}
                </button>
              </div>

              {cameraPreset === 'AUTO_360' && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                  <button
                    onClick={toggleAuto360Direction}
                    className="text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <RotateCw size={10} />
                    <span>{auto360Config.direction === 1 ? 'CW' : 'CCW'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {[0.5, 1.0, 2.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setAuto360Speed(spd)}
                        className={`px-1.5 py-0.2 rounded font-bold ${
                          auto360Config.speed === spd
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'text-slate-500 hover:text-white'
                        }`}
                      >
                        {spd}×
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Group 4: Free Orbit & Reset */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
            <button
              onClick={() => handleSelect('FREE')}
              className="flex items-center gap-1 text-slate-400 hover:text-white"
            >
              <Compass size={12} />
              <span>Free (0)</span>
            </button>

            <button
              onClick={() => {
                focusComponent();
                setIsOpen(false);
              }}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              <Crosshair size={12} />
              <span>Focus (F)</span>
            </button>

            <button
              onClick={() => {
                resetCamera();
                setIsOpen(false);
              }}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300"
            >
              <RotateCcw size={12} />
              <span>Reset (R)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
