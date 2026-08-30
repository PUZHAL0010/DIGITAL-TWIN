import { SectionProperties } from '../types/physics';

export interface CorrosionAssessment {
  effectiveAreaM2: number;
  effectiveMomentOfInertiaM4: number;
  sectionLossRatio: number;
  chlorideIngressMm: number;
  spallingAreaSqM: number;
  rebarExposure: boolean;
}

/**
 * Calculates cross-sectional area loss and moment of inertia reduction
 * due to electrochemical corrosion and environmental chloride diffusion.
 * Equation: A_effective = A_original - A_loss
 */
export function calculateCorrosionSectionLoss(
  baseSection: SectionProperties,
  corrosionPercentage: number, // 0 to 100%
  crackSeverity: number,       // 0 to 100%
  yearsElapsed: number = 0,
  environmentalStress: number = 25
): CorrosionAssessment {
  const normCorr = Math.max(0, Math.min(100, corrosionPercentage)) / 100;
  const normCrack = Math.max(0, Math.min(100, crackSeverity)) / 100;
  const envFactor = environmentalStress / 50; // 0.0 to 2.0x

  // Direct section loss ratio (up to 45% maximum rebar/concrete section loss before total loss of integrity)
  const sectionLossRatio = normCorr * 0.42 + (normCrack * 0.12);
  const effectiveAreaM2 = Math.max(
    baseSection.areaM2 * 0.15,
    baseSection.areaM2 * (1.0 - sectionLossRatio)
  );

  // Moment of inertia drops with the cube/fourth power of lost thickness
  // I_eff = I_0 * (1 - loss_factor)
  const inertiaLossFactor = Math.min(0.85, (normCorr * 0.65) + (normCrack * 0.35));
  const effectiveMomentOfInertiaM4 = Math.max(
    baseSection.momentOfInertiaM4 * 0.12,
    baseSection.momentOfInertiaM4 * (1.0 - inertiaLossFactor)
  );

  // Chloride ion penetration depth (mm) based on Fick's Second Law: x = 2 * sqrt(D * t)
  const diffusionCoeffD = 2.4 * envFactor;
  const chlorideIngressMm = 6.0 + Math.sqrt(Math.max(1, yearsElapsed) * diffusionCoeffD) * 3.8;

  // Concrete cover spalling area (m²)
  const spallingAreaSqM = Math.pow(normCorr, 1.4) * 2.8;
  const rebarExposure = normCorr > 0.40 || normCrack > 0.60;

  return {
    effectiveAreaM2: Math.round(effectiveAreaM2 * 1000) / 1000,
    effectiveMomentOfInertiaM4: Math.round(effectiveMomentOfInertiaM4 * 10000) / 10000,
    sectionLossRatio: Math.round(sectionLossRatio * 1000) / 1000,
    chlorideIngressMm: Math.round(chlorideIngressMm * 10) / 10,
    spallingAreaSqM: Math.round(spallingAreaSqM * 100) / 100,
    rebarExposure,
  };
}
