'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function JoinButton({ courseId }: { courseId: string }) {
  const router = useRouter()

  async function join() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('course_memberships').insert({ user_id: user.id, course_id: courseId })
    router.refresh()
  }

  return <button onClick={join}>Join</button>
}
