import * as THREE from 'three';
import { getStressColor } from '../../utils/mathUtils';

/**
 * Creates or updates vertex colors on a BufferGeometry based on
 * a base stress (MPa), peak stress concentration, and localized damage.
 */
export function applyStressHeatmapToGeometry(
  geometry: THREE.BufferGeometry,
  baseStressMPa: number,
  peakStressMPa: number,
  damageSeverity: number, // 0 to 100
  componentType: string
): void {
  const posAttr = geometry.getAttribute('position');
  if (!posAttr) return;

  const count = posAttr.count;
  let colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;

  if (!colorAttr || colorAttr.count !== count) {
    const colors = new Float32Array(count * 3);
    colorAttr = new THREE.BufferAttribute(colors, 3);
    geometry.setAttribute('color', colorAttr);
  }

  const damageFactor = damageSeverity / 100;

  for (let i = 0; i < count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);

    let localStress = baseStressMPa;

    if (componentType === 'deck') {
      // High tension/bending stress at bottom/midspan of the deck (x near center)
      const midspanDist = Math.abs(x);
      const spanFactor = Math.max(0, 1.0 - (midspanDist / 6.0));
      // Top compression vs bottom tension
      const vertFactor = y < 0 ? 1.3 : 0.8;
      localStress = baseStressMPa * (0.6 + 0.8 * spanFactor * vertFactor) + (damageFactor * 35.0 * spanFactor);
    } else if (componentType === 'pier') {
      // Pier high shear stress near top cap joint and middle diagonal shear zone
      const heightNorm = (y + 3.8) / 7.6; // 0 (bottom) to 1 (top)
      const shearZone = Math.sin(heightNorm * Math.PI);
      localStress = baseStressMPa * (0.7 + 0.6 * shearZone) + (damageFactor * 45.0 * shearZone);
    } else if (componentType === 'pier_cap') {
      // High negative bending near pier supports
      const edgeFactor = Math.abs(z) / 3.4;
      localStress = baseStressMPa * (0.8 + 0.5 * edgeFactor);
    } else {
      localStress = baseStressMPa * (0.9 + 0.2 * Math.sin(x + y));
    }

    const c = getStressColor(localStress, 140);
    colorAttr.setXYZ(i, c.r, c.g, c.b);
  }

  colorAttr.needsUpdate = true;
}
