import type { ClientEntitlements } from '@vistaremote/shared';
import { featureGateMessage } from '@vistaremote/shared';
import { API_BASE } from '../../config/env';

export async function fetchEntitlements(userId: string): Promise<ClientEntitlements> {
  const res = await fetch(`${API_BASE}/api/v1/billing/entitlements`, {
    headers: { 'x-user-id': userId },
  });
  if (!res.ok) throw new Error(`entitlements ${res.status}`);
  return res.json() as Promise<ClientEntitlements>;
}

export function blockMessage(ent: ClientEntitlements, gateId: string): string {
  return featureGateMessage(ent.gates[gateId] ?? null);
}

export function canUseSfu(ent: ClientEntitlements): boolean {
  return ent.features.webrtcSfu;
}
