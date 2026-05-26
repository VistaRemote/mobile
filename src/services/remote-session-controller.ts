import {
  DataChannelName,
  type ControlEnvelope,
  type JoinPairingResponse,
  type SignalingEnvelope,
  iceCandidatePayloadSchema,
  rtcSessionDescriptionSchema,
} from '@vistaremote/shared';
import {
  RTCPeerConnection,
  type MediaStream,
  type RTCPeerConnection as RNPeerConnection,
} from 'react-native-webrtc';

type RnDataChannel = ReturnType<RNPeerConnection['createDataChannel']>;
import { fetchIceServers } from '../api/ice-api';
import { SignalingClient } from '../messaging/signaling-client';
import { SIGNALING_URL } from '../config/env';

export type RemoteSessionCallbacks = {
  onState?: (state: string) => void;
  onError?: (message: string) => void;
  onRemoteStream?: (stream: MediaStream | null) => void;
};

export class RemoteSessionController {
  private signaling: SignalingClient | null = null;
  private pc: RNPeerConnection | null = null;
  private controlDc: RnDataChannel | null = null;
  private deviceId = `mobile_${Date.now().toString(36).slice(2, 10)}`;
  private controlSeq = 0;
  private unsubSignaling: (() => void) | null = null;
  private offerSent = false;

  constructor(
    private readonly join: JoinPairingResponse,
    private readonly callbacks: RemoteSessionCallbacks = {},
  ) {}

  async start(): Promise<void> {
    this.callbacks.onState?.('connecting');
    const iceServers = await fetchIceServers();
    this.signaling = new SignalingClient(this.join.signalingUrl ?? SIGNALING_URL);
    await this.signaling.connect();
    this.unsubSignaling = this.signaling.onMessage((env) => {
      void this.onSignaling(env);
    });

    this.pc = new RTCPeerConnection({ iceServers });
    this.pc.addTransceiver('video', { direction: 'recvonly' });

    const pc = this.pc as RNPeerConnection & {
      ontrack: ((ev: { streams: MediaStream[] }) => void) | null;
      onicecandidate: ((ev: {
        candidate: { candidate: string; sdpMid: string | null; sdpMLineIndex: number | null } | null;
      }) => void) | null;
    };

    pc.ontrack = (ev) => {
      const stream = ev.streams[0] ?? null;
      this.callbacks.onRemoteStream?.(stream);
      this.callbacks.onState?.('connected');
    };

    this.controlDc = pc.createDataChannel(DataChannelName.CONTROL, {
      ordered: true,
    });

    pc.onicecandidate = (ev) => {
      if (!ev.candidate || !this.signaling) return;
      this.signaling.send(
        this.envelope('ice-candidate', {
          candidate: ev.candidate.candidate,
          sdpMid: ev.candidate.sdpMid,
          sdpMLineIndex: ev.candidate.sdpMLineIndex,
        }),
      );
    };

    this.signaling.send(
      this.envelope('join', { role: 'controller', userId: 'mvp-mobile' }),
    );
  }

  private async onSignaling(env: SignalingEnvelope): Promise<void> {
    if (env.sessionId !== this.join.sessionId) return;

    if (env.type === 'peer-joined' || env.type === 'joined') {
      await this.maybeCreateOffer();
      return;
    }

    if (env.type === 'answer' && env.deviceId !== this.deviceId) {
      const sdp = rtcSessionDescriptionSchema.safeParse(env.payload);
      if (!sdp.success || !this.pc) return;
      await this.pc.setRemoteDescription({
        type: sdp.data.type,
        sdp: sdp.data.sdp,
      });
      this.callbacks.onState?.('negotiating');
      return;
    }

    if (env.type === 'ice-candidate' && env.deviceId !== this.deviceId) {
      const ice = iceCandidatePayloadSchema.safeParse(env.payload);
      if (!ice.success || !this.pc) return;
      try {
        await this.pc.addIceCandidate({
          candidate: ice.data.candidate,
          sdpMid: ice.data.sdpMid ?? null,
          sdpMLineIndex: ice.data.sdpMLineIndex ?? null,
        });
      } catch {
        /* ignore late candidates */
      }
    }

    if (env.type === 'error') {
      this.callbacks.onError?.(
        String((env.payload as { code?: string })?.code ?? 'SIGNALING_ERROR'),
      );
    }
  }

  private async maybeCreateOffer(): Promise<void> {
    if (this.offerSent || !this.pc || !this.signaling) return;
    this.offerSent = true;
    const offer = await this.pc.createOffer({});
    await this.pc.setLocalDescription(offer);
    this.signaling.send(
      this.envelope('offer', { type: 'offer', sdp: offer.sdp ?? '' }),
    );
    this.callbacks.onState?.('negotiating');
  }

  sendControl(partial: Omit<ControlEnvelope, 'v' | 'seq'>): void {
    if (this.controlDc?.readyState !== 'open') return;
    const msg: ControlEnvelope = {
      v: 1,
      seq: this.controlSeq++,
      ...partial,
    };
    this.controlDc.send(JSON.stringify(msg));
  }

  sendTouchNormalized(x: number, y: number): void {
    this.sendControl({
      kind: 'mouse-move',
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
      displayIndex: 0,
    });
  }

  private envelope(
    type: SignalingEnvelope['type'],
    payload: unknown,
  ): SignalingEnvelope {
    return {
      v: 1,
      type,
      sessionId: this.join.sessionId,
      deviceId: this.deviceId,
      ts: Date.now(),
      payload,
    };
  }

  dispose(): void {
    this.unsubSignaling?.();
    this.signaling?.close();
    this.pc?.close();
    this.callbacks.onRemoteStream?.(null);
    this.controlDc = null;
    this.pc = null;
    this.signaling = null;
  }
}
