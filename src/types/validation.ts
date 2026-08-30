export interface BenchmarkCase {
  id: string;
  name: string;
  description: string;
  formula: string;
  inputs: {
    name: string;
    symbol: string;
    value: number;
    unit: string;
  }[];
  analyticalSolution: {
    deflectionMm: number;
    stressMPa: number;
    reactionKn: number;
  };
  cryonexSolution: {
    deflectionMm: number;
    stressMPa: number;
    reactionKn: number;
  };
  errorAnalysis: {
    deflectionErrorMm: number;
    deflectionErrorPercent: number;
    stressErrorMPa: number;
    stressErrorPercent: number;
    status: 'PASS' | 'MARGINAL' | 'FAIL';
  };
}
