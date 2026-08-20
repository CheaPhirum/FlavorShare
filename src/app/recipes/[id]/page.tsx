'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, Heart, Clock, ChefHat, Pencil, Trash2, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/stores/auth-store';
import { getRecipeById, isUserFavorite, addFavorite, removeFavorite, deleteRecipe } from '@/lib/firebase/firestore';
import { toast } from 'sonner';
import type { Recipe } from '@/types';
import { cn } from '@/lib/utils';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const recipeId = params.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchRecipe = useCallback(async () => {
    try {
      const data = await getRecipeById(recipeId);
      setRecipe(data);
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  const checkFavorite = useCallback(async () => {
    if (!user) return;
    try {
      const result = await isUserFavorite(user.id, recipeId);
      setIsFav(result);
    } catch {
      // ignore
    }
  }, [user, recipeId]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  useEffect(() => {
    checkFavorite();
  }, [checkFavorite]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }
    setFavLoading(true);
    try {
      if (isFav) {
        await removeFavorite(user.id, recipeId);
        setIsFav(false);
        toast.success('Removed from favorites');
      } else {
        await addFavorite(user.id, recipeId);
        setIsFav(true);
        toast.success('Added to favorites');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setFavLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRecipe(recipeId);
      toast.success('Recipe deleted successfully');
      router.push('/explore');
    } catch {
      toast.error('Failed to delete recipe');
    } finally {
      setDeleting(false);
    }
  };

  const difficultyColor =
    recipe?.difficulty === 'Easy'
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : recipe?.difficulty === 'Medium'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

  if (loading) {
    return (
      <div className='min-h-screen bg-background'>
        <Skeleton className='aspect-[2/1] md:aspect-[3/1] w-full' />
        <div className='container mx-auto px-4 py-8 max-w-4xl'>
          <div className='flex gap-2 mb-4'>
            <Skeleton className='h-6 w-20 rounded-full' />
            <Skeleton className='h-6 w-20 rounded-full' />
          </div>
          <Skeleton className='h-10 w-3/4 mb-4' />
          <div className='flex items-center gap-4 mb-6'>
            <Skeleton className='h-10 w-10 rounded-full' />
            <Skeleton className='h-4 w-32' />
          </div>
          <Skeleton className='h-4 w-full mb-2' />
          <Skeleton className='h-4 w-2/3 mb-8' />
          <div className='grid md:grid-cols-2 gap-8'>
            <div>
              <Skeleton className='h-7 w-40 mb-4' />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-6 w-full mb-2' />
              ))}
            </div>
            <div>
              <Skeleton className='h-7 w-40 mb-4' />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className='h-16 w-full mb-2' />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <ChefHat className='h-16 w-16 text-muted-foreground/40 mx-auto mb-4' />
          <h1 className='text-2xl font-bold mb-2'>Recipe Not Found</h1>
          <p className='text-muted-foreground mb-6'>The recipe you’re looking for doesn’t exist or has been removed.</p>
          <Button asChild>
            <Link href='/explore'>Browse Recipes</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isAuthor = user?.id === recipe.authorId;

  return (
    <div className='min-h-screen bg-background'>
      {/* Hero Image */}
      <div className='relative aspect-[2/1] md:aspect-[3/1] w-full overflow-hidden bg-muted'>
        <Image
          src={recipe.imageURL || '/image/FlavorShare_Logo_NoBg.png'}
          alt={recipe.title}
          fill
          sizes='100vw'
          className='object-cover'
          priority
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent' />

        {/* Top bar */}
        <div className='absolute top-4 left-4 right-4 flex items-center justify-between'>
          <Button
            variant='secondary'
            size='sm'
            onClick={() => router.back()}
            className='backdrop-blur-sm bg-black/20 text-white border-white/20 hover:bg-black/40 hover:text-white'
          >
            <ArrowLeft className='h-4 w-4 mr-1' />
            Back
          </Button>

          <button
            onClick={handleToggleFavorite}
            disabled={favLoading}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm transition-all',
              'bg-black/20 border border-white/20 hover:bg-black/40',
              isFav ? 'text-red-400' : 'text-white'
            )}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn('h-5 w-5', isFav && 'fill-red-500 text-red-500')} />
            <span className='text-sm font-medium'>{isFav ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {/* Bottom info overlay */}
        <div className='absolute bottom-6 left-4 right-4 md:bottom-8 md:left-8'>
          <div className='flex flex-wrap items-center gap-2 mb-3'>
            <Badge className={cn('text-xs font-medium', difficultyColor)}>{recipe.difficulty}</Badge>
            <Badge variant='secondary' className='bg-black/30 text-white border-0 text-xs backdrop-blur-sm'>
              {recipe.categoryName}
            </Badge>
            <Badge variant='secondary' className='bg-black/30 text-white border-0 text-xs backdrop-blur-sm'>
              <Clock className='h-3 w-3 mr-1' />
              {recipe.cookingTime} min
            </Badge>
          </div>
          <h1 className='text-3xl md:text-5xl font-bold text-white drop-shadow-lg'>{recipe.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        {/* Author & Actions */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
              <User className='h-5 w-5 text-primary' />
            </div>
            <div>
              <p className='text-sm font-medium'>by <span className='text-primary'>{recipe.authorName}</span></p>
              <p className='text-xs text-muted-foreground'>
                {new Date(recipe.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {isAuthor && (
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' asChild>
                <Link href={`/edit-recipe/${recipe.id}`}>
                  <Pencil className='h-4 w-4 mr-1' />
                  Edit
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='destructive' size='sm'>
                    <Trash2 className='h-4 w-4 mr-1' />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &ldquo;{recipe.title}&rdquo;? This action cannot be
                      undone and will permanently remove the recipe from FlavorShare.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* Description */}
        <Card className='mb-8 bg-card'>
          <CardContent className='p-6'>
            <h2 className='text-lg font-semibold mb-3'>About This Recipe</h2>
            <p className='text-muted-foreground leading-relaxed'>{recipe.description}</p>
          </CardContent>
        </Card>

        {/* Ingredients & Instructions */}
        <div className='grid md:grid-cols-2 gap-8'>
          {/* Ingredients */}
          <Card className='bg-card'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <div className='h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center'>
                  <ChefHat className='h-4 w-4 text-primary' />
                </div>
                Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className='space-y-3'>
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mt-0.5'>
                      {index + 1}
                    </span>
                    <span className='text-sm leading-relaxed pt-0.5'>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className='bg-card'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <div className='h-7 w-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
                  <span className='text-green-700 dark:text-green-400 text-xs font-bold'>&#9654;</span>
                </div>
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className='space-y-4'>
                {recipe.instructions.map((step, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='flex-shrink-0 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-semibold mt-0.5'>
                      {index + 1}
                    </span>
                    <span className='text-sm leading-relaxed pt-0.5'>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <Separator className='my-8' />

        {/* Back to explore */}
        <div className='text-center'>
          <Button variant='outline' asChild>
            <Link href='/explore'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Explore
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
