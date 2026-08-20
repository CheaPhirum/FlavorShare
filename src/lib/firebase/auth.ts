import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { User as AppUser } from '@/types';

function mapFirebaseUser(fbUser: User, dbUser?: Partial<AppUser>): AppUser {
  return {
    id: fbUser.uid,
    name: fbUser.displayName || dbUser?.name || 'User',
    email: fbUser.email || '',
    photoURL: fbUser.photoURL || dbUser?.photoURL || null,
    bio: dbUser?.bio || '',
    role: dbUser?.role || 'user',
    createdAt: dbUser?.createdAt || new Date().toISOString(),
  };
}

export async function loginWithEmail(email: string, password: string): Promise<AppUser> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
  const dbData = userDoc.exists() ? userDoc.data() : undefined;
  return mapFirebaseUser(cred.user, dbData);
}

export async function registerWithEmail(email: string, password: string, displayName: string): Promise<AppUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await firebaseUpdateProfile(cred.user, { displayName });
  const userData: Omit<AppUser, 'id'> = {
    name: displayName,
    email,
    photoURL: null,
    bio: '',
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', cred.user.uid), userData);
  return mapFirebaseUser(cred.user, userData);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function fetchUserFromFirestore(uid: string): Promise<AppUser | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  return { id: uid, ...userDoc.data() } as AppUser;
}

export async function updateUserProfile(uid: string, data: Partial<AppUser>): Promise<void> {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.photoURL !== undefined) updateData.photoURL = data.photoURL;
  if (Object.keys(updateData).length > 0) {
    await setDoc(doc(db, 'users', uid), updateData, { merge: true });
  }
  if (data.name && auth.currentUser) {
    await firebaseUpdateProfile(auth.currentUser, { displayName: data.name });
  }
}

export { onAuthStateChanged, auth };
export type { User as FirebaseUser };