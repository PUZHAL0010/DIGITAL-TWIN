import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { ActiveAppView } from '../../types/simulation';
import { 
  X,
  Boxes, 
  History, 
  Sliders, 
  Zap, 
  Sparkles, 
  LineChart, 
  Radio,
  Wrench, 
  Database, 
  CheckCircle2, 
  BookOpen, 
  PlaySquare,
  Cpu
} from 'lucide-react';

export const NavDrawer: React.FC = () => {
  const isNavDrawerOpen = useSimulationStore(state => state.isNavDrawerOpen);
  const setNavDrawer = useSimulationStore(state => state.setNavDrawer);
  const activeView = useSimulationStore(state => state.activeView);
  const setActiveView = useSimulationStore(state => state.setActiveView);
  const startDemo = useSimulationStore(state => state.startDemo);

  const navItems: { id: ActiveAppView; label: string; icon: React.ReactNode }[] = [
    { id: 'DIGITAL_TWIN', label: 'Digital Twin', icon: <Boxes size={16} /> },
    { id: 'HISTORICAL_CASE', label: 'Historical Case', icon: <History size={16} /> },
    { id: 'SIMULATION', label: 'Simulation', icon: <Sliders size={16} /> },
    { id: 'DAMAGE', label: 'Damage Mechanics', icon: <Zap size={16} /> },
    { id: 'WHAT_IF', label: 'What-If Engine', icon: <Sparkles size={16} /> },
    { id: 'ANALYTICS', label: 'Analytics', icon: <LineChart size={16} /> },
    { id: 'SENSORS', label: 'IoT Sensors & SHM', icon: <Radio size={16} /> },
    { id: 'MAINTENANCE', label: 'Intervention Window', icon: <Wrench size={16} /> },
    { id: 'ENGINEERING_DATA', label: 'Engineering Data', icon: <Database size={16} /> },
    { id: 'VALIDATION', label: 'Validation', icon: <CheckCircle2 size={16} /> },
    { id: 'SOURCES', label: 'Sources & Assumptions', icon: <BookOpen size={16} /> },
    { id: 'DEMO_MODE', label: 'Demo Tour', icon: <PlaySquare size={16} /> },
  ];

  if (!isNavDrawerOpen) return null;

  return (
    <>
      {/* Translucent Backdrop */}
      <div
        onClick={() => setNavDrawer(false)}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Slim Drawer Panel */}
      <div className="fixed top-0 left-0 bottom-0 w-64 z-50 bg-[#05070A]/95 backdrop-blur-2xl border-r border-slate-800/80 p-4 flex flex-col justify-between shadow-2xl font-mono text-xs select-none animate-in slide-in-from-left duration-200">
        <div>
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Cpu size={16} />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm tracking-wider">CRYONEX</span>
                <div className="text-[9px] text-slate-400">SIH26158 Digital Twin</div>
              </div>
            </div>

            <button
              onClick={() => setNavDrawer(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setNavDrawer(false);
                    if (item.id === 'DEMO_MODE') startDemo();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold shadow-glow-cyan'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="p-2.5 rounded-xl bg-[#080B10] border border-slate-800 text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between text-slate-200 font-bold">
            <span>ENGINE: SIH26158</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>SI Deterministic Mechanics</div>
        </div>
      </div>
    </>
  );
};
