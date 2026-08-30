import { StructuralComponent, RigidBodyMotion } from '../types/bridge';
import { FailureStage, ScenarioFailureConfig, CollapseSimulationState } from '../types/failure';
import type { FailureScenarioType } from '../types/simulation';
import { SimulationEvent, ShipVesselState } from '../types/simulation';
import { GRAVITY_ACCELERATION_MPS2 } from './units';

const RIVERBED_Y = -4.4; // Ground/riverbed elevation in 3D world (m)
const WATER_SURFACE_Y = -0.5; // Water surface elevation (m)

export const SCENARIO_CONFIGS: Record<FailureScenarioType, ScenarioFailureConfig> = {
  CORROSION: {
    scenarioId: 'CORROSION',
    title: 'Marine Fog / 50-Yr Chloride Ingress',
    failureMechanism: 'Severe Rebar Section Loss & Concrete Core Crushing in Splash Zone',
    affectedComponents: ['pier-p3', 'pier-cap-p3'],
    secondaryAffectedComponents: ['deck-span-3'],
    damageRateMultiplier: 1.4,
    failureCriterionDescription: 'Effective Section Loss > 60% & Compressive Strain ε_v > 0.0035',
    collapseKinematicMode: 'LOCALIZED_SUBSIDENCE',
    scourExcavationDepthMeters: 0.0,
    debrisCount: 10,
  },
  OVERLOAD: {
    scenarioId: 'OVERLOAD',
    title: 'Heavy Multi-Axle Freight Overload',
    failureMechanism: 'Excessive Flexural Demand & Midspan Girder Plastic Yield',
    affectedComponents: ['girder-g2', 'girder-g1', 'deck-span-3'],
    secondaryAffectedComponents: ['pier-cap-p3'],
    damageRateMultiplier: 2.2,
    failureCriterionDescription: 'Midspan bending stress σ_b > 355 MPa & Deflection > 48 mm (L/250)',
    collapseKinematicMode: 'FLEXURAL_SAG',
    scourExcavationDepthMeters: 0.0,
    debrisCount: 8,
  },
  SHIP_COLLISION: {
    scenarioId: 'SHIP_COLLISION',
    title: 'Ship / Vessel Navigation Channel Collision',
    failureMechanism: '3,500-Tonne Vessel Kinetic Impact & Pier Column Shear Fracture',
    affectedComponents: ['pier-p3', 'pier-cap-p3', 'deck-span-3'],
    secondaryAffectedComponents: ['foundation-f3'],
    damageRateMultiplier: 3.5,
    failureCriterionDescription: 'Kinetic Impact Energy E_k = 19.4 MJ Exceeding Pier Shear Capacity',
    collapseKinematicMode: 'SHIP_IMPACT_FRACTURE',
    scourExcavationDepthMeters: 0.0,
    debrisCount: 16,
  },
  SCOUR: {
    scenarioId: 'SCOUR',
    title: 'Hydraulic Riverbed Scour & Foundation Tilt',
    failureMechanism: 'Hydrodynamic Sediment Excavation & Loss of Soil Bearing Capacity',
    affectedComponents: ['foundation-f3', 'pier-p3'],
    secondaryAffectedComponents: ['deck-span-3', 'deck-span-4', 'pier-cap-p3'],
    damageRateMultiplier: 1.6,
    failureCriterionDescription: 'Scour Depth > 2.5m & Foundation Differential Tilt > 14°',
    collapseKinematicMode: 'SCOUR_ASYMMETRIC_TILT',
    scourExcavationDepthMeters: 2.8,
    debrisCount: 14,
  },
  DEFERRED_MAINTENANCE: {
    scenarioId: 'DEFERRED_MAINTENANCE',
    title: 'Deferred Maintenance (Multi-Decade Aging)',
    failureMechanism: 'Unrepaired Cracks Accelerate to Critical Structural Capacity Loss',
    affectedComponents: ['pier-p3', 'deck-span-3'],
    secondaryAffectedComponents: ['girder-g2', 'pier-cap-p3'],
    damageRateMultiplier: 1.8,
    failureCriterionDescription: 'Unmaintained Damage Growth Exceeding Safety Threshold (FoS < 1.0)',
    collapseKinematicMode: 'FATIGUE_CLEAVAGE',
    scourExcavationDepthMeters: 0.0,
    debrisCount: 12,
  },
  SEISMIC: {
    scenarioId: 'SEISMIC',
    title: 'Seismic Ground Motion Excitation',
    failureMechanism: 'Horizontal Ground Acceleration & Elastomeric Bearing Shear Rupture',
    affectedComponents: ['deck-span-3', 'pier-cap-p3', 'pier-p3'],
    secondaryAffectedComponents: ['deck-span-2'],
    damageRateMultiplier: 2.5,
    failureCriterionDescription: 'Peak Ground Accel a_g = 0.35g Exceeding Bearing Lateral Restraint',
    collapseKinematicMode: 'SEISMIC_OSCILLATION',
    scourExcavationDepthMeters: 0.0,
    debrisCount: 12,
  },
};

export interface ScenarioPhysicsOutput {
  updatedComponents: Record<string, StructuralComponent>;
  updatedState: CollapseSimulationState;
  updatedShip: ShipVesselState;
  events: SimulationEvent[];
  activeScourDepthM: number;
  waterDisturbances: { x: number; z: number; intensity: number }[];
}

/**
 * Executes scenario-specific kinematic and progressive structural failure physics.
 */
export function stepScenarioFailurePhysics(
  components: Record<string, StructuralComponent>,
  state: CollapseSimulationState,
  deltaSeconds: number,
  ship: ShipVesselState
): ScenarioPhysicsOutput {
  if (!state.isActive) {
    return {
      updatedComponents: components,
      updatedState: state,
      updatedShip: ship,
      events: [],
      activeScourDepthM: 0,
      waterDisturbances: [],
    };
  }

  const scenarioConfig = SCENARIO_CONFIGS[state.activeScenarioId] || SCENARIO_CONFIGS.OVERLOAD;
  const simTime = state.simulationTimeSec + deltaSeconds;
  const updatedComponents: Record<string, StructuralComponent> = { ...components };
  const collapsedIds = [...state.collapsedComponentIds];
  const newEvents: SimulationEvent[] = [];
  const waterDisturbances: { x: number; z: number; intensity: number }[] = [];
  let updatedShip: ShipVesselState = { ...ship };

  let currentStage: FailureStage = state.stage;
  let activeScourDepthM = 0;

  const nowTimeStr = new Date().toTimeString().split(' ')[0];

  // =========================================================================
  // SCENARIO-SPECIFIC KINEMATIC RESOLUTION
  // =========================================================================
  switch (scenarioConfig.collapseKinematicMode) {
    // -----------------------------------------------------------------------
    // 1. SHIP_IMPACT_FRACTURE: 3D Vessel strikes Pier P-03 column base
    // -----------------------------------------------------------------------
    case 'SHIP_IMPACT_FRACTURE': {
      // Advance ship along Z towards pier (Pier 3 is at X = 6.0, Z = 0)
      const shipZ = Math.min(22, updatedShip.position[2] + updatedShip.velocityMps * deltaSeconds);
      updatedShip.position = [updatedShip.position[0], updatedShip.position[1], shipZ];

      if (simTime < 1.0) {
        currentStage = 'INITIATING_YIELD';
        if (!updatedShip.impactOccurred) {
          updatedShip.impactOccurred = true;
          updatedShip.impactTimeSec = simTime;
          newEvents.push({
            id: `evt-ship-impact-${Date.now()}`,
            timestampStr: nowTimeStr,
            simTimeSec: simTime,
            category: 'VESSEL',
            message: '3,500t Navigation vessel impacted Pier P-03 column base (Kinetic Energy: 19.4 MJ)',
            severity: 'CRITICAL',
            componentId: 'pier-p3',
          });
        }
        if (!collapsedIds.includes('pier-p3')) collapsedIds.push('pier-p3');
      } else if (simTime < 3.0) {
        currentStage = 'CONSTRAINT_RELEASE';
        if (!collapsedIds.includes('pier-cap-p3')) collapsedIds.push('pier-cap-p3');
        if (!collapsedIds.includes('deck-span-3')) {
          collapsedIds.push('deck-span-3');
          newEvents.push({
            id: `evt-ship-deck-${Date.now()}`,
            timestampStr: nowTimeStr,
            simTimeSec: simTime,
            category: 'FAILURE',
            message: 'Pier P-03 column sheared and lost axial bearing; Deck Span 3 initiated rotational fall',
            severity: 'CRITICAL',
            componentId: 'deck-span-3',
          });
        }
      } else if (simTime < 5.5) {
        currentStage = 'PROGRESSIVE_COLLAPSE';
      } else {
        currentStage = 'POST_FAILURE_EQUILIBRIUM';
      }

      // Kinematic update: Pier 3 shears and tilts +18° around X, Deck 3 falls under gravity
      for (const id of collapsedIds) {
        const comp = updatedComponents[id];
        if (!comp) continue;

        const rb: RigidBodyMotion = { ...comp.rigidBody };
        rb.isConstrained = false;
        rb.timeSinceRelease += deltaSeconds;

        const [posX, posY, posZ] = rb.position;
        let [vx, vy, vz] = rb.velocity;
        let [rx, ry, rz] = rb.rotation;

        if (id === 'pier-p3') {
          const tiltX = Math.min(0.32, simTime * 0.12);
          const settleY = comp.position[1] - Math.min(1.8, simTime * 0.35);
          rb.position = [posX, settleY, posZ + Math.sin(tiltX) * 2.2];
          rb.rotation = [tiltX, ry, rz];
        } else if (id === 'deck-span-3') {
          const isGrounded = posY <= RIVERBED_Y + (comp.dimensions[1] / 2);
          if (!isGrounded) {
            vy -= GRAVITY_ACCELERATION_MPS2 * deltaSeconds * 0.95;
            rx += 0.18 * deltaSeconds;
            rz += 0.12 * deltaSeconds;

            const nextY = Math.max(RIVERBED_Y + (comp.dimensions[1] / 2), posY + vy * deltaSeconds);
            rb.position = [posX, nextY, posZ];
            rb.rotation = [rx, ry, rz];
            rb.velocity = [vx, vy, vz];

            if (posY > WATER_SURFACE_Y && nextY <= WATER_SURFACE_Y) {
              waterDisturbances.push({ x: posX, z: posZ, intensity: 1.5 });
              newEvents.push({
                id: `evt-deck-splash-${Date.now()}`,
                timestampStr: nowTimeStr,
                simTimeSec: simTime,
                category: 'WATER',
                message: 'Deck Span 03 struck water surface (Impact splash generated)',
                severity: 'WARNING',
              });
            }
          } else {
            rb.velocity = [0, 0, 0];
            rb.position[1] = RIVERBED_Y + (comp.dimensions[1] / 2);
          }
        }

        updatedComponents[id] = {
          ...comp,
          structuralState: currentStage === 'POST_FAILURE_EQUILIBRIUM' ? 'POST_FAILURE' : 'FAILED',
          health: 0,
          rigidBody: rb,
        };
      }
      break;
    }

    // -----------------------------------------------------------------------
    // 2. SEISMIC_OSCILLATION: Horizontal ground acceleration & bearing rupture
    // -----------------------------------------------------------------------
    case 'SEISMIC_OSCILLATION': {
      if (simTime < 1.5) {
        currentStage = 'INITIATING_YIELD';
        if (!collapsedIds.includes('deck-span-3')) {
          collapsedIds.push('deck-span-3');
          newEvents.push({
            id: `evt-seismic-1-${Date.now()}`,
            timestampStr: nowTimeStr,
            simTimeSec: simTime,
            category: 'SEISMIC',
            message: 'Peak horizontal ground acceleration (0.35g) ruptured elastomeric bearing seismic stoppers',
            severity: 'CRITICAL',
            componentId: 'deck-span-3',
          });
        }
      } else if (simTime < 3.5) {
        currentStage = 'CONSTRAINT_RELEASE';
        if (!collapsedIds.includes('pier-p3')) collapsedIds.push('pier-p3');
      } else if (simTime < 5.5) {
        currentStage = 'PROGRESSIVE_COLLAPSE';
      } else {
        currentStage = 'POST_FAILURE_EQUILIBRIUM';
      }

      // Kinematic update: Harmonic lateral oscillation (Z-axis) leading to unseating and drop
      const oscZ = Math.sin(simTime * 8.0) * Math.max(0, 1.2 - simTime * 0.2);

      for (const id of collapsedIds) {
        const comp = updatedComponents[id];
        if (!comp) continue;

        const rb: RigidBodyMotion = { ...comp.rigidBody };
        rb.isConstrained = false;
        rb.timeSinceRelease += deltaSeconds;

        const [posX, posY, posZ] = rb.position;
        let [vx, vy, vz] = rb.velocity;
        let [rx, ry, rz] = rb.rotation;

        if (id === 'deck-span-3') {
          const isGrounded = posY <= RIVERBED_Y + (comp.dimensions[1] / 2);
          if (!isGrounded) {
            vy -= GRAVITY_ACCELERATION_MPS2 * deltaSeconds;
            const nextY = Math.max(RIVERBED_Y + (comp.dimensions[1] / 2), posY + vy * deltaSeconds);
            rb.position = [posX, nextY, posZ + oscZ * deltaSeconds];
            rb.rotation = [rx + 0.15 * deltaSeconds, ry, rz];
            rb.velocity = [vx, vy, vz];

            if (posY > WATER_SURFACE_Y && nextY <= WATER_SURFACE_Y) {
              waterDisturbances.push({ x: posX, z: posZ, intensity: 1.2 });
            }
          } else {
            rb.velocity = [0, 0, 0];
            rb.position[1] = RIVERBED_Y + (comp.dimensions[1] / 2);
          }
        } else if (id === 'pier-p3') {
          rb.rotation = [0, 0, oscZ * 0.08];
        }

        updatedComponents[id] = {
          ...comp,
          structuralState: currentStage === 'POST_FAILURE_EQUILIBRIUM' ? 'POST_FAILURE' : 'FAILED',
          health: 0,
          rigidBody: rb,
        };
      }
      break;
    }

    // -----------------------------------------------------------------------
    // 3. FLEXURAL_SAG: Heavy freight live overload
    // -----------------------------------------------------------------------
    case 'FLEXURAL_SAG': {
      if (simTime < 1.2) {
        currentStage = 'INITIATING_YIELD';
        if (!collapsedIds.includes('girder-g2')) {
          collapsedIds.push('girder-g2');
          newEvents.push({
            id: `evt-overload-1-${Date.now()}`,
            timestampStr: nowTimeStr,
            simTimeSec: simTime,
            category: 'MECHANICS',
            message: 'Girder G-02 flexural stress exceeded 355 MPa yield threshold (Deflection: 48 mm)',
            severity: 'CRITICAL',
            componentId: 'girder-g2',
          });
        }
      } else if (simTime < 3.2) {
        currentStage = 'CONSTRAINT_RELEASE';
        if (!collapsedIds.includes('deck-span-3')) {
          collapsedIds.push('deck-span-3');
          newEvents.push({
            id: `evt-overload-2-${Date.now()}`,
            timestampStr: nowTimeStr,
            simTimeSec: simTime,
            category: 'CONSTRAINT',
            message: 'Deck Span 03 elastomeric bearing support lost due to girder flange tearing',
            severity: 'CRITICAL',
            componentId: 'deck-span-3',
          });
        }
      } else if (simTime < 5.5) {
        currentStage = 'PROGRESSIVE_COLLAPSE';
      } else {
        currentStage = 'POST_FAILURE_EQUILIBRIUM';
      }

      for (const id of collapsedIds) {
        const comp = updatedComponents[id];
        if (!comp) continue;

        const rb: RigidBodyMotion = { ...comp.rigidBody };
        rb.isConstrained = false;
        rb.timeSinceRelease += deltaSeconds;

        const [posX, posY, posZ] = rb.position;
        let [vx, vy, vz] = rb.velocity;
        let [rx, ry, rz] = rb.rotation;
        let [wx, wy, wz] = rb.angularVelocity;

        const isGrounded = posY <= RIVERBED_Y + (comp.dimensions[1] / 2);

        if (!isGrounded) {
          vy -= GRAVITY_ACCELERATION_MPS2 * deltaSeconds * 0.85;
          if (id === 'deck-span-3') {
            wz += 0.22 * deltaSeconds;
            wx += 0.10 * deltaSeconds;
          }

          const nextY = Math.max(RIVERBED_Y + (comp.dimensions[1] / 2), posY + vy * deltaSeconds);
          rb.position = [posX + vx * deltaSeconds, nextY, posZ + vz * deltaSeconds];
          rb.rotation = [rx + wx * deltaSeconds, ry + wy * deltaSeconds, rz + wz * deltaSeconds];
          rb.velocity = [vx, vy, vz];
          rb.angularVelocity = [wx, wy, wz];

          if (posY > WATER_SURFACE_Y && nextY <= WATER_SURFACE_Y) {
            waterDisturbances.push({ x: posX, z: posZ, intensity: 1.0 });
          }
        } else {
          rb.velocity = [0, 0, 0];
          rb.angularVelocity = [0, 0, 0];
          rb.position[1] = RIVERBED_Y + (comp.dimensions[1] / 2);
        }

        updatedComponents[id] = {
          ...comp,
          structuralState: isGrounded ? 'POST_FAILURE' : 'FALLING',
          health: 0,
          rigidBody: rb,
        };
      }
      break;
    }

    // -----------------------------------------------------------------------
    // 4. LOCALIZED_SUBSIDENCE: 50-Year splash zone corrosion crushing
    // -----------------------------------------------------------------------
    case 'LOCALIZED_SUBSIDENCE': {
      if (simTime < 1.8) {
        currentStage = 'INITIATING_YIELD';
        if (!collapsedIds.includes('pier-p3')) {
          collapsedIds.push('pier-p3');
          newEvents.push({
            id: `evt-corr-1-${Date.now()}`,
            timestampStr: nowTimeStr,
            simTimeSec: simTime,
            category: 'DAMAGE',
            message: 'Pier P-03 splash zone cover spalled; effective rebar area loss reached 64%',
            severity: 'CRITICAL',
            componentId: 'pier-p3',
          });
        }
      } else if (simTime < 4.0) {
        currentStage = 'CONSTRAINT_RELEASE';
        if (!collapsedIds.includes('pier-cap-p3')) collapsedIds.push('pier-cap-p3');
        if (!collapsedIds.includes('deck-span-3')) collapsedIds.push('deck-span-3');
      } else if (simTime < 6.5) {
        currentStage = 'PROGRESSIVE_COLLAPSE';
      } else {
        currentStage = 'POST_FAILURE_EQUILIBRIUM';
      }

      for (const id of collapsedIds) {
        const comp = updatedComponents[id];
        if (!comp) continue;

        const rb: RigidBodyMotion = { ...comp.rigidBody };
        rb.isConstrained = false;
        rb.timeSinceRelease += deltaSeconds;

        const [posX, posY, posZ] = rb.position;
        let [rx, ry, rz] = rb.rotation;

        if (id === 'pier-p3') {
          const targetY = comp.position[1] - Math.min(2.4, simTime * 0.45);
          rb.position = [posX, targetY, posZ];
          rb.rotation = [rx, ry, rz + 0.02 * deltaSeconds];
        } else if (id === 'pier-cap-p3') {
          const targetY = comp.position[1] - Math.min(2.4, simTime * 0.45);
          rb.position = [posX, targetY, posZ];
          rb.rotation = [rx, ry, rz + 0.02 * deltaSeconds];
        } else if (id === 'deck-span-3') {
          const targetY = comp.position[1] - Math.min(2.2, simTime * 0.4);
          const targetRz = -Math.min(0.18, simTime * 0.035);
          rb.position = [posX, targetY, posZ];
          rb.rotation = [rx, ry, targetRz];
        }

        updatedComponents[id] = {
          ...comp,
          structuralState: simTime > 6.0 ? 'POST_FAILURE' : 'CRITICAL',
          health: Math.max(0, Math.round(30 - simTime * 5)),
          rigidBody: rb,
        };
      }
      break;
    }

    // -----------------------------------------------------------------------
    // 5. FATIGUE_CLEAVAGE: Deferred maintenance / Paris Law crack snap
    // -----------------------------------------------------------------------
    case 'FATIGUE_CLEAVAGE': {
      if (simTime < 1.5) {
        currentStage = 'INITIATING_YIELD';
        if (!collapsedIds.includes('pier-p3')) {
          collapsedIds.push('pier-p3');
          newEvents.push({
            id: `evt-def-1-${Date.now()}`,
            timestampStr: nowTimeStr,
            simTimeSec: simTime,
            category: 'DAMAGE',
            message: 'Pier P-03 fatigue crack length breached 2.2m; K_I = 2.85 MPa√m > K_Ic (2.2 MPa√m)',
            severity: 'CRITICAL',
            componentId: 'pier-p3',
          });
        }
      } else if (simTime < 3.0) {
        currentStage = 'CONSTRAINT_RELEASE';
        if (!collapsedIds.includes('pier-cap-p3')) collapsedIds.push('pier-cap-p3');
        if (!collapsedIds.includes('deck-span-3')) collapsedIds.push('deck-span-3');
      } else if (simTime < 5.8) {
        currentStage = 'PROGRESSIVE_COLLAPSE';
      } else {
        currentStage = 'POST_FAILURE_EQUILIBRIUM';
      }

      for (const id of collapsedIds) {
        const comp = updatedComponents[id];
        if (!comp) continue;

        const rb: RigidBodyMotion = { ...comp.rigidBody };
        rb.isConstrained = false;
        rb.timeSinceRelease += deltaSeconds;

        const [posX, posY, posZ] = rb.position;
        let [vx, vy, vz] = rb.velocity;
        let [rx, ry, rz] = rb.rotation;
        let [wx, wy, wz] = rb.angularVelocity;

        const isGrounded = posY <= RIVERBED_Y + (comp.dimensions[1] / 2);

        if (!isGrounded) {
          vy -= GRAVITY_ACCELERATION_MPS2 * deltaSeconds;
          if (id === 'pier-p3') wz += 0.35 * deltaSeconds;
          if (id === 'deck-span-3') wz += 0.40 * deltaSeconds;

          const nextY = Math.max(RIVERBED_Y + (comp.dimensions[1] / 2), posY + vy * deltaSeconds);
          rb.position = [posX + vx * deltaSeconds, nextY, posZ + vz * deltaSeconds];
          rb.rotation = [rx + wx * deltaSeconds, ry + wy * deltaSeconds, rz + wz * deltaSeconds];
          rb.velocity = [vx, vy, vz];
          rb.angularVelocity = [wx, wy, wz];

          if (posY > WATER_SURFACE_Y && nextY <= WATER_SURFACE_Y) {
            waterDisturbances.push({ x: posX, z: posZ, intensity: 1.2 });
          }
        } else {
          rb.velocity = [0, 0, 0];
          rb.angularVelocity = [0, 0, 0];
          rb.position[1] = RIVERBED_Y + (comp.dimensions[1] / 2);
        }

        updatedComponents[id] = {
          ...comp,
          structuralState: isGrounded ? 'POST_FAILURE' : 'FALLING',
          health: 0,
          rigidBody: rb,
        };
      }
      break;
    }

    // -----------------------------------------------------------------------
    // 6. SCOUR_ASYMMETRIC_TILT: Hydrodynamic sediment crater & footing tilt
    // -----------------------------------------------------------------------
    case 'SCOUR_ASYMMETRIC_TILT': {
      activeScourDepthM = Math.min(2.8, simTime * 0.65);

      if (simTime < 2.0) {
        currentStage = 'INITIATING_YIELD';
        if (!collapsedIds.includes('foundation-f3')) {
          collapsedIds.push('foundation-f3');
          newEvents.push({
            id: `evt-scour-1-${Date.now()}`,
            timestampStr: nowTimeStr,
            simTimeSec: simTime,
            category: 'WATER',
            message: `Hydraulic current washed sediment around Footing F-03 (Scour depth: ${activeScourDepthM.toFixed(1)}m)`,
            severity: 'WARNING',
            componentId: 'foundation-f3',
          });
        }
      } else if (simTime < 3.8) {
        currentStage = 'CONSTRAINT_RELEASE';
        if (!collapsedIds.includes('pier-p3')) collapsedIds.push('pier-p3');
        if (!collapsedIds.includes('deck-span-3')) collapsedIds.push('deck-span-3');
        if (!collapsedIds.includes('deck-span-4')) collapsedIds.push('deck-span-4');
      } else if (simTime < 6.2) {
        currentStage = 'PROGRESSIVE_COLLAPSE';
      } else {
        currentStage = 'POST_FAILURE_EQUILIBRIUM';
      }

      const tiltRad = Math.min(0.26, simTime * 0.05);

      for (const id of collapsedIds) {
        const comp = updatedComponents[id];
        if (!comp) continue;

        const rb: RigidBodyMotion = { ...comp.rigidBody };
        rb.isConstrained = false;
        rb.timeSinceRelease += deltaSeconds;

        const [posX, posY, posZ] = rb.position;

        if (id === 'foundation-f3') {
          const settlementY = comp.position[1] - Math.min(1.2, simTime * 0.25);
          rb.position = [posX, settlementY, posZ];
          rb.rotation = [0, 0, tiltRad];
          rb.settlementTiltAngle = tiltRad;
        } else if (id === 'pier-p3') {
          const settlementY = comp.position[1] - Math.min(1.2, simTime * 0.25);
          rb.position = [posX + Math.sin(tiltRad) * 3.8, settlementY, posZ];
          rb.rotation = [0, 0, tiltRad * 1.2];
        } else if (id === 'deck-span-3' || id === 'deck-span-4') {
          let [vx, vy, vz] = rb.velocity;
          let [rx, ry, rz] = rb.rotation;
          const isGrounded = posY <= RIVERBED_Y + (comp.dimensions[1] / 2);

          if (!isGrounded) {
            vy -= GRAVITY_ACCELERATION_MPS2 * deltaSeconds;
            vz += (id === 'deck-span-3' ? 0.35 : -0.35) * deltaSeconds;
            rz += (id === 'deck-span-3' ? -0.25 : 0.25) * deltaSeconds;

            const nextY = Math.max(RIVERBED_Y + (comp.dimensions[1] / 2), posY + vy * deltaSeconds);
            rb.position = [posX + vx * deltaSeconds, nextY, posZ + vz * deltaSeconds];
            rb.rotation = [rx, ry, rz];
            rb.velocity = [vx, vy, vz];

            if (posY > WATER_SURFACE_Y && nextY <= WATER_SURFACE_Y) {
              waterDisturbances.push({ x: posX, z: posZ, intensity: 1.4 });
            }
          } else {
            rb.velocity = [0, 0, 0];
            rb.position[1] = RIVERBED_Y + (comp.dimensions[1] / 2);
          }
        }

        updatedComponents[id] = {
          ...comp,
          structuralState: 'FAILED',
          health: 0,
          rigidBody: rb,
        };
      }
      break;
    }
  }

  return {
    updatedComponents,
    updatedState: {
      ...state,
      stage: currentStage,
      simulationTimeSec: simTime,
      collapsedComponentIds: collapsedIds,
    },
    updatedShip,
    events: newEvents,
    activeScourDepthM,
    waterDisturbances,
  };
}
