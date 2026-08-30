export type SensorType = 
  | 'STRAIN_GAUGE'
  | 'ACCELEROMETER'
  | 'TILTMETER'
  | 'WATER_LEVEL'
  | 'SCOUR_DEPTH'
  | 'CORROSION_LPR'
  | 'DISPLACEMENT_LVDT';

export type SensorDataStatus = 'LIVE' | 'SIMULATED' | 'CALIBRATING' | 'OFFLINE';

export interface SensorTelemetryPoint {
  timestampIso: string;
  value: number;
  unit: string;
}

export interface BridgeSensor {
  id: string;
  name: string;
  type: SensorType;
  componentId: string;
  position3D: [number, number, number];
  unit: string;
  currentValue: number;
  status: SensorDataStatus;
  samplingRateHz: number;
  lowerThreshold: number;
  upperThreshold: number;
  criticalThreshold: number;
  historicalReadings: SensorTelemetryPoint[];
  provenance: {
    manufacturer: string;
    model: string;
    serialNumber: string;
    calibrationDate: string;
    accuracyPercent: number;
  };
}
