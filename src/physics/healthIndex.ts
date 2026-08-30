import { StructuralComponent, RiskLevel, MaintenancePriority, ComponentStructuralState } from '../types/bridge';

export interface HealthCalculationResult {
  healthScore: number; // 0 to 100%
  risk: RiskLevel;
  maintenancePriority: MaintenancePriority;
  structuralState: ComponentStructuralState;
  riskDrivers: {
    primary: string;
    utilizationContribution: number;
    crackContribution: number;
    corrosionContribution: number;
    deflectionContribution: number;
  };
}

/**
 * Calculates a fully transparent, physics-informed Structural Health Index (SHI)
 * and detailed root-cause risk driver breakdown for an individual component.
 */
export function calculatePhysicsHealthAndRisk(
  component: StructuralComponent
): HealthCalculationResult {
  const { 
    utilizationRatio, 
    deformationMm, 
    damage, 
    lengthMeters 
  } = component;

  // 1. Utilization Penalty (0 to 45 points deduction)
  // Normal elastic limit is utilization <= 0.65
  let utilPenalty = 0;
  if (utilizationRatio > 1.0) {
    utilPenalty = 45; // failure / plastic yielding
  } else if (utilizationRatio > 0.75) {
    utilPenalty = 25 + ((utilizationRatio - 0.75) / 0.25) * 20;
  } else if (utilizationRatio > 0.50) {
    utilPenalty = 10 + ((utilizationRatio - 0.50) / 0.25) * 15;
  } else {
    utilPenalty = (utilizationRatio / 0.50) * 10;
  }

  // 2. Deformation Limit Penalty (0 to 25 points deduction)
  // AASHTO serviceability limit is approx L / 800
  const maxAllowableDeflMm = (lengthMeters * 1000) / 800; // e.g. 15mm for 12m span
  const deflRatio = deformationMm / Math.max(1, maxAllowableDeflMm);
  const deflPenalty = Math.min(25, Math.pow(deflRatio, 1.3) * 18);

  // 3. Crack & Fracture Intensity Penalty (0 to 25 points deduction)
  const crackNorm = damage.crackSeverity / 100;
  const fractureCriticalMultiplier = damage.stressIntensityFactorKI >= damage.fractureToughnessKIc ? 1.4 : 1.0;
  const crackPenalty = Math.min(25, Math.pow(crackNorm, 1.2) * 22 * fractureCriticalMultiplier);

  // 4. Corrosion Section Loss Penalty (0 to 20 points deduction)
  const corrNorm = damage.corrosionPercentage / 100;
  const corrPenalty = Math.min(20, Math.pow(corrNorm, 1.1) * 18);

  // Total deduction & Health Score (0 - 100)
  const totalDeductions = (utilPenalty * 0.38) + (deflPenalty * 0.22) + (crackPenalty * 0.24) + (corrPenalty * 0.16);
  const rawHealth = 100 - totalDeductions;
  const healthScore = Math.max(0, Math.min(100, Math.round(rawHealth)));

  // Risk Classification
  let risk: RiskLevel = 'NORMAL';
  let maintenancePriority: MaintenancePriority = 'P5';
  let structuralState: ComponentStructuralState = 'HEALTHY';

  if (utilizationRatio >= 1.05 || healthScore < 25 || damage.crackSeverity >= 85 || deformationMm > 35) {
    risk = 'CRITICAL';
    maintenancePriority = 'P1';
    structuralState = utilizationRatio >= 1.2 ? 'FAILED' : 'CRITICAL';
  } else if (utilizationRatio >= 0.85 || healthScore < 50 || damage.crackSeverity >= 60 || deformationMm > 20) {
    risk = 'HIGH';
    maintenancePriority = 'P2';
    structuralState = 'DAMAGED';
  } else if (utilizationRatio >= 0.65 || healthScore < 70 || damage.crackSeverity >= 35 || damage.corrosionPercentage >= 35) {
    risk = 'MODERATE';
    maintenancePriority = 'P3';
    structuralState = 'MONITORED';
  } else if (healthScore < 85 || damage.crackSeverity > 15 || damage.corrosionPercentage > 15) {
    risk = 'LOW';
    maintenancePriority = 'P4';
    structuralState = 'MONITORED';
  } else {
    risk = 'NORMAL';
    maintenancePriority = 'P5';
    structuralState = 'HEALTHY';
  }

  // Calculate percentage contributions to risk
  const sumPenalties = Math.max(1, utilPenalty + deflPenalty + crackPenalty + corrPenalty);
  const uCont = Math.round((utilPenalty / sumPenalties) * 100);
  const crCont = Math.round((crackPenalty / sumPenalties) * 100);
  const coCont = Math.round((corrPenalty / sumPenalties) * 100);
  const dCont = Math.round((deflPenalty / sumPenalties) * 100);

  let primaryDriver = 'Nominal Service Load';
  if (uCont >= 35 && utilizationRatio > 0.8) primaryDriver = `High Structural Demand (Utilization: ${(utilizationRatio * 100).toFixed(0)}%)`;
  else if (crCont >= 35 && damage.crackSeverity > 40) primaryDriver = `Advanced Fracture Network (Crack Severity: ${damage.crackSeverity}%)`;
  else if (coCont >= 35 && damage.corrosionPercentage > 40) primaryDriver = `Severe Rebar Oxidation (Section Loss: ${(damage.effectiveSectionLossRatio * 100).toFixed(0)}%)`;
  else if (dCont >= 35 && deformationMm > 15) primaryDriver = `Excessive Deflection (${deformationMm.toFixed(1)}mm exceeding L/800)`;

  return {
    healthScore,
    risk,
    maintenancePriority,
    structuralState,
    riskDrivers: {
      primary: primaryDriver,
      utilizationContribution: uCont,
      crackContribution: crCont,
      corrosionContribution: coCont,
      deflectionContribution: dCont,
    },
  };
}
