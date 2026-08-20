'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { getAllMessages, markMessageRead, deleteMessage } from '@/lib/firebase/firestore';
import { Mail, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import type { ContactMessage } from '@/types';

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

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      const data = await getAllMessages();
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const openMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setDetailOpen(true);

    // Mark as read if unread
    if (!msg.read) {
      markMessageRead(msg.id)
        .then(() => {
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
          );
          setSelectedMessage((prev) => (prev ? { ...prev, read: true } : null));
        })
        .catch((err) => {
          console.error('Failed to mark as read:', err);
        });
    }
  };

  const toggleRead = async (msg: ContactMessage) => {
    try {
      await markMessageRead(msg.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id ? { ...m, read: !m.read } : m
        )
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage((prev) =>
          prev ? { ...prev, read: !prev.read } : null
        );
      }
    } catch (err) {
      console.error('Failed to toggle read status:', err);
      toast.error('Failed to update message status');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setDetailOpen(false);
        setSelectedMessage(null);
      }
      toast.success('Message deleted');
    } catch (err) {
      console.error('Failed to delete message:', err);
      toast.error('Failed to delete message');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-72" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Messages
        </h1>
        <p className="text-muted-foreground">
          View and manage contact messages
        </p>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Mail className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              No messages yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Messages from the contact form will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">From</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    className={`border-b last:border-0 transition-colors hover:bg-muted/30 cursor-pointer ${
                      !msg.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => openMessage(msg)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Badge variant={msg.read ? 'secondary' : 'default'}>
                        {msg.read ? 'Read' : 'Unread'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className={`font-medium ${!msg.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {msg.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{msg.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`truncate max-w-xs ${!msg.read ? 'font-medium' : ''}`}>
                        {msg.subject}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(msg.createdAt)}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleRead(msg)}
                          title={msg.read ? 'Mark as unread' : 'Mark as read'}
                        >
                          {msg.read ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {msg.read ? 'Mark as unread' : 'Mark as read'}
                          </span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Message</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this message from{' '}
                                <strong>{msg.name}</strong>? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(msg.id)}
                                disabled={deleting === msg.id}
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                {deleting === msg.id ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {messages.map((msg) => (
              <Card
                key={msg.id}
                className={`cursor-pointer transition-colors ${
                  !msg.read ? 'border-primary/30' : ''
                }`}
                onClick={() => openMessage(msg)}
              >
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={msg.read ? 'secondary' : 'default'}>
                          {msg.read ? 'Read' : 'Unread'}
                        </Badge>
                        <span className={`text-sm ${!msg.read ? 'font-medium' : 'text-muted-foreground'}`}>
                          {msg.name}
                        </span>
                      </div>
                      <p className={`mt-1 truncate ${!msg.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {msg.subject}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Message detail dialog */}
          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent className="sm:max-w-lg">
              {selectedMessage && (
                <>
                  <DialogHeader>
                    <DialogTitle>{selectedMessage.subject}</DialogTitle>
                    <DialogDescription>
                      From {selectedMessage.name} ({selectedMessage.email}) on{' '}
                      {formatDateTime(selectedMessage.createdAt)}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={selectedMessage.read ? 'secondary' : 'default'}
                      >
                        {selectedMessage.read ? 'Read' : 'Unread'}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="max-h-64 overflow-y-auto text-sm text-foreground whitespace-pre-wrap">
                      {selectedMessage.message}
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRead(selectedMessage)}
                      >
                        {selectedMessage.read ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Mark as Unread
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Mark as Read
                          </>
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Message</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this message? This action cannot
                              be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(selectedMessage.id)}
                              disabled={deleting === selectedMessage.id}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              {deleting === selectedMessage.id ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
