'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, Upload, Link as LinkIcon, Loader2, ChefHat, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth-store';
import { getAllCategories, createRecipe } from '@/lib/firebase/firestore';
import { uploadImage } from '@/lib/firebase/storage';
import type { Category } from '@/types';

export default function CreateRecipePage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
  }, []);

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
      let finalImageURL = '';

      if (imageMode === 'url' && imageURL.trim()) {
        finalImageURL = imageURL.trim();
      } else if (imageMode === 'upload' && imageFile) {
        setUploading(true);
        finalImageURL = await uploadImage(imageFile, `recipes/${Date.now()}_${imageFile.name}`);
        setUploading(false);
      }

      const category = categories.find((c) => c.id === categoryId);

      await createRecipe({
        title: title.trim(),
        description: description.trim(),
        imageURL: finalImageURL,
        authorId: user.id,
        authorName: user.name,
        categoryId,
        categoryName: category?.name || '',
        cookingTime: Number(cookingTime),
        difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
        ingredients: validIngredients,
        instructions: validInstructions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast.success('Recipe created successfully!');
      router.push('/my-recipes');
    } catch (error) {
      console.error('Failed to create recipe:', error);
      toast.error('Failed to create recipe. Please try again.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  // Auth not initialized
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
            <h1 className='text-3xl md:text-4xl font-bold mb-4'>Create Recipe</h1>
            <p className='text-muted-foreground'>Share your culinary creation with the community</p>
          </div>
        </section>
        <div className='container mx-auto px-4 py-16'>
          <Card className='bg-card max-w-md mx-auto'>
            <CardContent className='py-16 text-center'>
              <ChefHat className='h-16 w-16 text-muted-foreground/40 mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Sign in to create a recipe</h3>
              <p className='text-muted-foreground mb-6'>Create an account or sign in to share your recipes with the community.</p>
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

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <section className='bg-gradient-to-br from-primary/5 to-amber-50/50 dark:from-primary/10 dark:to-amber-950/20 py-12 md:py-16'>
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>Create Recipe</h1>
          <p className='text-muted-foreground'>Share your culinary creation with the community</p>
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
                      placeholder="e.g. Cambodian Fish Amok"
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
                  <CardDescription>Add a photo of your finished dish</CardDescription>
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
                        onChange={(e) => setImageURL(e.target.value)}
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
                      {imagePreview && (
                        <div className='mt-2 rounded-lg overflow-hidden border bg-muted max-w-xs'>
                            <img src={imagePreview} alt='Preview' className='w-full h-auto object-cover' />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit */}
              <div className='flex items-center gap-3 pt-2'>
                <Button type='submit' size='lg' disabled={submitting || uploading} className='min-w-[140px]'>
                  {submitting || uploading ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      {uploading ? 'Uploading...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <ChefHat className='h-4 w-4' />
                      Create Recipe
                    </>
                  )}
                </Button>
                <Button type='button' variant='outline' size='lg' onClick={() => router.back()} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
