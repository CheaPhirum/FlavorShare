'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { loginWithEmail } from '@/lib/firebase/auth';
import { useAuthStore } from '@/stores/auth-store';

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Invalid email or password';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return 'Login failed. Please try again.';
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialized && user) {
      router.push('/');
    }
  }, [initialized, user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      toast.success('Welcome back!');
      router.push('/');
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      toast.error(getFirebaseErrorMessage(error.code || ''));
    } finally {
      setLoading(false);
    }
  };

  if (!initialized) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12'>
      <Card className='w-full max-w-md'>
        <CardHeader className='items-center text-center'>
          <Link href='/' className='mb-2'>
            <Image src='/image/FlavorShare_Logo_NoBg.png' alt='FlavorShare' width={180} height={46} className='h-10 w-auto' priority />
          </Link>
          <CardTitle className='text-2xl'>Welcome Back</CardTitle>
          <CardDescription>Sign in to your FlavorShare account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete='email'
              />
            </div>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password'>Password</Label>
                <Link href='/forgot-password' className='text-xs text-primary hover:underline'>
                  Forgot password?
                </Link>
              </div>
              <Input
                id='password'
                type='password'
                placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete='current-password'
              />
            </div>
            <Button type='submit' className='w-full' size='lg' disabled={loading}>
              {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <LogIn className='h-4 w-4' />}
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='justify-center'>
          <p className='text-sm text-muted-foreground'>
            Don&apos;t have an account?{' '}
            <Link href='/register' className='font-medium text-primary hover:underline'>
              Create one
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
