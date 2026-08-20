'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useAuthStore } from '@/stores/auth-store';
import { getRecipesByAuthor } from '@/lib/firebase/firestore';
import type { Recipe } from '@/types';

export default function MyRecipesPage() {
  const { user, initialized } = useAuthStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchRecipes() {
      try {
        const data = await getRecipesByAuthor(user!.id);
        setRecipes(data);
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipes();
  }, [user]);

  // Auth not initialized yet
  if (!initialized) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center'>
        <Skeleton className='h-8 w-8 rounded-full' />
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className='min-h-screen bg-background'>
        <section className='bg-gradient-to-br from-primary/5 to-amber-50/50 dark:from-primary/10 dark:to-amber-950/20 py-12 md:py-16'>
          <div className='container mx-auto px-4 text-center'>
            <h1 className='text-3xl md:text-4xl font-bold mb-4'>My Recipes</h1>
            <p className='text-muted-foreground'>Manage your shared recipes</p>
          </div>
        </section>
        <div className='container mx-auto px-4 py-16'>
          <Card className='bg-card max-w-md mx-auto'>
            <CardContent className='py-16 text-center'>
              <BookOpen className='h-16 w-16 text-muted-foreground/40 mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Sign in to manage recipes</h3>
              <p className='text-muted-foreground mb-6'>Create an account or sign in to create and manage your recipes.</p>
              <div className='flex items-center justify-center gap-3'>
                <Button asChild>
                  <Link href='/login'>
                    <LogIn className='h-4 w-4 mr-2' />
                    Sign In
                  </Link>
                </Button>
                <Button variant='outline' asChild>
                  <Link href='/register'>Create Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <section className='bg-gradient-to-br from-primary/5 to-amber-50/50 dark:from-primary/10 dark:to-amber-950/20 py-12 md:py-16'>
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>My Recipes</h1>
          <p className='text-muted-foreground mb-6'>Manage your shared recipes</p>
          <Button asChild>
            <Link href='/create-recipe'>
              <Plus className='h-4 w-4 mr-2' />
              Create Recipe
            </Link>
          </Button>
        </div>
      </section>

      <div className='container mx-auto px-4 py-8'>
        {loading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className='overflow-hidden'>
                <Skeleton className='aspect-[4/3] w-full' />
                <CardContent className='p-4 space-y-3'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-5 w-3/4' />
                  <Skeleton className='h-3 w-full' />
                  <Skeleton className='h-9 w-full mt-2' />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <Card className='bg-card'>
            <CardContent className='py-20 text-center'>
              <BookOpen className='h-16 w-16 text-muted-foreground/40 mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No recipes yet</h3>
              <p className='text-muted-foreground max-w-md mx-auto'>
                You haven&apos;t created any recipes yet. Share your first culinary creation with the community!
              </p>
              <Button className='mt-6' asChild>
                <Link href='/create-recipe'>
                  <Plus className='h-4 w-4 mr-2' />
                  Create Your First Recipe
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className='flex items-center justify-between mb-6'>
              <p className='text-sm text-muted-foreground'>
                You&apos;ve shared <strong className='text-foreground'>{recipes.length}</strong>{' '}
                {recipes.length === 1 ? 'recipe' : 'recipes'}
              </p>
              <Button variant='outline' size='sm' asChild>
                <Link href='/create-recipe'>
                  <Plus className='h-4 w-4 mr-1' />
                  New
                </Link>
              </Button>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
