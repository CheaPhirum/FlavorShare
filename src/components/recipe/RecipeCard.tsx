'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Recipe } from '@/types';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import { addFavorite, removeFavorite, isUserFavorite } from '@/lib/firebase/firestore';
import { toast } from 'sonner';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { user } = useAuthStore();
  const [isFav, setIsFav] = useState(false);
  const [favChecked, setFavChecked] = useState(false);

  const checkFavorite = useCallback(async () => {
    if (!user) return;
    try {
      const result = await isUserFavorite(user.id, recipe.id);
      setIsFav(result);
    } catch {
      // ignore
    }
    setFavChecked(true);
  }, [user, recipe.id]);

  // Check favorite status on mount
  useEffect(() => { checkFavorite(); }, [checkFavorite]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }
    try {
      if (isFav) {
        await removeFavorite(user.id, recipe.id);
        setIsFav(false);
        toast.success('Removed from favorites');
      } else {
        await addFavorite(user.id, recipe.id);
        setIsFav(true);
        toast.success('Added to favorites');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const difficultyColor =
    recipe.difficulty === 'Easy'
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : recipe.difficulty === 'Medium'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

  return (
    <div className='group rounded-xl border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md'>
      <Link href={`/recipes/${recipe.id}`} className='block'>
        <div className='relative aspect-[4/3] overflow-hidden bg-muted'>
          <Image
            src={recipe.imageURL || '/image/FlavorShare_Logo_NoBg.png'}
            alt={recipe.title}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            className='object-cover transition-transform duration-300 group-hover:scale-105'
          />
          <div className='absolute top-3 left-3'>
            <Badge variant='secondary' className={cn('text-xs font-medium', difficultyColor)}>{recipe.difficulty}</Badge>
          </div>
          {user && favChecked && (
            <button
              onClick={handleFavorite}
              className='absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-black/60 shadow-sm transition-all hover:scale-110'
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={cn('h-4 w-4 transition-colors', isFav ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400')} />
            </button>
          )}
        </div>
        <div className='p-4 flex flex-col gap-2'>
          <h3 className='font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors'>{recipe.title}</h3>
          <div className='flex items-center gap-3'>
            <span className='text-xs font-medium text-primary'>{recipe.categoryName}</span>
            <span className='flex items-center gap-1 text-xs text-muted-foreground'><Clock className='h-3 w-3' />{recipe.cookingTime} min</span>
          </div>
          <p className='text-xs text-muted-foreground line-clamp-2'>{recipe.description}</p>
          <span className='text-xs font-medium text-foreground'>by {recipe.authorName}</span>
          <Button size='sm' className='mt-1 w-full text-xs bg-green-600 hover:bg-green-700 text-white' tabIndex={-1}>View Recipe</Button>
        </div>
      </Link>
    </div>
  );
}
