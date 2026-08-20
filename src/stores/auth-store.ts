'use client';

import { create } from 'zustand';
import { auth, onAuthStateChanged, fetchUserFromFirestore, type FirebaseUser } from '@/lib/firebase/auth';
import type { User } from '@/types';

interface AuthStore {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  initialized: boolean;
  fbUser: FirebaseUser | null;
  setUser: (user: User | null) => void;
  setFbUser: (fbUser: FirebaseUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAdmin: false,
  loading: true,
  initialized: false,
  fbUser: null,

  setUser: (user) => set({ user, isAdmin: user?.role === 'admin' }),
  setFbUser: (fbUser) => set({ fbUser }),

  logout: () => {},
}));

export function initAuthListener() {
  onAuthStateChanged(auth, async (fbUser) => {
    const store = useAuthStore.getState();
    store.setFbUser(fbUser);

    if (fbUser) {
      try {
        const dbUser = await fetchUserFromFirestore(fbUser.uid);
        if (dbUser) {
          store.setUser({
            id: dbUser.id,
            name: dbUser.name || fbUser.displayName || 'User',
            email: dbUser.email || fbUser.email || '',
            photoURL: dbUser.photoURL || fbUser.photoURL || null,
            bio: dbUser.bio || '',
            role: dbUser.role || 'user',
            createdAt: dbUser.createdAt,
          });
        } else {
          store.setUser({
            id: fbUser.uid,
            name: fbUser.displayName || 'User',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || null,
            bio: '',
            role: 'user',
            createdAt: new Date().toISOString(),
          });
        }
      } catch {
        store.setUser({
          id: fbUser.uid,
          name: fbUser.displayName || 'User',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || null,
          bio: '',
          role: 'user',
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      store.setUser(null);
    }
    useAuthStore.setState({ initialized: true, loading: false });
  });
}
