export function parseQuantity(value: string | number | null | undefined): number {
  const quantity = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(quantity)) return 1;
  return Math.max(1, Math.min(100, quantity));
}
