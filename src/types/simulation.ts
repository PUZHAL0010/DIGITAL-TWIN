export type ActiveAppView = 
  | 'DIGITAL_TWIN'
  | 'HISTORICAL_CASE'
  | 'SIMULATION'
  | 'DAMAGE'
  | 'WHAT_IF'
  | 'ANALYTICS'
  | 'SENSORS'
  | 'MAINTENANCE'
  | 'ENGINEERING_DATA'
  | 'VALIDATION'
  | 'SOURCES'
  | 'DEMO_MODE';

export type ViewMode3D = 
  | 'NORMAL'
  | 'STRESS'
  | 'DEFORMATION'
  | 'DAMAGE'
  | 'RISK'
  | 'LOAD_PATH';

export type RenderingMode = 
  | 'SOLID'
  | 'WIREFRAME'
  | 'HYBRID';

export type CameraPreset = 
  | 'DEFAULT'
  | 'FREE'
  | 'FRONT'
  | 'BACK'
  | 'LEFT'
  | 'RIGHT'
  | 'TOP'
  | 'BOTTOM'
  | 'ISOMETRIC'
  | 'UNDER_DECK'
  | 'UNDER_BRIDGE'
  | 'WATER_LEVEL'
  | 'UNDERWATER'
  | 'COMPONENT'
  | 'AUTO_360'
  | 'DRONE_INSPECTION'
  | 'CINEMATIC';

export type WeatherPreset = 
  | 'CLEAR_NOON'
  | 'GOLDEN_HOUR'
  | 'OVERCAST'
  | 'RAIN'
  | 'FOG'
  | 'NIGHT';

export type MeasurementMode = 
  | 'NONE'
  | 'DISTANCE'
  | 'SPAN'
  | 'CRACK'
  | 'DEFLECTION';

export type DeformationScale = 1 | 10 | 50 | 100;

export type SimulationLifecycleState = 
  | 'BASELINE'
  | 'AGING'
  | 'DAMAGE_DEVELOPMENT'
  | 'CRITICAL'
  | 'FAILURE_TRIGGERED'
  | 'COLLAPSING'
  | 'POST_FAILURE'
  | 'RESETTING';

export type FailureScenarioType = 
  | 'CORROSION'
  | 'OVERLOAD'
  | 'SHIP_COLLISION'
  | 'SCOUR'
  | 'DEFERRED_MAINTENANCE'
  | 'SEISMIC';

export interface Auto360Config {
  isPlaying: boolean;
  speed: number;        // 0.5, 1.0, 2.0
  direction: 1 | -1;    // 1: clockwise, -1: counter-clockwise
}

export interface ShipVesselState {
  active: boolean;
  position: [number, number, number]; // [x, y, z] in water coordinates
  velocityMps: number;                // e.g. 3.33 m/s = 12 km/h
  headingRad: number;
  massTonnes: number;                 // e.g. 3500 t
  kineticEnergyMj: number;            // E = 0.5 * m * v^2
  impactOccurred: boolean;
  impactTimeSec: number;
}

export interface ScenarioDefinition {
  id: FailureScenarioType;
  name: string;
  badge: string;
  mechanism: string;
  affectedComponents: string[];
  secondaryAffectedComponents: string[];
  liveLoadMultiplier: number;
  corrosionRateMultiplier: number;
  crackGrowthMultiplier: number;
  scourExcavationDepthM: number;
  seismicAccelerationG: number;
  shipImpactActive: boolean;
  failureCriterionDescription: string;
  collapseMode: string;
  expectedFailureYear: number;
  baselineHealth50Years: number;
  scenarioHealth50Years: number;
}

export interface SimulationParameters {
  structuralLoadPercentage: number;  // 0 - 100%
  crackSeverityPercentage: number;   // 0 - 100%
  corrosionPercentage: number;       // 0 - 100%
  environmentalStress: number;       // 0 - 100%
  trafficFlowRateVehMin: number;     // vehicles / min
  dynamicAmplificationFactor: number;// DAF (0.0 to 0.60)
  vehicleOverloadMultiplier: number; // 1.0x to 2.5x
  seismicIntensity: number;          // 0 to 5.0 Richter / g
}

export interface TimelineState {
  currentYear: number;               // 2026 - 2076 (50-year horizon)
  startYear: number;                 // 2026 (Year 0)
  endYear: number;                   // 2076 (Year 50)
  isPlaying: boolean;
  isFrozenOnFailure: boolean;        // Timeline stops advancing when failure triggers
  playbackSpeed: number;             // 1x, 2x, 5x, 10x, 25x, 50x
  mode: 'CONTEMPORARY' | 'HISTORICAL_MORANDI';
}

export interface MaintenanceIntervention {
  id: string;
  yearScheduled: number;
  actionType: 'CFRP_WRAPPING' | 'EPOXY_INJECTION' | 'CABLE_STAY_REPLACEMENT' | 'BEARING_RENEWAL' | 'DECK_HYDRODEMOLITION';
  targetComponentId: string;
  costUSD: number;
  capacityRestorationPercentage: number;
  corrosionMitigationPercentage: number;
  applied: boolean;
}

export interface ComparativeTrajectoryPoint {
  year: number;
  healthWithoutMaintenance: number;
  healthWithMaintenance: number;
  capacityWithoutKn: number;
  capacityWithKn: number;
  riskWithout: string;
  riskWith: string;
}

export interface SimulationEvent {
  id: string;
  timestampStr: string;
  simTimeSec: number;
  category: 'TRAFFIC' | 'MECHANICS' | 'DAMAGE' | 'CONSTRAINT' | 'FAILURE' | 'WATER' | 'VESSEL' | 'SEISMIC';
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  componentId?: string;
}

export interface WaterEnvironmentConfig {
  currentVelocityMps: number;
  waterLevelM: number;
  flowDirectionRad: number;
  scourExcavationDepthM: number;
  waterCurrentVisible: boolean;
}

export interface MaintenanceRecommendation {
  id: string;
  componentId: string;
  componentName: string;
  urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'MONITOR';
  title: string;
  description: string;
  suggestedAction: string;
  estimatedCostUSD: number;
  timeToFailureMonths: number;
  priority: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
}

export interface ScenarioPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  engineeringRationale: string;
  parameters: {
    structuralLoadPercentage: number;
    crackSeverityPercentage: number;
    corrosionPercentage: number;
    environmentalStress: number;
    trafficFlowRateVehMin: number;
    dynamicAmplificationFactor: number;
    vehicleOverloadMultiplier: number;
    seismicIntensity: number;
  };
  targetComponentId: string;
  simulatedYearOffset: number;
}
