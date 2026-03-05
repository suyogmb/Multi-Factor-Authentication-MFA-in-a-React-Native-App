import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Call this once at app startup in App.tsx
export const configureGoogleSignIn = (webClientId: string) => {
  GoogleSignin.configure({ webClientId });
};

export const signUpEmail = async (email: string, password: string) => {
  const credential = await auth().createUserWithEmailAndPassword(email, password);
  return credential.user;
};

export const loginEmail = async (email: string, password: string) => {
  try {
    const credential = await auth().signInWithEmailAndPassword(email, password);
    return { user: credential.user };
  } catch (error: any) {
    if (error.code === 'auth/multi-factor-auth-required') {
      const resolver = auth().getMultiFactorResolver(error);
      return { mfaResolver: resolver };
    }
    throw error;
  }
};

export const loginWithGoogle = async () => {
  await GoogleSignin.hasPlayServices();
  const { data } = await GoogleSignin.signIn();
  const googleCredential = auth.GoogleAuthProvider.credential(data!.idToken);
  try {
    const credential = await auth().signInWithCredential(googleCredential);
    return { user: credential.user };
  } catch (error: any) {
    if (error.code === 'auth/multi-factor-auth-required') {
      const resolver = auth().getMultiFactorResolver(error);
      return { mfaResolver: resolver };
    }
    throw error;
  }
};

export const sendEnrollmentOtp = async (phoneNumber: string) => {
  const multiFactorUser = auth().multiFactor(auth().currentUser!);
  const session = await multiFactorUser.getSession();
  const verificationId = await auth().verifyPhoneNumberForMultiFactor({
    phoneNumber,
    session,
  });
  return { verificationId };
};

export const sendSigninOtp = async (resolver: any) => {
  const hint = resolver.hints[0];
  const verificationId = await auth().verifyPhoneNumberWithMultiFactorInfo(
    hint,
    resolver.session,
  );
  return { verificationId };
};

export const verifyAndEnroll = async (
  verificationId: string,
  otp: string,
) => {
  const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
  const assertion = auth.PhoneMultiFactorGenerator.assertion(credential);
  const multiFactorUser = auth().multiFactor(auth().currentUser!);
  await multiFactorUser.enroll(assertion, 'My Phone');
  await auth().currentUser?.reload();
};

export const resolveSignIn = async (
  resolver: any,
  verificationId: string,
  otp: string,
) => {
  const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
  const assertion = auth.PhoneMultiFactorGenerator.assertion(credential);
  await resolver.resolveSignIn(assertion);
};

export const signOut = async () => {
  await auth().signOut();
  await GoogleSignin.signOut();
};
