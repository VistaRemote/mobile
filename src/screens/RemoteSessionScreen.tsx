import type { JoinPairingResponse } from '@vistaremote/shared';
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { RTCView, type MediaStream } from 'react-native-webrtc';
import { RemoteSessionController } from '../services/remote-session-controller';

type Props = {
  join: JoinPairingResponse;
  onDisconnect: () => void;
};

export function RemoteSessionScreen({ join, onDisconnect }: Props) {
  const controllerRef = useRef<RemoteSessionController | null>(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const layoutRef = useRef({ width: 1, height: 1 });

  useEffect(() => {
    const ctrl = new RemoteSessionController(join, {
      onState: setStatus,
      onError: setError,
      onRemoteStream: setStream,
    });
    controllerRef.current = ctrl;
    void ctrl.start();
    return () => {
      ctrl.dispose();
      controllerRef.current = null;
    };
  }, [join]);

  const onLayout = (ev: LayoutChangeEvent) => {
    const { width, height } = ev.nativeEvent.layout;
    layoutRef.current = { width, height };
  };

  const onTouch = (x: number, y: number) => {
    const { width, height } = layoutRef.current;
    if (width <= 0 || height <= 0) return;
    controllerRef.current?.sendTouchNormalized(x / width, y / height);
  };

  return (
    <View style={styles.root}>
      <View style={styles.bar}>
        <Text style={styles.room}>{join.roomId}</Text>
        <Text style={styles.status}>{status}</Text>
        <Button title="断开" onPress={onDisconnect} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        style={styles.videoWrap}
        onLayout={onLayout}
        onPressIn={(e) => onTouch(e.nativeEvent.locationX, e.nativeEvent.locationY)}
      >
        {stream ? (
          <RTCView
            streamURL={stream.toURL()}
            style={styles.video}
            objectFit="contain"
          />
        ) : (
          <Text style={styles.waiting}>等待画面…（请确认 Desktop Agent 已启动）</Text>
        )}
      </Pressable>
      <Text style={styles.hint}>点击画面发送控制坐标（MVP）</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#222',
  },
  room: { color: '#fff', fontWeight: '600', flex: 1 },
  status: { color: '#9cf' },
  error: { color: '#f88', padding: 8 },
  videoWrap: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  video: { flex: 1 },
  waiting: { color: '#aaa', textAlign: 'center', padding: 24 },
  hint: { color: '#888', fontSize: 12, padding: 8, textAlign: 'center' },
});
