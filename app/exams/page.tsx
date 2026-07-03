import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'

type ExamItem = {
  id: string
  title: string
  item_type: string
  due_at: string
  courses: { name: string } | null
}

export default async function ExamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Fetch exams sorted chronologically
  const { data: items } = await supabase
    .from('schedule_items')
    .select('id, title, item_type, due_at, courses(name)')
    .eq('item_type', 'exam')
    .order('due_at', { ascending: true })

  const exams = (items ?? []) as unknown as ExamItem[]

  // Helper function to format date for the calendar visual widget
  function getCalendarParts(dateStr: string) {
    const d = new Date(dateStr)
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return {
      month: months[d.getMonth()],
      dayNum: d.getDate(),
      dayName: days[d.getDay()],
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <main className="container">
      <Nav isAdmin={profile?.role === 'admin'} />
      
      <h1>Exam Timetable</h1>

      {exams.length === 0 ? (
        <div className="admin-card stagger-item" style={{ animationDelay: '200ms', textAlign: 'center', marginTop: 32 } as React.CSSProperties}>
          <p className="muted" style={{ margin: 0 }}>No exams scheduled. You are fully prepared!</p>
        </div>
      ) : (
        <div className="timetable-list">
          {exams.map((exam, index) => {
            const dateParts = getCalendarParts(exam.due_at)
            return (
              <div
                key={exam.id}
                className="timetable-card stagger-item"
                style={{ animationDelay: `${(index + 3) * 60}ms` } as React.CSSProperties}
              >
                {/* Calendar visual widget */}
                <div className="calendar-widget">
                  <span className="cal-month">{dateParts.month}</span>
                  <span className="cal-day-num">{dateParts.dayNum}</span>
                  <span className="cal-day-name">{dateParts.dayName}</span>
                </div>

                {/* Details section */}
                <div className="timetable-details">
                  <div className="item-course">{exam.courses?.name}</div>
                  <div className="timetable-title">{exam.title}</div>
                  <div className="timetable-time">
                    <svg className="clock-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {dateParts.time}
                  </div>
                </div>


              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
