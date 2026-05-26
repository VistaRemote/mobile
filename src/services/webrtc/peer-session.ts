import type { SessionModePayload } from '@vistaremote/shared';

/**
 * React Native 主控 WebRTC 会话（react-native-webrtc）。
 * 与 web PeerSession 行为对齐：默认 P2P，SFU 仅订阅。
 */
export class MobilePeerSession {
  mode: 'p2p' | 'sfu' = 'p2p';

  applySessionMode(payload: SessionModePayload): void {
    this.mode = payload.mode;
  }

  /** @deprecated MVP 使用 {@link RemoteSessionController} */
}
