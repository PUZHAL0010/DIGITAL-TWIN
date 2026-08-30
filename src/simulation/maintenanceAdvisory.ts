import { StructuralComponent } from '../types/bridge';
import { MaintenanceRecommendation } from '../types/simulation';

export function generateMaintenanceRecommendations(
  components: Record<string, StructuralComponent>
): MaintenanceRecommendation[] {
  const recommendations: MaintenanceRecommendation[] = [];
  const list = Object.values(components);

  // Sort components by worst health first
  const sorted = [...list].sort((a, b) => a.health - b.health);

  for (const comp of sorted) {
    if (comp.risk === 'CRITICAL') {
      if (comp.damage.crackSeverity > 60) {
        recommendations.push({
          id: `rec-${comp.id}-1`,
          componentId: comp.id,
          componentName: comp.name,
          urgency: 'IMMEDIATE',
          title: `Emergency Structural Shoring & CFRP Wrapping`,
          description: `Severe crack network detected (${comp.damage.crackWidthMm.toFixed(1)}mm width, ${comp.damage.crackLengthMeters.toFixed(1)}m length). High probability of structural shearing under cyclic live load.`,
          suggestedAction: `Deploy temporary hydraulic shoring towers immediately. Perform high-pressure structural epoxy injection followed by 3-layer Carbon Fiber Reinforced Polymer (CFRP) composite wrapping.`,
          estimatedCostUSD: 45000,
          timeToFailureMonths: 1.5,
          priority: 'P1',
        });
      } else if (comp.deformationMm > 20) {
        recommendations.push({
          id: `rec-${comp.id}-2`,
          componentId: comp.id,
          componentName: comp.name,
          urgency: 'IMMEDIATE',
          title: `Substructure Jacking & Soil Grouting`,
          description: `Excessive deformation of ${comp.deformationMm.toFixed(1)}mm detected (${comp.deflectionRatio}), exceeding AASHTO serviceability limit.`,
          suggestedAction: `Install synchronized computer-controlled hydraulic lifting jacks. Inject microfine cementitious grout into foundation stratum.`,
          estimatedCostUSD: 68000,
          timeToFailureMonths: 2.0,
          priority: 'P1',
        });
      } else {
        recommendations.push({
          id: `rec-${comp.id}-3`,
          componentId: comp.id,
          componentName: comp.name,
          urgency: 'IMMEDIATE',
          title: `Urgent Load Restriction & Full Engineering Audit`,
          description: `Component health degraded to ${comp.health}%. Yield stress threshold exceeded (${comp.stressMPa.toFixed(1)} MPa).`,
          suggestedAction: `Post emergency 15-ton single-lane load restriction. Schedule mandatory Level 3 comprehensive Ultrasonic NDT testing.`,
          estimatedCostUSD: 28000,
          timeToFailureMonths: 3.0,
          priority: 'P1',
        });
      }
    } else if (comp.risk === 'HIGH') {
      if (comp.damage.corrosionPercentage > 40) {
        recommendations.push({
          id: `rec-${comp.id}-4`,
          componentId: comp.id,
          componentName: comp.name,
          urgency: 'HIGH',
          title: `Electrochemical Cathodic Protection & Rebar Passivation`,
          description: `Severe corrosion oxidation (${comp.damage.corrosionPercentage.toFixed(0)}%) with chloride ingress depth of ${comp.damage.chlorideIngressMm.toFixed(1)}mm.`,
          suggestedAction: `Hydro-demolish delaminated concrete, apply zinc-rich sacrificial anodes (Galvashield), and coat surface with silane hydrophobic impregnator.`,
          estimatedCostUSD: 24000,
          timeToFailureMonths: 6.0,
          priority: 'P2',
        });
      } else {
        recommendations.push({
          id: `rec-${comp.id}-5`,
          componentId: comp.id,
          componentName: comp.name,
          urgency: 'HIGH',
          title: `Micro-Crack Sealing & Sensor Telemetry Installation`,
          description: `Propagating fracture detected with elevated stress concentration (${comp.stressMPa.toFixed(1)} MPa).`,
          suggestedAction: `Vacuum inject low-viscosity polymeric resins. Mount continuous Fiber-Optic Bragg Grating (FBG) strain sensors.`,
          estimatedCostUSD: 16500,
          timeToFailureMonths: 9.0,
          priority: 'P2',
        });
      }
    } else if (comp.risk === 'MODERATE') {
      recommendations.push({
        id: `rec-${comp.id}-6`,
        componentId: comp.id,
        componentName: comp.name,
        urgency: 'MEDIUM',
        title: `Preventive Maintenance & Drone Lidar Re-Scan`,
        description: `Early stage surface wear and hairline micro-fissures (${comp.damage.crackSeverity.toFixed(0)}%).`,
        suggestedAction: `Schedule automated UAV high-resolution photogrammetry survey in Q3. Apply elastomeric anti-carbonation coating.`,
        estimatedCostUSD: 8500,
        timeToFailureMonths: 18.0,
        priority: 'P3',
      });
    }
  }

  // If all components are normal
  if (recommendations.length === 0) {
    recommendations.push({
      id: `rec-routine-1`,
      componentId: 'all',
      componentName: 'Bridge Structure (Global)',
      urgency: 'MONITOR',
      title: `Routine Sensor Health Telemetry & Condition Monitoring`,
      description: `All structural elements operating well within elastic design thresholds (Safety Factor > 2.8).`,
      suggestedAction: `Maintain standard 6-month automated drone flight inspection schedule and continuous accelerometer monitoring.`,
      estimatedCostUSD: 2500,
      timeToFailureMonths: 120.0,
      priority: 'P5',
    });
  }

  return recommendations.slice(0, 5); // top 5 recommendations
}
