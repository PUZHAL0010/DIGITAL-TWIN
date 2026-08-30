import { FailureScenarioType } from './simulation';
export type { FailureScenarioType };

export type FailureStage = 
  | 'STABLE'
  | 'INITIATING_YIELD'
  | 'CRITICAL_FRACTURE'
  | 'CONSTRAINT_RELEASE'
  | 'PROGRESSIVE_COLLAPSE'
  | 'POST_FAILURE_EQUILIBRIUM';

export type CollapseKinematicMode = 
  | 'FLEXURAL_SAG'
  | 'LOCALIZED_SUBSIDENCE'
  | 'FATIGUE_CLEAVAGE'
  | 'SCOUR_ASYMMETRIC_TILT'
  | 'DIAGONAL_SHEAR_SLIP'
  | 'CABLE_SNAP_ROTATION'
  | 'SHIP_IMPACT_FRACTURE'
  | 'SEISMIC_OSCILLATION';

export interface ScenarioFailureConfig {
  scenarioId: FailureScenarioType;
  title: string;
  failureMechanism: string;
  affectedComponents: string[];
  secondaryAffectedComponents: string[];
  damageRateMultiplier: number;
  failureCriterionDescription: string;
  collapseKinematicMode: CollapseKinematicMode;
  scourExcavationDepthMeters: number;
  debrisCount: number;
}

export interface CollapseSimulationState {
  stage: FailureStage;
  isActive: boolean;
  activeScenarioId: FailureScenarioType;
  simulationTimeSec: number;
  triggerComponentId: string;
  triggerCause: string;
  collapsedComponentIds: string[];
  failedJointIds: string[];
  cinematicCameraActive: boolean;
  totalEnergyReleasedMj: number;
  disclaimer: string;
}
