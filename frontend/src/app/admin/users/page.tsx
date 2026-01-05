'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const router = useRouter();
  useAuthGuard();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const params = filter !== 'all' ? { role: filter } : {};
        const { data } = await api.get<User[]>('/admin/users', { params });
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [filter]);

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter((u) => u.user_id !== userId));
    } catch (error) {
      console.error(error);
      alert('Failed to delete user');
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      setUsers(users.map((u) => (u.user_id === userId ? { ...u, role: newRole as any } : u)));
    } catch (error) {
      console.error(error);
      alert('Failed to update role');
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">User Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage all users: create, update, delete, and assign roles. View student and teacher profiles.
          </p>
        </div>
        <div className="flex gap-2">
          {(['all', 'student', 'teacher', 'admin'] as const).map((role) => (
            <Button
              key={role}
              variant={filter === role ? 'default' : 'outline'}
              onClick={() => setFilter(role)}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground">No users found.</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between rounded-lg border border-white/10 p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium text-white">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Role: {user.role.toUpperCase()} | Created: {new Date(user.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                      className="rounded border border-white/20 bg-white/5 px-3 py-1 text-white"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user.user_id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

