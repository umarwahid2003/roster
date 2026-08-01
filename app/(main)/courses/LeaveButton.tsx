'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LeaveButton({ courseId }: { courseId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function leave() {
    setIsLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }

    const { error } = await supabase
      .from('course_memberships')
      .delete()
      .eq('user_id', user.id)
      .eq('course_id', courseId)

    if (error) {
      console.error('Error leaving course:', error.message)
    }

    setIsLoading(false)
    router.refresh()
  }

  return (
    <button
      type="button"
      className="leave-btn"
      onClick={leave}
      disabled={isLoading}
    >
      {isLoading ? 'Leaving...' : 'Leave'}
    </button>
  )
}
