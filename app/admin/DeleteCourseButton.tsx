'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function deleteCourse() {
    if (!confirm('Are you sure you want to delete this course?')) return
    setIsDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('courses').delete().eq('id', courseId)
    if (error) {
      alert(error.message)
      setIsDeleting(false)
      return
    }
    router.refresh()
  }

  return (
    <button 
      type="button" 
      className="leave-btn" 
      onClick={deleteCourse}
      disabled={isDeleting}
      style={{ marginLeft: '8px' }}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
