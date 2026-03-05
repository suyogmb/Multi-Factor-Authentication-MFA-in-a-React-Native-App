import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { sendEnrollmentOtp, signOut } from '../services/authService';
import auth from '@react-native-firebase/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'EnrollPhone'>;

export default function EnrollPhoneScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailVerified = auth().currentUser?.emailVerified ?? false;

  const handleSendVerificationEmail = async () => {
    setError(null);
    setLoading(true);
    try {
      await auth().currentUser?.sendEmailVerification();
      setError('Verification email sent. Please verify then reload the app.');
    } catch (err: any) {
      setError(err.message ?? 'Failed to send verification email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const { verificationId } = await sendEnrollmentOtp(phone);
      navigation.navigate('Otp', { mode: 'enroll', verificationId });
    } catch (err: any) {
      switch (err.code) {
        case 'auth/second-factor-already-enrolled':
          await auth().currentUser?.reload();
          return;
        case 'auth/invalid-phone-number':
          setError('Invalid phone number format.');
          break;
        case 'auth/quota-exceeded':
          setError('SMS quota exceeded. Try again later.');
          break;
        default:
          setError(err.message ?? 'Failed to send OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!emailVerified) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          Please verify your email address before setting up MFA.
        </Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <Button
          title={loading ? 'Sending...' : 'Send Verification Email'}
          onPress={handleSendVerificationEmail}
          disabled={loading}
        />
        <View style={styles.spacer} />
        <Button title="Sign Out" onPress={signOut} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Up MFA</Text>
      <Text style={styles.subtitle}>Enter your phone number to continue. This step is required.</Text>
      <TextInput
        style={styles.input}
        placeholder="+16505553434"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={loading ? 'Sending...' : 'Send OTP'} onPress={handleSendOtp} disabled={loading} />
      <View style={styles.spacer} />
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 12 },
  error: { color: 'red', marginBottom: 12 },
  spacer: { height: 8 },
});
