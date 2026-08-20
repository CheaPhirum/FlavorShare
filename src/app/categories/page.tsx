'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Category } from '@/types';
import { getAllCategories, getRecipeCountByCategory } from '@/lib/firebase/firestore';

const CATEGORY_COLORS: Record<string, string> = {
  Italian: 'bg-red-100 dark:bg-red-900/30',
  Asian: 'bg-amber-100 dark:bg-amber-900/30',
  Mexican: 'bg-green-100 dark:bg-green-900/30',
  Desserts: 'bg-pink-100 dark:bg-pink-900/30',
  Seafood: 'bg-blue-100 dark:bg-blue-900/30',
  Vegetarian: 'bg-emerald-100 dark:bg-emerald-900/30',
  American: 'bg-orange-100 dark:bg-orange-900/30',
  French: 'bg-violet-100 dark:bg-violet-900/30',
  Indian: 'bg-yellow-100 dark:bg-yellow-900/30',
  Mediterranean: 'bg-cyan-100 dark:bg-cyan-900/30',
};

const CATEGORY_ICONS: Record<string, string> = {
  Italian: '\u{1F35D}',
  Asian: '\u{1F962}',
  Mexican: '\u{1F32E}',
  Desserts: '\u{1F370}',
  Seafood: '\u{1F41F}',
  Vegetarian: '\u{1F957}',
  American: '\u{1F354}',
  French: '\u{1F950}',
  Indian: '\u{1F35D}',
  Mediterranean: '\u{1FAD2}',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipeCounts, setRecipeCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesData, counts] = await Promise.all([
          getAllCategories(),
          getRecipeCountByCategory(),
        ]);
        setCategories(categoriesData);
        setRecipeCounts(counts);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <section className='bg-gradient-to-br from-primary/5 to-amber-50/50 dark:from-primary/10 dark:to-amber-950/20 py-12 md:py-16'>
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>Recipe Categories</h1>
          <p className='text-muted-foreground max-w-xl mx-auto'>
            Browse recipes organized by cuisine type and meal category
          </p>
        </div>
      </section>

      <div className='container mx-auto px-4 py-12'>
        {loading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className='overflow-hidden'>
                <Skeleton className='aspect-[4/3] w-full' />
                <CardContent className='p-4 space-y-2'>
                  <Skeleton className='h-5 w-24' />
                  <Skeleton className='h-3 w-full' />
                  <Skeleton className='h-4 w-16' />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Card className='bg-card'>
            <CardContent className='py-20 text-center'>
              <BookOpen className='h-16 w-16 text-muted-foreground/40 mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No categories yet</h3>
              <p className='text-muted-foreground max-w-md mx-auto'>
                Categories will appear here once they are created by the community.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {categories.map((category) => {
              const count = recipeCounts[category.id] || 0;
              const localImagePath = `/images/categories/${category.name}.png`;
              const hasFirebaseImage = category.imageURL && category.imageURL.trim() !== '';
              const imageSrc = hasFirebaseImage ? category.imageURL : localImagePath;
              const imageFailed = failedImages.has(category.id);
              const bgColor = CATEGORY_COLORS[category.name] || 'bg-primary/10';
              const iconEmoji = CATEGORY_ICONS[category.name] || '\u{1F37D}';

              return (
                <Link key={category.id} href={`/explore?category=${category.id}`}>
                  <Card className='group overflow-hidden transition-all hover:shadow-lg cursor-pointer'>
                    <div className='relative aspect-[4/3] overflow-hidden bg-muted'>
                      {imageFailed || !imageSrc ? (
                        <div className={`w-full h-full flex items-center justify-center ${bgColor}`}>
                          <span className='text-5xl'>{iconEmoji}</span>
                        </div>
                      ) : (
                        <Image
                          src={imageSrc}
                          alt={category.name}
                          fill
                          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                          className='object-cover transition-transform duration-300 group-hover:scale-105'
                          onError={() => {
                            setFailedImages((prev) => new Set(prev).add(category.id));
                          }}
                        />
                      )}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent' />
                      <div className='absolute bottom-0 left-0 right-0 p-4'>
                        <h3 className='text-lg font-bold text-white drop-shadow-md'>{category.name}</h3>
                      </div>
                      <div className='absolute top-3 right-3'>
                        <Badge variant='secondary' className='bg-black/30 text-white border-0 text-xs backdrop-blur-sm'>
                          {count} {count === 1 ? 'recipe' : 'recipes'}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className='p-4'>
                      <p className='text-sm text-muted-foreground line-clamp-2'>{category.description}</p>
                      <div className='flex items-center gap-1 mt-3 text-sm text-primary font-medium group-hover:gap-2 transition-all'>
                        Browse recipes <ArrowRight className='h-3 w-3' />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
