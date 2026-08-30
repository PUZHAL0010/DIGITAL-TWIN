import React, { useState, useEffect, useRef } from 'react';
import { useSimulationStore } from './state/useSimulationStore';
import { BridgeCanvas } from './3d/BridgeCanvas';
import { FloatingNavbar } from './components/layout/FloatingNavbar';
import { LeftNavRail } from './components/layout/LeftNavRail';
import { NavDrawer } from './components/layout/NavDrawer';
import { BottomTimeline } from './components/layout/BottomTimeline';
import { FloatingHUD } from './components/layout/FloatingHUD';
import { EngineeringInspector } from './components/panels/EngineeringInspector';
import { CollapseBanner } from './components/panels/CollapseBanner';
import { FailureEventLog } from './components/layout/FailureEventLog';
import { SimulationDebugOverlay } from './components/panels/SimulationDebugOverlay';
import { StressLegend } from './components/panels/StressLegend';
import { DroneInspectionHUD } from './components/panels/DroneInspectionHUD';
import { KeyboardShortcutsHandler } from './components/layout/KeyboardShortcutsHandler';
import { RiskExplanationModal } from './components/panels/RiskExplanationModal';
import { ReportModal } from './components/panels/ReportModal';
import { HistoricalCaseView } from './components/views/HistoricalCaseView';
import { SimulationStationView } from './components/views/SimulationStationView';
import { DamageMechanicsView } from './components/views/DamageMechanicsView';
import { WhatIfEngineView } from './components/views/WhatIfEngineView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SensorsView } from './components/views/SensorsView';
import { MaintenanceView } from './components/views/MaintenanceView';
import { EngineeringDataView } from './components/views/EngineeringDataView';
import { ValidationView } from './components/views/ValidationView';
import { SourcesAssumptionsView } from './components/views/SourcesAssumptionsView';
import { DemoModeTour } from './components/views/DemoModeTour';

export function App() {
  const activeView = useSimulationStore(state => state.activeView);
  const isPresentationMode = useSimulationStore(state => state.isPresentationMode);
  const isDemoPlaying = useSimulationStore(state => state.isDemoPlaying);

  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isUserActive, setIsUserActive] = useState(true);
  const idleTimerRef = useRef<number | null>(null);

  // Auto-hide UI on inactivity (5.0s)
  useEffect(() => {
    const handleMouseMove = () => {
      setIsUserActive(true);
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => {
        setIsUserActive(false);
      }, 5000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseMove);
    window.addEventListener('keydown', handleMouseMove);

    idleTimerRef.current = window.setTimeout(() => {
      setIsUserActive(false);
    }, 6000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseMove);
      window.removeEventListener('keydown', handleMouseMove);
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#000000] text-slate-100 font-mono overflow-hidden select-none relative">
      {/* Global Keyboard Shortcuts (1-0, R, F, D, Space, Esc) */}
      <KeyboardShortcutsHandler />

      {/* 1. Root 3D WebGL Canvas Layer (100% Fullscreen Viewport) */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <BridgeCanvas />
      </div>

      {/* 2. Floating UI Overlay Container */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 ${
          isUserActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'
        }`}
      >
        {/* Minimal Floating Top Navbar */}
        <FloatingNavbar onOpenReport={() => setIsReportModalOpen(true)} />

        {/* Left Navigation Icon Rail Matching Reference Image */}
        <LeftNavRail onOpenReport={() => setIsReportModalOpen(true)} />

        {/* Top-Right Compact Failure Notification Card */}
        <CollapseBanner />

        {/* Developer / Engineering Physics Simulation Debug Overlay */}
        <SimulationDebugOverlay />

        {/* Stress Viewport Legend */}
        <StressLegend />

        {/* Drone Inspection Telemetry HUD */}
        <DroneInspectionHUD />

        {/* Bottom-Right Collapsible Event Log */}
        <FailureEventLog />

        {/* Thin Bottom Floating Timeline */}
        <BottomTimeline />

        {/* Floating Right-Hand Engineering Inspector (matching reference image) */}
        {activeView === 'DIGITAL_TWIN' && !isPresentationMode && (
          <EngineeringInspector onOpenWhyModal={() => setIsWhyModalOpen(true)} />
        )}
      </div>

      {/* 3. Collapsible Navigation Drawer */}
      <NavDrawer />

      {/* 4. Fullscreen Overlay Engineering Views */}
      {activeView === 'HISTORICAL_CASE' && <HistoricalCaseView />}
      {activeView === 'SIMULATION' && <SimulationStationView />}
      {activeView === 'DAMAGE' && <DamageMechanicsView />}
      {activeView === 'WHAT_IF' && <WhatIfEngineView />}
      {activeView === 'ANALYTICS' && <AnalyticsView />}
      {activeView === 'SENSORS' && <SensorsView />}
      {activeView === 'MAINTENANCE' && <MaintenanceView />}
      {activeView === 'ENGINEERING_DATA' && <EngineeringDataView />}
      {activeView === 'VALIDATION' && <ValidationView />}
      {activeView === 'SOURCES' && <SourcesAssumptionsView />}

      {/* 5. Guided Demo Mode Tour Overlay */}
      {isDemoPlaying && <DemoModeTour />}

      {/* 6. Root-Cause "Why Risk?" Explanation Modal */}
      <RiskExplanationModal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
      />

      {/* 7. Engineering Assessment Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}

export default App;
