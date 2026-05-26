import type { JoinPairingRequest, JoinPairingResponse } from '@vistaremote/shared';
import { API_BASE } from '../config/env';

export async function joinPairing(
  body: JoinPairingRequest,
): Promise<JoinPairingResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/pairing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { code?: string };
    throw new Error(err.code ?? `HTTP ${res.status}`);
  }
  return (await res.json()) as JoinPairingResponse;
}
