'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  getAllRecipes,
  getAllCategories,
  getAllUsers,
  getAllMessages,
} from '@/lib/firebase/firestore';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth-store';
import { Loader2, BookOpen, Users, FolderTree, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
}

const defaultSettings: SiteSettings = {
  siteName: '',
  siteDescription: '',
  supportEmail: '',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [savingSiteInfo, setSavingSiteInfo] = useState(false);
  const [savingSupport, setSavingSupport] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    recipes: 0,
    categories: 0,
    users: 0,
    messages: 0,
  });

  // Site info form
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');

  // Support settings
  const [supportEmail, setSupportEmail] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [recipes, categories, users, messages] = await Promise.all([
          getAllRecipes(),
          getAllCategories(),
          getAllUsers(),
          getAllMessages(),
        ]);
        setStats({
          recipes: recipes.length,
          categories: categories.length,
          users: users.length,
          messages: messages.length,
        });

        // Load site settings from Firestore
        const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setSiteName(data.siteName || '');
          setSiteDescription(data.siteDescription || '');
          setSupportEmail(data.supportEmail || '');
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveSiteInfo = async () => {
    setSavingSiteInfo(true);
    try {
      await setDoc(
        doc(db, 'settings', 'site'),
        {
          siteName: siteName.trim(),
          siteDescription: siteDescription.trim(),
          supportEmail: supportEmail.trim(),
        },
        { merge: true }
      );
      toast.success('Site information saved successfully');
    } catch (err) {
      console.error('Failed to save site info:', err);
      toast.error('Failed to save site information');
    } finally {
      setSavingSiteInfo(false);
    }
  };

  const handleSaveSupport = async () => {
    if (!supportEmail.trim()) {
      toast.error('Support email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(supportEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSavingSupport(true);
    try {
      await setDoc(
        doc(db, 'settings', 'site'),
        {
          supportEmail: supportEmail.trim(),
          siteName: siteName.trim(),
          siteDescription: siteDescription.trim(),
        },
        { merge: true }
      );
      toast.success('Support settings saved successfully');
    } catch (err) {
      console.error('Failed to save support settings:', err);
      toast.error('Failed to save support settings');
    } finally {
      setSavingSupport(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your platform configuration
        </p>
      </div>

      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
          <CardDescription>
            Basic information about your FlavorShare platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input
              id="site-name"
              placeholder="FlavorShare"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-description">Site Description</Label>
            <Textarea
              id="site-description"
              placeholder="A community-driven recipe sharing platform..."
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button
            onClick={handleSaveSiteInfo}
            disabled={savingSiteInfo}
          >
            {savingSiteInfo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Platform Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Statistics</CardTitle>
          <CardDescription>
            Current state of your platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.recipes}</p>
                <p className="text-sm text-muted-foreground">Total Recipes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.users}</p>
                <p className="text-sm text-muted-foreground">Registered Users</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <FolderTree className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.categories}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.messages}</p>
                <p className="text-sm text-muted-foreground">Messages</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Profile</CardTitle>
          <CardDescription>
            Your current admin account information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {user.photoURL && (
                  <AvatarImage src={user.photoURL} alt={user.name} />
                )}
                <AvatarFallback className="text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium">{user.name}</p>
                  <Badge variant="default" className="gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Admin
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Unable to load admin profile.</p>
          )}
        </CardContent>
      </Card>

      {/* Support Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Support Settings</CardTitle>
          <CardDescription>
            Configure contact and support information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="support-email">Support Email</Label>
            <Input
              id="support-email"
              type="email"
              placeholder="support@example.com"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium">Default Response Time</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              The contact page displays a default response time to set expectations
              with users. By default, it shows &quot;within 24-48 hours&quot;. You can
              update this by modifying the contact page directly.
            </p>
          </div>
          <Button
            onClick={handleSaveSupport}
            disabled={savingSupport}
          >
            {savingSupport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Support Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
