import { SIUnit, EngineeringValue, DataStatus } from '../types/physics';

export const GRAVITY_ACCELERATION_MPS2 = 9.81; // g = 9.81 m/s² (SI Standard)

/**
 * Creates an immutable typed engineering quantity with unit, formula provenance, and data status.
 */
export function createEngineeringValue(
  value: number,
  unit: SIUnit,
  formula?: string,
  source: DataStatus = 'VERIFIED',
  notes?: string
): EngineeringValue {
  let formatted = '';
  
  switch (unit) {
    case 'N':
      formatted = `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })} N`;
      break;
    case 'kN':
      formatted = `${value.toFixed(1)} kN`;
      break;
    case 'MN':
      formatted = `${(value / 1000).toFixed(2)} MN`;
      break;
    case 'MPa':
      formatted = `${value.toFixed(2)} MPa`;
      break;
    case 'GPa':
      formatted = `${value.toFixed(1)} GPa`;
      break;
    case 'm':
      formatted = `${value.toFixed(2)} m`;
      break;
    case 'mm':
      formatted = `${value.toFixed(2)} mm`;
      break;
    case 'm²':
      formatted = `${value.toFixed(3)} m²`;
      break;
    case 'm⁴':
      formatted = `${value.toFixed(4)} m⁴`;
      break;
    case 'kg':
      formatted = `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })} kg`;
      break;
    case 't':
      formatted = `${value.toFixed(1)} t`;
      break;
    case 'MPa√m':
      formatted = `${value.toFixed(2)} MPa√m`;
      break;
    case '%':
      formatted = `${Math.round(value)}%`;
      break;
    case 'ratio':
      formatted = value.toFixed(3);
      break;
    default:
      formatted = `${value} ${unit}`;
  }

  return {
    value,
    unit,
    formatted,
    formula,
    source,
    notes,
  };
}

export function convertTonnesToNewtons(tonnes: number): number {
  return tonnes * 1000 * GRAVITY_ACCELERATION_MPS2;
}

export function convertKnToNewtons(kn: number): number {
  return kn * 1000;
}

export function convertMpaToPascals(mpa: number): number {
  return mpa * 1e6;
}
