import { round2 } from './math.util';

export function centsToDollar(v?: number | null): number | undefined {
  if (v == null) return undefined;
  return round2(Math.round(v) / 100);
}
