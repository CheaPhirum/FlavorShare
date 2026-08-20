'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { Pencil, Loader2, BookOpen, Heart, LogIn, Calendar, ChefHat } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useAuthStore } from '@/stores/auth-store';
import { getRecipesByAuthor, getUserFavoriteIds, getAllRecipes } from '@/lib/firebase/firestore';
import { updateUserProfile } from '@/lib/firebase/auth';
import type { Recipe } from '@/types';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage() {
  const { user, initialized, setUser } = useAuthStore();

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  // Data
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      try {
        const [recipes, favIds, allRecipes] = await Promise.all([
          getRecipesByAuthor(user!.id),
          getUserFavoriteIds(user!.id),
          getAllRecipes(),
        ]);
        setMyRecipes(recipes);
        setFavoriteRecipes(allRecipes.filter((r) => favIds.includes(r.id)));
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setDataLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const startEditing = () => {
    if (user) {
      setEditName(user.name);
      setEditBio(user.bio || '');
      setEditing(true);
    }
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!editName.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(user.id, { name: editName.trim(), bio: editBio.trim() });
      setUser({
        ...user,
        name: editName.trim(),
        bio: editBio.trim(),
      });
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className='text-3xl md:text-4xl font-bold mb-4'>Profile</h1>
            <p className='text-muted-foreground'>View and manage your profile</p>
          </div>
        </section>
        <div className='container mx-auto px-4 py-16'>
          <Card className='bg-card max-w-md mx-auto'>
            <CardContent className='py-16 text-center'>
              <LogIn className='h-16 w-16 text-muted-foreground/40 mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Sign in to view your profile</h3>
              <p className='text-muted-foreground mb-6'>Create an account or sign in to manage your profile and recipes.</p>
              <div className='flex items-center justify-center gap-3'>
                <Button asChild>
                  <Link href='/login'><LogIn className='h-4 w-4 mr-2' />Sign In</Link>
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

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <section className='bg-gradient-to-br from-primary/5 to-amber-50/50 dark:from-primary/10 dark:to-amber-950/20 py-12 md:py-16'>
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>Profile</h1>
          <p className='text-muted-foreground'>View and manage your profile</p>
        </div>
      </section>

      <div className='container mx-auto px-4 py-8 max-w-5xl'>
        {/* Profile Card - Left-Right split */}
        <Card className='bg-card mb-8'>
          <CardContent className='p-6 md:p-8'>
            <div className='flex flex-col md:flex-row gap-6 md:gap-8'>
              {/* LEFT: Avatar + name/email/bio */}
              <div className='flex flex-col items-center md:items-start gap-4 md:min-w-[200px]'>
                <div className='h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold flex-shrink-0'>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className='h-24 w-24 rounded-full object-cover'
                    />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleSaveProfile} className='w-full space-y-3'>
                    <div className='space-y-2'>
                      <Label htmlFor='editName' className='text-xs'>Name</Label>
                      <Input
                        id='editName'
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={saving}
                        className='text-sm'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='editBio' className='text-xs'>Bio</Label>
                      <Textarea
                        id='editBio'
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        disabled={saving}
                        rows={3}
                        className='text-sm'
                      />
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button type='submit' size='sm' disabled={saving}>
                        {saving ? <Loader2 className='h-3 w-3 animate-spin' /> : null}
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button type='button' variant='outline' size='sm' onClick={cancelEditing} disabled={saving}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className='text-center md:text-left space-y-1'>
                    <h2 className='text-xl font-bold'>{user.name}</h2>
                    <p className='text-sm text-muted-foreground'>{user.email}</p>
                    {user.bio && (
                      <p className='text-sm text-muted-foreground mt-2 max-w-sm'>{user.bio}</p>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT: User info + edit button */}
              {!editing && (
                <div className='flex-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2 text-sm'>
                      <Calendar className='h-4 w-4 text-muted-foreground' />
                      <span className='text-muted-foreground'>Member since</span>
                      <span className='font-medium'>{memberSince}</span>
                    </div>
                    <div className='flex items-center gap-4 text-sm'>
                      <div className='flex items-center gap-1.5'>
                        <ChefHat className='h-4 w-4 text-muted-foreground' />
                        <span className='text-muted-foreground'>Recipes:</span>
                        <span className='font-medium'>{myRecipes.length}</span>
                      </div>
                      <div className='flex items-center gap-1.5'>
                        <Heart className='h-4 w-4 text-muted-foreground' />
                        <span className='text-muted-foreground'>Favorites:</span>
                        <span className='font-medium'>{favoriteRecipes.length}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant='outline' size='sm' onClick={startEditing}>
                    <Pencil className='h-4 w-4 mr-1' />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs: My Recipes & Favorites */}
        <Tabs defaultValue='recipes'>
          <TabsList>
            <TabsTrigger value='recipes' className='gap-1.5'>
              <BookOpen className='h-4 w-4' />
              My Recipes ({myRecipes.length})
            </TabsTrigger>
            <TabsTrigger value='favorites' className='gap-1.5'>
              <Heart className='h-4 w-4' />
              Favorites ({favoriteRecipes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value='recipes'>
            {dataLoading ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {Array.from({ length: 4 }).map((_, i) => (
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
            ) : myRecipes.length === 0 ? (
              <Card className='bg-card'>
                <CardContent className='py-16 text-center'>
                  <BookOpen className='h-12 w-12 text-muted-foreground/40 mx-auto mb-3' />
                  <h3 className='text-base font-semibold mb-2'>No recipes yet</h3>
                  <p className='text-sm text-muted-foreground mb-4'>Share your first recipe with the community!</p>
                  <Button size='sm' asChild>
                    <Link href='/create-recipe'>Create Recipe</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {myRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='favorites'>
            {dataLoading ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {Array.from({ length: 4 }).map((_, i) => (
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
            ) : favoriteRecipes.length === 0 ? (
              <Card className='bg-card'>
                <CardContent className='py-16 text-center'>
                  <Heart className='h-12 w-12 text-muted-foreground/40 mx-auto mb-3' />
                  <h3 className='text-base font-semibold mb-2'>No favorites yet</h3>
                  <p className='text-sm text-muted-foreground mb-4'>Explore recipes and tap the heart icon to save them here.</p>
                  <Button size='sm' variant='outline' asChild>
                    <Link href='/explore'>Explore Recipes</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {favoriteRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
