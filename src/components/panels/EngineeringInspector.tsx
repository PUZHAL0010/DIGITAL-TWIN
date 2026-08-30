import React, { useState } from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { 
  X, 
  Activity, 
  Layers, 
  HelpCircle, 
  Radio, 
  Camera, 
  ShieldCheck, 
  Cpu, 
  Compass, 
  AlertTriangle,
  FileCheck,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { formatMPa, formatMm } from '../../utils/formatters';

interface EngineeringInspectorProps {
  onOpenWhyModal: () => void;
}

type InspectorTab = 'OVERVIEW' | 'MECHANICS' | 'SENSORS' | 'AI_EVIDENCE' | 'PROVENANCE';

export const EngineeringInspector: React.FC<EngineeringInspectorProps> = ({ onOpenWhyModal }) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('OVERVIEW');
  const selectedComponentId = useSimulationStore(state => state.selectedComponentId);
  const isPresentationMode = useSimulationStore(state => state.isPresentationMode);
  const bridge = useSimulationStore(state => state.bridge);
  const sensors = useSimulationStore(state => state.sensors);
  const selectComponent = useSimulationStore(state => state.selectComponent);

  const component = selectedComponentId ? bridge.components[selectedComponentId] : null;

  if (!component || isPresentationMode) return null;

  // Filter sensors associated with this component
  const linkedSensors = Object.values(sensors).filter(s => s.componentId === component.id);

  return (
    <div className="absolute top-16 right-4 z-20 w-88 sm:w-96 bg-[#070a10]/95 backdrop-blur-2xl border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200 font-mono select-none text-xs animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-3.5 bg-[#0b0f17] border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>{component.name}</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {component.id.toUpperCase()}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-tight">
            Navigation Channel Pier • Asset {bridge.assetCode}
          </div>
        </div>

        <button
          onClick={() => selectComponent(null)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close Inspector (Esc)"
        >
          <X size={15} />
        </button>
      </div>

      {/* Tab Ribbon */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#05070a] px-2 py-1 text-[10px]">
        {[
          { id: 'OVERVIEW', label: 'Overview', icon: <Layers size={11} /> },
          { id: 'MECHANICS', label: 'Mechanics', icon: <Activity size={11} /> },
          { id: 'SENSORS', label: `Sensors (${linkedSensors.length})`, icon: <Radio size={11} /> },
          { id: 'AI_EVIDENCE', label: 'AI Vision', icon: <Camera size={11} /> },
          { id: 'PROVENANCE', label: 'Provenance', icon: <Compass size={11} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as InspectorTab)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all font-bold ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-3.5 overflow-y-auto max-h-[72vh] custom-scrollbar">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Structural Health & Risk Banner */}
            <div className="p-3 rounded-xl bg-[#0b0f17] border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-tight">Structural Health</span>
                  <div className="text-xl font-extrabold text-white mt-0.5">{component.health}%</div>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${
                    component.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                    component.risk === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                    component.risk === 'MODERATE' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}>
                    {component.risk} RISK
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Maintenance Priority:</span>
                  <span className="text-white font-bold">{component.maintenancePriority || 'P1'}</span>
                </div>
                <button
                  onClick={onOpenWhyModal}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                >
                  <HelpCircle size={11} />
                  <span>Why Risk?</span>
                </button>
              </div>
            </div>

            {/* Quick State Grid */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2.5 rounded-lg bg-[#0b0f17] border border-slate-800/80">
                <span className="text-slate-400 block text-[9px]">Total Stress (σ)</span>
                <span className="font-bold text-white text-xs mt-0.5 block">{formatMPa(component.stressMPa)}</span>
                <span className="text-[8px] text-slate-500">Allowable: 250 MPa</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0b0f17] border border-slate-800/80">
                <span className="text-slate-400 block text-[9px]">Deflection (Δ)</span>
                <span className="font-bold text-white text-xs mt-0.5 block">{formatMm(component.deformationMm)}</span>
                <span className="text-[8px] text-cyan-400">{component.deflectionRatio}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0b0f17] border border-slate-800/80">
                <span className="text-slate-400 block text-[9px]">Safety Factor (FoS)</span>
                <span className="font-bold text-emerald-400 text-xs mt-0.5 block">{component.safetyFactor.toFixed(2)}</span>
                <span className="text-[8px] text-slate-500">Util: {(component.utilizationRatio * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0b0f17] border border-slate-800/80">
                <span className="text-slate-400 block text-[9px]">Elastic Strain (ε)</span>
                <span className="font-bold text-cyan-300 text-xs mt-0.5 block">0.0042</span>
                <span className="text-[8px] text-slate-500">Yield: 0.0035</span>
              </div>
            </div>

            {/* Material & Section */}
            <div className="p-2.5 rounded-xl bg-[#0b0f17] border border-slate-800/80 space-y-1.5 text-[10px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Layers size={11} className="text-cyan-400" />
                <span>Material & Section Properties</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                <span className="text-slate-400">Concrete Grade:</span>
                <span className="font-bold text-white">M50 Reinforced</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                <span className="text-slate-400">Steel Rebar Grade:</span>
                <span className="font-bold text-white">Fe 500 TMT</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                <span className="text-slate-400">Cross Section Area:</span>
                <span className="font-bold text-white">{component.section.areaM2.toFixed(3)} m²</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Moment of Inertia:</span>
                <span className="font-bold text-white">{component.section.momentOfInertiaM4.toFixed(4)} m⁴</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MECHANICS */}
        {activeTab === 'MECHANICS' && (
          <div className="space-y-3 animate-in fade-in duration-150 text-[10px]">
            <div className="p-3 rounded-xl bg-[#0b0f17] border border-slate-800/80 space-y-2">
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={12} />
                <span>Deterministic Structural Mechanics</span>
              </div>

              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Axial Compression (σ_a):</span>
                  <span className="font-bold text-white">4.20 MPa</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Bending Stress (σ_b):</span>
                  <span className="font-bold text-white">102.30 MPa</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Combined Peak Stress:</span>
                  <span className="font-bold text-cyan-300">{formatMPa(component.stressMPa)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Euler Critical Buckling (P_cr):</span>
                  <span className="font-bold text-white">14,820 kN</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Applied Total Force (F):</span>
                  <span className="font-bold text-white">1,856.6 kN</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Peak Bending Moment (M):</span>
                  <span className="font-bold text-white">942.5 kN·m</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[9px] text-slate-400 space-y-1">
              <div className="font-bold text-slate-300 uppercase">Solver Formulation:</div>
              <p>Euler-Bernoulli Elastic Beam Theory combined with LEFM fracture mechanics and Fick's Law chloride ingress model.</p>
            </div>
          </div>
        )}

        {/* TAB 3: SENSORS / IoT */}
        {activeTab === 'SENSORS' && (
          <div className="space-y-2.5 animate-in fade-in duration-150 text-[10px]">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase">Associated IoT Sensors</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                {linkedSensors.length} ONLINE
              </span>
            </div>

            {linkedSensors.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800 text-center text-slate-500">
                No active IoT sensors mapped directly to this component.
              </div>
            ) : (
              linkedSensors.map((sensor) => (
                <div
                  key={sensor.id}
                  className="p-3 rounded-xl bg-[#0b0f17] border border-slate-800/80 space-y-2 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-white text-xs">{sensor.id}</span>
                      <span className="text-[9px] text-slate-400">({sensor.name})</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 font-bold border border-slate-800">
                      {sensor.samplingRateHz} Hz
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Live Reading:</span>
                    <span className="text-sm font-extrabold text-cyan-300">
                      {sensor.currentValue} {sensor.unit}
                    </span>
                  </div>

                  <div className="text-[9px] text-slate-500 space-y-0.5">
                    <div>Mfr: {sensor.provenance.manufacturer} ({sensor.provenance.model})</div>
                    <div>Calibrated: {sensor.provenance.calibrationDate} | Accuracy: {sensor.provenance.accuracyPercent}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: AI DEFECT EVIDENCE */}
        {activeTab === 'AI_EVIDENCE' && (
          <div className="space-y-3 animate-in fade-in duration-150 text-[10px]">
            <div className="p-3 rounded-xl bg-[#0b0f17] border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300 text-xs">DEFECT: CRACK-C024</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40">
                  AI DETECTED
                </span>
              </div>

              {/* Simulated 4K Drone Inspection Crop Reticle */}
              <div className="relative rounded-lg overflow-hidden border border-cyan-500/40 bg-slate-950 aspect-video flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.8)_100%)]" />
                {/* AI Bounding Box */}
                <div className="relative border-2 border-cyan-400 rounded p-3 w-4/5 h-4/5 flex flex-col justify-between bg-cyan-950/20">
                  <div className="flex justify-between text-[8px] font-bold text-cyan-300">
                    <span>[YOLO-v8 CRACK SEG]</span>
                    <span className="text-emerald-400">CONF: 94.2%</span>
                  </div>
                  {/* Stylized Crack Path */}
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transform rotate-12 my-auto" />
                  <div className="text-[8px] text-slate-400">
                    Depth: 4.2mm | L: 4.20m | θ: 45° Shear
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-slate-300 text-[9px]">
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Inspection Source:</span>
                  <span className="font-bold text-white">DJI Matrice 350 RTK / Zenmuse P1</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Capture Date:</span>
                  <span className="font-bold text-white">2026-08-20 14:32 UTC</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Validation Status:</span>
                  <span className="text-amber-400 font-bold">Pending Structural Engineer Signoff</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DATA PROVENANCE */}
        {activeTab === 'PROVENANCE' && (
          <div className="space-y-3 animate-in fade-in duration-150 text-[10px]">
            <div className="p-3 rounded-xl bg-[#0b0f17] border border-slate-800/80 space-y-2">
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={12} />
                <span>Geospatial & Reality Model Provenance</span>
              </div>

              <div className="space-y-1 text-slate-300 text-[9px]">
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Geodetic Datum:</span>
                  <span className="font-bold text-white">{bridge.geographicCoordinate.datum}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">WGS84 Coordinates:</span>
                  <span className="font-bold text-cyan-300">
                    {bridge.geographicCoordinate.latitude.toFixed(5)}°N, {bridge.geographicCoordinate.longitude.toFixed(5)}°E
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">MSL Elevation:</span>
                  <span className="font-bold text-white">{bridge.geographicCoordinate.elevationMslMeters.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Reality Capture Pipeline:</span>
                  <span className="font-bold text-white">{bridge.realityCapture.reconstructionEngine}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Point Cloud Density:</span>
                  <span className="font-bold text-white">{bridge.realityCapture.pointDensityPtsM2} pts/m²</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Spatial Accuracy:</span>
                  <span className="font-bold text-emerald-400">±{bridge.realityCapture.spatialAccuracyMm} mm</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Validation Score:</span>
                  <span className="font-bold text-emerald-400">{bridge.realityCapture.validationScorePercent}% Validated</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Action Button */}
        <button
          onClick={onOpenWhyModal}
          className="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold tracking-wider uppercase transition-all shadow-glow-cyan flex items-center justify-center gap-1.5"
        >
          <Cpu size={12} />
          <span>Open Full Diagnostic Analysis</span>
        </button>
      </div>
    </div>
  );
};
