'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className='mt-auto border-t bg-background'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
          <div className='sm:col-span-2 lg:col-span-1 lg:pl-2'>
            <Image src='/image/FlavorShare_Logo_NoBg.png' alt='FlavorShare' width={200} height={52} className='h-10 w-auto' />
            <p className='mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs'>
              Discover, share, and save your favorite recipes from around the world. Join our community of food lovers.
            </p>
          </div>
          <div>
            <h3 className='text-sm font-semibold text-foreground mb-3'>Explore</h3>
            <ul className='space-y-2'>
              <li><Link href='/explore' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>All Recipes</Link></li>
              <li><Link href='/categories' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>Categories</Link></li>
              <li><Link href='/create-recipe' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>Share a Recipe</Link></li>
            </ul>
          </div>
          <div>
            <h3 className='text-sm font-semibold text-foreground mb-3'>Company</h3>
            <ul className='space-y-2'>
              <li><Link href='/about' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>About Us</Link></li>
              <li><Link href='/contact' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className='text-sm font-semibold text-foreground mb-3'>Account</h3>
            <ul className='space-y-2'>
              <li><Link href='/profile' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>Profile</Link></li>
              <li><Link href='/my-recipes' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>My Recipes</Link></li>
              <li><Link href='/favorites' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>Favorites</Link></li>
            </ul>
          </div>
        </div>
        <div className='mt-10 pt-6 border-t'>
          <p className='text-center text-sm text-muted-foreground'>&copy; {new Date().getFullYear()} FlavorShare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
