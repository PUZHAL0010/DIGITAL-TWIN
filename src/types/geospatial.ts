export interface GeographicCoordinate {
  latitude: number;             // e.g. 18.5204
  longitude: number;            // e.g. 73.8567
  elevationMslMeters: number;   // Mean Sea Level elevation e.g. 560.2m
  datum: string;                // e.g. 'WGS84 / EPSG:4326'
  localGridOrigin: [number, number, number]; // [0.0, 0.0, 0.0] in meters
}

export interface RealityCaptureMetadata {
  captureSource: 'DRONE_PHOTOGRAMMETRY' | 'TERRESTRIAL_LIDAR' | 'MOBILE_MAPPING' | 'BIM_IFC';
  captureDate: string;          // e.g. '2026-08-20'
  reconstructionEngine: string; // e.g. 'CRYONEX Reality Engine v2.4 (Cesium 3D Tiles 1.1)'
  pointDensityPtsM2: number;    // e.g. 1420 pts/m²
  spatialAccuracyMm: number;    // e.g. ±4.5 mm
  validationScorePercent: number; // e.g. 96.4%
  totalVerticesCount: number;
  totalTrianglesCount: number;
  textureResolution: string;    // e.g. '8K PBR UDIM'
}
