'use client';

import { useEffect } from 'react';
import { initAuthListener } from '@/stores/auth-store';

export function AuthInitializer() {
  useEffect(() => { initAuthListener(); }, []);
  return null;
}
