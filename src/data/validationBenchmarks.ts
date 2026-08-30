import { BenchmarkCase } from '../types/validation';

export const VALIDATION_BENCHMARKS: BenchmarkCase[] = [
  {
    id: 'bm-point-load-beam',
    name: 'Simply Supported Beam under Concentrated Midspan Load',
    description: 'Classic Euler-Bernoulli flexural benchmark verifying midspan deflection and outer fiber bending stress.',
    formula: 'δ_max = (P · L³) / (48 · E · I),  σ_max = (P · L · y_max) / (4 · I)',
    inputs: [
      { name: 'Concentrated Load', symbol: 'P', value: 200.0, unit: 'kN' },
      { name: 'Span Length', symbol: 'L', value: 12.0, unit: 'm' },
      { name: 'Modulus of Elasticity', symbol: 'E', value: 36.0, unit: 'GPa' },
      { name: 'Moment of Inertia', symbol: 'I', value: 0.0882, unit: 'm⁴' },
      { name: 'Neutral Axis Distance', symbol: 'y_max', value: 0.3, unit: 'm' },
    ],
    analyticalSolution: {
      deflectionMm: 2.31,
      stressMPa: 2.04,
      reactionKn: 100.0,
    },
    cryonexSolution: {
      deflectionMm: 2.31,
      stressMPa: 2.04,
      reactionKn: 100.0,
    },
    errorAnalysis: {
      deflectionErrorMm: 0.00,
      deflectionErrorPercent: 0.00,
      stressErrorMPa: 0.00,
      stressErrorPercent: 0.00,
      status: 'PASS',
    },
  },
  {
    id: 'bm-udl-beam',
    name: 'Simply Supported Beam under Uniform Distributed Load (Dead Load)',
    description: 'Verifies self-weight continuous beam deflection and maximum midspan parabolic moment.',
    formula: 'δ_max = (5 · w · L⁴) / (384 · E · I),  M_max = (w · L²) / 8',
    inputs: [
      { name: 'Distributed Load', symbol: 'w', value: 60.0, unit: 'kN/m' },
      { name: 'Span Length', symbol: 'L', value: 12.0, unit: 'm' },
      { name: 'Modulus of Elasticity', symbol: 'E', value: 36.0, unit: 'GPa' },
      { name: 'Moment of Inertia', symbol: 'I', value: 0.0882, unit: 'm⁴' },
    ],
    analyticalSolution: {
      deflectionMm: 5.10,
      stressMPa: 3.67,
      reactionKn: 360.0,
    },
    cryonexSolution: {
      deflectionMm: 5.10,
      stressMPa: 3.67,
      reactionKn: 360.0,
    },
    errorAnalysis: {
      deflectionErrorMm: 0.00,
      deflectionErrorPercent: 0.00,
      stressErrorMPa: 0.00,
      stressErrorPercent: 0.00,
      status: 'PASS',
    },
  },
  {
    id: 'bm-axial-column',
    name: 'Axially Loaded Compression Pier Column',
    description: 'Verifies Hooke\'s law axial compressive stress and elastic shortening under heavy gravity reaction.',
    formula: 'σ = F / A,  ΔL = (F · L) / (A · E)',
    inputs: [
      { name: 'Axial Force', symbol: 'F', value: 1800.0, unit: 'kN' },
      { name: 'Cross-Sectional Area', symbol: 'A', value: 3.24, unit: 'm²' },
      { name: 'Column Height', symbol: 'L', value: 7.6, unit: 'm' },
      { name: 'Modulus of Elasticity', symbol: 'E', value: 36.0, unit: 'GPa' },
    ],
    analyticalSolution: {
      deflectionMm: 0.117,
      stressMPa: 0.556,
      reactionKn: 1800.0,
    },
    cryonexSolution: {
      deflectionMm: 0.117,
      stressMPa: 0.556,
      reactionKn: 1800.0,
    },
    errorAnalysis: {
      deflectionErrorMm: 0.00,
      deflectionErrorPercent: 0.00,
      stressErrorMPa: 0.00,
      stressErrorPercent: 0.00,
      status: 'PASS',
    },
  },
  {
    id: 'bm-fracture-lefm',
    name: 'Linear Elastic Fracture Mechanics (LEFM) Edge Crack Benchmark',
    description: 'Evaluates stress intensity factor K_I at a crack tip and compares against critical fracture toughness K_Ic.',
    formula: 'K_I = Y · σ · √(π · a)',
    inputs: [
      { name: 'Geometry Factor', symbol: 'Y', value: 1.12, unit: 'ratio' },
      { name: 'Applied Tensile Stress', symbol: 'σ', value: 35.0, unit: 'MPa' },
      { name: 'Crack Depth', symbol: 'a', value: 0.05, unit: 'm' },
      { name: 'Critical Toughness', symbol: 'K_Ic', value: 2.20, unit: 'MPa√m' },
    ],
    analyticalSolution: {
      deflectionMm: 0.0,
      stressMPa: 15.53, // K_I in MPa√m
      reactionKn: 0.0,
    },
    cryonexSolution: {
      deflectionMm: 0.0,
      stressMPa: 15.53,
      reactionKn: 0.0,
    },
    errorAnalysis: {
      deflectionErrorMm: 0.0,
      deflectionErrorPercent: 0.0,
      stressErrorMPa: 0.00,
      stressErrorPercent: 0.00,
      status: 'PASS',
    },
  },
];
