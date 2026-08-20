'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getAllRecipes,
  getAllCategories,
  getAllUsers,
  getAllMessages,
} from '@/lib/firebase/firestore';
import { BookOpen, Users, FolderTree, Mail } from 'lucide-react';
import type { Recipe, Category, User as AppUser, ContactMessage } from '@/types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#22c55e',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(210, 80%, 55%)',
  'hsl(150, 70%, 45%)',
  'hsl(30, 90%, 55%)',
  'hsl(280, 65%, 55%)',
  'hsl(340, 70%, 55%)',
  'hsl(180, 60%, 45%)',
  'hsl(60, 70%, 45%)',
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

export default function AdminDashboard() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [r, c, u, m] = await Promise.all([
          getAllRecipes(),
          getAllCategories(),
          getAllUsers(),
          getAllMessages(),
        ]);
        setRecipes(r);
        setCategories(c);
        setUsers(u);
        setMessages(m);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Build chart data
  const categoryBarData = categories.map((cat) => ({
    name: cat.name,
    count: recipes.filter((r) => r.categoryId === cat.id).length,
  }));

  const difficultyCounts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
  recipes.forEach((r) => {
    if (difficultyCounts[r.difficulty] !== undefined) {
      difficultyCounts[r.difficulty]++;
    }
  });
  const difficultyPieData = Object.entries(difficultyCounts)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  // Monthly activity (last 6 months)
  const monthlyData: { month: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();
    const month = d.getMonth();
    const count = recipes.filter((r) => {
      try {
        const rd = new Date(r.createdAt);
        return rd.getFullYear() === year && rd.getMonth() === month;
      } catch {
        return false;
      }
    }).length;
    monthlyData.push({ month: label, count });
  }

  const unreadMessages = messages.filter((m) => !m.read).length;
  const recentRecipes = recipes.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your FlavorShare platform
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipes.length}</div>
            <p className="text-xs text-muted-foreground">Published recipes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Total accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Recipe categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recipes by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Recipes by Category</CardTitle>
            <CardDescription>Distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryBarData.length === 0 || categoryBarData.every((d) => d.count === 0) ? (
              <div className="flex h-60 items-center justify-center text-muted-foreground">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryBarData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Difficulty Distribution</CardTitle>
            <CardDescription>Recipes by difficulty level</CardDescription>
          </CardHeader>
          <CardContent>
            {difficultyPieData.length === 0 ? (
              <div className="flex h-60 items-center justify-center text-muted-foreground">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={difficultyPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {difficultyPieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={DIFFICULTY_COLORS[entry.name] || '#8884d8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Activity</CardTitle>
            <CardDescription>Recipes created over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.every((d) => d.count === 0) ? (
              <div className="flex h-60 items-center justify-center text-muted-foreground">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Recipes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Recipes</CardTitle>
          <CardDescription>Latest 5 published recipes</CardDescription>
        </CardHeader>
        <CardContent>
          {recentRecipes.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              No recipes yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Title</th>
                    <th className="hidden pb-3 pr-4 font-medium sm:table-cell">Author</th>
                    <th className="hidden pb-3 pr-4 font-medium md:table-cell">Category</th>
                    <th className="hidden pb-3 pr-4 font-medium md:table-cell">Difficulty</th>
                    <th className="hidden pb-3 font-medium lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRecipes.map((recipe) => (
                    <tr key={recipe.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/recipes/${recipe.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {recipe.title}
                        </Link>
                      </td>
                      <td className="hidden py-3 pr-4 sm:table-cell text-muted-foreground">
                        {recipe.authorName}
                      </td>
                      <td className="hidden py-3 pr-4 md:table-cell">
                        <Badge variant="secondary">{recipe.categoryName}</Badge>
                      </td>
                      <td className="hidden py-3 pr-4 md:table-cell">
                        <Badge
                          variant={
                            recipe.difficulty === 'Easy'
                              ? 'default'
                              : recipe.difficulty === 'Medium'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {recipe.difficulty}
                        </Badge>
                      </td>
                      <td className="hidden py-3 lg:table-cell text-muted-foreground">
                        {formatDate(recipe.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
