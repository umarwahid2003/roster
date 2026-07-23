import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'

export default async function AboutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <main className="container">
      {user && <Nav isAdmin={isAdmin} />}
      
      <div className="layout-brand" style={{ padding: '0px 0px 48px', maxWidth: '800px', margin: '0' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '32px' }}>About Roster</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '15px', color: 'var(--text)', lineHeight: '1.6' }}>
          <p>
            Roster is built and maintained by a solo student developer, with one goal: help students stop missing deadlines.
          </p>

          <p>
            Join the courses you're enrolled in, and Roster tracks every assignment, quiz, and deadline for you — with reminders at 12 hours, 1 hour, and 5 minutes before each one hits. You'll also find all course material for your enrolled courses in one place, so you're not digging through group chats and scattered PDFs.
          </p>

          <div>
            <p style={{ marginBottom: '12px' }}>Right now (v1), Roster supports three courses:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ background: 'transparent', border: 'none', padding: 0, margin: 0, display: 'list-item' }}>Software Engineering</li>
              <li style={{ background: 'transparent', border: 'none', padding: 0, margin: 0, display: 'list-item' }}>Multivariable Calculus</li>
              <li style={{ background: 'transparent', border: 'none', padding: 0, margin: 0, display: 'list-item' }}>Virtualization and Cloud Computing</li>
            </ul>
          </div>

          <p>
            More courses are being added regularly, with the goal of eventually covering every course offered at Iqra University — making Roster a one-stop hub for deadlines and material, for every student on campus.
          </p>

          <p>
            Found a bug, or have an idea to make this better? I'd genuinely like to hear it. <br/>
            📧 <a href="mailto:umarwahid2003@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>umarwahid2003@gmail.com</a>
          </p>
          
          <div style={{ marginTop: '32px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <h2 style={{ marginTop: 0, color: 'var(--danger)', fontSize: '14px' }}>Disclaimer</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
              Roster is an independent, student-built project and is not affiliated with, endorsed by, or officially connected to Iqra University or its administration in any way. All course materials shared through the app are provided by students for peer use and are not officially distributed or verified by the university.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
              Roster is provided as-is, with no guarantee of uptime, accuracy, or completeness of deadline data — always cross-check critical deadlines against official university sources (LMS, course instructor, or department notices). The developer is not responsible for missed deadlines resulting from app errors, notification delays, or outdated course material.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
