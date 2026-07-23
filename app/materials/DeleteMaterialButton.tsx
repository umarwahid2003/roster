'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteMaterialButton({ materialId, filePath }: { materialId: string, filePath: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function deleteMaterial() {
    if (!confirm('Are you sure you want to delete this material?')) return
    setIsDeleting(true)
    const supabase = createClient()
    
    // 1. Delete from database
    const { error: dbError } = await supabase.from('course_materials').delete().eq('id', materialId)
    if (dbError) {
      alert(`Database error: ${dbError.message}`)
      setIsDeleting(false)
      return
    }

    // 2. Delete from storage
    const { error: storageError } = await supabase.storage.from('materials').remove([filePath])
    if (storageError) {
      alert(`Storage error: ${storageError.message}`)
      // Proceed to refresh anyway since DB row is gone
    }

    setIsDeleting(false)
    router.refresh()
  }

  return (
    <button 
      type="button" 
      className="leave-btn" 
      onClick={deleteMaterial}
      disabled={isDeleting}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
