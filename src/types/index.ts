export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  bio: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageURL: string;
  authorId: string;
  authorName: string;
  categoryId: string;
  categoryName: string;
  cookingTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageURL: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  recipeId: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}
