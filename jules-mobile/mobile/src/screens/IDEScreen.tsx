import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getVMs, addVM, upgradePlan, downgradePlan } from '../services/api';
import TerminalView from '../components/TerminalView';

export default function IDEScreen() {
  const { token, user, updateUser } = useAuth();
  const [vms, setVms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentVM, setCurrentVM] = useState<any | null>(null);

  // Form State
  const [vmName, setVmName] = useState('');
  const [vmHost, setVmHost] = useState('');
  const [vmUser, setVmUser] = useState('');
  const [vmType, setVmType] = useState<'local' | 'cloud'>('local');

  useEffect(() => {
    fetchVMs();
  }, [token]);

  const fetchVMs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getVMs(token);
      setVms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVM = async () => {
    if (!token) return;
    try {
      // For cloud VM, we just set host to 'mock' for prototype if not provided
      const host = vmType === 'cloud' ? 'mock-cloud' : vmHost;

      const newVM = await addVM(token, {
        name: vmName,
        type: vmType,
        host: host,
        username: vmUser || 'root',
        port: 22
      });
      setVms([...vms, newVM]);
      setShowAddModal(false);
      // Reset form
      setVmName(''); setVmHost(''); setVmUser('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const togglePlan = async () => {
      if (!token || !user) return;
      try {
          if (user.plan === 'free') {
            const res = await upgradePlan(token);
            if (res.user) updateUser(res.user);
            Alert.alert('Upgraded', 'You are now on PRO plan!');
          } else {
            const res = await downgradePlan(token);
            if (res.user) updateUser(res.user);
            Alert.alert('Downgraded', 'You are now on FREE plan.');
          }
      } catch (e) {
          Alert.alert('Error', 'Failed to change plan');
      }
  };

  if (currentVM) {
      return <TerminalView vmId={currentVM.id} vmName={currentVM.name} onClose={() => setCurrentVM(null)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VM Manager</Text>
        <Text style={styles.subtitle}>Plan: {user?.plan.toUpperCase()}</Text>
        <Button title={user?.plan === 'free' ? "Upgrade to Pro" : "Downgrade to Free"} onPress={togglePlan} />
      </View>

      <FlatList
        data={vms}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchVMs}
        ListEmptyComponent={<Text style={styles.emptyText}>No VMs found. Add one!</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.vmItem} onPress={() => setCurrentVM(item)}>
            <View>
                <Text style={styles.vmName}>{item.name}</Text>
                <Text style={styles.vmDetails}>{item.username}@{item.host}</Text>
                <Text style={styles.vmType}>{item.type.toUpperCase()}</Text>
            </View>
            <Text style={styles.connectBtn}>Connect &gt;</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showAddModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New VM</Text>

          <View style={styles.typeSelector}>
              <Button title="Local VM" onPress={() => setVmType('local')} color={vmType === 'local' ? '#007AFF' : '#999'} />
              <Button title="Cloud VM" onPress={() => setVmType('cloud')} color={vmType === 'cloud' ? '#007AFF' : '#999'} />
          </View>

          <TextInput placeholder="Name (e.g. My Server)" style={styles.input} value={vmName} onChangeText={setVmName} />

          {vmType === 'local' && (
              <>
                <TextInput placeholder="Host (IP or Domain)" style={styles.input} value={vmHost} onChangeText={setVmHost} />
                <TextInput placeholder="Username" style={styles.input} value={vmUser} onChangeText={setVmUser} />
                <Text style={styles.hint}>Note: For prototype, use 'mock' as Host to test without SSH.</Text>
              </>
          )}

          {vmType === 'cloud' && (
              <Text style={styles.info}>Cloud VM will be provisioned by us. Requires PRO plan.</Text>
          )}

          <View style={styles.modalButtons}>
            <Button title="Cancel" color="red" onPress={() => setShowAddModal(false)} />
            <Button title="Add VM" onPress={handleAddVM} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
  header: { padding: 20, backgroundColor: '#fff', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#666', marginVertical: 5 },
  vmItem: { padding: 20, backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 10, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vmName: { fontSize: 18, fontWeight: 'bold' },
  vmDetails: { color: '#666' },
  vmType: { fontSize: 12, color: '#999', marginTop: 2 },
  connectBtn: { color: '#007AFF', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 30 },
  modalContainer: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  typeSelector: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  hint: { color: '#888', marginBottom: 10, fontStyle: 'italic' },
  info: { color: '#007AFF', marginBottom: 20, textAlign: 'center' }
});
