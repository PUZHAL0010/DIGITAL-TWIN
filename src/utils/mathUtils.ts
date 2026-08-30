import * as THREE from 'three';
import { RiskLevel } from '../types/bridge';

/**
 * Clamp value between min and max
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

/**
 * Maps Von Mises stress (MPa) to scientific heatmap color (RGB)
 * Safe: Blue (0-20) -> Cyan (20-45) -> Green (45-75) -> Yellow (75-110) -> Orange (110-140) -> Red/Magenta (>140)
 */
export function getStressColor(stressMPa: number, yieldMPa: number = 140): THREE.Color {
  const normalized = clamp(stressMPa / yieldMPa, 0, 1.2);
  const color = new THREE.Color();

  if (normalized < 0.2) {
    // Deep blue to bright blue/cyan
    const t = normalized / 0.2;
    color.setRGB(lerp(0.05, 0.0, t), lerp(0.3, 0.8, t), lerp(0.8, 1.0, t));
  } else if (normalized < 0.45) {
    // Cyan to green
    const t = (normalized - 0.2) / 0.25;
    color.setRGB(0.0, lerp(0.8, 1.0, t), lerp(1.0, 0.2, t));
  } else if (normalized < 0.7) {
    // Green to yellow
    const t = (normalized - 0.45) / 0.25;
    color.setRGB(lerp(0.0, 1.0, t), 1.0, lerp(0.2, 0.0, t));
  } else if (normalized < 0.95) {
    // Yellow to orange-red
    const t = (normalized - 0.7) / 0.25;
    color.setRGB(1.0, lerp(1.0, 0.2, t), 0.0);
  } else {
    // Critical red to magenta/white hot
    const t = clamp((normalized - 0.95) / 0.25, 0, 1);
    color.setRGB(1.0, lerp(0.2, 0.05, t), lerp(0.0, 0.6, t));
  }

  return color;
}

/**
 * Returns hex color string for UI based on RiskLevel
 */
export function getRiskColorHex(risk: RiskLevel): string {
  switch (risk) {
    case 'NORMAL':
      return '#10b981'; // emerald-500
    case 'LOW':
      return '#3b82f6'; // blue-500
    case 'MODERATE':
      return '#f59e0b'; // amber-500
    case 'HIGH':
      return '#f97316'; // orange-500
    case 'CRITICAL':
      return '#ef4444'; // red-500
  }
}

/**
 * Returns color hex for health percentage (0-100)
 */
export function getHealthColorHex(health: number): string {
  if (health >= 85) return '#10b981'; // green
  if (health >= 70) return '#3b82f6'; // blue
  if (health >= 50) return '#f59e0b'; // amber
  if (health >= 30) return '#f97316'; // orange
  return '#ef4444'; // red
}
