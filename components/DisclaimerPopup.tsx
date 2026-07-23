'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DisclaimerPopup({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  async function handleAccept() {
    setIsUpdating(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ has_accepted_disclaimer: true }).eq('id', userId)
    setIsOpen(false)
    router.refresh()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ marginTop: 0, color: 'var(--danger)', fontSize: '18px' }}>Disclaimer</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text)', margin: 0 }}>
            Roster is an independent, student-built project and is not affiliated with, endorsed by, or officially connected to Iqra University or its administration in any way. All course materials shared through the app are provided by students for peer use and are not officially distributed or verified by the university.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text)', margin: 0 }}>
            Roster is provided as-is, with no guarantee of uptime, accuracy, or completeness of deadline data — always cross-check critical deadlines against official university sources (LMS, course instructor, or department notices). The developer is not responsible for missed deadlines resulting from app errors, notification delays, or outdated course material.
          </p>
        </div>
        <button onClick={handleAccept} disabled={isUpdating} style={{ marginTop: '16px' }}>
          {isUpdating ? 'Saving...' : 'I have read this'}
        </button>
      </div>
    </div>
  )
}
