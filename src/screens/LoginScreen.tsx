import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  loginEmail,
  signUpEmail,
  loginWithGoogle,
  sendSigninOtp,
} from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleError = (err: any) => {
    switch (err.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        setError('Invalid email or password.');
        break;
      case 'auth/too-many-requests':
        setError('Too many attempts. Try again later.');
        break;
      default:
        setError(err.message ?? 'An error occurred.');
    }
  };

  const handleEmailLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await loginEmail(email, password);
      if (result.mfaResolver) {
        const { verificationId } = await sendSigninOtp(result.mfaResolver);
        navigation.navigate('Otp', {
          mode: 'signin',
          verificationId,
          resolver: result.mfaResolver,
        });
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    setError(null);
    setLoading(true);
    try {
      await signUpEmail(email, password);
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.mfaResolver) {
        const { verificationId } = await sendSigninOtp(result.mfaResolver);
        navigation.navigate('Otp', {
          mode: 'signin',
          verificationId,
          resolver: result.mfaResolver,
        });
      }
    } catch (err: any) {
      if (err.code === 'SIGN_IN_CANCELLED') return;
      if (err.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        setError('Google Play Services not available.');
        return;
      }
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={loading ? 'Loading...' : 'Log In'} onPress={handleEmailLogin} disabled={loading} />
      <View style={styles.spacer} />
      <Button title={loading ? 'Loading...' : 'Sign Up'} onPress={handleEmailSignUp} disabled={loading} />
      <View style={styles.spacer} />
      <Button title={loading ? 'Loading...' : 'Sign In with Google'} onPress={handleGoogleLogin} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 12 },
  error: { color: 'red', marginBottom: 12 },
  spacer: { height: 8 },
});
