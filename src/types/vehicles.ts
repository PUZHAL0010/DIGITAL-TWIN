export type VehicleClass = 
  | 'CAR'
  | 'BUS'
  | 'TRUCK'
  | 'HEAVY_TRUCK'
  | 'OVERLOAD_FREIGHT';

export type VehicleSupportState = 
  | 'SUPPORTED'
  | 'BRAKING'
  | 'FALLING'
  | 'GROUNDED';

export interface Vehicle {
  id: string;
  name: string;
  vehicleClass: VehicleClass;
  massKg: number;
  massTonnes: number;
  staticForceKn: number;     // F = m * g
  axleCount: number;
  axleSpacingM: number[];
  lane: -1 | 1;              // -1 = Westbound (z = -1.8), 1 = Eastbound (z = 1.8)
  positionX: number;         // X coordinate along bridge (-28 to +28 m)
  speedMps: number;          // velocity in m/s (e.g. 16.6 m/s = 60 km/h)
  lengthM: number;
  widthM: number;
  heightM: number;
  colorHex: string;
  currentSpanId?: string;
  
  // Failure Response & Fall Kinematics
  supportState?: VehicleSupportState;
  verticalOffset?: number;   // Y offset during fall
  fallVelocity?: number;     // downward velocity m/s
  pitchAngle?: number;       // tilt angle rad
  rollAngle?: number;        // roll angle rad
}

export interface DynamicLoadAssessment {
  staticTotalKn: number;
  dynamicAmplificationFactor: number; // DAF e.g. 0.30 (30% increase)
  totalDynamicLoadKn: number;         // P_dyn = P_stat * (1 + DAF)
  peakPointLoadKn: number;
  activeVehiclesCount: number;
}
