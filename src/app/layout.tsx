import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { AuthInitializer } from '@/components/layout/AuthInitializer';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'FlavorShare - Recipe Sharing Platform', template: '%s | FlavorShare' },
  description: 'Discover, share, and save your favorite recipes from around the world. Join our community of food lovers.',
  keywords: ['recipes', 'cooking', 'food', 'sharing', 'community'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem disableTransitionOnChange>
          <AuthInitializer />
          <div className='min-h-screen flex flex-col'>
            <Navbar />
            <main className='flex-1'>{children}</main>
            <Footer />
          </div>
          <Toaster position='top-right' />
        </ThemeProvider>
      </body>
    </html>
  );
}
