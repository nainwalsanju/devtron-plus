import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import io, { Socket } from 'socket.io-client';
import { API_URL } from '../services/api';

// Simplified type for socket events
interface ServerToClientEvents {
  output: (data: string) => void;
}
interface ClientToServerEvents {
  start_session: (vmId: string) => void;
  input: (data: string) => void;
}

interface TerminalViewProps {
  vmId: string;
  vmName: string;
  onClose: () => void;
}

export default function TerminalView({ vmId, vmName, onClose }: TerminalViewProps) {
  const [output, setOutput] = useState<string>('');
  const [input, setInput] = useState('');
  // Use any for socket to avoid complex typing issues in prototype
  const socketRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Connect socket
    socketRef.current = io(API_URL);

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      // Start session
      socketRef.current.emit('start_session', vmId);
    });

    socketRef.current.on('output', (data: string) => {
      // Append output
      setOutput((prev) => prev + data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [vmId]);

  useEffect(() => {
    // Auto scroll
    if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [output]);

  const handleSend = () => {
    if (!socketRef.current) return;

    // Send input + \r (Enter)
    socketRef.current.emit('input', input + '\r');
    setInput('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Terminal: {vmName}</Text>
        <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.terminal}
        contentContainerStyle={styles.terminalContent}
      >
        <Text style={styles.terminalText}>{output}</Text>
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputContainer}>
            <Text style={styles.prompt}>$</Text>
            <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
                placeholder="Type command..."
                placeholderTextColor="#666"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="send"
            />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#333', alignItems: 'center', paddingTop: 40 },
  headerTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closeBtn: { color: '#ff4444', fontWeight: 'bold' },
  terminal: { flex: 1, padding: 10 },
  terminalContent: { paddingBottom: 20 },
  terminalText: { color: '#0f0', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 14 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#222', borderTopWidth: 1, borderTopColor: '#333' },
  prompt: { color: '#0f0', marginRight: 5, fontWeight: 'bold' },
  input: { flex: 1, color: '#fff', height: 40, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }
});
