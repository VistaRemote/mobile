import type { SignalingEnvelope } from '@vistaremote/shared';

export type SignalingMessageHandler = (envelope: SignalingEnvelope) => void;

export class SignalingClient {
  private ws: WebSocket | null = null;
  private handlers = new Set<SignalingMessageHandler>();

  constructor(private readonly url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => resolve();
      this.ws.onerror = () => reject(new Error('WebSocket failed'));
      this.ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(String(ev.data)) as SignalingEnvelope;
          for (const h of this.handlers) h(data);
        } catch {
          /* ignore malformed */
        }
      };
    });
  }

  onMessage(handler: SignalingMessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  send(envelope: SignalingEnvelope): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(envelope));
    }
  }

  close(): void {
    this.ws?.close();
    this.ws = null;
  }
}
