import { ComponentDamage } from '../types/bridge';

export interface FractureAssessment {
  stressIntensityFactorKI: number; // K_I (MPa√m)
  fractureToughnessKIc: number;   // K_Ic (MPa√m)
  isFractureCritical: boolean;    // K_I >= K_Ic
  fractureRatio: number;          // K_I / K_Ic
  crackProgressionState: ComponentDamage['state'];
  crackOpeningWidthMm: number;
}

/**
 * Evaluates Linear Elastic Fracture Mechanics (LEFM) for a crack under applied tensile/shear stress.
 * Equation: K_I = Y * σ * sqrt(π * a)
 */
export function evaluateFractureMechanics(
  crackSeverity: number, // 0 to 100%
  appliedStressMPa: number,
  geometryFactorY: number = 1.12,
  fractureToughnessKIc: number = 2.2 // 2.2 MPa√m for concrete, ~50 MPa√m for structural steel
): FractureAssessment {
  const normSev = Math.max(0, Math.min(100, crackSeverity)) / 100;
  
  // Physical crack length 'a' (meters)
  const a_meters = normSev * 2.8; // up to 2.8 meters max span fracture
  
  // Crack opening displacement width (mm)
  const crackOpeningWidthMm = Math.pow(normSev, 1.2) * 14.0; // up to 14 mm critical gap

  // K_I = Y * σ * sqrt(π * a)
  let K_I = 0;
  if (a_meters > 0.001 && appliedStressMPa > 0.1) {
    K_I = geometryFactorY * appliedStressMPa * Math.sqrt(Math.PI * a_meters);
  }

  const fractureRatio = K_I / Math.max(0.1, fractureToughnessKIc);
  const isFractureCritical = fractureRatio >= 1.0;

  // Determine crack progression classification
  let state: ComponentDamage['state'] = 'INITIAL';
  if (normSev < 0.10) {
    state = 'INITIAL';
  } else if (normSev < 0.30) {
    state = 'MICRO_CRACK';
  } else if (normSev < 0.55) {
    state = 'VISIBLE_CRACK';
  } else if (normSev < 0.80) {
    state = 'PROPAGATING';
  } else {
    state = 'CRITICAL_FRACTURE';
  }

  return {
    stressIntensityFactorKI: Math.round(K_I * 100) / 100,
    fractureToughnessKIc,
    isFractureCritical,
    fractureRatio: Math.round(fractureRatio * 100) / 100,
    crackProgressionState: state,
    crackOpeningWidthMm: Math.round(crackOpeningWidthMm * 100) / 100,
  };
}
