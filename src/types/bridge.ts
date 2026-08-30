import { MaterialProperties, SectionProperties, DataStatus } from './physics';
import { GeographicCoordinate, RealityCaptureMetadata } from './geospatial';

export type ComponentType = 
  | 'deck'
  | 'pier'
  | 'pier_cap'
  | 'foundation'
  | 'beam'
  | 'cable'
  | 'bearing'
  | 'abutment';

export type RiskLevel = 
  | 'NORMAL'
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL';

export type MaintenancePriority = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';

export type ComponentStructuralState = 
  | 'HEALTHY'
  | 'MONITORED'
  | 'DAMAGED'
  | 'CRITICAL'
  | 'FAILED'
  | 'FALLING'
  | 'POST_FAILURE';

export interface ComponentDamage {
  crackSeverity: number;             // 0 - 100%
  crackLengthMeters: number;         // physical crack length (a)
  crackWidthMm: number;              // crack opening displacement (w)
  crackOrientationDeg: number;       // 0 = longitudinal, 45 = shear, 90 = flexural
  stressIntensityFactorKI: number;   // K_I in MPa√m
  fractureToughnessKIc: number;      // K_Ic in MPa√m (e.g. 2.2 for concrete)
  corrosionPercentage: number;       // 0 - 100%
  sectionLossAreaM2: number;         // A_loss in m²
  effectiveSectionLossRatio: number; // A_loss / A_0 (e.g. 0.18 = 18%)
  chlorideIngressMm: number;         // diffusion penetration depth (mm)
  spallingAreaSqM: number;           // concrete cover spalling area
  rebarExposure: boolean;
  state: 'INITIAL' | 'MICRO_CRACK' | 'VISIBLE_CRACK' | 'PROPAGATING' | 'CRITICAL_FRACTURE';
}

export interface RigidBodyMotion {
  position: [number, number, number];
  velocity: [number, number, number];
  rotation: [number, number, number];
  angularVelocity: [number, number, number];
  mass: number;
  isConstrained: boolean;
  timeSinceRelease: number;
  shearSlipOffset?: [number, number, number];
  settlementTiltAngle?: number;
}

export interface StructuralComponent {
  id: string;
  name: string;
  type: ComponentType;
  spanIndex?: number;
  material: MaterialProperties;
  section: SectionProperties;
  lengthMeters: number;
  massKg: number;
  selfWeightKn: number;
  position: [number, number, number];
  dimensions: [number, number, number]; // [length, height, width]
  
  // Real-Time Calculated Physics Metrics
  deadLoadKn: number;
  liveLoadKn: number;
  appliedForceKn: number;            // F_total (kN)
  bendingMomentKnM: number;          // M (kN·m)
  shearForceKn: number;              // V (kN)
  stressMPa: number;                 // σ_total (MPa)
  axialStressMPa: number;            // σ_axial = F / A (MPa)
  bendingStressMPa: number;          // σ_bending = M * y / I (MPa)
  shearStressMPa: number;            // τ_shear (MPa)
  strain: number;                    // ε = σ / E
  deformationMm: number;             // δ (mm)
  deflectionRatio: string;           // e.g. "L/1250"
  
  // Capacity & Safety Margin
  designCapacityKn: number;
  effectiveCapacityKn: number;       // Reduced by section loss
  demandKn: number;                  // Applied load
  utilizationRatio: number;          // Demand / Capacity (0.0 to >1.0)
  safetyFactor: number;              // Capacity / Demand
  
  // Health, Risk & Lifecycle State
  health: number;                    // 0 - 100%
  risk: RiskLevel;
  riskDrivers: {
    primary: string;
    utilizationContribution: number; // e.g. 45%
    crackContribution: number;       // e.g. 30%
    corrosionContribution: number;   // e.g. 15%
    deflectionContribution: number;  // e.g. 10%
  };
  maintenancePriority: MaintenancePriority;
  structuralState: ComponentStructuralState;
  
  // Advanced Damage Subsystem
  damage: ComponentDamage;
  
  // Rigid Body Dynamics for Progressive Failure
  rigidBody: RigidBodyMotion;
  
  criticalityWeight: number;
  installedYear: number;
  designLifeYears: number;
  dataStatus: DataStatus;
}

export interface BridgeStructure {
  id: string;
  name: string;
  assetCode: string;
  location: string;
  geographicCoordinate: GeographicCoordinate;
  realityCapture: RealityCaptureMetadata;
  totalLengthMeters: number;
  spansCount: number;
  constructionYear: number;
  designLifeYears: number;
  overallHealth: number;
  overallUtilization: number;
  overallRisk: RiskLevel;
  peakStressMPa: number;
  maxDeformationMm: number;
  systemSafetyFactor: number;
  components: Record<string, StructuralComponent>;
}
