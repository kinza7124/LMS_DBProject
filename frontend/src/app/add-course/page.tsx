'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function AddCoursePage() {
  const router = useRouter();
  useAuthGuard();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    code: '',
    title: '',
    description: '',
    thumbnailUrl: '',
    credits: '3',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setUser(data.user);
        if (data.user.role !== 'admin') {
          router.push('/dashboard');
        }
      } catch (error) {
        router.push('/login');
      }
    };
    checkUser();
  }, [router]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/courses', {
        ...form,
        credits: Number(form.credits) || 3,
      });
      setSuccess('Course created successfully');
      setForm({
        code: '',
        title: '',
        description: '',
        thumbnailUrl: '',
        credits: '3',
        content: '',
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Failed to create course. Are you logged in as admin?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a new course</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="code">Course Code</Label>
            <Input
              id="code"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="CS-201"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Intro to Algorithms"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What will learners accomplish?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              name="thumbnailUrl"
              value={form.thumbnailUrl}
              onChange={handleChange}
              placeholder="https://images.example.com/course.png"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                name="credits"
                type="number"
                min={1}
                value={form.credits}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Syllabus Highlights</Label>
              <Input
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Weeks, modules, deliverables..."
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Create course'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

