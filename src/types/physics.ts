export type SIUnit = 
  | 'N'
  | 'kN'
  | 'MN'
  | 'Pa'
  | 'kPa'
  | 'MPa'
  | 'GPa'
  | 'm'
  | 'mm'
  | 'cm'
  | 'm²'
  | 'mm²'
  | 'm⁴'
  | 'mm⁴'
  | 'kg'
  | 't'
  | 'm/s²'
  | 'm/s'
  | 'km/h'
  | 's'
  | 'yr'
  | '%'
  | 'ratio'
  | 'MPa√m';

export type DataStatus = 
  | 'VERIFIED'
  | 'USER_PROVIDED'
  | 'SIMULATION_INPUT'
  | 'PROTOTYPE_ASSUMPTION';

export interface EngineeringValue {
  value: number;
  unit: SIUnit;
  formatted: string;
  formula?: string;
  source: DataStatus;
  notes?: string;
}

export interface SectionProperties {
  areaM2: number;            // Cross-sectional area (m²)
  momentOfInertiaM4: number;  // Second moment of area I_xx (m⁴)
  sectionModulusM3: number;   // Elastic section modulus W = I / y_max (m³)
  heightM: number;
  widthM: number;
  effectiveAreaM2: number;   // A_eff factoring corrosion section loss
  effectiveMomentOfInertiaM4: number; // I_eff factoring damage
}

export interface MaterialProperties {
  name: string;
  type: 'CONCRETE' | 'STEEL' | 'STAY_CABLE' | 'ELASTOMER';
  youngsModulusGPa: number;       // E (GPa)
  yieldStrengthMPa: number;       // σ_yield / f_ck (MPa)
  ultimateStrengthMPa: number;    // σ_ult / f_tk (MPa)
  fractureToughnessMPaSqrtM: number; // K_Ic (MPa√m)
  densityKgM3: number;            // ρ (kg/m³)
  poissonRatio: number;           // ν
  thermalExpansionCoeff: number;  // α (1/K)
}
