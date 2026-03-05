import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthState } from '../hooks/useAuthState';

import LoginScreen from '../screens/LoginScreen';
import EnrollPhoneScreen from '../screens/EnrollPhoneScreen';
import OtpScreen from '../screens/OtpScreen';
import HomeScreen from '../screens/HomeScreen';

export type RootStackParamList = {
  Login: undefined;
  EnrollPhone: undefined;
  Otp:
    | { mode: 'enroll'; verificationId: string }
    | { mode: 'signin'; verificationId: string; resolver: any };
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const authState = useAuthState();

  if (authState.status === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authState.status === 'unauthenticated' && (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
        {authState.status === 'needs-enrollment' && (
          <>
            <Stack.Screen name="EnrollPhone" component={EnrollPhoneScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
          </>
        )}
        {authState.status === 'authenticated' && (
          <Stack.Screen name="Home" component={HomeScreen} />
        )}
        {authState.status === 'unauthenticated' && (
          <Stack.Screen name="Otp" component={OtpScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
