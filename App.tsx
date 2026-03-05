import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { configureGoogleSignIn } from './src/services/authService';

const WEB_CLIENT_ID =
  '1011214304127-8hl1hh12b99v81q0kigtmmmlqmn6lvhu.apps.googleusercontent.com'; // Replace with Web Client ID from Firebase Console → Auth → Sign-in method → Google

export default function App() {
  useEffect(() => {
    configureGoogleSignIn(WEB_CLIENT_ID);
  }, []);

  return <AppNavigator />;
}
