import { create } from 'zustand';
import { BridgeStructure, StructuralComponent } from '../types/bridge';
import { BridgeSensor } from '../types/sensors';
import { INITIAL_BRIDGE_SENSORS } from '../data/sensorsData';
import { 
  ActiveAppView, 
  ViewMode3D, 
  RenderingMode,
  CameraPreset, 
  DeformationScale, 
  SimulationParameters, 
  TimelineState,
  ComparativeTrajectoryPoint,
  MaintenanceIntervention,
  SimulationEvent,
  WaterEnvironmentConfig,
  FailureScenarioType,
  Auto360Config,
  ScenarioDefinition,
  SimulationLifecycleState,
  ShipVesselState
} from '../types/simulation';
import { Vehicle, DynamicLoadAssessment } from '../types/vehicles';
import { CollapseSimulationState } from '../types/failure';
import { HistoricalCaseStudy } from '../types/historical';
import { INITIAL_BRIDGE, INITIAL_COMPONENTS } from '../data/initialBridgeData';
import { INITIAL_VEHICLES } from '../data/vehiclesData';
import { MORANDI_HISTORICAL_CASE } from '../data/historicalMorandiData';
import { calculateComponentMechanics } from '../physics/mechanics';
import { processVehicleTrafficAndLoads } from '../physics/dynamicLoad';
import { evaluateFractureMechanics } from '../physics/fractureMechanics';
import { calculateCorrosionSectionLoss } from '../physics/corrosionModel';
import { calculatePhysicsHealthAndRisk } from '../physics/healthIndex';
import { calculate3DLoadPathVectors, LoadPathVector3D } from '../physics/loadPath';
import { stepScenarioFailurePhysics } from '../physics/scenarioFailureEngine';

export const SCENARIOS_DEFINITIONS: Record<FailureScenarioType, ScenarioDefinition> = {
  CORROSION: {
    id: 'CORROSION',
    name: 'Marine Fog / 50-Yr Chloride Ingress',
    badge: 'ENVIRONMENTAL LOSS',
    mechanism: 'Multi-decade chloride diffusion depassivates rebar; effective section A_eff drops by 64% in splash zone, crushing concrete core',
    affectedComponents: ['pier-p3', 'pier-cap-p3'],
    secondaryAffectedComponents: ['deck-span-3'],
    liveLoadMultiplier: 1.0,
    corrosionRateMultiplier: 3.5,
    crackGrowthMultiplier: 1.3,
    scourExcavationDepthM: 0.0,
    seismicAccelerationG: 0.0,
    shipImpactActive: false,
    failureCriterionDescription: 'Effective Section Loss > 60% & Compressive Strain ε_v > 0.0035',
    collapseMode: 'LOCALIZED_SPLASH_ZONE_SUBSIDENCE',
    expectedFailureYear: 2062,
    baselineHealth50Years: 65,
    scenarioHealth50Years: 16,
  },
  OVERLOAD: {
    id: 'OVERLOAD',
    name: 'Heavy Multi-Axle Freight Overload',
    badge: 'LIVE LOAD DEMAND',
    mechanism: 'Moving multi-axle freight transporter point loads induce peak midspan bending moment exceeding yield capacity σ_y = 355 MPa',
    affectedComponents: ['girder-g2', 'girder-g1', 'deck-span-3'],
    secondaryAffectedComponents: ['pier-cap-p3'],
    liveLoadMultiplier: 2.4,
    corrosionRateMultiplier: 1.0,
    crackGrowthMultiplier: 1.5,
    scourExcavationDepthM: 0.0,
    seismicAccelerationG: 0.0,
    shipImpactActive: false,
    failureCriterionDescription: 'Midspan bending stress σ_b > 355 MPa & Deflection > 48 mm (L/250)',
    collapseMode: 'PROGRESSIVE_GIRDER_FLEXURAL_SAG',
    expectedFailureYear: 2045,
    baselineHealth50Years: 65,
    scenarioHealth50Years: 12,
  },
  SHIP_COLLISION: {
    id: 'SHIP_COLLISION',
    name: 'Ship / Vessel Channel Collision',
    badge: 'KINETIC IMPACT',
    mechanism: '3,500-Tonne navigation cargo vessel strikes Pier P-03 column base in channel, transferring 19.4 MJ kinetic impact energy',
    affectedComponents: ['pier-p3', 'pier-cap-p3', 'deck-span-3'],
    secondaryAffectedComponents: ['foundation-f3'],
    liveLoadMultiplier: 1.0,
    corrosionRateMultiplier: 1.0,
    crackGrowthMultiplier: 1.0,
    scourExcavationDepthM: 0.0,
    seismicAccelerationG: 0.0,
    shipImpactActive: true,
    failureCriterionDescription: 'Kinetic Impact Energy E_k = 19.4 MJ Exceeding Pier Shear Capacity',
    collapseMode: 'SHIP_IMPACT_PIER_SHEAR_FRACTURE',
    expectedFailureYear: 2038,
    baselineHealth50Years: 65,
    scenarioHealth50Years: 8,
  },
  SCOUR: {
    id: 'SCOUR',
    name: 'Hydraulic Scour & Foundation Instability',
    badge: 'HYDRAULIC SCOUR',
    mechanism: 'Continuous river current excavates a 2.8m sediment crater under Footing F-03, inducing 15° lateral tilt and bearing slip',
    affectedComponents: ['foundation-f3', 'pier-p3'],
    secondaryAffectedComponents: ['deck-span-3', 'deck-span-4'],
    liveLoadMultiplier: 1.0,
    corrosionRateMultiplier: 1.0,
    crackGrowthMultiplier: 1.2,
    scourExcavationDepthM: 2.8,
    seismicAccelerationG: 0.0,
    shipImpactActive: false,
    failureCriterionDescription: 'Scour Depth > 2.5m & Differential Tilt > 14°',
    collapseMode: 'ASYMMETRIC_FOUNDATION_TILT_AND_DECK_SLIP',
    expectedFailureYear: 2052,
    baselineHealth50Years: 65,
    scenarioHealth50Years: 10,
  },
  DEFERRED_MAINTENANCE: {
    id: 'DEFERRED_MAINTENANCE',
    name: 'Deferred Maintenance (50-Year Aging)',
    badge: 'AGING ACCELERATION',
    mechanism: 'Ignored early micro-defects accelerate across decades, leading to catastrophic structural capacity reduction',
    affectedComponents: ['pier-p3', 'deck-span-3'],
    secondaryAffectedComponents: ['girder-g2', 'pier-cap-p3'],
    liveLoadMultiplier: 1.2,
    corrosionRateMultiplier: 2.2,
    crackGrowthMultiplier: 2.6,
    scourExcavationDepthM: 0.0,
    seismicAccelerationG: 0.0,
    shipImpactActive: false,
    failureCriterionDescription: 'Unmaintained Damage Growth Exceeding Safety Threshold (FoS < 1.0)',
    collapseMode: 'BRITTLE_FATIGUE_CLEAVAGE_SNAP',
    expectedFailureYear: 2056,
    baselineHealth50Years: 65,
    scenarioHealth50Years: 8,
  },
  SEISMIC: {
    id: 'SEISMIC',
    name: 'Seismic Ground Motion Excitation',
    badge: 'SEISMIC HAZARD',
    mechanism: 'Horizontal ground acceleration (a_g = 0.35g) induces differential pier-deck phase oscillation, rupturing elastomeric bearings',
    affectedComponents: ['deck-span-3', 'pier-cap-p3', 'pier-p3'],
    secondaryAffectedComponents: ['deck-span-2'],
    liveLoadMultiplier: 1.0,
    corrosionRateMultiplier: 1.0,
    crackGrowthMultiplier: 1.0,
    scourExcavationDepthM: 0.0,
    seismicAccelerationG: 0.35,
    shipImpactActive: false,
    failureCriterionDescription: 'Peak Ground Acceleration a_g = 0.35g Exceeding Bearing Lateral Restraint',
    collapseMode: 'SEISMIC_HARMONIC_BEARING_SHEAR_UNSEATING',
    expectedFailureYear: 2042,
    baselineHealth50Years: 65,
    scenarioHealth50Years: 14,
  },
};

const DEFAULT_SHIP_STATE: ShipVesselState = {
  active: true,
  position: [1.5, -0.5, 12.0], // Navigating cleanly in the channel between Pier 2 (x: -6) and Pier 3 (x: 6)
  velocityMps: 2.2,             // Cruising speed
  headingRad: 0.0,
  massTonnes: 3500,
  kineticEnergyMj: 19.4,
  impactOccurred: false,
  impactTimeSec: 0,
};

const DEFAULT_PARAMS: SimulationParameters = {
  structuralLoadPercentage: 35,
  crackSeverityPercentage: 20,
  corrosionPercentage: 15,
  environmentalStress: 30,
  trafficFlowRateVehMin: 45,
  dynamicAmplificationFactor: 0.25,
  vehicleOverloadMultiplier: 1.0,
  seismicIntensity: 0.0,
};

const DEFAULT_TIMELINE: TimelineState = {
  currentYear: 2026,
  startYear: 2026,
  endYear: 2076,
  isPlaying: false,
  isFrozenOnFailure: false,
  playbackSpeed: 1,
  mode: 'CONTEMPORARY',
};

const DEFAULT_COLLAPSE_STATE: CollapseSimulationState = {
  stage: 'STABLE',
  isActive: false,
  activeScenarioId: 'OVERLOAD',
  simulationTimeSec: 0,
  triggerComponentId: 'girder-g2',
  triggerCause: 'Excessive Flexural Demand & Midspan Girder Plastic Yield',
  collapsedComponentIds: [],
  failedJointIds: [],
  cinematicCameraActive: false,
  totalEnergyReleasedMj: 420.5,
  disclaimer: 'PHYSICS-INFORMED SCENARIO FAILURE SIMULATION',
};

const DEFAULT_WATER_CONFIG: WaterEnvironmentConfig = {
  currentVelocityMps: 1.8,
  waterLevelM: -0.5,
  flowDirectionRad: 0.0,
  scourExcavationDepthM: 0.0,
  waterCurrentVisible: false,
};

const DEFAULT_AUTO_360: Auto360Config = {
  isPlaying: true,
  speed: 1.0,
  direction: 1,
};

const DEFAULT_INTERVENTIONS: MaintenanceIntervention[] = [
  {
    id: 'int-cfrp-p3',
    yearScheduled: 2032,
    actionType: 'CFRP_WRAPPING',
    targetComponentId: 'pier-p3',
    costUSD: 48000,
    capacityRestorationPercentage: 35,
    corrosionMitigationPercentage: 50,
    applied: false,
  },
  {
    id: 'int-epoxy-deck3',
    yearScheduled: 2038,
    actionType: 'EPOXY_INJECTION',
    targetComponentId: 'deck-span-3',
    costUSD: 24000,
    capacityRestorationPercentage: 20,
    corrosionMitigationPercentage: 40,
    applied: false,
  },
  {
    id: 'int-cable-c3',
    yearScheduled: 2045,
    actionType: 'CABLE_STAY_REPLACEMENT',
    targetComponentId: 'cable-stay-c3',
    costUSD: 85000,
    capacityRestorationPercentage: 55,
    corrosionMitigationPercentage: 90,
    applied: false,
  },
];

function generateTrajectories(interventions: MaintenanceIntervention[]): ComparativeTrajectoryPoint[] {
  const points: ComparativeTrajectoryPoint[] = [];
  const hasAppliedIntervention = interventions.some(i => i.applied);

  for (let year = 2026; year <= 2076; year += 1) {
    const elapsed = year - 2026;
    const degradationPercent = Math.min(92, (elapsed * 0.9) + Math.pow(elapsed * 0.08, 2.1));
    const healthWithout = Math.max(5, Math.round(92 - degradationPercent));
    const capacityWithoutKn = Math.max(1200, Math.round(5400 * (1 - (degradationPercent / 100) * 0.75)));
    
    let riskWithout = 'NORMAL';
    if (healthWithout < 30) riskWithout = 'CRITICAL';
    else if (healthWithout < 50) riskWithout = 'HIGH';
    else if (healthWithout < 70) riskWithout = 'MODERATE';
    else riskWithout = 'LOW';

    let healthWith = 92;
    let capacityWithKn = 5400;
    if (hasAppliedIntervention && year >= 2035) {
      const postIntvElapsed = year - 2035;
      healthWith = Math.min(95, Math.round(88 - postIntvElapsed * 0.45));
      capacityWithKn = Math.round(5400 * (1 - postIntvElapsed * 0.006));
    } else {
      healthWith = Math.max(45, Math.round(92 - elapsed * 0.6));
      capacityWithKn = Math.round(5400 * (1 - elapsed * 0.008));
    }
    const riskWith = healthWith >= 80 ? 'LOW' : healthWith >= 60 ? 'MODERATE' : 'HIGH';

    points.push({
      year,
      healthWithoutMaintenance: healthWithout,
      healthWithMaintenance: healthWith,
      capacityWithoutKn,
      capacityWithKn,
      riskWithout,
      riskWith,
    });
  }

  return points;
}

interface SimulationStore {
  // Navigation & View Modes
  activeView: ActiveAppView;
  viewMode3D: ViewMode3D;
  renderingMode: RenderingMode;
  isEngineeringMode: boolean;
  isPresentationMode: boolean;
  isNavDrawerOpen: boolean;
  isEventLogOpen: boolean;
  isHudVisible: boolean;
  showAnnotations: boolean;
  showSimulationDebug: boolean;
  cameraPreset: CameraPreset;
  auto360Config: Auto360Config;
  deformationScale: DeformationScale;
  
  // State Machine Lifecycle State
  lifecycleState: SimulationLifecycleState;
  
  // Bridge, Vehicles & Sensor State
  bridge: BridgeStructure;
  vehicles: Vehicle[];
  shipState: ShipVesselState;
  sensors: Record<string, BridgeSensor>;
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  selectedSensorId: string | null;
  
  // Physics Parameters & Telemetry
  params: SimulationParameters;
  timeline: TimelineState;
  dynamicLoad: DynamicLoadAssessment;
  loadPathVectors: LoadPathVector3D[];
  
  // Water & Environmental Hydraulics
  waterConfig: WaterEnvironmentConfig;
  
  // Active Scenario Configuration & Progressive Failure Simulation
  activeScenarioId: FailureScenarioType;
  collapseState: CollapseSimulationState;
  simulationEvents: SimulationEvent[];
  
  // Maintenance & 50-Year Trajectories
  interventions: MaintenanceIntervention[];
  comparativeTrajectories: ComparativeTrajectoryPoint[];
  
  // Historical Case Study
  historicalCase: HistoricalCaseStudy;
  
  // Demo Mode Guided Tour
  demoStepIndex: number;
  isDemoPlaying: boolean;

  // Environment Weather & Lighting
  weather: WeatherPreset;
  measurementMode: MeasurementMode;
  
  // Actions
  setWeather: (weather: WeatherPreset) => void;
  setMeasurementMode: (mode: MeasurementMode) => void;
  setActiveView: (view: ActiveAppView) => void;
  setViewMode3D: (mode: ViewMode3D) => void;
  setRenderingMode: (mode: RenderingMode) => void;
  toggleEngineeringMode: () => void;
  togglePresentationMode: () => void;
  setPresentationMode: (active: boolean) => void;
  toggleNavDrawer: () => void;
  setNavDrawer: (open: boolean) => void;
  toggleEventLog: () => void;
  setEventLog: (open: boolean) => void;
  toggleHud: () => void;
  setHudVisible: (visible: boolean) => void;
  toggleAnnotations: () => void;
  toggleSimulationDebug: () => void;
  setCameraPreset: (preset: CameraPreset) => void;
  resetCamera: () => void;
  focusComponent: (id?: string) => void;
  toggleAuto360: () => void;
  setAuto360Speed: (speed: number) => void;
  toggleAuto360Direction: () => void;
  setDeformationScale: (scale: DeformationScale) => void;
  selectComponent: (id: string | null) => void;
  hoverComponent: (id: string | null) => void;
  selectSensor: (id: string | null) => void;
  setParam: <K extends keyof SimulationParameters>(key: K, value: SimulationParameters[K]) => void;
  setTimelineYear: (year: number) => void;
  playTimeline: () => void;
  pauseTimeline: () => void;
  stepTimeline: (deltaYears: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  resetSimulation: () => void;
  
  // Scenario & Failure Actions
  runScenario: (scenarioId: FailureScenarioType) => void;
  triggerFailureSimulation: (scenarioId?: FailureScenarioType, triggerComponentId?: string, cause?: string) => void;
  resetFailureSimulation: () => void;
  setCinematicCamera: (active: boolean) => void;
  addSimulationEvent: (event: SimulationEvent) => void;
  
  // Maintenance Actions
  toggleIntervention: (interventionId: string) => void;
  
  // Demo Tour Actions
  startDemo: () => void;
  stopDemo: () => void;
  setDemoStep: (step: number) => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  
  // Continuous Physics Simulation Tick Loop
  tickSimulation: (deltaSeconds: number) => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => {
  return {
    activeView: 'DIGITAL_TWIN',
    viewMode3D: 'NORMAL',
    renderingMode: 'HYBRID',
    isEngineeringMode: true,
    isPresentationMode: false,
    isNavDrawerOpen: false,
    isEventLogOpen: false,
    isHudVisible: true,
    showAnnotations: true,
    showSimulationDebug: false,
    cameraPreset: 'DEFAULT',
    auto360Config: DEFAULT_AUTO_360,
    deformationScale: 50,
    
    lifecycleState: 'BASELINE',
    
    bridge: INITIAL_BRIDGE,
    vehicles: INITIAL_VEHICLES,
    shipState: DEFAULT_SHIP_STATE,
    sensors: INITIAL_BRIDGE_SENSORS,
    selectedComponentId: 'pier-p3',
    hoveredComponentId: null,
    selectedSensorId: null,
    
    params: DEFAULT_PARAMS,
    timeline: DEFAULT_TIMELINE,
    dynamicLoad: {
      staticTotalKn: 1485.3,
      dynamicAmplificationFactor: 0.25,
      totalDynamicLoadKn: 1856.6,
      peakPointLoadKn: 637.7,
      activeVehiclesCount: 4,
    },
    loadPathVectors: [],
    waterConfig: DEFAULT_WATER_CONFIG,
    
    activeScenarioId: 'OVERLOAD',
    collapseState: DEFAULT_COLLAPSE_STATE,
    simulationEvents: [
      {
        id: 'evt-init',
        timestampStr: new Date().toTimeString().split(' ')[0],
        simTimeSec: 0,
        category: 'TRAFFIC',
        message: 'CRYONEX 50-Year Digital Twin online. Baseline State: INTACT (2026).',
        severity: 'INFO',
      }
    ],
    interventions: DEFAULT_INTERVENTIONS,
    comparativeTrajectories: generateTrajectories(DEFAULT_INTERVENTIONS),
    historicalCase: MORANDI_HISTORICAL_CASE,
    
    demoStepIndex: 0,
    isDemoPlaying: false,
    weather: 'CLEAR_NOON',
    measurementMode: 'NONE',

    setWeather: (weather) => set({ weather }),
    setMeasurementMode: (mode) => set({ measurementMode: mode }),
    setActiveView: (view) => set({ activeView: view, isNavDrawerOpen: false }),
    setViewMode3D: (mode) => set({ viewMode3D: mode }),
    setRenderingMode: (mode) => set({ renderingMode: mode }),
    toggleEngineeringMode: () => set(state => ({ isEngineeringMode: !state.isEngineeringMode })),
    toggleSimulationDebug: () => set(state => ({ showSimulationDebug: !state.showSimulationDebug })),
    
    togglePresentationMode: () => {
      set(state => {
        const next = !state.isPresentationMode;
        return {
          isPresentationMode: next,
          isNavDrawerOpen: false,
          isEventLogOpen: false,
          activeView: 'DIGITAL_TWIN',
          cameraPreset: next ? 'DEFAULT' : state.cameraPreset,
        };
      });
    },

    setPresentationMode: (active) => {
      set({
        isPresentationMode: active,
        isNavDrawerOpen: false,
        isEventLogOpen: false,
        activeView: 'DIGITAL_TWIN',
      });
    },

    toggleNavDrawer: () => set(state => ({ isNavDrawerOpen: !state.isNavDrawerOpen })),
    setNavDrawer: (open) => set({ isNavDrawerOpen: open }),
    
    toggleEventLog: () => set(state => ({ isEventLogOpen: !state.isEventLogOpen })),
    setEventLog: (open) => set({ isEventLogOpen: open }),
    
    toggleHud: () => set(state => ({ isHudVisible: !state.isHudVisible })),
    setHudVisible: (visible) => set({ isHudVisible: visible }),
    
    toggleAnnotations: () => set(state => ({ showAnnotations: !state.showAnnotations })),
    
    setCameraPreset: (preset) => set({ cameraPreset: preset }),
    resetCamera: () => set({ cameraPreset: 'ISOMETRIC' }),
    
    focusComponent: (id) => {
      set(state => {
        const targetId = id || state.selectedComponentId || 'pier-p3';
        return {
          selectedComponentId: targetId,
          cameraPreset: 'COMPONENT',
          activeView: 'DIGITAL_TWIN',
        };
      });
    },

    toggleAuto360: () => {
      set(state => {
        if (state.cameraPreset === 'AUTO_360') {
          return {
            auto360Config: {
              ...state.auto360Config,
              isPlaying: !state.auto360Config.isPlaying,
            },
          };
        } else {
          return {
            cameraPreset: 'AUTO_360',
            auto360Config: {
              ...state.auto360Config,
              isPlaying: true,
            },
          };
        }
      });
    },

    setAuto360Speed: (speed) => {
      set(state => ({
        auto360Config: { ...state.auto360Config, speed },
      }));
    },

    toggleAuto360Direction: () => {
      set(state => ({
        auto360Config: {
          ...state.auto360Config,
          direction: state.auto360Config.direction === 1 ? -1 : 1,
        },
      }));
    },

    setDeformationScale: (scale) => set({ deformationScale: scale }),
    selectComponent: (id) => set({ selectedComponentId: id }),
    hoverComponent: (id) => set({ hoveredComponentId: id }),
    selectSensor: (id) => set({ selectedSensorId: id }),
    
    setParam: (key, value) => {
      set(state => ({
        params: { ...state.params, [key]: value },
      }));
    },

    setTimelineYear: (year) => {
      set(state => {
        const clamped = Math.max(state.timeline.startYear, Math.min(state.timeline.endYear, year));
        return {
          timeline: { ...state.timeline, currentYear: clamped, isFrozenOnFailure: false },
        };
      });
    },

    playTimeline: () => {
      const { timeline } = get();
      if (timeline.isFrozenOnFailure) return; // Frozen at failure
      set({ timeline: { ...timeline, isPlaying: true } });
    },

    pauseTimeline: () => set(state => ({ timeline: { ...state.timeline, isPlaying: false } })),
    
    stepTimeline: (deltaYears) => {
      const { timeline, setTimelineYear } = get();
      if (timeline.isFrozenOnFailure) return;
      let next = timeline.currentYear + deltaYears;
      if (next > timeline.endYear) next = timeline.startYear;
      if (next < timeline.startYear) next = timeline.endYear;
      setTimelineYear(next);
    },

    setPlaybackSpeed: (speed) => set(state => ({ timeline: { ...state.timeline, playbackSpeed: speed } })),

    resetSimulation: () => {
      const freshVehicles = INITIAL_VEHICLES.map(v => ({
        ...v,
        supportState: 'SUPPORTED' as const,
        verticalOffset: 0,
        fallVelocity: 0,
        pitchAngle: 0,
        rollAngle: 0,
      }));

      const freshComponents: Record<string, StructuralComponent> = {};
      for (const [id, c] of Object.entries(INITIAL_COMPONENTS)) {
        freshComponents[id] = {
          ...c,
          structuralState: 'HEALTHY',
          health: 92,
          rigidBody: {
            isConstrained: true,
            position: [...c.position],
            rotation: [0, 0, 0],
            velocity: [0, 0, 0],
            angularVelocity: [0, 0, 0],
            mass: c.massKg,
            timeSinceRelease: 0,
          },
        };
      }

      set({
        lifecycleState: 'BASELINE',
        params: DEFAULT_PARAMS,
        timeline: { ...DEFAULT_TIMELINE, currentYear: 2026, isPlaying: false, isFrozenOnFailure: false },
        collapseState: DEFAULT_COLLAPSE_STATE,
        waterConfig: DEFAULT_WATER_CONFIG,
        shipState: DEFAULT_SHIP_STATE,
        activeScenarioId: 'OVERLOAD',
        selectedComponentId: 'pier-p3',
        viewMode3D: 'NORMAL',
        renderingMode: 'HYBRID',
        deformationScale: 50,
        cameraPreset: 'ISOMETRIC',
        weather: 'CLEAR_NOON',
        measurementMode: 'NONE',
        interventions: DEFAULT_INTERVENTIONS,
        comparativeTrajectories: generateTrajectories(DEFAULT_INTERVENTIONS),
        bridge: {
          ...INITIAL_BRIDGE,
          overallHealth: 92,
          overallUtilization: 0.35,
          overallRisk: 'NORMAL',
          components: freshComponents,
        },
        vehicles: freshVehicles,
        simulationEvents: [
          {
            id: `evt-reset-${Date.now()}`,
            timestampStr: new Date().toTimeString().split(' ')[0],
            simTimeSec: 0,
            category: 'MECHANICS',
            message: 'Baseline bridge structural integrity and state machine restored to Year 2026 (+0.0y).',
            severity: 'INFO',
          }
        ],
      });
    },

    runScenario: (scenarioId) => {
      const { resetSimulation } = get();
      resetSimulation();

      const def = SCENARIOS_DEFINITIONS[scenarioId] || SCENARIOS_DEFINITIONS.OVERLOAD;

      const newParams: SimulationParameters = {
        ...DEFAULT_PARAMS,
        structuralLoadPercentage: Math.round(35 * def.liveLoadMultiplier),
        corrosionPercentage: Math.round(15 * def.corrosionRateMultiplier),
        crackSeverityPercentage: Math.round(20 * def.crackGrowthMultiplier),
        environmentalStress: scenarioId === 'CORROSION' ? 85 : 30,
        dynamicAmplificationFactor: scenarioId === 'OVERLOAD' ? 0.38 : 0.25,
        vehicleOverloadMultiplier: def.liveLoadMultiplier,
        seismicIntensity: def.seismicAccelerationG * 10,
      };

      const newWater: WaterEnvironmentConfig = {
        ...DEFAULT_WATER_CONFIG,
        currentVelocityMps: scenarioId === 'SCOUR' ? 3.8 : 1.8,
        scourExcavationDepthM: def.scourExcavationDepthM,
        waterCurrentVisible: scenarioId === 'SCOUR',
      };

      const newShip: ShipVesselState = {
        ...DEFAULT_SHIP_STATE,
        active: scenarioId === 'SHIP_COLLISION',
        position: [6.0, -0.5, -28.0],
        impactOccurred: false,
        impactTimeSec: 0,
      };

      const targetComp = def.affectedComponents[0] || 'pier-p3';

      set({
        lifecycleState: 'AGING',
        activeScenarioId: scenarioId,
        params: newParams,
        waterConfig: newWater,
        shipState: newShip,
        selectedComponentId: targetComp,
        activeView: 'DIGITAL_TWIN',
        simulationEvents: [
          {
            id: `evt-scen-init-${Date.now()}`,
            timestampStr: new Date().toTimeString().split(' ')[0],
            simTimeSec: 0,
            category: 'MECHANICS',
            message: `Scenario "${def.name}" initialized. Expected failure year: ${def.expectedFailureYear}`,
            severity: 'INFO',
          }
        ],
      });
    },

    triggerFailureSimulation: (scenarioId = 'OVERLOAD', triggerComponentId = 'girder-g2', cause = 'Excessive Flexural Demand') => {
      set(state => ({
        lifecycleState: 'FAILURE_TRIGGERED',
        timeline: {
          ...state.timeline,
          isPlaying: false,
          isFrozenOnFailure: true,
        },
        collapseState: {
          ...DEFAULT_COLLAPSE_STATE,
          isActive: true,
          activeScenarioId: scenarioId,
          triggerComponentId,
          triggerCause: cause,
          stage: 'INITIATING_YIELD',
          cinematicCameraActive: true,
        },
        selectedComponentId: triggerComponentId,
      }));
    },

    resetFailureSimulation: () => {
      const { resetSimulation } = get();
      resetSimulation();
    },

    setCinematicCamera: (active) => {
      set(state => ({
        collapseState: { ...state.collapseState, cinematicCameraActive: active },
      }));
    },

    addSimulationEvent: (event) => {
      set(state => ({
        simulationEvents: [...state.simulationEvents.slice(-25), event],
      }));
    },

    toggleIntervention: (interventionId) => {
      set(state => {
        const updated = state.interventions.map(item => 
          item.id === interventionId ? { ...item, applied: !item.applied } : item
        );
        return {
          interventions: updated,
          comparativeTrajectories: generateTrajectories(updated),
        };
      });
    },

    startDemo: () => set({ isDemoPlaying: true, demoStepIndex: 0, isPresentationMode: true }),
    stopDemo: () => set({ isDemoPlaying: false }),
    setDemoStep: (step) => set({ demoStepIndex: step }),
    nextDemoStep: () => set(state => ({ demoStepIndex: (state.demoStepIndex + 1) % 12 })),
    prevDemoStep: () => set(state => ({ demoStepIndex: Math.max(0, state.demoStepIndex - 1) })),

    tickSimulation: (deltaSeconds) => {
      const state = get();
      const { params, timeline, collapseState, bridge, vehicles, shipState, waterConfig, simulationEvents, activeScenarioId, lifecycleState } = state;
      const scenarioDef = SCENARIOS_DEFINITIONS[activeScenarioId] || SCENARIOS_DEFINITIONS.OVERLOAD;

      // 1. Advance 50-Year Timeline if Playing and NOT Frozen on Failure
      if (timeline.isPlaying && !timeline.isFrozenOnFailure && lifecycleState !== 'POST_FAILURE') {
        const rate = (deltaSeconds * (50 / 30)) * timeline.playbackSpeed;
        let nextYear = timeline.currentYear + rate;

        // Dynamic Limit State Check during Timeline Playback
        if (nextYear >= scenarioDef.expectedFailureYear) {
          nextYear = scenarioDef.expectedFailureYear;
          // Trigger failure at exact scenario limit year!
          const critComp = scenarioDef.affectedComponents[0] || 'pier-p3';
          set({
            lifecycleState: 'FAILURE_TRIGGERED',
            timeline: { ...timeline, currentYear: nextYear, isPlaying: false, isFrozenOnFailure: true },
            collapseState: {
              ...DEFAULT_COLLAPSE_STATE,
              isActive: true,
              activeScenarioId,
              triggerComponentId: critComp,
              triggerCause: `${scenarioDef.name}: Limit state reached in Year ${Math.floor(nextYear)}`,
              stage: 'INITIATING_YIELD',
              cinematicCameraActive: true,
            },
          });
          return;
        } else if (nextYear >= timeline.endYear) {
          set({ timeline: { ...timeline, currentYear: timeline.endYear, isPlaying: false } });
        } else {
          set({ timeline: { ...timeline, currentYear: nextYear } });
        }
      }

      const yearsElapsed = Math.max(0, state.timeline.currentYear - 2026); // 0.0 to 50.0 years

      // Update State Machine Lifecycle
      let currentLifecycle: SimulationLifecycleState = lifecycleState;
      if (collapseState.isActive) {
        currentLifecycle = collapseState.stage === 'POST_FAILURE_EQUILIBRIUM' ? 'POST_FAILURE' : 'COLLAPSING';
      } else if (yearsElapsed > 35) {
        currentLifecycle = 'CRITICAL';
      } else if (yearsElapsed > 15) {
        currentLifecycle = 'DAMAGE_DEVELOPMENT';
      } else if (yearsElapsed > 5) {
        currentLifecycle = 'AGING';
      }

      // 2. Process Traffic Kinematics & Dynamic Live Loads
      const { updatedVehicles, spanLoads, globalAssessment } = processVehicleTrafficAndLoads(
        vehicles,
        deltaSeconds,
        bridge.totalLengthMeters,
        params.dynamicAmplificationFactor,
        bridge.components
      );

      // 3. Process Component Physics & 50-Year Degradation (Only if NOT post-failure)
      const updatedComponents: Record<string, StructuralComponent> = {};
      let totalWeightedHealth = 0;
      let totalWeights = 0;
      let peakStressMPa = 0;
      let maxDeformationMm = 0;
      let maxUtilization = 0;

      for (const [id, baseComp] of Object.entries(bridge.components)) {
        let crackSev = baseComp.damage.crackSeverity;
        let corrPerc = baseComp.damage.corrosionPercentage;

        const isDirectlyAffected = scenarioDef.affectedComponents.includes(id);
        const isSecondaryAffected = scenarioDef.secondaryAffectedComponents.includes(id);

        if (isDirectlyAffected) {
          crackSev = Math.max(crackSev, params.crackSeverityPercentage * scenarioDef.crackGrowthMultiplier);
          corrPerc = Math.max(corrPerc, params.corrosionPercentage * scenarioDef.corrosionRateMultiplier);
        } else if (isSecondaryAffected) {
          crackSev = Math.max(crackSev * 0.9, params.crackSeverityPercentage * 0.7);
          corrPerc = Math.max(corrPerc * 0.9, params.corrosionPercentage * 0.7);
        } else {
          crackSev = Math.max(crackSev * 0.7, params.crackSeverityPercentage * 0.3);
          corrPerc = Math.max(corrPerc * 0.7, params.corrosionPercentage * 0.3);
        }

        // 50-Year Degradation Formula
        const timeRateCrack = (yearsElapsed * 0.8) + Math.pow(yearsElapsed * 0.045, 1.9) * (isDirectlyAffected ? scenarioDef.crackGrowthMultiplier : 1.0);
        const timeRateCorr = (yearsElapsed * 0.7) + Math.pow(yearsElapsed * 0.040, 1.8) * (isDirectlyAffected ? scenarioDef.corrosionRateMultiplier : 1.0);

        crackSev = Math.min(100, crackSev + timeRateCrack);
        corrPerc = Math.min(100, corrPerc + timeRateCorr);

        const appliedIntervention = state.interventions.find(i => i.targetComponentId === id && i.applied);
        if (appliedIntervention && state.timeline.currentYear >= appliedIntervention.yearScheduled) {
          crackSev = Math.max(5, crackSev - 30);
          corrPerc = Math.max(5, corrPerc * (1 - appliedIntervention.corrosionMitigationPercentage / 100));
        }

        const corrosionEval = calculateCorrosionSectionLoss(
          baseComp.section,
          corrPerc,
          crackSev,
          yearsElapsed,
          params.environmentalStress
        );

        const updatedSection = {
          ...baseComp.section,
          effectiveAreaM2: corrosionEval.effectiveAreaM2,
          effectiveMomentOfInertiaM4: corrosionEval.effectiveMomentOfInertiaM4,
        };

        const livePointLoadKn = spanLoads[id] ? spanLoads[id].primaryPointLoadKn * (isDirectlyAffected ? scenarioDef.liveLoadMultiplier : 1.0) : 0;
        const livePointLoadRelX = spanLoads[id] ? spanLoads[id].relativePointLoadX : 0.5;

        const mechanics = calculateComponentMechanics(
          { ...baseComp, section: updatedSection },
          livePointLoadKn,
          livePointLoadRelX,
          params.dynamicAmplificationFactor
        );

        const fractureEval = evaluateFractureMechanics(
          crackSev,
          mechanics.totalStressMPa,
          1.12,
          baseComp.material.fractureToughnessMPaSqrtM
        );

        const updatedDamage = {
          ...baseComp.damage,
          crackSeverity: Math.round(crackSev),
          crackWidthMm: fractureEval.crackOpeningWidthMm,
          stressIntensityFactorKI: fractureEval.stressIntensityFactorKI,
          corrosionPercentage: Math.round(corrPerc),
          sectionLossAreaM2: corrosionEval.sectionLossRatio * baseComp.section.areaM2,
          effectiveSectionLossRatio: corrosionEval.sectionLossRatio,
          chlorideIngressMm: corrosionEval.chlorideIngressMm,
          spallingAreaSqM: corrosionEval.spallingAreaSqM,
          rebarExposure: corrosionEval.rebarExposure,
          state: fractureEval.crackProgressionState,
        };

        const tempComp: StructuralComponent = {
          ...baseComp,
          section: updatedSection,
          appliedForceKn: mechanics.appliedForceKn,
          bendingMomentKnM: mechanics.bendingMomentKnM,
          stressMPa: mechanics.totalStressMPa,
          axialStressMPa: mechanics.axialStressMPa,
          bendingStressMPa: mechanics.bendingStressMPa,
          strain: mechanics.strain,
          deformationMm: mechanics.deformationMm,
          deflectionRatio: mechanics.deflectionRatio,
          effectiveCapacityKn: mechanics.effectiveCapacityKn,
          demandKn: mechanics.appliedForceKn,
          utilizationRatio: mechanics.utilizationRatio,
          safetyFactor: mechanics.safetyFactor,
          damage: updatedDamage,
        };

        const healthEval = calculatePhysicsHealthAndRisk(tempComp);
        tempComp.health = healthEval.healthScore;
        tempComp.risk = healthEval.risk;
        tempComp.maintenancePriority = healthEval.maintenancePriority;
        tempComp.structuralState = healthEval.structuralState;
        tempComp.riskDrivers = healthEval.riskDrivers;

        updatedComponents[id] = tempComp;

        const w = tempComp.criticalityWeight || 1.0;
        totalWeightedHealth += tempComp.health * w;
        totalWeights += w;
        if (tempComp.stressMPa > peakStressMPa) peakStressMPa = tempComp.stressMPa;
        if (tempComp.deformationMm > maxDeformationMm) maxDeformationMm = tempComp.deformationMm;
        if (tempComp.utilizationRatio > maxUtilization) maxUtilization = tempComp.utilizationRatio;
      }

      // 4. Handle Progressive Structural Collapse & Ship Collision Kinematics
      let finalComponents = updatedComponents;
      let finalCollapseState = collapseState;
      let finalShip = shipState;
      let currentScourDepth = waterConfig.scourExcavationDepthM;
      let newEvents = [...simulationEvents];

      if (collapseState.isActive) {
        const failureStep = stepScenarioFailurePhysics(
          updatedComponents,
          collapseState,
          deltaSeconds,
          shipState
        );
        finalComponents = failureStep.updatedComponents;
        finalCollapseState = failureStep.updatedState;
        finalShip = failureStep.updatedShip;
        currentScourDepth = failureStep.activeScourDepthM;
        if (failureStep.events.length > 0) {
          newEvents = [...newEvents.slice(-25), ...failureStep.events];
        }
        if (finalCollapseState.stage === 'POST_FAILURE_EQUILIBRIUM') {
          currentLifecycle = 'POST_FAILURE';
        }
      }

      // 5. Compute 3D Load Path Vectors
      const loadPathVectors = calculate3DLoadPathVectors(updatedVehicles, finalComponents);

      const overallHealth = Math.round(totalWeightedHealth / Math.max(1, totalWeights));
      let overallRisk = bridge.overallRisk;
      if (finalCollapseState.isActive || overallHealth < 30 || maxUtilization > 1.0) overallRisk = 'CRITICAL';
      else if (overallHealth < 55 || maxUtilization > 0.8) overallRisk = 'HIGH';
      else if (overallHealth < 75 || maxUtilization > 0.6) overallRisk = 'MODERATE';
      else overallRisk = 'NORMAL';

      set({
        lifecycleState: currentLifecycle,
        vehicles: updatedVehicles,
        shipState: finalShip,
        dynamicLoad: globalAssessment,
        loadPathVectors,
        collapseState: finalCollapseState,
        simulationEvents: newEvents,
        waterConfig: {
          ...waterConfig,
          scourExcavationDepthM: currentScourDepth,
        },
        bridge: {
          ...bridge,
          overallHealth,
          overallUtilization: Math.round(maxUtilization * 100) / 100,
          overallRisk,
          peakStressMPa: Math.round(peakStressMPa * 10) / 10,
          maxDeformationMm: Math.round(maxDeformationMm * 10) / 10,
          systemSafetyFactor: Math.max(0.1, Math.round((1.0 / Math.max(0.01, maxUtilization)) * 100) / 100),
          components: finalComponents,
        },
      });
    },
  };
});
