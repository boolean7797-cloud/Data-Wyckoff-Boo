import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  User,
  Trade,
  SetupItem,
  FundedAccountConfig,
  DailyTargetConfig,
  MilestoneConfig,
  MultiPortfolioConfig,
  DailyRecapItem,
} from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const googleProvider = new GoogleAuthProvider();

export interface UserCloudProfile {
  user: User;
  trades: Trade[];
  setupItems: SetupItem[];
  pairs: string[];
  emotions: string[];
  invalidationReasons: string[];
  fundedAccounts: FundedAccountConfig[];
  dailyTargetConfig: DailyTargetConfig;
  milestoneConfig: MilestoneConfig;
  multiPortfolioConfig: MultiPortfolioConfig;
  recaps: DailyRecapItem[];
  updatedAt: string;
}

// Convert Firebase Auth Error codes to clear Thai messages
export function formatAuthError(error: any): string {
  if (!error) return 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
  const code = error.code || '';
  switch (code) {
    case 'auth/unauthorized-domain':
      return 'โดเมนของเว็บนี้ยังไม่ได้เพิ่มใน Firebase Authorized Domains สำหรับ Google Popup — แนะนำให้ใช้ "เข้าสู่ระบบหรือสมัครด้วยอีเมลและรหัสผ่าน" ซึ่งพร้อมใช้งานและซิงค์ Cloud ได้ทันทีบนทุกอุปกรณ์';
    case 'auth/operation-not-allowed':
      return 'รูปแบบการเข้าสู่ระบบนี้ยังไม่เปิดใช้งานใน Firebase';
    case 'auth/invalid-email':
      return 'รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีเมลอีกครั้ง';
    case 'auth/user-disabled':
      return 'บัญชีนี้ถูกระงับการใช้งาน';
    case 'auth/user-not-found':
      return 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบอีเมลหรือกด "สมัครด้วยอีเมล"';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
    case 'auth/email-already-in-use':
      return 'อีเมลนี้มีในระบบแล้ว กรุณาเลือกแท็บ "เข้าสู่ระบบ" หรือใช้อีเมลอื่น';
    case 'auth/weak-password':
      return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    case 'auth/popup-closed-by-user':
      return 'หน้าต่างล็อกอินถูกปิดก่อนดำเนินการเสร็จสิ้น';
    case 'auth/popup-blocked':
      return 'เบราว์เซอร์บล็อกป๊อปอัป กรุณาอนุญาตป๊อปอัปสำหรับเว็บนี้';
    case 'auth/too-many-requests':
      return 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่แล้วลองใหม่';
    case 'auth/network-request-failed':
      return 'การเชื่อมต่อเครือข่ายล้มเหลว กรุณาตรวจสอบอินเทอร์เน็ต';
    default:
      return error.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตน';
  }
}

/**
 * Register a new user with Email and Password
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  title: string = 'Ghost Trader',
  accountBalance: number = 50000,
  fundedBalance: number = 100000
): Promise<{ user: User; isNew: boolean }> {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const fbUser = userCredential.user;

  if (displayName.trim()) {
    await updateProfile(fbUser, { displayName: displayName.trim() });
  }

  const newUser: User = {
    id: fbUser.uid,
    email: fbUser.email || email.trim(),
    username: (fbUser.email || email).split('@')[0],
    displayName: displayName.trim() || (fbUser.email || email).split('@')[0],
    title: title || 'Ghost Trader',
    accountBalance,
    fundedBalance,
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
    isFirebaseUser: true,
  };

  // Initial user doc in Firestore
  await setDoc(doc(db, 'users', fbUser.uid), {
    user: newUser,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return { user: newUser, isNew: true };
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const fbUser = userCredential.user;

  // Check if profile exists in Firestore
  const userDocRef = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(userDocRef);

  let appUser: User;
  if (snap.exists() && snap.data()?.user) {
    appUser = {
      ...snap.data().user,
      id: fbUser.uid,
      email: fbUser.email || email,
      isFirebaseUser: true,
    };
  } else {
    appUser = {
      id: fbUser.uid,
      email: fbUser.email || email,
      username: (fbUser.email || email).split('@')[0],
      displayName: fbUser.displayName || (fbUser.email || email).split('@')[0],
      title: 'Ghost Trader',
      accountBalance: 50000,
      fundedBalance: 100000,
      createdAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      isFirebaseUser: true,
    };
    await setDoc(userDocRef, {
      user: appUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }

  return appUser;
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  const userDocRef = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(userDocRef);

  let appUser: User;
  if (snap.exists() && snap.data()?.user) {
    appUser = {
      ...snap.data().user,
      id: fbUser.uid,
      email: fbUser.email || '',
      photoURL: fbUser.photoURL || undefined,
      isFirebaseUser: true,
    };
  } else {
    appUser = {
      id: fbUser.uid,
      email: fbUser.email || '',
      username: (fbUser.email || 'user').split('@')[0],
      displayName: fbUser.displayName || (fbUser.email || 'Trader').split('@')[0],
      title: 'Ghost Trader',
      photoURL: fbUser.photoURL || undefined,
      accountBalance: 50000,
      fundedBalance: 100000,
      createdAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      isFirebaseUser: true,
    };
    await setDoc(userDocRef, {
      user: appUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }

  return appUser;
}

/**
 * Sign Out
 */
export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * Send Password Reset Email
 */
export async function sendResetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Save complete user workspace to Firestore (Multi-device live sync)
 */
export async function saveUserCloudData(
  userId: string,
  payload: Partial<UserCloudProfile>
): Promise<void> {
  if (!userId) return;
  
  // Only attempt Firestore writes if user is authenticated with Firebase as this userId
  const currentFbUser = auth.currentUser;
  if (!currentFbUser || currentFbUser.uid !== userId) {
    return;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        ...payload,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error: any) {
    if (error?.code !== 'permission-denied') {
      console.error('Error saving to Cloud Firestore:', error);
    }
  }
}

/**
 * Fetch complete user workspace from Firestore
 */
export async function fetchUserCloudData(
  userId: string
): Promise<UserCloudProfile | null> {
  if (!userId) return null;

  const currentFbUser = auth.currentUser;
  if (!currentFbUser || currentFbUser.uid !== userId) {
    return null;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserCloudProfile;
    }
  } catch (error: any) {
    if (error?.code !== 'permission-denied') {
      console.error('Error fetching from Cloud Firestore:', error);
    }
  }
  return null;
}

/**
 * Realtime listener for Firestore changes on user workspace
 */
export function subscribeToUserCloudData(
  userId: string,
  onData: (data: UserCloudProfile) => void
): Unsubscribe {
  if (!userId) return () => {};

  const currentFbUser = auth.currentUser;
  if (!currentFbUser || currentFbUser.uid !== userId) {
    return () => {};
  }

  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(
    userDocRef,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as UserCloudProfile);
      }
    },
    (err) => {
      if (err?.code !== 'permission-denied') {
        console.warn('Firestore subscription warning:', err);
      }
    }
  );
}
