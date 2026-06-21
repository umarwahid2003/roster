'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
      <Link href="/dashboard" className="brand">
  <Image src="/icon-192.png" alt="Roster" width={32} height={32} />
</Link>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/courses">Courses</Link>
      {isAdmin && <Link href="/admin">Admin</Link>}
      <button onClick={signOut}>Sign out</button>
    </nav>
  )
}