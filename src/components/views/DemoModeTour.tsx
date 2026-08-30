import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { 
  PlaySquare, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  Cpu, 
  Flame, 
  Navigation, 
  Zap, 
  History, 
  Wrench, 
  Sparkles, 
  ShieldAlert, 
  Ship,
  Waves,
  Anchor,
  TrendingDown,
  RotateCcw,
  Activity
} from 'lucide-react';

export const DemoModeTour: React.FC = () => {
  const isDemoPlaying = useSimulationStore(state => state.isDemoPlaying);
  const demoStepIndex = useSimulationStore(state => state.demoStepIndex);
  const nextDemoStep = useSimulationStore(state => state.nextDemoStep);
  const prevDemoStep = useSimulationStore(state => state.prevDemoStep);
  const stopDemo = useSimulationStore(state => state.stopDemo);
  const setActiveView = useSimulationStore(state => state.setActiveView);
  const setViewMode3D = useSimulationStore(state => state.setViewMode3D);
  const setCameraPreset = useSimulationStore(state => state.setCameraPreset);
  const setRenderingMode = useSimulationStore(state => state.setRenderingMode);
  const runScenario = useSimulationStore(state => state.runScenario);
  const triggerFailureSimulation = useSimulationStore(state => state.triggerFailureSimulation);
  const resetSimulation = useSimulationStore(state => state.resetSimulation);

  if (!isDemoPlaying) return null;

  const demoSteps = [
    {
      title: '1. Healthy Baseline (2026)',
      subtitle: 'Living 3D Digital Twin Platform (SIH26158)',
      icon: <Cpu size={20} className="text-cyan-400" />,
      content: 'CRYONEX establishes a living 3D Digital Twin of bridge infrastructure in Year 2026 (Health: 92%, Demand/Capacity: 0.35, FoS: 2.85). All components represent real PBR assets.',
      actionText: 'Inspect 360° Baseline',
      onEnter: () => {
        resetSimulation();
        setActiveView('DIGITAL_TWIN');
        setViewMode3D('NORMAL');
        setRenderingMode('HYBRID');
        setCameraPreset('ISOMETRIC');
      },
    },
    {
      title: '2. Structural Wireframe Topology',
      subtitle: 'Internal Finite Element Grid Discretization',
      icon: <Cpu size={20} className="text-cyan-400" />,
      content: 'Switching to Wireframe Mode exposes the underlying structural mesh discretization and topological geometry of deck slabs, girders, piers, and caisson footings.',
      actionText: 'Examine Structural Mesh',
      onEnter: () => {
        setActiveView('DIGITAL_TWIN');
        setRenderingMode('WIREFRAME');
        setCameraPreset('DEFAULT');
      },
    },
    {
      title: '3. What-If Scenario Selection',
      subtitle: 'Ship / Vessel Navigation Channel Collision',
      icon: <Ship size={20} className="text-red-400" />,
      content: 'Selecting the Ship Collision scenario launches a 3,500-tonne navigation cargo vessel traversing the water channel towards Pier P-03 at 12 km/h (Kinetic Energy: 19.4 MJ).',
      actionText: 'Load Ship Collision Scenario',
      onEnter: () => {
        runScenario('SHIP_COLLISION');
        setRenderingMode('HYBRID');
        setCameraPreset('WATER_LEVEL');
      },
    },
    {
      title: '4. Kinetic Vessel Impact',
      subtitle: 'Energy Transfer into Pier P-03 Column Base',
      icon: <Zap size={20} className="text-red-400" />,
      content: 'The vessel collides with the column base of Pier P-03. Massive lateral shear force exceeds the concrete diagonal shear capacity, fracturing the column.',
      actionText: 'Simulate Vessel Impact',
      onEnter: () => {
        triggerFailureSimulation('SHIP_COLLISION', 'pier-p3', '3,500t Vessel Kinetic Impact & Pier Column Shear Fracture');
        setCameraPreset('CINEMATIC');
      },
    },
    {
      title: '5. Deck Rotational Fall & Vehicle Response',
      subtitle: 'Gravity Dynamics (g = 9.81 m/s²)',
      icon: <TrendingDown size={20} className="text-amber-400" />,
      content: 'With Pier P-03 sheared, Deck Span 3 rotates and falls under gravity into the water. Moving freight vehicles on that span lose support, tilt with the slab, and fall under gravity.',
      actionText: 'Observe Gravity Collapse',
      onEnter: () => {
        setCameraPreset('FRONT');
      },
    },
    {
      title: '6. Post-Failure Equilibrium & Timeline Freeze',
      subtitle: 'Timeline Stops & Freezes at Failure Year',
      icon: <Activity size={20} className="text-red-400" />,
      content: 'Once the structure reaches post-failure equilibrium, the timeline advances no further and freezes permanently at the failure year. All critical telemetry is locked.',
      actionText: 'Inspect Frozen Equilibrium',
      onEnter: () => {
        setCameraPreset('UNDER_DECK');
      },
    },
    {
      title: '7. Complete Clean Restore',
      subtitle: 'Zero Page Reload State Reset',
      icon: <RotateCcw size={20} className="text-amber-400" />,
      content: 'Clicking Restore Bridge instantly returns all geometry, rigid bodies, vehicle positions, ship state, water bathymetry, and timeline back to the clean 2026 baseline.',
      actionText: 'Restore Clean Baseline',
      onEnter: () => {
        resetSimulation();
        setCameraPreset('ISOMETRIC');
      },
    },
    {
      title: '8. Differentiated Scenarios (e.g. Scour)',
      subtitle: 'Unique Engineering Mechanisms & 3D Kinematics',
      icon: <Anchor size={20} className="text-sky-400" />,
      content: 'Every scenario in CRYONEX produces a completely different physical failure: Hydraulic Scour excavates a 2.8m riverbed crater, causing Footing F-03 to tilt 15° and decks to slide sideways.',
      actionText: 'Explore Scour Scenario',
      onEnter: () => {
        runScenario('SCOUR');
        setCameraPreset('UNDERWATER');
      },
    },
    {
      title: '9. Predictive Maintenance Interventions',
      subtitle: 'Preventing Failure Before the Limit State',
      icon: <Wrench size={20} className="text-emerald-400" />,
      content: 'Applying CFRP wrapping, epoxy injection, and cable replacements restores capacity (+35%) and extends the service life beyond 2076, avoiding failure altogether.',
      actionText: 'Open Maintenance Interventions',
      onEnter: () => {
        setActiveView('MAINTENANCE');
      },
    },
  ];

  const currentStep = demoSteps[demoStepIndex] || demoSteps[0];

  const handleNext = () => {
    const nextIdx = (demoStepIndex + 1) % demoSteps.length;
    nextDemoStep();
    demoSteps[nextIdx]?.onEnter();
  };

  const handlePrev = () => {
    const prevIdx = Math.max(0, demoStepIndex - 1);
    prevDemoStep();
    demoSteps[prevIdx]?.onEnter();
  };

  return (
    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40 w-11/12 max-w-xl bg-[#05070A]/95 backdrop-blur-2xl border border-cyan-500/50 rounded-2xl p-4 shadow-2xl shadow-glow-cyan text-xs font-mono select-none text-slate-200 animate-in zoom-in-95 duration-200">
      {/* Step Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            {currentStep.icon}
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">{currentStep.title}</h2>
            <p className="text-[10px] text-cyan-400 font-semibold">{currentStep.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            {demoStepIndex + 1} / {demoSteps.length}
          </span>
          <button
            onClick={stopDemo}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <p className="py-3 text-[11px] text-slate-300 leading-relaxed">
        {currentStep.content}
      </p>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
        <button
          onClick={handlePrev}
          disabled={demoStepIndex === 0}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[11px] transition-colors ${
            demoStepIndex === 0
              ? 'opacity-30 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
        >
          <ArrowLeft size={12} />
          <span>Back</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] transition-all shadow-glow-cyan"
        >
          <span>{currentStep.actionText}</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};
