import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import NotificationBanner from '@/components/NotificationBanner'
import { formatDueDate } from '@/lib/formatDate'
import StatusDropdown from '@/components/StatusDropdown'
import DashboardSummaryText from '@/components/DashboardSummaryText'
import { getCourseSlot } from '@/lib/courseSlots'


type ScheduleItem = {
  id: string
  title: string
  item_type: string
  due_at: string
  course_id: string
  file_path?: string | null
  courses: { id: string; name: string } | null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Fetch the courses the user has joined
  const { data: memberships } = await supabase
    .from('course_memberships')
    .select('course_id, courses(id, name)')

  const joinedCourses = (memberships ?? [])
    .map((m: any) => m.courses)
    .filter(Boolean) as { id: string; name: string }[]

  // Fetch schedule items
  const { data: items } = await supabase
    .from('schedule_items')
    .select('id, title, item_type, due_at, course_id, file_path, courses(id, name)')
    .order('due_at', { ascending: true })

  const list = (items ?? []) as unknown as ScheduleItem[]

  return (
    <main className="container">
      <Nav isAdmin={profile?.role === 'admin'} />
      
      <DashboardSummaryText items={list} userId={user.id} />

      <div className="stagger-item" style={{ animationDelay: '250ms' } as React.CSSProperties}>
        <NotificationBanner />
      </div>

      {joinedCourses.length === 0 ? (
        <div className="admin-card stagger-item" style={{ animationDelay: '300ms', textAlign: 'center', marginTop: 32 } as React.CSSProperties}>
          <p className="muted" style={{ margin: 0 }}>You haven't joined any courses yet. Join some subjects to track assignments!</p>
          <Link href="/courses" className="status-pill status-in_progress" style={{ display: 'inline-flex', marginTop: 16, textDecoration: 'none' }}>
            <span className="status-dot" />
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="dashboard-grid">
          {joinedCourses.map((course, index) => {
            const courseItems = list.filter((i) => i.course_id === course.id && i.item_type !== 'exam')
            return (
              <div
                key={course.id}
                className="course-column stagger-item"
                style={{ animationDelay: `${(index + 5) * 60}ms` } as React.CSSProperties}
              >
                <h2 className="course-column-title" style={{ textAlign: 'center' }}>
                  {course.name}
                  {getCourseSlot(course.name) && (
                    <span style={{ display: 'block', textAlign: 'center', fontSize: '11px', color: 'var(--muted)', marginTop: '4px', textTransform: 'none', letterSpacing: 'normal' }}>
                      {getCourseSlot(course.name)}
                    </span>
                  )}
                </h2>
                {courseItems.length === 0 ? (
                  <p className="no-tasks">All caught up!</p>
                ) : (
                  <ul className="course-tasks-list">
                    {courseItems.map((item) => (
                      <li
                        key={item.id}
                        className={`type-${item.item_type} course-task-item`}
                      >
                        <div className="item-title" style={{ fontWeight: 600, fontSize: '14px', wordBreak: 'break-word' }}>
                          {item.title}
                          {item.file_path && (
                            <a 
                              href={supabase.storage.from('materials').getPublicUrl(item.file_path).data.publicUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ display: 'block', marginTop: 4, fontSize: 12, color: 'var(--accent)', textDecoration: 'underline' }}
                            >
                              Download Attachment
                            </a>
                          )}
                        </div>
                        <div className={`item-badge badge-${item.item_type}`}>
                          {item.item_type}
                        </div>
                        <div className="item-due" style={{ marginTop: 4, fontSize: '11px', color: 'var(--muted)' }}>
                          Due {formatDueDate(item.due_at)}
                        </div>
                        <StatusDropdown itemId={item.id} userId={user.id} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
