/**
 * React Native：在主 JS 线程定时 getStats（无 Web Worker 时的 P2 等价方案）。
 * 采样间隔不宜过高，避免阻塞 UI。
 */
export type MobileStatsSample = {
  timestamp: number;
  jitterMs?: number;
  framesDropped?: number;
};

export class MobileStatsCollector {
  private handle: ReturnType<typeof setInterval> | null = null;

  start(
    getStats: () => Promise<MobileStatsSample>,
    onSample: (s: MobileStatsSample) => void,
    intervalMs = 3000,
  ): void {
    this.handle = setInterval(() => {
      void getStats().then(onSample).catch(() => undefined);
    }, intervalMs);
  }

  stop(): void {
    if (this.handle) clearInterval(this.handle);
    this.handle = null;
  }
}
