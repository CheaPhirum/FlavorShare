'use client';

import { useState } from 'react';
import {
  Mail, Phone, MapPin, Clock, Send,
  MessageSquare, HelpCircle, ChefHat,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { createMessage } from '@/lib/firebase/firestore';
import { toast } from 'sonner';

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'flavorshare@gmail.com',
    href: 'mailto:flavorshare@gmail.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+855 123456789',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: 'Phnom Penh',
    href: null,
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Mon–Sat, 8:00 AM – 6:00 PM',
    href: null,
  },
];

const FAQS = [
  {
    question: 'How do I share a recipe?',
    answer:
      'Sign in to your account, click the "Add Recipe" button in the navigation, and fill in your recipe details including title, description, ingredients, and step-by-step instructions. You can also upload a photo of your dish.',
  },
  {
    question: 'Is FlavorShare free to use?',
    answer:
      'Yes! FlavorShare is completely free. You can browse recipes, create an account, share your own recipes, and save favorites at no cost.',
  },
  {
    question: 'Can I edit or delete my recipe after posting?',
    answer:
      'Absolutely. Navigate to your recipe page and you\'ll see Edit and Delete options if you\'re the author. Please note that deleting a recipe is permanent.',
  },
  {
    question: 'How do I report inappropriate content?',
    answer:
      'If you find content that violates our community guidelines, please contact us through this form with the recipe link and a brief description of the issue. We\'ll review it promptly.',
  },
  {
    question: 'Can I use recipes from FlavorShare commercially?',
    answer:
      'Recipes shared on FlavorShare are for personal use. If you\'d like to use a recipe commercially, please contact the original author directly for permission.',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      await createMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Hero */}
      <section className='bg-primary text-primary-foreground py-16 md:py-20'>
        <div className='container mx-auto px-4 text-center'>
          <div className='inline-flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full text-sm font-medium mb-6'>
            <MessageSquare className='h-4 w-4' />
            Get in Touch
          </div>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>Contact Us</h1>
          <p className='text-primary-foreground/80 max-w-xl mx-auto'>
            Have a question, suggestion, or feedback? We\'d love to hear from you.
          </p>
        </div>
      </section>

      <div className='container mx-auto px-4 py-12'>
        <div className='grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto'>
          {/* Contact Form */}
          <div className='lg:col-span-2'>
            <Card className='bg-card'>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className='space-y-5'>
                  <div className='grid sm:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='name'>
                        Name <span className='text-destructive'>*</span>
                      </Label>
                      <Input
                        id='name'
                        name='name'
                        placeholder='Your name'
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='email'>
                        Email <span className='text-destructive'>*</span>
                      </Label>
                      <Input
                        id='email'
                        name='email'
                        type='email'
                        placeholder='you@example.com'
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='subject'>Subject</Label>
                    <Input
                      id='subject'
                      name='subject'
                      placeholder='What is this about?'
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='message'>
                      Message <span className='text-destructive'>*</span>
                    </Label>
                    <Textarea
                      id='message'
                      name='message'
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Button type='submit' className='w-full sm:w-auto' disabled={submitting}>
                    <Send className='h-4 w-4 mr-2' />
                    {submitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Contact Info */}
            <Card className='bg-card'>
              <CardHeader>
                <CardTitle className='text-lg'>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {CONTACT_INFO.map((info) => (
                  <div key={info.label} className='flex items-start gap-3'>
                    <div className='h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                      <info.icon className='h-4 w-4 text-primary' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-muted-foreground'>{info.label}</p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className='text-sm hover:text-primary transition-colors'
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className='text-sm'>{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Support Info */}
            <Card className='bg-card border-primary/20'>
              <CardContent className='p-5'>
                <div className='flex items-start gap-3'>
                  <div className='h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                    <HelpCircle className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-sm mb-1'>Support Information</h3>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      We typically respond within <strong>1–2 business days</strong>. For faster help,
                      please include:
                    </p>
                    <ul className='text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside'>
                      <li>Your account email address</li>
                      <li>A detailed description of your issue</li>
                      <li>Any relevant screenshots or links</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className='max-w-3xl mx-auto mt-16'>
          <div className='text-center mb-8'>
            <h2 className='text-2xl md:text-3xl font-bold mb-3'>Frequently Asked Questions</h2>
            <p className='text-muted-foreground'>Quick answers to common questions</p>
          </div>
          <Card className='bg-card'>
            <CardContent className='p-2 md:p-4'>
              <Accordion type='single' collapsible className='w-full'>
                {FAQS.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className='text-left text-sm'>{faq.question}</AccordionTrigger>
                    <AccordionContent className='text-sm text-muted-foreground'>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
