/**
 * Android 模拟器访问本机 API 用 10.0.2.2；真机请改 mobile/.env 为电脑局域网 IP。
 */
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? 'http://10.0.2.2:3000';

export const SIGNALING_URL =
  process.env.EXPO_PUBLIC_SIGNALING_URL ?? 'ws://10.0.2.2:3000/signaling';

export const VISTA_ENV = process.env.VISTA_ENV ?? 'local';
