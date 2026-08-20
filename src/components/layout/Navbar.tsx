'use client';

import Link from 'next/link';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { Menu, X, ChevronDown, LogOut, User, BookOpen, Heart, Shield, Plus, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth-store';
import { logoutUser } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const emptySubscribe = () => () => {};

function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  if (!mounted) return <div className={cn('w-9 h-9', className)} />;
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn('p-2 rounded-md hover:bg-muted transition-colors', className)}
      aria-label='Toggle theme'
    >
      {theme === 'dark' ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
    </button>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin, initialized } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = async () => {
    await logoutUser();
    router.push('/');
    closeMobile();
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/explore', label: 'Explore Recipes' },
    { href: '/categories', label: 'Categories' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const linkClass = (href: string) =>
    cn(
      'px-3 py-2 text-sm font-medium transition-colors rounded-md',
      isActive(href) ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    );

  const mobileLinkClass = (href: string) =>
    cn(
      'px-4 py-3 text-sm font-medium transition-colors rounded-md',
      isActive(href) ? 'text-primary font-semibold bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    );

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-colors duration-200',
        scrolled ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' : 'bg-background border-b border-transparent'
      )}
    >
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        <Link href='/' className='flex items-center gap-2.5 shrink-0'>
          <Image src='/image/FlavorShare_Logo_NoBg.png' alt='FlavorShare' width={200} height={52} className='h-10 w-auto sm:h-[52px]' priority />
        </Link>

        <nav className='hidden lg:flex items-center gap-1'>
          {publicLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>{link.label}</Link>
          ))}
        </nav>

        <div className='hidden lg:flex items-center gap-1'>
          <ThemeToggle />
          {!initialized ? null : user ? (
            <>
              <Button variant='outline' size='sm' asChild className='gap-1.5 ml-1'>
                <Link href='/create-recipe'><Plus className='h-4 w-4' />Share Recipe</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='gap-1.5'>
                    <User className='h-4 w-4' />
                    {user.name}
                    <ChevronDown className='h-3 w-3 opacity-50' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuItem asChild><Link href='/profile' className='gap-2 cursor-pointer'><User className='h-4 w-4' /> Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href='/my-recipes' className='gap-2 cursor-pointer'><BookOpen className='h-4 w-4' /> My Recipes</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href='/favorites' className='gap-2 cursor-pointer'><Heart className='h-4 w-4' /> Favorites</Link></DropdownMenuItem>
                  {isAdmin && (<>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href='/admin' className='gap-2 cursor-pointer text-primary'><Shield className='h-4 w-4' /> Admin Dashboard</Link></DropdownMenuItem>
                  </>)}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className='gap-2 cursor-pointer text-destructive focus:text-destructive'>
                    <LogOut className='h-4 w-4' /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant='ghost' size='sm' asChild className='ml-1'><Link href='/login'>Login</Link></Button>
              <Button size='sm' asChild><Link href='/register'>Register</Link></Button>
            </>
          )}
        </div>

        <div className='lg:hidden flex items-center gap-1'>
          <ThemeToggle />
          <button onClick={() => setMobileOpen(!mobileOpen)} className='p-2 rounded-md hover:bg-muted transition-colors' aria-label='Toggle menu'>
            {mobileOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className='lg:hidden fixed inset-0 top-16 z-40 bg-background border-t animate-in slide-in-from-top-2 duration-200'>
          <nav className='flex flex-col p-4 gap-1 overflow-y-auto max-h-[calc(100vh-4rem)]'>
            {publicLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeMobile} className={mobileLinkClass(link.href)}>{link.label}</Link>
            ))}
            {!initialized ? null : user ? (
              <>
                <div className='my-2 border-t' />
                <Link href='/create-recipe' onClick={closeMobile} className='px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 rounded-md transition-colors'>+ Share Recipe</Link>
                <Link href='/profile' onClick={closeMobile} className={mobileLinkClass('/profile')}>Profile</Link>
                <Link href='/my-recipes' onClick={closeMobile} className={mobileLinkClass('/my-recipes')}>My Recipes</Link>
                <Link href='/favorites' onClick={closeMobile} className={mobileLinkClass('/favorites')}>Favorites</Link>
                {isAdmin && <Link href='/admin' onClick={closeMobile} className={mobileLinkClass('/admin')}>Admin Dashboard</Link>}
                <div className='my-2 border-t' />
                <button onClick={handleLogout} className='px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors text-left w-full'>Logout</button>
              </>
            ) : (
              <>
                <div className='my-2 border-t' />
                <div className='flex gap-2 px-4'>
                  <Button variant='outline' className='flex-1' asChild><Link href='/login' onClick={closeMobile}>Login</Link></Button>
                  <Button className='flex-1' asChild><Link href='/register' onClick={closeMobile}>Register</Link></Button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
