import { RiskLevel, MaintenancePriority, StructuralComponent } from '../types/bridge';
import { clamp } from '../utils/mathUtils';

export interface HealthAssessment {
  healthIndex: number; // 0 - 100%
  risk: RiskLevel;
  maintenancePriority: MaintenancePriority;
}

/**
 * Calculates deterministic Structural Health Index (SHI) and Risk Level
 * from physical stress, deformation, and damage parameters.
 */
export function calculateComponentHealth(
  component: StructuralComponent
): HealthAssessment {
  const { stressMPa, deformationMm, damage, material, type } = component;
  
  // 1. Stress penalty: ratio of current stress to yield strength
  const stressRatio = stressMPa / material.yieldStrengthMPa;
  let stressPenalty = 0;
  if (stressRatio > 0.85) {
    stressPenalty = 45 * Math.pow((stressRatio - 0.85) / 0.15, 1.2) + 30; // severe penalty near/above yield
  } else if (stressRatio > 0.5) {
    stressPenalty = 30 * ((stressRatio - 0.5) / 0.35);
  } else {
    stressPenalty = 10 * (stressRatio / 0.5);
  }

  // 2. Deformation penalty (e.g. >15mm is critical for bridge deck/pier)
  const maxAllowableDeflectionMm = type === 'deck' ? 25 : type === 'pier' ? 20 : 18;
  const deflRatio = deformationMm / maxAllowableDeflectionMm;
  const deflPenalty = clamp(deflRatio * 35, 0, 45);

  // 3. Crack severity penalty (0-100%)
  const crackPenalty = Math.pow(damage.crackSeverity / 100, 1.3) * 40;

  // 4. Corrosion penalty (0-100%)
  const corrosionPenalty = Math.pow(damage.corrosionPercentage / 100, 1.2) * 25;

  // 5. Spalling & Rebar exposure penalty
  const rebarPenalty = damage.rebarExposure ? 15 : 0;

  // Total deductions
  const totalDeductions = (stressPenalty * 0.35) + (deflPenalty * 0.25) + (crackPenalty * 0.25) + (corrosionPenalty * 0.15) + rebarPenalty;
  
  const rawHealth = 100 - totalDeductions;
  const healthIndex = clamp(Math.round(rawHealth), 5, 100);

  // Determine Risk Level & Maintenance Priority
  let risk: RiskLevel = 'NORMAL';
  let maintenancePriority: MaintenancePriority = 'P5';

  if (healthIndex < 35 || stressRatio > 0.95 || damage.crackSeverity > 80 || deformationMm > 28) {
    risk = 'CRITICAL';
    maintenancePriority = 'P1';
  } else if (healthIndex < 55 || stressRatio > 0.75 || damage.crackSeverity > 55 || deformationMm > 18) {
    risk = 'HIGH';
    maintenancePriority = 'P2';
  } else if (healthIndex < 72 || stressRatio > 0.55 || damage.crackSeverity > 35) {
    risk = 'MODERATE';
    maintenancePriority = 'P3';
  } else if (healthIndex < 88 || damage.crackSeverity > 15 || damage.corrosionPercentage > 20) {
    risk = 'LOW';
    maintenancePriority = 'P4';
  } else {
    risk = 'NORMAL';
    maintenancePriority = 'P5';
  }

  return {
    healthIndex,
    risk,
    maintenancePriority,
  };
}

/**
 * Calculates Bridge-wide overall Structural Health Index and Risk Level
 * weighted by component criticality.
 */
export function calculateOverallBridgeHealth(components: Record<string, StructuralComponent>): {
  overallHealth: number;
  overallRisk: RiskLevel;
  peakStressMPa: number;
  maxDeformationMm: number;
} {
  let totalWeightedHealth = 0;
  let totalWeights = 0;
  let peakStressMPa = 0;
  let maxDeformationMm = 0;
  let criticalCount = 0;
  let highCount = 0;

  const componentList = Object.values(components);

  for (const comp of componentList) {
    const weight = comp.criticalityWeight || 1.0;
    totalWeightedHealth += comp.health * weight;
    totalWeights += weight;

    if (comp.stressMPa > peakStressMPa) peakStressMPa = comp.stressMPa;
    if (comp.deformationMm > maxDeformationMm) maxDeformationMm = comp.deformationMm;

    if (comp.risk === 'CRITICAL') criticalCount++;
    if (comp.risk === 'HIGH') highCount++;
  }

  const overallHealth = Math.round(totalWeightedHealth / Math.max(1, totalWeights));

  let overallRisk: RiskLevel = 'NORMAL';
  if (criticalCount > 0 || overallHealth < 40) {
    overallRisk = 'CRITICAL';
  } else if (highCount > 0 || overallHealth < 60) {
    overallRisk = 'HIGH';
  } else if (overallHealth < 75) {
    overallRisk = 'MODERATE';
  } else if (overallHealth < 90) {
    overallRisk = 'LOW';
  } else {
    overallRisk = 'NORMAL';
  }

  return {
    overallHealth,
    overallRisk,
    peakStressMPa: Math.round(peakStressMPa * 10) / 10,
    maxDeformationMm: Math.round(maxDeformationMm * 100) / 100,
  };
}
