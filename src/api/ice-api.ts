import type { IceServersResponse } from '@vistaremote/shared';
import { API_BASE } from '../config/env';

export async function fetchIceServers(): Promise<IceServersResponse['iceServers']> {
  const res = await fetch(`${API_BASE}/api/v1/ice/servers`);
  if (!res.ok) throw new Error(`ICE ${res.status}`);
  const body = (await res.json()) as IceServersResponse;
  return body.iceServers;
}
