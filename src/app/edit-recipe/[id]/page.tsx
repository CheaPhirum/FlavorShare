'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, Upload, Link as LinkIcon, Loader2, ChefHat, LogIn, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
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
import { getRecipeById, getAllCategories, updateRecipe, deleteRecipe } from '@/lib/firebase/firestore';
import { uploadImage } from '@/lib/firebase/storage';
import type { Recipe, Category } from '@/types';

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const recipeId = params.id as string;

  // Loading states
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [notAuthor, setNotAuthor] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);

  // Image
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [imageURL, setImageURL] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const data = await getRecipeById(recipeId);
        if (!data) {
          setNotFound(true);
          return;
        }
        if (user && data.authorId !== user.id) {
          setNotAuthor(true);
          return;
        }
        // Pre-populate form
        setTitle(data.title);
        setDescription(data.description);
        setCategoryId(data.categoryId);
        setCookingTime(String(data.cookingTime));
        setDifficulty(data.difficulty);
        setIngredients(data.ingredients.length > 0 ? data.ingredients : ['']);
        setInstructions(data.instructions.length > 0 ? data.instructions : ['']);
        if (data.imageURL) {
          setImageURL(data.imageURL);
          setImagePreview(data.imageURL);
          setImageMode('url');
        }
      } catch (error) {
        console.error('Failed to fetch recipe:', error);
        setNotFound(true);
      } finally {
        setPageLoading(false);
      }
    }

    async function fetchCategories() {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    }

    fetchCategories();
    if (user) {
      fetchRecipe();
    } else {
      setPageLoading(false);
    }
  }, [recipeId, user]);

  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const addInstruction = () => setInstructions([...instructions, '']);
  const removeInstruction = (index: number) => setInstructions(instructions.filter((_, i) => i !== index));
  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!title.trim()) { toast.error('Please enter a recipe title.'); return; }
    if (!description.trim()) { toast.error('Please enter a description.'); return; }
    if (!categoryId) { toast.error('Please select a category.'); return; }
    if (!cookingTime || Number(cookingTime) <= 0) { toast.error('Please enter a valid cooking time.'); return; }
    if (!difficulty) { toast.error('Please select a difficulty level.'); return; }
    const validIngredients = ingredients.filter((i) => i.trim());
    if (validIngredients.length === 0) { toast.error('Please add at least one ingredient.'); return; }
    const validInstructions = instructions.filter((i) => i.trim());
    if (validInstructions.length === 0) { toast.error('Please add at least one instruction step.'); return; }

    setSubmitting(true);
    try {
      let finalImageURL = imageURL;

      if (imageMode === 'url' && imageURL.trim()) {
        finalImageURL = imageURL.trim();
      } else if (imageMode === 'upload' && imageFile) {
        setUploading(true);
        finalImageURL = await uploadImage(imageFile, `recipes/${Date.now()}_${imageFile.name}`);
        setUploading(false);
      }

      const category = categories.find((c) => c.id === categoryId);

      await updateRecipe(recipeId, {
        title: title.trim(),
        description: description.trim(),
        imageURL: finalImageURL,
        categoryId,
        categoryName: category?.name || '',
        cookingTime: Number(cookingTime),
        difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
        ingredients: validIngredients,
        instructions: validInstructions,
      });

      toast.success('Recipe updated successfully!');
      router.push('/my-recipes');
    } catch (error) {
      console.error('Failed to update recipe:', error);
      toast.error('Failed to update recipe. Please try again.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRecipe(recipeId);
      toast.success('Recipe deleted successfully');
      router.push('/my-recipes');
    } catch {
      toast.error('Failed to delete recipe');
    } finally {
      setDeleting(false);
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
            <h1 className='text-3xl md:text-4xl font-bold mb-4'>Edit Recipe</h1>
            <p className='text-muted-foreground'>Update your recipe details</p>
          </div>
        </section>
        <div className='container mx-auto px-4 py-16'>
          <Card className='bg-card max-w-md mx-auto'>
            <CardContent className='py-16 text-center'>
              <LogIn className='h-16 w-16 text-muted-foreground/40 mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Sign in to edit recipes</h3>
              <p className='text-muted-foreground mb-6'>Create an account or sign in to manage your recipes.</p>
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

  // Not found
  if (notFound) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <ChefHat className='h-16 w-16 text-muted-foreground/40 mx-auto mb-4' />
          <h1 className='text-2xl font-bold mb-2'>Recipe Not Found</h1>
          <p className='text-muted-foreground mb-6'>The recipe you&apos;re trying to edit doesn&apos;t exist or has been removed.</p>
          <Button asChild>
            <Link href='/my-recipes'>Back to My Recipes</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Not author
  if (notAuthor) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <ChefHat className='h-16 w-16 text-muted-foreground/40 mx-auto mb-4' />
          <h1 className='text-2xl font-bold mb-2'>Access Denied</h1>
          <p className='text-muted-foreground mb-6'>You can only edit your own recipes.</p>
          <Button asChild>
            <Link href='/my-recipes'>Back to My Recipes</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Page loading (fetching recipe data)
  if (pageLoading) {
    return (
      <div className='min-h-screen bg-background'>
        <section className='bg-gradient-to-br from-primary/5 to-amber-50/50 dark:from-primary/10 dark:to-amber-950/20 py-12 md:py-16'>
          <div className='container mx-auto px-4 text-center'>
            <Skeleton className='h-10 w-64 mx-auto mb-4' />
            <Skeleton className='h-5 w-80 mx-auto' />
          </div>
        </section>
        <div className='container mx-auto px-4 py-8 max-w-3xl'>
          <Card className='bg-card'>
            <CardContent className='p-6 md:p-8 space-y-6'>
              <Skeleton className='h-20 w-full' />
              <Skeleton className='h-20 w-full' />
              <Skeleton className='h-32 w-full' />
              <Skeleton className='h-32 w-full' />
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
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>Edit Recipe</h1>
          <p className='text-muted-foreground'>Update your recipe details</p>
        </div>
      </section>

      <div className='container mx-auto px-4 py-8 max-w-3xl'>
        <Card className='bg-card'>
          <CardContent className='p-6 md:p-8'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Basic Info */}
              <Card className='bg-muted/50 border-dashed'>
                <CardHeader className='pb-4'>
                  <CardTitle className='text-lg'>Basic Information</CardTitle>
                  <CardDescription>Give your recipe a name and description</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='title'>Recipe Title *</Label>
                    <Input
                      id='title'
                      placeholder="e.g. Grandma's Apple Pie"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='description'>Description *</Label>
                    <Textarea
                      id='description'
                      placeholder='Describe your recipe, its origins, or what makes it special...'
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      disabled={submitting}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Category & Details */}
              <Card className='bg-muted/50 border-dashed'>
                <CardHeader className='pb-4'>
                  <CardTitle className='text-lg'>Details</CardTitle>
                  <CardDescription>Categorize your recipe and set cooking details</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label>Category *</Label>
                    {categoriesLoading ? (
                      <Skeleton className='h-9 w-full' />
                    ) : (
                      <Select value={categoryId} onValueChange={setCategoryId} disabled={submitting}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select a category' />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='cookingTime'>Cooking Time (minutes) *</Label>
                      <Input
                        id='cookingTime'
                        type='number'
                        min='1'
                        placeholder='e.g. 30'
                        value={cookingTime}
                        onChange={(e) => setCookingTime(e.target.value)}
                        disabled={submitting}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Difficulty *</Label>
                      <Select value={difficulty} onValueChange={setDifficulty} disabled={submitting}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select difficulty' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Easy'>Easy</SelectItem>
                          <SelectItem value='Medium'>Medium</SelectItem>
                          <SelectItem value='Hard'>Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ingredients */}
              <Card className='bg-muted/50 border-dashed'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='text-lg'>Ingredients *</CardTitle>
                      <CardDescription>List all the ingredients needed</CardDescription>
                    </div>
                    <Button type='button' variant='outline' size='sm' onClick={addIngredient} disabled={submitting}>
                      <Plus className='h-4 w-4 mr-1' />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {ingredients.map((ingredient, index) => (
                      <div key={index} className='flex items-center gap-3'>
                        <span className='flex-shrink-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold'>
                          {index + 1}
                        </span>
                        <Input
                          placeholder={`Ingredient ${index + 1}`}
                          value={ingredient}
                          onChange={(e) => updateIngredient(index, e.target.value)}
                          disabled={submitting}
                          className='flex-1'
                        />
                        {ingredients.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => removeIngredient(index)}
                            disabled={submitting}
                            className='text-muted-foreground hover:text-destructive'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className='bg-muted/50 border-dashed'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='text-lg'>Instructions *</CardTitle>
                      <CardDescription>Step-by-step cooking instructions</CardDescription>
                    </div>
                    <Button type='button' variant='outline' size='sm' onClick={addInstruction} disabled={submitting}>
                      <Plus className='h-4 w-4 mr-1' />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {instructions.map((instruction, index) => (
                      <div key={index} className='flex items-start gap-3'>
                        <span className='flex-shrink-0 h-7 w-7 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-semibold mt-2'>
                          {index + 1}
                        </span>
                        <Textarea
                          placeholder={`Step ${index + 1}: Describe what to do...`}
                          value={instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                          disabled={submitting}
                          rows={2}
                          className='flex-1'
                        />
                        {instructions.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => removeInstruction(index)}
                            disabled={submitting}
                            className='text-muted-foreground hover:text-destructive mt-2'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Image */}
              <Card className='bg-muted/50 border-dashed'>
                <CardHeader className='pb-4'>
                  <CardTitle className='text-lg'>Recipe Image</CardTitle>
                  <CardDescription>Update the photo of your dish</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <RadioGroup
                    value={imageMode}
                    onValueChange={(v) => setImageMode(v as 'url' | 'upload')}
                    className='flex flex-wrap gap-4'
                    disabled={submitting}
                  >
                    <div className='flex items-center gap-2'>
                      <RadioGroupItem value='url' id='img-url' />
                      <Label htmlFor='img-url' className='cursor-pointer flex items-center gap-1.5'>
                        <LinkIcon className='h-4 w-4' />
                        Image URL
                      </Label>
                    </div>
                    <div className='flex items-center gap-2'>
                      <RadioGroupItem value='upload' id='img-upload' />
                      <Label htmlFor='img-upload' className='cursor-pointer flex items-center gap-1.5'>
                        <Upload className='h-4 w-4' />
                        Upload Image
                      </Label>
                    </div>
                  </RadioGroup>

                  {imageMode === 'url' ? (
                    <div className='space-y-2'>
                      <Label htmlFor='imageURL'>Image URL</Label>
                      <Input
                        id='imageURL'
                        placeholder='https://example.com/my-recipe.jpg'
                        value={imageURL}
                        onChange={(e) => {
                          setImageURL(e.target.value);
                          setImagePreview(e.target.value);
                        }}
                        disabled={submitting}
                      />
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      <Label htmlFor='imageFile'>Upload Image</Label>
                      <div className='flex items-center gap-3'>
                        <Input
                          id='imageFile'
                          type='file'
                          accept='image/*'
                          onChange={handleFileChange}
                          disabled={submitting || uploading}
                          className='flex-1'
                        />
                      </div>
                    </div>
                  )}

                  {imagePreview && (
                    <div className='rounded-lg overflow-hidden border bg-muted max-w-xs'>
                      <img src={imagePreview} alt='Preview' className='w-full h-auto object-cover' />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className='flex items-center justify-between pt-2'>
                <div className='flex items-center gap-3'>
                  <Button type='submit' size='lg' disabled={submitting || uploading} className='min-w-[140px]'>
                    {submitting || uploading ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        {uploading ? 'Uploading...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <ChefHat className='h-4 w-4' />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button type='button' variant='outline' size='lg' onClick={() => router.back()} disabled={submitting}>
                    <ArrowLeft className='h-4 w-4 mr-1' />
                    Cancel
                  </Button>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type='button' variant='destructive' size='lg' disabled={submitting}>
                      <Trash2 className='h-4 w-4 mr-1' />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &ldquo;{title}&rdquo;? This action cannot be
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
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
