'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { Course } from '@/types';
import { CourseCard } from '@/components/CourseCard';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const stats = [
    { label: 'Active learners', value: '2.4k+' },
    { label: 'Hours of content', value: '380+' },
    { label: 'Avg. satisfaction', value: '4.9/5' },
  ];

  const highlights = [
    'Streamlined course & lecture builder',
    'Secure PDF delivery with instant previews',
    'Realtime analytics-ready API foundation',
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const { data } = await api.get<Course[]>('/courses');
        setCourses(data);
        
        // Fetch user profile if logged in
        try {
          const { data: userData } = await api.get('/auth/profile');
          setUser(userData.user);
        } catch (error) {
          // User not logged in, that's fine
          setUser(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="space-y-12 pb-12 relative">
      <div className="glass-panel flex flex-col gap-10 lg:flex-row card-hover">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.3em] text-purple-200/80">Next-gen LMS</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white lg:text-5xl">
            Build cinematic learning experiences your students will remember.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Manage enrollments, publish lectures with video + PDF resources, and keep admins in flow
            with a polished dashboard powered by Node.js, PostgreSQL, and Next.js.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
              onClick={() => router.push('/signup')}
            >
              Create account
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 bg-transparent text-white backdrop-blur hover:bg-white/10"
              onClick={() => router.push('/login')}
            >
              Admin login
            </Button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div 
                key={stat.label} 
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-4 backdrop-blur-sm transition-all duration-300 hover:border-purple-400/30 hover:from-purple-500/20 hover:to-indigo-500/20 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <p className="text-2xl font-semibold bg-gradient-to-r from-purple-200 to-cyan-200 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-4 rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-500/40 via-indigo-600/30 to-slate-900/70 p-8 shadow-2xl shadow-purple-500/20 backdrop-blur-xl transition-all duration-300 hover:border-purple-400/40 hover:shadow-purple-500/30 hover:scale-[1.02]">
          <p className="text-sm font-medium text-purple-100">Why teams choose LMS Studio</p>
          <ul className="space-y-4 text-sm text-purple-50/90">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-white/80" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-2xl border border-white/20 bg-black/30 p-4 text-sm text-purple-100/80">
            “This stack lets us launch premium curriculum in days, not months.”
            <p className="mt-2 text-xs uppercase tracking-wide text-white/60">— Product teams</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-widest text-purple-200/70">Curriculum</p>
            <h2 className="text-3xl font-semibold text-white">Featured Courses</h2>
          </div>
          {user?.role === 'admin' && (
            <Button
              variant="ghost"
              className="text-purple-100 hover:bg-white/10"
              onClick={() => router.push('/add-course')}
            >
              Add new
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-muted-foreground">No courses available yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.course_id}
                course={course}
                onView={(id) => router.push(`/course/${id}`)}
              />
            ))}
          </div>
        )}
    </div>
    </section>
  );
}
