'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChefHat, BookOpen, Users, Globe, 
  ArrowRight, Search, Star, 
  Utensils, Flame, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import RecipeCard from '@/components/recipe/RecipeCard';
import type { Recipe, Category } from '@/types';
import { getAllRecipes, getAllCategories } from '@/lib/firebase/firestore';

const CATEGORY_COLORS: Record<string, string> = {
  Italian: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  Asian: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  Mexican: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  Desserts: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  Seafood: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  Vegetarian: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  American: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  French: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  Indian: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  Mediterranean: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
};

const CATEGORY_ICONS: Record<string, string> = {
  Italian: '',
  Asian: '',
  Mexican: '',
  Desserts: '',
  Seafood: '',
  Vegetarian: '',
  American: '',
  French: '',
  Indian: '',
  Mediterranean: '',
};

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const [recipesData, categoriesData] = await Promise.all([
          getAllRecipes(),
          getAllCategories(),
        ]);
        setRecipes(recipesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const latestRecipes = recipes.slice(0, 6);
  const displayedCategories = categories.slice(0, 8);
  const activeCuisines = categories.length;

  return (
    <div className='flex flex-col'>
      {/* Hero Section */}
      <section className='relative bg-gradient-to-br from-primary/5 to-amber-50/50 dark:from-primary/10 dark:to-amber-950/20 py-20 md:py-32'>
        <div className='container mx-auto px-4 text-center'>
          <div className='inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6'>
            <Flame className='h-4 w-4' />
            Discover Amazing Recipes
          </div>
          <h1 className='text-4xl md:text-6xl font-bold tracking-tight mb-6'>
            Share Your{' '}
            <span className='text-primary'>Culinary</span>
            {' '}Creations
          </h1>
          <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8'>
            Join a vibrant community of food lovers. Discover recipes from around the world,
            share your own creations, and inspire others to cook something amazing.
          </p>
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Button size='lg' asChild className='text-base'>
              <Link href='/explore'>
                <Search className='h-4 w-4 mr-2' />
                Explore Recipes
              </Link>
            </Button>
            <Button size='lg' variant='outline' asChild className='text-base'>
              <Link href='/categories'>
                <BookOpen className='h-4 w-4 mr-2' />
                Browse Categories
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-12 border-y'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className='bg-card border-0 shadow-sm'>
                  <CardContent className='p-6 text-center'>
                    <Skeleton className='h-8 w-12 mx-auto mb-2' />
                    <Skeleton className='h-4 w-20 mx-auto' />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card className='bg-card border-0 shadow-sm'>
                  <CardContent className='p-6 text-center'>
                    <div className='flex justify-center mb-2'><BookOpen className='h-8 w-8 text-primary' /></div>
                    <div className='text-3xl font-bold'>{recipes.length}</div>
                    <div className='text-sm text-muted-foreground'>Recipes</div>
                  </CardContent>
                </Card>
                <Card className='bg-card border-0 shadow-sm'>
                  <CardContent className='p-6 text-center'>
                    <div className='flex justify-center mb-2'><Utensils className='h-8 w-8 text-primary' /></div>
                    <div className='text-3xl font-bold'>{categories.length}</div>
                    <div className='text-sm text-muted-foreground'>Categories</div>
                  </CardContent>
                </Card>
                <Card className='bg-card border-0 shadow-sm'>
                  <CardContent className='p-6 text-center'>
                    <div className='flex justify-center mb-2'><Users className='h-8 w-8 text-primary' /></div>
                    <div className='text-3xl font-bold'>0</div>
                    <div className='text-sm text-muted-foreground'>Users</div>
                  </CardContent>
                </Card>
                <Card className='bg-card border-0 shadow-sm'>
                  <CardContent className='p-6 text-center'>
                    <div className='flex justify-center mb-2'><Globe className='h-8 w-8 text-primary' /></div>
                    <div className='text-3xl font-bold'>{activeCuisines}</div>
                    <div className='text-sm text-muted-foreground'>Cuisines</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Latest Recipes Section */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h2 className='text-2xl md:text-3xl font-bold'>Latest Recipes</h2>
              <p className='text-muted-foreground mt-1'>Fresh recipes from our community</p>
            </div>
            <Button variant='ghost' asChild>
              <Link href='/explore' className='flex items-center gap-1'>
                View All <ArrowRight className='h-4 w-4' />
              </Link>
            </Button>
          </div>
          {loading ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className='overflow-hidden'>
                  <Skeleton className='aspect-[4/3] w-full' />
                  <CardContent className='p-4 space-y-3'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-5 w-3/4' />
                    <Skeleton className='h-3 w-full' />
                    <Skeleton className='h-9 w-full mt-2' />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : latestRecipes.length === 0 ? (
            <Card className='bg-card'>
              <CardContent className='py-16 text-center'>
                <ChefHat className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-2'>No recipes yet</h3>
                <p className='text-muted-foreground mb-4'>Be the first to share a recipe with the community!</p>
                <Button asChild>
                  <Link href='/create-recipe'>Share a Recipe</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {latestRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className='py-16 bg-muted/30'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h2 className='text-2xl md:text-3xl font-bold'>Browse by Category</h2>
              <p className='text-muted-foreground mt-1'>Find recipes by cuisine type</p>
            </div>
            <Button variant='ghost' asChild>
              <Link href='/categories' className='flex items-center gap-1'>
                All Categories <ArrowRight className='h-4 w-4' />
              </Link>
            </Button>
          </div>
          {loading ? (
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className='overflow-hidden'>
                  <Skeleton className='aspect-square w-full' />
                  <CardContent className='p-3'>
                    <Skeleton className='h-4 w-20' />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayedCategories.length === 0 ? (
            <Card className='bg-card'>
              <CardContent className='py-16 text-center'>
                <BookOpen className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-2'>No categories yet</h3>
                <p className='text-muted-foreground'>Categories will appear once they are created.</p>
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
              {displayedCategories.map((category) => {
                const localImagePath = `/images/categories/${category.name}.png`;
                const hasFirebaseImage = category.imageURL && category.imageURL.trim() !== '';
                const imageSrc = hasFirebaseImage ? category.imageURL : localImagePath;
                const imageFailed = failedImages.has(category.id);
                const colorClass = CATEGORY_COLORS[category.name] || 'bg-primary/10 text-primary';
                const iconEmoji = CATEGORY_ICONS[category.name] || '🍽️';

                return (
                  <Link key={category.id} href={`/explore?category=${category.id}`}>
                    <Card className='group overflow-hidden transition-all hover:shadow-md cursor-pointer'>
                      <div className='relative aspect-square overflow-hidden bg-muted'>
                        {imageFailed || !imageSrc ? (
                          <div className={`w-full h-full flex items-center justify-center ${colorClass.split(' ')[0]}`}>
                            <span className='text-4xl'>{iconEmoji}</span>
                          </div>
                        ) : (
                          <Image
                            src={imageSrc}
                            alt={category.name}
                            fill
                            sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
                            className='object-cover transition-transform duration-300 group-hover:scale-105'
                            onError={() => {
                              setFailedImages((prev) => new Set(prev).add(category.id));
                            }}
                          />
                        )}
                        <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
                        <div className='absolute bottom-3 left-3 right-3'>
                          <h3 className='text-sm font-bold text-white drop-shadow-md'>{category.name}</h3>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-primary text-primary-foreground py-16'>
        <div className='container mx-auto px-4 text-center'>
          <Heart className='h-12 w-12 mx-auto mb-6 opacity-80' />
          <h2 className='text-2xl md:text-3xl font-bold mb-4'>Ready to Share Your Recipe?</h2>
          <p className='text-primary-foreground/80 max-w-xl mx-auto mb-8'>
            Join thousands of home cooks sharing their favorite recipes.
            Your next masterpiece could inspire someone across the globe.
          </p>
          <Button size='lg' variant='secondary' asChild className='text-base'>
            <Link href='/create-recipe'>
              <Star className='h-4 w-4 mr-2' />
              Share a Recipe
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
