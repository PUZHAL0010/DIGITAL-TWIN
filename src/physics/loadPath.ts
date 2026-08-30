import { StructuralComponent } from '../types/bridge';
import { Vehicle } from '../types/vehicles';

export interface LoadPathVector3D {
  id: string;
  startPos: [number, number, number];
  endPos: [number, number, number];
  magnitudeKn: number;
  label: string;
  phase: 'VEHICLE_TO_DECK' | 'DECK_TO_GIRDER' | 'GIRDER_TO_PIER' | 'PIER_TO_FOUNDATION' | 'FOUNDATION_TO_SOIL' | 'REDISTRIBUTION';
  colorHex: string;
}

/**
 * Computes 3D load transmission vectors mapping the physics load path:
 * Vehicle → Deck → Girder → Pier → Foundation → Ground
 * Dynamically re-routes vectors to adjacent supports when a member fails.
 */
export function calculate3DLoadPathVectors(
  vehicles: Vehicle[],
  components: Record<string, StructuralComponent>
): LoadPathVector3D[] {
  const vectors: LoadPathVector3D[] = [];

  // 1. Vehicle to Deck Point Load Vectors
  for (const veh of vehicles) {
    if (veh.currentSpanId && components[veh.currentSpanId]) {
      const span = components[veh.currentSpanId];
      const isSpanFailing = !span.rigidBody.isConstrained;
      
      vectors.push({
        id: `lp-veh-${veh.id}`,
        startPos: [veh.positionX, (isSpanFailing ? span.rigidBody.position[1] : span.position[1]) + 1.6, veh.lane * 1.8],
        endPos: [veh.positionX, (isSpanFailing ? span.rigidBody.position[1] : span.position[1]) + 0.3, veh.lane * 1.8],
        magnitudeKn: veh.staticForceKn,
        label: `${veh.name} (${veh.staticForceKn.toFixed(0)} kN)`,
        phase: 'VEHICLE_TO_DECK',
        colorHex: isSpanFailing ? '#ef4444' : '#00f2fe',
      });
    }
  }

  // 2. Deck to Girder & Pier Columns
  const pierPairs = [
    { deckId: 'deck-span-1', pierId: 'pier-p1', capId: 'pier-p1', pos: [-18, 4.2, 0] },
    { deckId: 'deck-span-2', pierId: 'pier-p2', capId: 'pier-cap-p2', pos: [-6, 4.2, 0] },
    { deckId: 'deck-span-3', pierId: 'pier-p3', capId: 'pier-cap-p3', pos: [6, 4.2, 0] },
    { deckId: 'deck-span-4', pierId: 'pier-p4', capId: 'pier-p4', pos: [18, 4.2, 0] },
  ];

  const pier3Comp = components['pier-p3'];
  const isPier3Failed = pier3Comp && (!pier3Comp.rigidBody.isConstrained || pier3Comp.structuralState === 'FAILED' || pier3Comp.health === 0);

  for (const pair of pierPairs) {
    const deckComp = components[pair.deckId];
    const pierComp = components[pair.pierId];

    if (deckComp && pierComp) {
      const isPierFailed = !pierComp.rigidBody.isConstrained || pierComp.structuralState === 'FAILED';
      const transmittedLoadKn = deckComp.appliedForceKn;

      if (isPierFailed && pair.pierId === 'pier-p3') {
        // DYNAMIC LOAD REDISTRIBUTION: Reroute force diagonally to Pier 2 and Pier 4!
        vectors.push({
          id: `lp-redist-p3-to-p2`,
          startPos: [6, 3.8, 0],
          endPos: [-6, 3.8, 0],
          magnitudeKn: transmittedLoadKn * 0.58,
          label: `Load Redistribution: +${(transmittedLoadKn * 0.58).toFixed(0)} kN to Pier 2`,
          phase: 'REDISTRIBUTION',
          colorHex: '#f59e0b',
        });

        vectors.push({
          id: `lp-redist-p3-to-p4`,
          startPos: [6, 3.8, 0],
          endPos: [18, 3.8, 0],
          magnitudeKn: transmittedLoadKn * 0.42,
          label: `Load Redistribution: +${(transmittedLoadKn * 0.42).toFixed(0)} kN to Pier 4`,
          phase: 'REDISTRIBUTION',
          colorHex: '#f59e0b',
        });
      } else if (!isPierFailed) {
        // Intact load path
        const currentAxialForceKn = (pair.pierId === 'pier-p2' && isPier3Failed)
          ? pierComp.appliedForceKn + 850
          : (pair.pierId === 'pier-p4' && isPier3Failed)
          ? pierComp.appliedForceKn + 620
          : pierComp.appliedForceKn;

        // Deck to Pier Cap Transfer
        vectors.push({
          id: `lp-deck-${pair.deckId}`,
          startPos: [pair.pos[0], 4.2, 0],
          endPos: [pair.pos[0], 3.8, 0],
          magnitudeKn: transmittedLoadKn,
          label: `Transfer: ${transmittedLoadKn.toFixed(0)} kN`,
          phase: 'DECK_TO_GIRDER',
          colorHex: '#38bdf8',
        });

        // Pier Cap down Pier Column
        vectors.push({
          id: `lp-pier-${pair.pierId}`,
          startPos: [pierComp.position[0], 3.8, 0],
          endPos: [pierComp.position[0], -3.5, 0],
          magnitudeKn: currentAxialForceKn,
          label: `Axial Demand: ${currentAxialForceKn.toFixed(0)} kN`,
          phase: 'GIRDER_TO_PIER',
          colorHex: isPier3Failed && (pair.pierId === 'pier-p2' || pair.pierId === 'pier-p4') ? '#f59e0b' : '#0284c7',
        });

        // Pier to Foundation & Bedrock
        vectors.push({
          id: `lp-fnd-${pair.pierId}`,
          startPos: [pierComp.position[0], -3.5, 0],
          endPos: [pierComp.position[0], -7.5, 0],
          magnitudeKn: currentAxialForceKn,
          label: `Bedrock Bearing: ${currentAxialForceKn.toFixed(0)} kN`,
          phase: 'FOUNDATION_TO_SOIL',
          colorHex: '#10b981',
        });
      }
    }
  }

  return vectors;
}
