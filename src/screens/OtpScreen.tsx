import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { verifyAndEnroll, resolveSignIn } from '../services/authService';
import auth from '@react-native-firebase/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export default function OtpScreen({ route }: Props) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
    setError(null);
    setLoading(true);
    try {
      const params = route.params;
      if (params.mode === 'enroll') {
        await verifyAndEnroll(params.verificationId, otp);
        setSuccess(true); // show spinner while navigator updates
      } else {
        await resolveSignIn(params.resolver, params.verificationId, otp);
        setSuccess(true);
      }
    } catch (err: any) {
      switch (err.code) {
        case 'auth/second-factor-already-enrolled':
          setSuccess(true);
          await auth().currentUser?.reload();
          break;
        case 'auth/invalid-verification-code':
          setError('Incorrect OTP. Please try again.');
          break;
        case 'auth/code-expired':
          setError('OTP expired. Please go back and resend.');
          break;
        default:
          setError(err.message ?? 'Verification failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.successText}>Verified! Redirecting...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="123456"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={loading ? 'Verifying...' : 'Verify'} onPress={handleVerify} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 12 },
  error: { color: 'red', marginBottom: 12 },
  successText: { marginTop: 16, color: '#666', textAlign: 'center' },
});
