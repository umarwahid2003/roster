import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import JoinButton from './JoinButton'

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: courses } = await supabase.from('courses').select('id, name, term')
  const { data: memberships } = await supabase
    .from('course_memberships')
    .select('course_id')
    .eq('user_id', user.id)

  const joinedIds = new Set((memberships ?? []).map((m) => m.course_id))

  return (
    <main className="container">
      <Nav isAdmin={profile?.role === 'admin'} />
      <h1>Courses</h1>
      <ul>
        {(courses ?? []).map((course) => (
          <li key={course.id} className="course-row">
            <div>
              <div className="item-title">{course.name}</div>
              <div className="item-due">{course.term}</div>
            </div>
            {joinedIds.has(course.id) ? (
              <span className="muted">Joined</span>
            ) : (
              <JoinButton courseId={course.id} />
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
