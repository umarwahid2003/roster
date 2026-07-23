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
      <button onClick={signOut}>Sign out</button>
    </nav>
  )
}