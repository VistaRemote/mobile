import { PairingEntryMethod } from '@vistaremote/shared';
import { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { joinPairing } from '../api/pairing-api';
import type { JoinPairingResponse } from '@vistaremote/shared';
import { API_BASE } from '../config/env';

type Props = {
  onJoined: (join: JoinPairingResponse) => void;
};

export function PairingScreen({ onJoined }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onConnect = async () => {
    const trimmed = code.replace(/\s/g, '');
    if (trimmed.length < 4) {
      setError('请输入至少 4 位配对码');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await joinPairing({
        method: PairingEntryMethod.CODE,
        code: trimmed,
      });
      onJoined(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : '配对失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>VistaRemote 主控</Text>
      <Text style={styles.hint}>
        先在桌面 Agent 记下配对码，再输入连接。API：{API_BASE}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="6–8 位数字配对码"
        keyboardType="number-pad"
        value={code}
        onChangeText={setCode}
        maxLength={12}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 12 }} />
      ) : (
        <Button title="连接远程桌面" onPress={() => void onConnect()} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  hint: { fontSize: 13, color: '#666', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 18,
  },
  error: { color: '#c00', marginBottom: 8 },
});
