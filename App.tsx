import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { configureGoogleSignIn } from './src/services/authService';
import Config from 'react-native-config';

const WEB_CLIENT_ID = Config.GOOGLE_WEB_CLIENT_ID ?? '';

export default function App() {
  useEffect(() => {
    configureGoogleSignIn(WEB_CLIENT_ID);
  }, []);

  return <AppNavigator />;
}
