import { useState, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'needs-enrollment'; user: FirebaseAuthTypes.User }
  | { status: 'authenticated'; user: FirebaseAuthTypes.User };

export const useAuthState = (): AuthState => {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    const evaluate = (user: FirebaseAuthTypes.User | null) => {
      if (!user) {
        setState({ status: 'unauthenticated' });
        return;
      }
      const mfaEnrolled = user.multiFactor.enrolledFactors.length > 0;
      if (mfaEnrolled) {
        setState({ status: 'authenticated', user });
      } else {
        setState({ status: 'needs-enrollment', user });
      }
    };

    const unsubscribeAuth = auth().onAuthStateChanged(evaluate);
    const unsubscribeToken = auth().onIdTokenChanged(evaluate);

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, []);

  return state;
};
