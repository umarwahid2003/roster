import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import NotificationBanner from '@/components/NotificationBanner'

type ScheduleItem = {
  id: string
  title: string
  item_type: string
  due_at: string
  courses: { name: string } | null
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

  const { data: items } = await supabase
    .from('schedule_items')
    .select('id, title, item_type, due_at, courses(name)')
    .order('due_at', { ascending: true })

  const now = Date.now()
  const weekFromNow = now + 7 * 24 * 60 * 60 * 1000
  const list = (items ?? []) as unknown as ScheduleItem[]
  const thisWeek = list.filter((i) => new Date(i.due_at).getTime() <= weekFromNow)
  const later = list.filter((i) => new Date(i.due_at).getTime() > weekFromNow)

  return (
    <main className="container">
      <Nav isAdmin={profile?.role === 'admin'} />
      <h1>Your schedule</h1>
      <NotificationBanner />
      <Section title="This week" items={thisWeek} />
      <Section title="Later" items={later} />
      {list.length === 0 && (
        <p className="muted">Nothing scheduled yet. Join a course to see its deadlines here.</p>
      )}
    </main>
  )
}

function Section({ title, items }: { title: string; items: ScheduleItem[] }) {
  if (items.length === 0) return null
  return (
    <section>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id} className={`type-${item.item_type}`}>
            <div className="item-course">{item.courses?.name}</div>
            <div className="item-title">
              {item.title} · {item.item_type}
            </div>
            <div className="item-due">
              Due {new Date(item.due_at).toLocaleString(undefined, {
                weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
              })}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
