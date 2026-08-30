import { Vehicle, DynamicLoadAssessment } from '../types/vehicles';
import { StructuralComponent } from '../types/bridge';
import { GRAVITY_ACCELERATION_MPS2 } from './units';

const RIVERBED_Y = -4.4; // Riverbed ground level

export interface SpanLoadState {
  spanId: string;
  totalStaticLiveLoadKn: number;
  totalDynamicLiveLoadKn: number;
  primaryPointLoadKn: number;
  relativePointLoadX: number; // 0.0 to 1.0 along the span
  occupyingVehicleIds: string[];
}

/**
 * Updates positions and kinematics of all moving vehicles along the bridge
 * and calculates dynamic live-load distribution across all bridge deck spans.
 * Accurately responds when structural deck spans collapse.
 */
export function processVehicleTrafficAndLoads(
  vehicles: Vehicle[],
  deltaSeconds: number,
  bridgeLengthMeters: number = 48.0,
  daf: number = 0.25,
  components?: Record<string, StructuralComponent>
): {
  updatedVehicles: Vehicle[];
  spanLoads: Record<string, SpanLoadState>;
  globalAssessment: DynamicLoadAssessment;
} {
  const halfLen = bridgeLengthMeters / 2; // 24 meters
  let totalStaticLiveLoadKn = 0;
  let peakPointLoadKn = 0;

  const spanConfigs = [
    { id: 'deck-span-1', minX: -24, maxX: -12, center: -18, length: 12 },
    { id: 'deck-span-2', minX: -12, maxX: 0, center: -6, length: 12 },
    { id: 'deck-span-3', minX: 0, maxX: 12, center: 6, length: 12 },
    { id: 'deck-span-4', minX: 12, maxX: 24, center: 18, length: 12 },
  ];

  const spanLoads: Record<string, SpanLoadState> = {
    'deck-span-1': { spanId: 'deck-span-1', totalStaticLiveLoadKn: 0, totalDynamicLiveLoadKn: 0, primaryPointLoadKn: 0, relativePointLoadX: 0.5, occupyingVehicleIds: [] },
    'deck-span-2': { spanId: 'deck-span-2', totalStaticLiveLoadKn: 0, totalDynamicLiveLoadKn: 0, primaryPointLoadKn: 0, relativePointLoadX: 0.5, occupyingVehicleIds: [] },
    'deck-span-3': { spanId: 'deck-span-3', totalStaticLiveLoadKn: 0, totalDynamicLiveLoadKn: 0, primaryPointLoadKn: 0, relativePointLoadX: 0.5, occupyingVehicleIds: [] },
    'deck-span-4': { spanId: 'deck-span-4', totalStaticLiveLoadKn: 0, totalDynamicLiveLoadKn: 0, primaryPointLoadKn: 0, relativePointLoadX: 0.5, occupyingVehicleIds: [] },
  };

  const updatedVehicles: Vehicle[] = vehicles.map(veh => {
    const direction = veh.lane;
    let newX = veh.positionX;
    let newYOffset = veh.verticalOffset || 0;
    let newFallVel = veh.fallVelocity || 0;
    let newPitch = veh.pitchAngle || 0;
    let newRoll = veh.rollAngle || 0;
    let supportState = veh.supportState || 'SUPPORTED';

    // Static force F = m * g (kN)
    const staticF_kn = (veh.massKg * GRAVITY_ACCELERATION_MPS2) / 1000;

    // Check which span the vehicle is on
    let assignedSpanId: string | undefined = undefined;
    for (const span of spanConfigs) {
      if (newX >= span.minX && newX < span.maxX) {
        assignedSpanId = span.id;
        break;
      }
    }

    const currentSpanComp = assignedSpanId && components ? components[assignedSpanId] : undefined;
    const isCurrentSpanFailing = currentSpanComp && !currentSpanComp.rigidBody.isConstrained;

    if (isCurrentSpanFailing && currentSpanComp) {
      // VEHICLE LOSES STRUCTURAL SUPPORT: Falls with failing deck!
      supportState = 'FALLING';
      
      // Match falling deck elevation and rotational tilt
      const deckDropY = currentSpanComp.rigidBody.position[1] - currentSpanComp.position[1];
      const targetYOffset = deckDropY;
      
      newFallVel += GRAVITY_ACCELERATION_MPS2 * deltaSeconds;
      newYOffset = Math.max(RIVERBED_Y - 4.5, Math.min(newYOffset - newFallVel * deltaSeconds, targetYOffset));
      
      // Inherit rotation from failing deck
      newPitch = currentSpanComp.rigidBody.rotation[2] || 0;
      newRoll = currentSpanComp.rigidBody.rotation[0] || 0;
      
      // Vehicle stops moving forward when falling
      if (newYOffset <= RIVERBED_Y - 4.5) {
        supportState = 'GROUNDED';
      }
    } else if (supportState === 'FALLING' || supportState === 'GROUNDED') {
      // Keep in settled ground state
      newYOffset = Math.max(RIVERBED_Y - 4.5, newYOffset - (veh.fallVelocity || 0) * deltaSeconds);
    } else {
      // Normal moving traffic kinematics
      newX = veh.positionX + (direction * veh.speedMps * deltaSeconds);

      // Loop around when exiting bridge
      if (direction === 1 && newX > halfLen + 8) {
        newX = -halfLen - 8;
      } else if (direction === -1 && newX < -halfLen - 8) {
        newX = halfLen + 8;
      }

      if (assignedSpanId) {
        const relX = (newX - spanConfigs.find(s => s.id === assignedSpanId)!.minX) / 12;
        spanLoads[assignedSpanId].totalStaticLiveLoadKn += staticF_kn;
        spanLoads[assignedSpanId].occupyingVehicleIds.push(veh.id);

        if (staticF_kn > spanLoads[assignedSpanId].primaryPointLoadKn) {
          spanLoads[assignedSpanId].primaryPointLoadKn = staticF_kn;
          spanLoads[assignedSpanId].relativePointLoadX = relX;
        }

        totalStaticLiveLoadKn += staticF_kn;
        if (staticF_kn > peakPointLoadKn) peakPointLoadKn = staticF_kn;
      }
    }

    return {
      ...veh,
      positionX: Math.round(newX * 100) / 100,
      staticForceKn: Math.round(staticF_kn * 10) / 10,
      currentSpanId: assignedSpanId,
      supportState,
      verticalOffset: newYOffset,
      fallVelocity: newFallVel,
      pitchAngle: newPitch,
      rollAngle: newRoll,
    };
  });

  // Calculate dynamic amplified live load per span
  for (const spanId of Object.keys(spanLoads)) {
    const s = spanLoads[spanId];
    s.totalDynamicLiveLoadKn = Math.round(s.totalStaticLiveLoadKn * (1 + daf) * 10) / 10;
  }

  const totalDynamicLoadKn = Math.round(totalStaticLiveLoadKn * (1 + daf) * 10) / 10;

  return {
    updatedVehicles,
    spanLoads,
    globalAssessment: {
      staticTotalKn: Math.round(totalStaticLiveLoadKn * 10) / 10,
      dynamicAmplificationFactor: daf,
      totalDynamicLoadKn,
      peakPointLoadKn: Math.round(peakPointLoadKn * 10) / 10,
      activeVehiclesCount: updatedVehicles.filter(v => v.currentSpanId !== undefined && v.supportState !== 'FALLING').length,
    },
  };
}
