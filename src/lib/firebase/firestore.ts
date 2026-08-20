import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Recipe, Category, ContactMessage, User } from '@/types';

// ── Helper ──
function tsToDate(ts: Timestamp | string | undefined): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  return ts;
}

// ── Recipes ──
export async function getAllRecipes(): Promise<Recipe[]> {
  const snap = await getDocs(query(collection(db, 'recipes'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Recipe));
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const snap = await getDoc(doc(db, 'recipes', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Recipe;
}

export async function getRecipesByAuthor(authorId: string): Promise<Recipe[]> {
  const snap = await getDocs(query(collection(db, 'recipes'), where('authorId', '==', authorId), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Recipe));
}

export async function getRecipesByCategory(categoryId: string): Promise<Recipe[]> {
  const snap = await getDocs(query(collection(db, 'recipes'), where('categoryId', '==', categoryId), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Recipe));
}

export async function createRecipe(data: Omit<Recipe, 'id'>): Promise<Recipe> {
  const ref = await addDoc(collection(db, 'recipes'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

export async function updateRecipe(id: string, data: Partial<Recipe>): Promise<void> {
  await updateDoc(doc(db, 'recipes', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteRecipe(id: string): Promise<void> {
  await deleteDoc(doc(db, 'recipes', id));
}

// ── Categories ──
export async function getAllCategories(): Promise<Category[]> {
  const snap = await getDocs(query(collection(db, 'categories'), orderBy('name', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const snap = await getDoc(doc(db, 'categories', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Category;
}

export async function createCategory(data: { name: string; description: string; imageURL: string }): Promise<Category> {
  const ref = await addDoc(collection(db, 'categories'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...data, createdAt: new Date().toISOString() };
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.imageURL !== undefined) updateData.imageURL = data.imageURL;
  await updateDoc(doc(db, 'categories', id), updateData);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', id));
}

// ── Users ──
export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
}

export async function getUserById(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: uid, ...snap.data() } as User;
}

export async function updateUserRole(uid: string, role: 'user' | 'admin'): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role });
}

export async function updateUserFields(uid: string, data: Partial<User>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data);
}

// ── Favorites ──
export async function addFavorite(userId: string, recipeId: string): Promise<void> {
  const snap = await getDocs(
    query(collection(db, 'favorites'), where('userId', '==', userId), where('recipeId', '==', recipeId))
  );
  if (!snap.empty) return;
  await addDoc(collection(db, 'favorites'), {
    userId,
    recipeId,
    createdAt: serverTimestamp(),
  });
}

export async function removeFavorite(userId: string, recipeId: string): Promise<void> {
  const snap = await getDocs(
    query(collection(db, 'favorites'), where('userId', '==', userId), where('recipeId', '==', recipeId))
  );
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  if (!snap.empty) await batch.commit();
}

export async function isUserFavorite(userId: string, recipeId: string): Promise<boolean> {
  const snap = await getDocs(
    query(collection(db, 'favorites'), where('userId', '==', userId), where('recipeId', '==', recipeId))
  );
  return !snap.empty;
}

export async function getUserFavoriteIds(userId: string): Promise<string[]> {
  const snap = await getDocs(query(collection(db, 'favorites'), where('userId', '==', userId)));
  return snap.docs.map((d) => d.data().recipeId as string);
}

export async function getUserFavoriteRecipes(userId: string): Promise<Recipe[]> {
  const favIds = await getUserFavoriteIds(userId);
  if (favIds.length === 0) return [];
  const recipes: Recipe[] = [];
  for (const id of favIds) {
    const r = await getRecipeById(id);
    if (r) recipes.push(r);
  }
  return recipes;
}

// ── Messages ──
export async function getAllMessages(): Promise<ContactMessage[]> {
  const snap = await getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactMessage));
}

export async function createMessage(data: { name: string; email: string; subject: string; message: string }): Promise<void> {
  await addDoc(collection(db, 'messages'), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function markMessageRead(id: string): Promise<void> {
  const snap = await getDoc(doc(db, 'messages', id));
  if (snap.exists()) {
    await updateDoc(doc(db, 'messages', id), { read: !snap.data().read });
  }
}

export async function deleteMessage(id: string): Promise<void> {
  await deleteDoc(doc(db, 'messages', id));
}

// ── Stats helpers ──
export async function getRecipeCountByCategory(): Promise<Record<string, number>> {
  const snap = await getDocs(collection(db, 'recipes'));
  const counts: Record<string, number> = {};
  snap.docs.forEach((d) => {
    const catId = d.data().categoryId as string;
    counts[catId] = (counts[catId] || 0) + 1;
  });
  return counts;
}
