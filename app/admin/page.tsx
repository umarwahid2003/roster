import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import AddItemForm from './AddItemForm'
import AddCourseForm from './AddCourseForm'
import ScheduleItemRow from './ScheduleItemRow'

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

  const { data: courses } = await supabase.from('courses').select('id, name')
  const { data: items } = await supabase
    .from('schedule_items')
    .select('id, title, item_type, due_at, course_id, courses(name)')
    .order('due_at', { ascending: true })

  return (
    <main className="container">
      <Nav isAdmin={true} />
      <h1>Add to the schedule</h1>
      <AddItemForm courses={courses ?? []} />

      <h2>Courses</h2>
      <AddCourseForm />
      <ul>
        {(courses ?? []).map((c: any) => (
          <li key={c.id}>
            <div className="item-title">{c.name}</div>
          </li>
        ))}
      </ul>

      <h2>Everything currently scheduled</h2>
      <ul>
        {(items ?? []).map((item: any) => (
          <ScheduleItemRow key={item.id} item={item} courses={courses ?? []} />
        ))}
      </ul>
    </main>
  )
}