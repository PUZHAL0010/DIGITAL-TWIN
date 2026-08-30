export type DefectType = 
  | 'crack_flexural'
  | 'crack_shear'
  | 'spalling_concrete'
  | 'corrosion_staining'
  | 'rebar_exposure'
  | 'bearing_misalignment'
  | 'pothole_asphalt';

export interface DefectAnnotation {
  id: string;
  componentId: string;
  type: DefectType;
  confidenceScore: number; // 0.0 to 1.0 (e.g. 0.94 from YOLO-V8 / Mask R-CNN)
  position3D: [number, number, number];
  dimensionsMeters: [number, number, number];
  severityScore: number; // 0 - 100
  droneCaptureTimestamp: string;
  imageUrl?: string;
  boundingPoly3D?: [number, number, number][];
}

export interface DroneFlightWaypoint {
  id: string;
  position: [number, number, number];
  cameraHeadingDeg: number;
  altitudeMeters: number;
  scanTargetComponentId?: string;
}

export interface DroneScanMission {
  missionId: string;
  droneModel: string;
  flightDate: string;
  totalPhotosCaptured: number;
  pointCloudDensityPtsSqM: number;
  photogrammetryResolutionMm: number; // e.g. 0.8 mm/pixel
  detectedDefectsCount: number;
  waypoints: DroneFlightWaypoint[];
  defects: DefectAnnotation[];
}
