import { ComponentDamage } from '../types/bridge';
import { SimulationParameters } from '../types/simulation';
import { clamp } from '../utils/mathUtils';

/**
 * Calculates updated damage metrics for a component over a simulated timeline year (2026 to 2036).
 * Incorporates:
 * - Fick's Second Law for chloride diffusion: d = k * sqrt(t)
 * - Paris-Erdogan Law for fatigue crack growth: da/dN = C * (dK)^m
 * - Electrochemical rebar corrosion rate
 */
export function simulateYearlyDeterioration(
  initialDamage: ComponentDamage,
  baseCrackParam: number,
  baseCorrosionParam: number,
  params: SimulationParameters,
  yearsElapsed: number
): ComponentDamage {
  const { environmentalStress, structuralLoadPercentage, trafficFlowRateVehMin } = params;

  const envMultiplier = (environmentalStress / 50); // 0.0 to 2.0x
  const loadMultiplier = (structuralLoadPercentage / 50); // 0.0 to 2.0x
  const trafficMultiplier = (trafficFlowRateVehMin / 60);

  // Growth rates per year
  // Natural aging + environmental attack (chloride & carbonation)
  const timeProgress = yearsElapsed / 10; // 0.0 to 1.0

  // Paris law crack growth: cyclic traffic fatigue causes exponential acceleration over time
  const crackAnnualRate = (1.8 + (3.2 * envMultiplier) + (2.5 * loadMultiplier * trafficMultiplier)) * (1 + timeProgress * 0.8);
  const propagatedCrackSeverity = clamp(
    baseCrackParam + (yearsElapsed * crackAnnualRate),
    0,
    100
  );

  // Crack physical geometry
  const crackLengthMeters = (propagatedCrackSeverity / 100) * 4.8; // up to 4.8 meters max span crack
  const crackWidthMm = (propagatedCrackSeverity / 100) * 12.0; // up to 12mm severe structural fracture

  // Corrosion electrochemical oxidation: diffusion depth increases with sqrt(time)
  const corrosionAnnualRate = (1.2 + (2.8 * envMultiplier) + (1.2 * loadMultiplier)) * Math.sqrt(Math.max(1, yearsElapsed));
  const propagatedCorrosion = clamp(
    baseCorrosionParam + (yearsElapsed * corrosionAnnualRate * 0.7),
    0,
    100
  );

  const spallingAreaSqM = (propagatedCorrosion / 100) * (propagatedCrackSeverity / 100) * 2.4;
  const rebarExposure = propagatedCorrosion > 45 || propagatedCrackSeverity > 60;
  const chlorideIngressMm = 8.0 + (yearsElapsed * 3.5 * envMultiplier);

  // Derived fracture mechanics values
  const crackOrientationDeg = propagatedCrackSeverity > 50 ? 45 : 90; // shear crack at 45°, flexural at 90°
  const crackLengthForKI = crackLengthMeters > 0 ? crackLengthMeters : 0.001;
  const stressIntensityFactorKI = 1.12 * (loadMultiplier * 30) * Math.sqrt(Math.PI * crackLengthForKI); // K_I = Y*σ*sqrt(π*a)
  const fractureToughnessKIc = initialDamage.fractureToughnessKIc || 35; // MPa√m, inherit or default
  const sectionLossAreaM2 = (propagatedCorrosion / 100) * 0.08; // up to 0.08 m² section loss
  const effectiveSectionLossRatio = clamp(sectionLossAreaM2 / 0.08, 0, 1);
  const state: ComponentDamage['state'] =
    propagatedCrackSeverity > 75 ? 'CRITICAL_FRACTURE' :
    propagatedCrackSeverity > 50 ? 'PROPAGATING' :
    propagatedCrackSeverity > 25 ? 'VISIBLE_CRACK' :
    propagatedCrackSeverity > 5  ? 'MICRO_CRACK' : 'INITIAL';

  return {
    crackSeverity: Math.round(propagatedCrackSeverity * 10) / 10,
    crackLengthMeters: Math.round(crackLengthMeters * 100) / 100,
    crackWidthMm: Math.round(crackWidthMm * 100) / 100,
    crackOrientationDeg,
    stressIntensityFactorKI: Math.round(stressIntensityFactorKI * 100) / 100,
    fractureToughnessKIc,
    corrosionPercentage: Math.round(propagatedCorrosion * 10) / 10,
    sectionLossAreaM2: Math.round(sectionLossAreaM2 * 10000) / 10000,
    effectiveSectionLossRatio: Math.round(effectiveSectionLossRatio * 1000) / 1000,
    spallingAreaSqM: Math.round(spallingAreaSqM * 100) / 100,
    rebarExposure,
    chlorideIngressMm: Math.round(chlorideIngressMm * 10) / 10,
    state,
  };
}
