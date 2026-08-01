import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import AddItemForm from './AddItemForm'
import AddCourseForm from './AddCourseForm'
import AddMaterialForm from './AddMaterialForm'
import ScheduleItemRow from './ScheduleItemRow'
import DeleteCourseButton from './DeleteCourseButton'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const [
    { data: courses },
    { data: items }
  ] = await Promise.all([
    supabase.from('courses').select('id, name, term, course_memberships(count)'),
    supabase.from('schedule_items').select('id, title, item_type, due_at, course_id, courses(name), file_path').order('due_at', { ascending: true })
  ])

  const coursesList = courses ?? []
  const itemsList = items ?? []

  return (
    <>
      
      <h1>Add to the schedule</h1>

      <h2 className="stagger-item" style={{ animationDelay: '150ms' } as React.CSSProperties}>
        Schedule Items
      </h2>
      <div className="admin-card stagger-item" style={{ animationDelay: '200ms' } as React.CSSProperties}>
        <AddItemForm courses={coursesList} />
      </div>

      <h2 className="stagger-item" style={{ animationDelay: '250ms' } as React.CSSProperties}>
        Create Course
      </h2>
      <div className="admin-card stagger-item" style={{ animationDelay: '300ms' } as React.CSSProperties}>
        <AddCourseForm />
      </div>

      <h2 className="stagger-item" style={{ animationDelay: '350ms' } as React.CSSProperties}>
        Upload Material
      </h2>
      <div className="admin-card stagger-item" style={{ animationDelay: '400ms' } as React.CSSProperties}>
        <AddMaterialForm courses={coursesList} />
      </div>

      <h2 className="stagger-item" style={{ animationDelay: '350ms' } as React.CSSProperties}>
        Courses
      </h2>
      <ul style={{ marginBottom: 32 }}>
        {coursesList.map((c: any, index: number) => (
          <li
            key={c.id}
            className="stagger-item"
            style={{ animationDelay: `${(index + 7) * 60}ms` } as React.CSSProperties}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div className="item-title" style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{c.name}{c.term ? ` (${c.term})` : ''}</span>
                <span style={{ fontSize: '0.85rem', opacity: 0.7, fontWeight: 'normal', marginTop: '4px' }}>
                  {c.course_memberships?.[0]?.count || 0} student{c.course_memberships?.[0]?.count === 1 ? '' : 's'} enrolled
                </span>
              </div>
              <DeleteCourseButton courseId={c.id} />
            </div>
          </li>
        ))}
      </ul>

      <h2 className="stagger-item" style={{ animationDelay: '400ms' } as React.CSSProperties}>
        Everything currently scheduled
      </h2>
      <ul>
        {itemsList.map((item: any, index: number) => (
          <ScheduleItemRow
            key={item.id}
            item={item}
            courses={coursesList}
            delay={`${(coursesList.length + index + 8) * 60}ms`}
          />
        ))}
      </ul>
    </>
  )
}