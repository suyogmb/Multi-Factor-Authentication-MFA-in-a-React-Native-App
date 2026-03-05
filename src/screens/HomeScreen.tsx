import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { signOut } from '../services/authService';
import auth from '@react-native-firebase/auth';

export default function HomeScreen() {
  const user = auth().currentUser;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.email}>{user?.email ?? user?.displayName ?? 'User'}</Text>
      <Text style={styles.badge}>MFA Enabled</Text>
      <View style={styles.spacer} />
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  email: { fontSize: 16, color: '#444', marginBottom: 8 },
  badge: { fontSize: 13, color: 'green', marginBottom: 32 },
  spacer: { height: 16 },
});
