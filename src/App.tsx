import { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import type { JoinPairingResponse } from '@vistaremote/shared';
import { PairingScreen } from './screens/PairingScreen';
import { RemoteSessionScreen } from './screens/RemoteSessionScreen';

export default function App() {
  const [join, setJoin] = useState<JoinPairingResponse | null>(null);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      {join ? (
        <RemoteSessionScreen join={join} onDisconnect={() => setJoin(null)} />
      ) : (
        <PairingScreen onJoined={setJoin} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f5' },
});
