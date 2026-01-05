'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Admin' },
];

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [specialtyTags, setSpecialtyTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering form after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Parse specialty tags (comma-separated keywords)
      const tagsArray = role === 'teacher' && specialtyTags
        ? specialtyTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      const { data } = await api.post('/auth/register', {
        fullName,
        email,
        password,
        role,
        specialtyTags: tagsArray,
      });
      // Registration successful - show verification message
      router.push(`/verify-email-sent?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-xl border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Create an account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign up to start building courses, uploading lectures, and tracking enrollments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-10 w-full rounded-md bg-white/5 animate-pulse" />
              <div className="h-10 w-full rounded-md bg-white/5 animate-pulse" />
              <div className="h-10 w-full rounded-md bg-white/5 animate-pulse" />
              <div className="h-10 w-full rounded-md bg-white/5 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-xl border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Create an account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign up to start building courses, uploading lectures, and tracking enrollments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} suppressHydrationWarning>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Olivia Instructor"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {roles.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {role === 'teacher' && (
              <div className="space-y-2">
                <Label htmlFor="specialtyTags">
                  Specialty Tags (Keywords)
                  <span className="text-xs text-muted-foreground ml-2">
                    Comma-separated keywords like: mathematics, calculus, algebra
                  </span>
                </Label>
                <Input
                  id="specialtyTags"
                  name="specialtyTags"
                  value={specialtyTags}
                  onChange={(event) => setSpecialtyTags(event.target.value)}
                  placeholder="mathematics, calculus, algebra"
                />
                <p className="text-xs text-muted-foreground">
                  Enter keywords that describe your teaching specialties. These will be matched with course requirements.
                </p>
              </div>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-indigo-500" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                className="text-purple-400 underline-offset-4 hover:underline"
                onClick={() => router.push('/login')}
              >
                Sign in
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

