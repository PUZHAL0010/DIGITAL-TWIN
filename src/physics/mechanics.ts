import { StructuralComponent } from '../types/bridge';
import { GRAVITY_ACCELERATION_MPS2 } from './units';

export interface MechanicsResult {
  axialStressMPa: number;
  bendingStressMPa: number;
  totalStressMPa: number;
  strain: number;
  deformationMm: number;
  deflectionRatio: string;
  appliedForceKn: number;
  bendingMomentKnM: number;
  effectiveCapacityKn: number;
  utilizationRatio: number;
  safetyFactor: number;
}

/**
 * Calculates continuous structural mechanics response using classic Euler-Bernoulli
 * beam theory and axial/shear mechanics for a given component.
 */
export function calculateComponentMechanics(
  component: StructuralComponent,
  pointLoadKn: number = 0,
  pointLoadRelPos: number = 0.5, // 0.0 to 1.0 along the span
  dynamicAmpFactor: number = 0.20
): MechanicsResult {
  const { material, section, lengthMeters, massKg } = component;

  // 1. Self-Weight Dead Load: F_dead = m * g (kN)
  const deadLoadKn = (massKg * GRAVITY_ACCELERATION_MPS2) / 1000;
  
  // 2. Dynamic Applied Load: P_dyn = P_static * (1 + DAF)
  const amplifiedLiveLoadKn = pointLoadKn * (1 + dynamicAmpFactor);
  const totalAppliedForceKn = deadLoadKn + amplifiedLiveLoadKn;

  // 3. Modulus of Elasticity in MPa: E (GPa) * 1000
  const E_MPa = material.youngsModulusGPa * 1000; // MPa = N/mm²

  // 4. Effective cross-section and moment of inertia
  const A_eff_m2 = Math.max(0.001, section.effectiveAreaM2);
  const I_eff_m4 = Math.max(1e-6, section.effectiveMomentOfInertiaM4);
  const y_max_m = section.heightM / 2; // Distance from neutral axis to outer fiber

  let axialStressMPa = 0;
  let bendingStressMPa = 0;
  let deformationMm = 0;
  let bendingMomentKnM = 0;

  if (component.type === 'deck' || component.type === 'beam') {
    // Simply supported / continuous beam model
    const L = lengthMeters;
    const w_dead_kn_m = deadLoadKn / L; // distributed dead load (kN/m)
    const P = amplifiedLiveLoadKn;     // concentrated live load (kN)

    // Bending moment M(x) at point load position
    // M_dead = (w * L²)/8 at midspan
    // M_live = (P * a * b) / L where a = relPos*L, b = (1-relPos)*L
    const a = pointLoadRelPos * L;
    const b = (1 - pointLoadRelPos) * L;
    const M_dead = (w_dead_kn_m * L * L) / 8;
    const M_live = P > 0 ? (P * a * b) / L : 0;
    bendingMomentKnM = M_dead + M_live;

    // Bending stress: σ_b = (M * y) / I (Convert M from kN·m to N·m: * 1000, result in MPa: / 1e6)
    // σ = (M [N·m] * y [m]) / I [m⁴] / 1e6 [MPa]
    bendingStressMPa = ((bendingMomentKnM * 1000) * y_max_m) / I_eff_m4 / 1e6;

    // Deflection δ_max = (5 * w * L⁴)/(384 * E * I) + (P * a² * b²)/(3 * E * I * L)
    // In SI units: w in N/m, L in m, E in Pa (E_MPa * 1e6), I in m⁴ -> result in meters
    const w_N_m = w_dead_kn_m * 1000;
    const P_N = P * 1000;
    const E_Pa = E_MPa * 1e6;

    const delta_dead_m = (5 * w_N_m * Math.pow(L, 4)) / (384 * E_Pa * I_eff_m4);
    const delta_live_m = P > 0 
      ? (P_N * Math.pow(a, 2) * Math.pow(b, 2)) / (3 * E_Pa * I_eff_m4 * L)
      : 0;

    deformationMm = (delta_dead_m + delta_live_m) * 1000; // mm

  } else if (component.type === 'pier' || component.type === 'foundation') {
    // Column axial compression: σ = F / A_eff
    const F_N = totalAppliedForceKn * 1000;
    axialStressMPa = (F_N / A_eff_m2) / 1e6; // MPa

    // Axial shortening: ΔL = (F * L) / (A * E)
    const delta_m = (F_N * lengthMeters) / (A_eff_m2 * (E_MPa * 1e6));
    deformationMm = delta_m * 1000;

    // Minor lateral shear drift from eccentric live load
    const shearDriftMm = (amplifiedLiveLoadKn / 500) * 2.5;
    deformationMm += shearDriftMm;

  } else if (component.type === 'cable') {
    // Cable stay tension: σ = F / A
    const F_N = totalAppliedForceKn * 1000;
    axialStressMPa = (F_N / A_eff_m2) / 1e6;
    const delta_m = (F_N * lengthMeters) / (A_eff_m2 * (E_MPa * 1e6));
    deformationMm = delta_m * 1000;

  } else {
    // General component
    axialStressMPa = ((totalAppliedForceKn * 1000) / A_eff_m2) / 1e6;
    deformationMm = 1.0;
  }

  const totalStressMPa = axialStressMPa + bendingStressMPa;

  // Strain: ε = σ / E
  const strain = totalStressMPa / E_MPa;

  // Effective Structural Capacity: Factored yield capacity
  // Cap = A_eff * σ_yield (kN)
  const effectiveCapacityKn = (A_eff_m2 * (material.yieldStrengthMPa * 1e6)) / 1000;
  const demandKn = totalAppliedForceKn;

  // Utilization ratio: Demand / Capacity
  const utilizationRatio = Math.min(2.5, demandKn / Math.max(1, effectiveCapacityKn));
  const safetyFactor = Math.max(0.1, effectiveCapacityKn / Math.max(1, demandKn));

  // Deflection limit ratio (e.g. L / δ)
  const L_mm = lengthMeters * 1000;
  const denom = Math.round(L_mm / Math.max(0.01, deformationMm));
  const deflectionRatio = `L/${denom}`;

  return {
    axialStressMPa: Math.round(axialStressMPa * 100) / 100,
    bendingStressMPa: Math.round(bendingStressMPa * 100) / 100,
    totalStressMPa: Math.round(totalStressMPa * 100) / 100,
    strain: parseFloat(strain.toExponential(3)),
    deformationMm: Math.round(deformationMm * 100) / 100,
    deflectionRatio,
    appliedForceKn: Math.round(totalAppliedForceKn * 10) / 10,
    bendingMomentKnM: Math.round(bendingMomentKnM * 10) / 10,
    effectiveCapacityKn: Math.round(effectiveCapacityKn * 10) / 10,
    utilizationRatio: Math.round(utilizationRatio * 1000) / 1000,
    safetyFactor: Math.round(safetyFactor * 100) / 100,
  };
}
