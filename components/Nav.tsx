'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Nav({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/exams">Exams</Link>
      <Link href="/courses">Courses</Link>
      <Link href="/materials">Materials</Link>
      {isAdmin && <Link href="/admin">Admin</Link>}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/about">About</Link>
        <button onClick={signOut} style={{ margin: 0 }}>Sign out</button>
      </div>
    </nav>
  )
}