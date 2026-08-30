import React, { useState } from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { RiskBadge } from '../ui/StatusBadge';
import { 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Zap, 
  FolderTree, 
  Crosshair 
} from 'lucide-react';
import type { ComponentType } from '../../types/bridge';

export const SidebarLeft: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // filterType drives the type-group filter; 'all' shows every type
  const [filterType, setFilterType] = useState<string>('all');
  // Local UI-only visibility toggles (not tracked by global store)
  const [showCracks, setShowCracks] = useState(false);
  const [showDefectPins, setShowDefectPins] = useState(false);

  const components = useSimulationStore(state => state.bridge.components);
  const selectedComponentId = useSimulationStore(state => state.selectedComponentId);
  const selectComponent = useSimulationStore(state => state.selectComponent);

  const componentList = Object.values(components);

  // Group components by type
  const groups: Record<ComponentType, typeof componentList> = {
    deck: componentList.filter(c => c.type === 'deck'),
    pier: componentList.filter(c => c.type === 'pier'),
    pier_cap: componentList.filter(c => c.type === 'pier_cap'),
    foundation: componentList.filter(c => c.type === 'foundation'),
    beam: componentList.filter(c => c.type === 'beam'),
    cable: componentList.filter(c => c.type === 'cable'),
    bearing: componentList.filter(c => c.type === 'bearing'),
    abutment: componentList.filter(c => c.type === 'abutment'),
  };

  const groupLabels: Record<ComponentType, string> = {
    deck: 'Deck Slabs (Superstructure)',
    pier: 'Support Columns / Piers',
    pier_cap: 'Pier Cap Beams',
    foundation: 'Substructure Foundations',
    beam: 'Longitudinal Girders',
    cable: 'Cable Stays & Pylon',
    bearing: 'Elastomeric Bearings',
    abutment: 'Abutment Structures',
  };

  return (
    <aside
      className={`absolute top-14 bottom-16 left-0 z-20 transition-all duration-300 flex flex-col bg-slate-950/85 backdrop-blur-xl border-r border-slate-800/80 ${
        isCollapsed ? 'w-12' : 'w-72'
      }`}
    >
      {/* Sidebar Header & Toggle */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            <FolderTree size={15} className="text-cyan-400" />
            <span>Digital Twin Asset Tree</span>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-auto"
          title={isCollapsed ? 'Expand Hierarchy' : 'Collapse Hierarchy'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Search and Layer Quick Toggles */}
          <div className="p-3 space-y-2 border-b border-slate-800/60">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter components (e.g. P-03)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Quick 3D Layer Visibility Controls */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <button
                onClick={() => setShowCracks(v => !v)}
                className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
                  showCracks
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
                title="Toggle 3D Fracture Rendering"
              >
                <Zap size={11} />
                <span>Cracks</span>
              </button>

              <button
                onClick={() => setShowDefectPins(v => !v)}
                className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
                  showDefectPins
                    ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
                title="Toggle AI Defect Spatial Pins"
              >
                <Crosshair size={11} />
                <span>AI Pins</span>
              </button>
            </div>
          </div>

          {/* Component List Tree */}
          <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar text-xs font-mono">
            {(Object.keys(groups) as ComponentType[]).map((type) => {
              const compsInGroup = groups[type].filter(c =>
                // Apply type-group filter (filterType='all' bypasses it)
                (filterType === 'all' || c.type === filterType) &&
                // Apply text search
                (
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.id.toLowerCase().includes(searchQuery.toLowerCase())
                )
              );

              if (compsInGroup.length === 0) return null;

              return (
                <div key={type} className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 flex items-center justify-between tracking-wider">
                    <span>{groupLabels[type]}</span>
                    <span className="text-slate-500 font-normal">({compsInGroup.length})</span>
                  </div>

                  <div className="space-y-1">
                    {compsInGroup.map((comp) => {
                      const isSelected = selectedComponentId === comp.id;

                      return (
                        <div
                          key={comp.id}
                          onClick={() => selectComponent(comp.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-150 border ${
                            isSelected
                              ? 'bg-cyan-950/50 border-cyan-400 text-cyan-200 shadow-glow-cyan'
                              : 'bg-slate-900/40 border-transparent hover:bg-slate-900 hover:border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                comp.health >= 85
                                  ? 'bg-emerald-400'
                                  : comp.health >= 65
                                  ? 'bg-amber-400'
                                  : 'bg-red-400 animate-pulse'
                              }`}
                            />
                            <span className="truncate font-medium">{comp.name}</span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {comp.health}%
                            </span>
                            <RiskBadge risk={comp.risk} size="sm" showPulse={false} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </aside>
  );
};
