export function normalizePairingInput(input: string): string {
  return input.replace(/\s/g, '').toUpperCase();
}
