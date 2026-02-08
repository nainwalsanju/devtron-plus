import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

export default function ChatScreen() {
  const [messages, setMessages] = useState<{id: string, text: string, sender: 'user' | 'bot'}[]>([
    { id: '1', text: 'Hello! I am Jules. How can I help you code today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now().toString(), text: input, sender: 'user' as const };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Mock bot response
    setTimeout(() => {
        const botMsg = { id: (Date.now() + 1).toString(), text: `I received: "${userMsg.text}". (This is a prototype response)`, sender: 'bot' as const };
        setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.msgContainer, item.sender === 'user' ? styles.userMsg : styles.botMsg]}>
            <Text style={[styles.msgText, item.sender === 'user' ? styles.userText : styles.botText]}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.inputContainer}>
        <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  listContent: { padding: 10 },
  msgContainer: { padding: 10, borderRadius: 10, marginBottom: 10, maxWidth: '80%' },
  userMsg: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  botMsg: { alignSelf: 'flex-start', backgroundColor: '#E5E5EA' },
  msgText: { fontSize: 16 },
  userText: { color: '#fff' },
  botText: { color: '#000' },
  inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#eee', alignItems: 'center', marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 15, height: 40, marginRight: 10 }
});
