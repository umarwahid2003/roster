'use client'

import { useEffect, useState } from 'react'

type ScheduleItem = {
  id: string
  item_type: string
}

export default function DashboardSummaryText({
  items,
  userId,
}: {
  items: ScheduleItem[]
  userId: string
}) {
  const [assignmentCount, setAssignmentCount] = useState(0)
  const [quizCount, setQuizCount] = useState(0)

  useEffect(() => {
    const calculateCounts = () => {
      let assignments = 0
      let quizzes = 0

      items.forEach((item) => {
        if (item.item_type === 'assignment') {
          const storageKey = `roster_status_${userId}_${item.id}`
          const savedStatus = localStorage.getItem(storageKey)
          // Exclude assignments that are marked as 'submitted' ('Done')
          if (savedStatus !== 'submitted') {
            assignments++
          }
        } else if (item.item_type === 'quiz') {
          quizzes++
        }
      })

      setAssignmentCount(assignments)
      setQuizCount(quizzes)
    }

    calculateCounts()

    // Listen to custom event for status changes
    window.addEventListener('roster_status_change', calculateCounts)
    // Also listen to standard storage event for cross-tab updates
    window.addEventListener('storage', calculateCounts)

    return () => {
      window.removeEventListener('roster_status_change', calculateCounts)
      window.removeEventListener('storage', calculateCounts)
    }
  }, [items, userId])

  return (
    <div className="dashboard-text-summary stagger-item" style={{ animationDelay: '150ms' } as React.CSSProperties}>
      <div className="summary-text-line">
        <span className="summary-bullet bullet-assignment" />
        <span>Assignments due (total): <strong className="highlight-count">{assignmentCount}</strong></span>
      </div>
      <div className="summary-text-line">
        <span className="summary-bullet bullet-quiz" />
        <span>Quizzes due (total): <strong className="highlight-count">{quizCount}</strong></span>
      </div>
    </div>
  )
}
