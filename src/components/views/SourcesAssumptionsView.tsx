import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { BookOpen, ArrowRight, ShieldCheck, Code, FileText, CheckCircle2 } from 'lucide-react';

export const SourcesAssumptionsView: React.FC = () => {
  const setActiveView = useSimulationStore(state => state.setActiveView);

  return (
    <div className="absolute inset-0 bg-[#050608]/95 backdrop-blur-2xl z-20 overflow-y-auto p-6 text-slate-200 font-mono select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight uppercase">
                Physics Assumptions, Equations & Literature Citations
              </h1>
              <p className="text-xs text-slate-400">
                Transparent documentation of physical equations, engineering codes, and literature grounding.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('DIGITAL_TWIN')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-glow-cyan"
          >
            <span>Back to 3D Twin</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Governing Mathematical Formulations */}
        <div className="p-5 rounded-2xl bg-[#0B0F14] border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Code size={14} className="text-cyan-400" />
            <span>Governing Physics Equations</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span className="font-bold text-white block">1. Flexural Deflection (Euler-Bernoulli)</span>
              <code className="text-cyan-300 block text-[11px] font-bold">
                δ_max = (5·w·L⁴) / (384·E·I) + (P·L³) / (48·E·I_eff)
              </code>
              <p className="text-[10px] text-slate-400">
                Calculates distributed dead-load and moving vehicle point-load midspan displacement.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span className="font-bold text-white block">2. Linear Elastic Fracture Mechanics (LEFM)</span>
              <code className="text-cyan-300 block text-[11px] font-bold">
                K_I = Y · σ · √(π · a)
              </code>
              <p className="text-[10px] text-slate-400">
                Evaluates stress intensity factor at crack tip compared against concrete critical toughness K_Ic = 2.2 MPa√m.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span className="font-bold text-white block">3. Chloride Diffusion (Fick's 2nd Law)</span>
              <code className="text-cyan-300 block text-[11px] font-bold">
                x_d = 2 · √(D_app · t)
              </code>
              <p className="text-[10px] text-slate-400">
                Models marine atmospheric chloride penetration leading to rebar depassivation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span className="font-bold text-white block">4. Dynamic Amplification Factor (DAF)</span>
              <code className="text-cyan-300 block text-[11px] font-bold">
                P_dynamic = P_static · (1 + DAF)
              </code>
              <p className="text-[10px] text-slate-400">
                Simulates dynamic impact and surface roughness vibration from moving heavy freight axles.
              </p>
            </div>
          </div>
        </div>

        {/* Structural Design Codes Cited */}
        <div className="p-5 rounded-2xl bg-[#0B0F14] border border-slate-800 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Referenced Structural Engineering Codes & Standards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="font-bold text-white">AASHTO LRFD Bridge Design</div>
              <div className="text-slate-400 text-[10px] mt-1">
                Deflection limit states (L/800), dynamic load allowance (IM = 33%), and load combination factors.
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="font-bold text-white">Eurocode 2 & 3 (EN 1992 / EN 1993)</div>
              <div className="text-slate-400 text-[10px] mt-1">
                Concrete crack width limitations (w_max = 0.3mm), steel fatigue verification, and section loss.
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="font-bold text-white">IRC:112-2020 / IS 456</div>
              <div className="text-slate-400 text-[10px] mt-1">
                Indian Road Congress code for concrete road bridges, durability in severe marine environments.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
