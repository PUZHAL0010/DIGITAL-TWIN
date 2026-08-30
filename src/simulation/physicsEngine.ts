import { StructuralComponent } from '../types/bridge';
import { SimulationParameters } from '../types/simulation';
import { clamp } from '../utils/mathUtils';

export interface PhysicsCalculationResult {
  stressMPa: number;
  deformationMm: number;
  deflectionRatio: string;
  effectiveStiffnessKnM: number;
  currentLoadKn: number;
}

/**
 * Calculates deterministic structural response (Stress, Deformation, Stiffness)
 * for a specific component based on global load, local damage, and geometry.
 */
export function calculateComponentPhysics(
  component: StructuralComponent,
  params: SimulationParameters,
  yearOffset: number = 0,
  isTargetOrAdjacent: boolean = false
): PhysicsCalculationResult {
  const { structuralLoadPercentage, crackSeverityPercentage, corrosionPercentage, environmentalStress, seismicIntensity } = params;

  // Base parameters
  const baseLoadKn = component.type === 'deck' ? 450 : component.type === 'pier' ? 1800 : 750;
  const loadFactor = (structuralLoadPercentage / 100) * 2.2 + 0.3; // 0.3x at 0% load (dead weight), up to 2.5x at 100% load
  const liveLoadKn = baseLoadKn * loadFactor;

  // Component-specific damage impact
  // If user selected this component or increased global damage, factor it in
  const crack = clamp(component.damage.crackSeverity, 0, 100) / 100;
  const corrosion = clamp(component.damage.corrosionPercentage, 0, 100) / 100;
  const envFactor = (environmentalStress / 100) * 0.2;
  const seismicFactor = (seismicIntensity / 5.0) * 0.4;

  // Stiffness degradation model: E_eff = E0 * (1 - 0.70 * crack - 0.45 * corrosion)
  const damageFactor = Math.min(0.85, 0.65 * Math.pow(crack, 1.4) + 0.35 * Math.pow(corrosion, 1.2) + envFactor);
  const stiffnessRetention = Math.max(0.15, 1.0 - damageFactor);
  // Flexural stiffness EI/L: E in GPa -> kN/m² (* 1e6), I in m⁴, L in m => kN·m
  const baseStiffnessKnM = (component.material.youngsModulusGPa * 1e6 * component.section.momentOfInertiaM4) / component.lengthMeters;
  const effectiveStiffnessKnM = baseStiffnessKnM * stiffnessRetention;

  let stressMPa = 0;
  let deformationMm = 0;

  if (component.type === 'deck') {
    // Euler-Bernoulli beam midspan bending model
    // Stress = M * y / I_eff
    // Nominal deck stress: 18 MPa dead load -> up to 135+ MPa under heavy crack & load
    const baseBendingStress = 16.0 * loadFactor;
    // Stress concentration factor near cracks Kt = 1 + 2 * sqrt(a / r) ~ up to 2.8x
    const stressConcentration = 1.0 + (crack * 1.8) + (corrosion * 0.6);
    stressMPa = (baseBendingStress * stressConcentration) + (seismicFactor * 25);

    // Deflection delta = (5 * w * L^4)/(384 * E * I) + (P * L^3)/(48 * E_eff * I)
    const baseDeflectionMm = 4.2 * loadFactor; // baseline dead+live deflection ~4.2mm
    const stiffnessMultiplier = 1.0 / stiffnessRetention;
    deformationMm = baseDeflectionMm * stiffnessMultiplier * (1 + seismicFactor * 1.2);

  } else if (component.type === 'pier') {
    // Axial compression + shear bending
    const baseAxialStress = 12.0 * loadFactor;
    const crackStressFactor = 1.0 + (crack * 2.2) + (corrosion * 0.8);
    stressMPa = (baseAxialStress * crackStressFactor) + (seismicFactor * 45); // piers take heavy lateral seismic load

    // Lateral drift + axial shortening (mm)
    const baseShorteningMm = 1.8 * loadFactor;
    const lateralDriftMm = (crack * 12.0) + (seismicFactor * 22.0) + (corrosion * 4.0);
    deformationMm = (baseShorteningMm / stiffnessRetention) + lateralDriftMm;

  } else if (component.type === 'pier_cap' || component.type === 'beam') {
    // Shear & flexure transfer
    const baseStress = 14.0 * loadFactor;
    stressMPa = baseStress * (1.0 + crack * 1.6 + corrosion * 0.5) + (seismicFactor * 20);
    deformationMm = (3.5 * loadFactor / stiffnessRetention) + (crack * 6.0);

  } else if (component.type === 'foundation') {
    // Foundation settlement (mm) & soil contact stress
    const baseSoilStress = 8.0 * loadFactor;
    stressMPa = baseStressFromLoad(baseSoilStress, crack, corrosion, seismicFactor);
    // Soil settlement increases under sustained load and time
    const settlementTimeFactor = 1.0 + (yearOffset * 0.12);
    deformationMm = (2.0 * loadFactor * settlementTimeFactor) + (corrosion * 8.0) + (seismicFactor * 15.0);

  } else if (component.type === 'cable') {
    // Tensile stress in stay cables
    const baseTensionStress = 45.0 * loadFactor;
    stressMPa = baseTensionStress * (1.0 + crack * 1.5 + corrosion * 0.7);
    deformationMm = (5.0 * loadFactor / stiffnessRetention);

  } else {
    // foundation or other — generic fallback
    stressMPa = 10.0 * loadFactor * (1.0 + crack * 0.8);
    deformationMm = 1.5 * loadFactor;
  }

  // Deflection limit ratio representation (e.g. Span L = 30m = 30000mm)
  const spanLengthMm = 30000;
  const ratioDenominator = Math.round(spanLengthMm / Math.max(0.1, deformationMm));
  const deflectionRatio = `L/${ratioDenominator}`;

  return {
    stressMPa: Math.round(stressMPa * 10) / 10,
    deformationMm: Math.round(deformationMm * 100) / 100,
    deflectionRatio,
    effectiveStiffnessKnM: Math.round(effectiveStiffnessKnM),
    currentLoadKn: Math.round(liveLoadKn),
  };
}

function baseStressFromLoad(base: number, crack: number, corrosion: number, seismic: number): number {
  return base * (1.0 + crack * 1.1 + corrosion * 0.7) + (seismic * 18);
}
