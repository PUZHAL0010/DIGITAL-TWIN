/**
 * Format numbers with unit abbreviations and precision
 */
export function formatMPa(val: number): string {
  return `${val.toFixed(1)} MPa`;
}

export function formatMm(val: number): string {
  return `${val.toFixed(2)} mm`;
}

export function formatKn(val: number): string {
  if (val >= 1000) {
    return `${(val / 1000).toFixed(1)} MN`;
  }
  return `${val.toFixed(0)} kN`;
}

export function formatCurrencyUSD(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatPercentage(val: number): string {
  return `${Math.round(val)}%`;
}
