'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ChefHat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import RecipeCard from '@/components/recipe/RecipeCard';
import type { Recipe, Category } from '@/types';
import { getAllRecipes, getAllCategories } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);

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

  // Sync with URL search params
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setActiveCategory(cat);
    }
  }, [searchParams]);

  const filteredRecipes = useMemo(() => {
    let result = recipes;

    if (activeCategory) {
      result = result.filter((r) => r.categoryId === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.categoryName.toLowerCase().includes(q) ||
          r.authorName.toLowerCase().includes(q) ||
          r.ingredients.some((ing) => ing.toLowerCase().includes(q))
      );
    }

    return result;
  }, [recipes, activeCategory, searchQuery]);

  const activeCategoryName = activeCategory
    ? categories.find((c) => c.id === activeCategory)?.name
    : null;

  const toggleCategory = (categoryId: string) => {
    setActiveCategory((prev) => (prev === categoryId ? '' : categoryId));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory('');
  };

  const hasFilters = searchQuery.trim() !== '' || activeCategory !== '';

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <section className='bg-gradient-to-br from-primary/5 to-amber-50/50 dark:from-primary/10 dark:to-amber-950/20 py-12 md:py-16'>
        <div className='container mx-auto px-4'>
          <div className='max-w-3xl mx-auto text-center'>
            <h1 className='text-3xl md:text-4xl font-bold mb-4'>Explore Recipes</h1>
            <p className='text-muted-foreground mb-8'>Search through our collection of delicious recipes</p>
            <div className='relative max-w-xl mx-auto'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search recipes, ingredients, authors...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10 h-12 text-base'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  <X className='h-4 w-4' />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className='container mx-auto px-4 py-8'>
        {/* Category Filter Badges */}
        <div className='mb-8'>
          <div className='flex items-center gap-2 mb-3'>
            <SlidersHorizontal className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm font-medium text-muted-foreground'>Filter by Category</span>
          </div>
          <div className='flex flex-wrap gap-2'>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className='h-8 w-24 rounded-full' />
                ))
              : categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={activeCategory === category.id ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors text-sm px-3 py-1',
                      activeCategory === category.id
                        ? ''
                        : 'hover:bg-primary/10 hover:text-primary'
                    )}
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.name}
                  </Badge>
                ))}
          </div>
        </div>

        {/* Results Info */}
        <div className='flex items-center justify-between mb-6'>
          <div className='text-sm text-muted-foreground'>
            {loading ? (
              <Skeleton className='h-4 w-40' />
            ) : (
              <span>
                Showing <strong className='text-foreground'>{filteredRecipes.length}</strong>{' '}
                {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
                {activeCategoryName && (
                  <span>
                    {' '}in <strong className='text-foreground'>{activeCategoryName}</strong>
                  </span>
                )}
                {searchQuery.trim() && (
                  <span>
                    {' '}matching &ldquo;<strong className='text-foreground'>{searchQuery}</strong>&rdquo;
                  </span>
                )}
              </span>
            )}
          </div>
          {hasFilters && (
            <Button variant='ghost' size='sm' onClick={clearFilters} className='text-xs'>
              <X className='h-3 w-3 mr-1' />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Recipes Grid */}
        {loading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.from({ length: 9 }).map((_, i) => (
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
        ) : filteredRecipes.length === 0 ? (
          <Card className='bg-card'>
            <CardContent className='py-20 text-center'>
              <ChefHat className='h-16 w-16 text-muted-foreground/40 mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>
                {hasFilters ? 'No matching recipes' : 'No recipes yet'}
              </h3>
              <p className='text-muted-foreground max-w-md mx-auto'>
                {hasFilters
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Be the first to share a recipe with the community!'}
              </p>
              {hasFilters && (
                <Button variant='outline' className='mt-4' onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background'>
          <div className='bg-gradient-to-br from-primary/5 to-amber-50/50 dark:from-primary/10 dark:to-amber-950/20 py-12 md:py-16'>
            <div className='container mx-auto px-4 text-center'>
              <Skeleton className='h-10 w-64 mx-auto mb-4' />
              <Skeleton className='h-5 w-80 mx-auto mb-8' />
              <Skeleton className='h-12 max-w-xl mx-auto' />
            </div>
          </div>
          <div className='container mx-auto px-4 py-8'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className='overflow-hidden'>
                  <Skeleton className='aspect-[4/3] w-full' />
                  <CardContent className='p-4 space-y-3'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-5 w-3/4' />
                    <Skeleton className='h-3 w-full' />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
