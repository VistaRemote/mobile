/** Runtime API base — set via mobile/.env (apply-env) or EXPO_PUBLIC_* at build. */
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? 'http://localhost:3000';

export const VISTA_ENV = process.env.VISTA_ENV ?? 'local';
