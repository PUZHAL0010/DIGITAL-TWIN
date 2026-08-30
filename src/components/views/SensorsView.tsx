import React, { useState } from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { 
  Radio, 
  ArrowRight, 
  Activity, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Cpu,
  Wifi,
  Waves,
  Maximize2
} from 'lucide-react';

export const SensorsView: React.FC = () => {
  const setActiveView = useSimulationStore(state => state.setActiveView);
  const sensors = useSimulationStore(state => state.sensors);
  const selectSensor = useSimulationStore(state => state.selectSensor);
  const selectComponent = useSimulationStore(state => state.selectComponent);

  const [selectedSensorId, setSelectedSensorId] = useState<string>('SG-P03-01');
  const activeSensor = sensors[selectedSensorId] || Object.values(sensors)[0];

  return (
    <div className="absolute inset-0 bg-[#000000]/95 backdrop-blur-2xl z-20 overflow-y-auto p-6 text-slate-200 font-mono select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Radio size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight uppercase">
                IoT Sensor Telemetry & Structural Health Monitoring (SHM)
              </h1>
              <p className="text-xs text-slate-400">
                Live multi-channel telemetry streams capturing dynamic strain, vibration spectra, river scour, and tilt response.
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

        {/* Global Sensor Fleet Telemetry Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#05070a] border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Fleet Status</div>
            <div className="text-base font-extrabold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>6 / 6 ONLINE</span>
            </div>
            <div className="text-[9px] text-slate-500">100% Ingestion Uptime</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#05070a] border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Max Sampling Rate</div>
            <div className="text-base font-extrabold text-cyan-300">250 Hz (Triaxial MEMS)</div>
            <div className="text-[9px] text-slate-500">Nyquist Bandwidth: 125 Hz</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#05070a] border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Fundamental Modal Freq</div>
            <div className="text-base font-extrabold text-white">2.45 Hz (Vertical Bending)</div>
            <div className="text-[9px] text-slate-500">FFT Peak Amplitude: 0.042g</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#05070a] border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Telemetry Ingestion Layer</div>
            <div className="text-base font-extrabold text-amber-400">MQTT / WebSocket</div>
            <div className="text-[9px] text-slate-500">Latency: 12ms</div>
          </div>
        </div>

        {/* Main Content Grid: Sensor Selector + Live Telemetry Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Sensor Selector List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Installed Sensor Fleet
            </div>

            <div className="space-y-2">
              {Object.values(sensors).map((sensor) => {
                const isSelected = selectedSensorId === sensor.id;
                return (
                  <div
                    key={sensor.id}
                    onClick={() => setSelectedSensorId(sensor.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-glow-cyan'
                        : 'bg-[#05070a] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-bold text-xs">{sensor.id}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-cyan-300 font-bold border border-slate-800">
                        {sensor.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400">{sensor.name}</span>
                      <span className="text-xs font-extrabold text-white">
                        {sensor.currentValue} {sensor.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Real-Time Telemetry Graph & Frequency Analysis */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-[#05070a] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{activeSensor.name}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {activeSensor.id}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Component: <span className="text-cyan-300 font-bold">{activeSensor.componentId}</span> | Sampling: {activeSensor.samplingRateHz} Hz
                  </p>
                </div>

                <button
                  onClick={() => {
                    selectSensor(activeSensor.id);
                    selectComponent(activeSensor.componentId);
                    setActiveView('DIGITAL_TWIN');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-bold transition-all flex items-center gap-1.5"
                >
                  <Maximize2 size={12} />
                  <span>Locate in 3D</span>
                </button>
              </div>

              {/* Time-Series Telemetry Waveform Visualization */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                  <span>Time-Series Response ({activeSensor.unit})</span>
                  <span className="text-emerald-400">● LIVE 100 Hz</span>
                </div>

                <div className="h-36 w-full flex items-end gap-1.5 pt-4">
                  {[280, 284, 279, 292, 298, 291, 287, 295, 302, 295, 288, 294, 296, 295.4].map((val, idx) => {
                    const heightPercent = ((val - 250) / 70) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          style={{ height: `${Math.max(15, Math.min(100, heightPercent))}%` }}
                          className="w-full rounded-t bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-300"
                        />
                        <span className="text-[8px] text-slate-600">t-{14 - idx}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spectral Analysis & FFT Modal Spectrum */}
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-500 uppercase font-bold">Calibration & Integrity</div>
                  <div className="text-slate-300 font-semibold">Manufacturer: {activeSensor.provenance.manufacturer}</div>
                  <div className="text-slate-400">Model: {activeSensor.provenance.model}</div>
                  <div className="text-emerald-400 font-bold">Calibration: {activeSensor.provenance.calibrationDate}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-500 uppercase font-bold">Operational Thresholds</div>
                  <div className="text-slate-400">Safe Range: {activeSensor.lowerThreshold} to {activeSensor.upperThreshold} {activeSensor.unit}</div>
                  <div className="text-amber-400 font-bold">Critical Limit: {activeSensor.criticalThreshold} {activeSensor.unit}</div>
                  <div className="text-cyan-300">Accuracy: {activeSensor.provenance.accuracyPercent}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
