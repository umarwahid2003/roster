'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Nav({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter()
  const pathname = usePathname()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav>
      <Link href="/dashboard" className={pathname === '/dashboard' ? 'current' : ''}>Dashboard</Link>
      <Link href="/exams" className={pathname === '/exams' ? 'current' : ''}>Exams</Link>
      <Link href="/courses" className={pathname === '/courses' ? 'current' : ''}>Courses</Link>
      <Link href="/materials" className={pathname === '/materials' ? 'current' : ''}>Materials</Link>
      {isAdmin && <Link href="/admin" className={pathname === '/admin' ? 'current' : ''}>Admin</Link>}
      <Link href="/about" className={pathname === '/about' ? 'current' : ''}>About</Link>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={signOut} style={{ margin: 0 }}>Sign out</button>
      </div>
    </nav>
  )
}