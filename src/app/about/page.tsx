'use client';

import Link from 'next/link';
import {
  Heart, Users, Globe, Shield, Star, ChefHat,
  Upload, Search, Share2, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FEATURES = [
  {
    icon: Upload,
    title: 'Easy Recipe Sharing',
    description: 'Upload your recipes with photos, ingredients, and step-by-step instructions in minutes.',
  },
  {
    icon: Search,
    title: 'Smart Discovery',
    description: 'Find recipes by category, ingredient, or cuisine type with our powerful search.',
  },
  {
    icon: Heart,
    title: 'Save Favorites',
    description: 'Build your personal collection by saving recipes you love to revisit later.',
  },
  {
    icon: Share2,
    title: 'Community Driven',
    description: 'Join a passionate community of home cooks and professional chefs sharing their best.',
  },
  {
    icon: Globe,
    title: 'Global Cuisines',
    description: 'Explore recipes from every corner of the world — Italian, Asian, Mexican, and more.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Your data is securely stored and always available when you need it.',
  },
];

const STEPS = [
  {
    step: 1,
    title: 'Create an Account',
    description: 'Sign up for free in seconds with your email. No credit card required.',
  },
  {
    step: 2,
    title: 'Browse or Share Recipes',
    description: 'Explore thousands of recipes or share your own culinary creations with the world.',
  },
  {
    step: 3,
    title: 'Connect & Grow',
    description: 'Save favorites, follow chefs, and build your personal recipe collection.',
  },
];

export default function AboutPage() {
  return (
    <div className='min-h-screen bg-background'>
      {/* Hero */}
      <section className='relative bg-primary text-primary-foreground py-20 md:py-28'>
        <div className='container mx-auto px-4 text-center'>
          <div className='inline-flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full text-sm font-medium mb-6'>
            <ChefHat className='h-4 w-4' />
            About FlavorShare
          </div>
          <h1 className='text-4xl md:text-5xl font-bold mb-6'>Bringing Food Lovers Together</h1>
          <p className='text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8'>
            FlavorShare is a community-driven recipe platform where home cooks and food enthusiasts
            can discover, share, and celebrate the joy of cooking.
          </p>
          <Button size='lg' variant='secondary' asChild className='text-base'>
            <Link href='/explore'>
              <Search className='h-4 w-4 mr-2' />
              Explore Recipes
            </Link>
          </Button>
        </div>
      </section>

      {/* Mission */}
      <section className='py-16'>
        <div className='container mx-auto px-4 max-w-3xl text-center'>
          <h2 className='text-2xl md:text-3xl font-bold mb-6'>Our Mission</h2>
          <p className='text-muted-foreground leading-relaxed text-lg'>
            We believe that everyone has a recipe worth sharing. Whether it&#39;s a family
            heirloom passed down through generations or a creative dish you invented last
            night, FlavorShare gives you the tools to share it with food lovers around the
            world. Our platform makes it easy to document your culinary journey and discover
            new flavors from diverse cultures.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className='py-16 bg-muted/50'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-2xl md:text-3xl font-bold mb-3'>What Makes Us Special</h2>
            <p className='text-muted-foreground max-w-xl mx-auto'>
              Everything you need to discover and share amazing recipes
            </p>
          </div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {FEATURES.map((feature) => (
              <Card key={feature.title} className='bg-card border-0 shadow-sm transition-shadow hover:shadow-md'>
                <CardContent className='p-6'>
                  <div className='h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4'>
                    <feature.icon className='h-6 w-6 text-primary' />
                  </div>
                  <h3 className='font-semibold text-lg mb-2'>{feature.title}</h3>
                  <p className='text-sm text-muted-foreground leading-relaxed'>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-2xl md:text-3xl font-bold mb-3'>How It Works</h2>
            <p className='text-muted-foreground max-w-xl mx-auto'>
              Get started in three simple steps
            </p>
          </div>
          <div className='grid md:grid-cols-3 gap-8 max-w-4xl mx-auto'>
            {STEPS.map((item) => (
              <div key={item.step} className='text-center'>
                <div className='h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4'>
                  {item.step}
                </div>
                <h3 className='font-semibold text-lg mb-2'>{item.title}</h3>
                <p className='text-sm text-muted-foreground leading-relaxed'>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='bg-primary text-primary-foreground py-16'>
        <div className='container mx-auto px-4 text-center'>
          <Star className='h-12 w-12 mx-auto mb-6 opacity-80' />
          <h2 className='text-2xl md:text-3xl font-bold mb-4'>Ready to Join the Community?</h2>
          <p className='text-primary-foreground/80 max-w-xl mx-auto mb-8'>
            Start sharing your favorite recipes and discover new culinary inspirations today.
          </p>
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Button size='lg' variant='secondary' asChild className='text-base'>
              <Link href='/explore'>
                <ArrowRight className='h-4 w-4 mr-2' />
                Get Started
              </Link>
            </Button>
            <Button size='lg' variant='outline' className='text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground' asChild>
              <Link href='/contact'>Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
