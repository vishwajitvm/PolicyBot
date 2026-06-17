export function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

export function formatLatency(value?: number) {
  return `${value ?? 0} ms`;
}
