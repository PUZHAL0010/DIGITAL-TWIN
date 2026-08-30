import React, { useState } from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { ViewMode3D, RenderingMode, WeatherPreset, MeasurementMode } from '../../types/simulation';
import { CameraControlsMenu } from './CameraControlsMenu';
import { 
  Menu, 
  Cpu, 
  Flame, 
  TrendingDown, 
  Zap, 
  Activity, 
  Navigation, 
  Eye, 
  FileText, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  SlidersHorizontal,
  Sun,
  Ruler,
  Terminal
} from 'lucide-react';

interface FloatingNavbarProps {
  onOpenReport: () => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({ onOpenReport }) => {
  const isPresentationMode = useSimulationStore(state => state.isPresentationMode);
  const togglePresentationMode = useSimulationStore(state => state.togglePresentationMode);
  const toggleNavDrawer = useSimulationStore(state => state.toggleNavDrawer);
  
  const viewMode3D = useSimulationStore(state => state.viewMode3D);
  const setViewMode3D = useSimulationStore(state => state.setViewMode3D);
  const renderingMode = useSimulationStore(state => state.renderingMode);
  const setRenderingMode = useSimulationStore(state => state.setRenderingMode);
  const isEngineeringMode = useSimulationStore(state => state.isEngineeringMode);
  const toggleEngineeringMode = useSimulationStore(state => state.toggleEngineeringMode);
  const showSimulationDebug = useSimulationStore(state => state.showSimulationDebug);
  const toggleSimulationDebug = useSimulationStore(state => state.toggleSimulationDebug);
  const weather = useSimulationStore(state => state.weather);
  const setWeather = useSimulationStore(state => state.setWeather);
  const measurementMode = useSimulationStore(state => state.measurementMode);
  const setMeasurementMode = useSimulationStore(state => state.setMeasurementMode);
  const resetSimulation = useSimulationStore(state => state.resetSimulation);
  const bridge = useSimulationStore(state => state.bridge);

  const [isWeatherMenuOpen, setIsWeatherMenuOpen] = useState(false);
  const [isMeasureMenuOpen, setIsMeasureMenuOpen] = useState(false);

  // PRESENTATION MODE: Ultra-minimal top floating ribbon
  if (isPresentationMode) {
    return (
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none select-none font-mono text-xs">
        {/* Top-Left Brand Mark */}
        <div className="flex items-center gap-2.5 bg-[#05070A]/85 backdrop-blur-xl border border-slate-800/80 px-3.5 py-1.5 rounded-2xl pointer-events-auto shadow-2xl">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Cpu size={14} />
          </div>
          <span className="font-extrabold text-white text-xs tracking-wider">CRYONEX</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
            PRESENTATION
          </span>
        </div>

        {/* Top-Right Live Controls & Camera Menu & Exit */}
        <div className="flex items-center gap-2 bg-[#05070A]/85 backdrop-blur-xl border border-slate-800/80 p-1 rounded-2xl pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE</span>
          </div>

          {/* Quick Camera Presets Dropdown */}
          <CameraControlsMenu />

          <button
            onClick={togglePresentationMode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-bold transition-all shadow-glow-cyan"
          >
            <Minimize2 size={12} />
            <span>Exit</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none select-none font-mono text-xs">
      {/* Left: Nav Drawer Trigger & Brand */}
      <div className="flex items-center gap-2 bg-[#05070A]/90 backdrop-blur-xl border border-slate-800/80 p-1 rounded-2xl pointer-events-auto shadow-2xl">
        <button
          onClick={toggleNavDrawer}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 transition-all"
          title="Open Navigation Drawer"
        >
          <Menu size={16} />
        </button>

        <div className="flex items-center gap-2 pr-3 pl-1">
          <span className="font-extrabold text-white text-xs tracking-wider">CRYONEX</span>
          <span className="text-[9px] text-slate-400 hidden sm:inline font-bold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
            {bridge.assetCode}
          </span>
          <span className="text-[8px] text-amber-400 font-bold px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 hidden lg:inline" title="Demonstration Digital Twin dataset with deterministic Euler-Bernoulli surrogate solver">
            DEMO DATASET • SURROGATE SOLVER
          </span>
        </div>
      </div>

      {/* Center: 3D View Modes & Rendering Modes */}
      <div className="hidden md:flex items-center gap-1 bg-[#05070A]/90 backdrop-blur-xl border border-slate-800/80 p-1 rounded-2xl pointer-events-auto shadow-2xl">
        {/* 3D Visual Modes */}
        {([
          { id: 'NORMAL', label: 'Twin', icon: <Eye size={12} /> },
          { id: 'STRESS', label: 'Stress', icon: <Flame size={12} /> },
          { id: 'DEFORMATION', label: 'Deform', icon: <TrendingDown size={12} /> },
          { id: 'DAMAGE', label: 'Damage', icon: <Zap size={12} /> },
          { id: 'RISK', label: 'Risk', icon: <Activity size={12} /> },
          { id: 'LOAD_PATH', label: 'Load Path', icon: <Navigation size={12} /> },
        ] as { id: ViewMode3D; label: string; icon: React.ReactNode }[]).map((mode) => {
          const isActive = viewMode3D === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setViewMode3D(mode.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          );
        })}

        {/* Rendering Modes Divider */}
        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Rendering Modes */}
        {(['HYBRID', 'SOLID', 'WIREFRAME'] as RenderingMode[]).map((rm) => (
          <button
            key={rm}
            onClick={() => setRenderingMode(rm)}
            className={`px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all ${
              renderingMode === rm
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {rm}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Camera Angles & Orbit Dropdown */}
        <CameraControlsMenu />
      </div>

      {/* Right: Presentation Toggle, Weather, Measurement, Eng Mode, Report, Reset */}
      <div className="flex items-center gap-1.5 bg-[#05070A]/90 backdrop-blur-xl border border-slate-800/80 p-1 rounded-2xl pointer-events-auto shadow-2xl">
        {/* Presentation Mode Button */}
        <button
          onClick={togglePresentationMode}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 text-[11px] font-extrabold shadow-glow-cyan hover:opacity-95 transition-all"
          title="Switch to Fullscreen 3D Presentation Mode"
        >
          <Maximize2 size={12} />
          <span>PRESENT</span>
        </button>

        {/* Weather Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setIsWeatherMenuOpen(!isWeatherMenuOpen);
              setIsMeasureMenuOpen(false);
            }}
            className={`p-1.5 rounded-xl border transition-all ${
              weather !== 'CLEAR_NOON'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Environment Weather & Daylight Lighting"
          >
            <Sun size={14} />
          </button>

          {isWeatherMenuOpen && (
            <div className="absolute top-9 right-0 w-36 bg-[#05070A]/95 backdrop-blur-2xl border border-slate-800 rounded-xl p-1.5 shadow-2xl z-50 text-[10px] space-y-1">
              {[
                { id: 'CLEAR_NOON', label: 'Clear Noon' },
                { id: 'GOLDEN_HOUR', label: 'Golden Hour' },
                { id: 'OVERCAST', label: 'Overcast' },
                { id: 'RAIN', label: 'Rain' },
                { id: 'FOG', label: 'Fog' },
                { id: 'NIGHT', label: 'Night' },
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    setWeather(w.id as WeatherPreset);
                    setIsWeatherMenuOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1 rounded-lg transition-colors ${
                    weather === w.id ? 'bg-cyan-500 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3D Measurement Tool Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setIsMeasureMenuOpen(!isMeasureMenuOpen);
              setIsWeatherMenuOpen(false);
            }}
            className={`p-1.5 rounded-xl border transition-all ${
              measurementMode !== 'NONE'
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="3D Engineering Measurement Tools"
          >
            <Ruler size={14} />
          </button>

          {isMeasureMenuOpen && (
            <div className="absolute top-9 right-0 w-44 bg-[#05070A]/95 backdrop-blur-2xl border border-slate-800 rounded-xl p-1.5 shadow-2xl z-50 text-[10px] space-y-1">
              {[
                { id: 'NONE', label: 'Off / Hide' },
                { id: 'SPAN', label: 'Span Lengths (48m)' },
                { id: 'DISTANCE', label: 'Nav Clearance (4.1m)' },
                { id: 'CRACK', label: 'Crack Width & Depth' },
                { id: 'DEFLECTION', label: 'Midspan Live Deflection' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMeasurementMode(m.id as MeasurementMode);
                    setIsMeasureMenuOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1 rounded-lg transition-colors ${
                    measurementMode === m.id ? 'bg-cyan-500 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Engineering Mode Toggle */}
        <button
          onClick={toggleEngineeringMode}
          className={`p-1.5 rounded-xl border transition-all ${
            isEngineeringMode
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Engineering Telemetry Overlay"
        >
          <SlidersHorizontal size={14} />
        </button>

        {/* Physics Debug Telemetry Toggle */}
        <button
          onClick={toggleSimulationDebug}
          className={`p-1.5 rounded-xl border transition-all ${
            showSimulationDebug
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Physics Simulation Debug Telemetry"
        >
          <Terminal size={14} />
        </button>

        {/* Export Report */}
        <button
          onClick={onOpenReport}
          className="p-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          title="Generate Simulation Assessment Report"
        >
          <FileText size={14} />
        </button>

        {/* Global Reset */}
        <button
          onClick={resetSimulation}
          className="p-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          title="Reset All Parameters to Baseline"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};
