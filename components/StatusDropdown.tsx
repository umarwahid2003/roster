'use client'

import { useState, useEffect, useRef } from 'react'

type ProgressStatus = 'not_started' | 'in_progress' | 'submitted'
type OpenDirection = 'above' | 'below'

export default function StatusDropdown({
  itemId,
  userId,
}: {
  itemId: string
  userId: string
}) {
  const [status, setStatus] = useState<ProgressStatus>('not_started')
  const [isOpen, setIsOpen] = useState(false)
  const [direction, setDirection] = useState<OpenDirection>('below')
  
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const storageKey = `roster_status_${userId}_${itemId}`

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey) as ProgressStatus | null
    if (saved === 'in_progress' || saved === 'submitted') {
      setStatus(saved)
    }
  }, [storageKey])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Measure space and open dropdown
  const toggleDropdown = () => {
    if (!isOpen && triggerRef.current) {
      const buttonRect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - buttonRect.bottom
      
      // If there is less than 240px of vertical space below the dropdown
      // and there is more space above, open it upwards.
      if (spaceBelow < 240 && buttonRect.top > spaceBelow) {
        setDirection('above')
      } else {
        setDirection('below')
      }
    }
    setIsOpen(!isOpen)
  }

  // Handle changes
  const selectStatus = (newStatus: ProgressStatus) => {
    setStatus(newStatus)
    setIsOpen(false)
    if (newStatus === 'not_started') {
      localStorage.removeItem(storageKey)
    } else {
      localStorage.setItem(storageKey, newStatus)
    }
  }

  // Helper to format visual labels
  const getStatusDetails = (s: ProgressStatus) => {
    switch (s) {
      case 'in_progress':
        return { label: 'In progress', className: 'status-in_progress' }
      case 'submitted':
        return { label: 'Done', className: 'status-submitted' }
      default:
        return { label: 'Not started', className: 'status-not_started' }
    }
  }

  const activeDetails = getStatusDetails(status)

  return (
    <div className="status-dropdown-container" ref={containerRef}>
      {/* Trigger Pill */}
      <button
        ref={triggerRef}
        type="button"
        className={`status-pill ${activeDetails.className}`}
        onClick={toggleDropdown}
      >
        <span className="status-dot" />
        {activeDetails.label}
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className={`status-menu menu-${direction}`}>
          {/* To-Do Section */}
          <div className="status-section">
            <span className="status-section-title">To-do</span>
            <button
              type="button"
              className="status-option option-not_started"
              onClick={() => selectStatus('not_started')}
            >
              Not started
            </button>
          </div>

          {/* In Progress Section */}
          <div className="status-section">
            <span className="status-section-title">In progress</span>
            <button
              type="button"
              className="status-option option-in_progress"
              onClick={() => selectStatus('in_progress')}
            >
              In progress
            </button>
          </div>

          {/* Complete Section */}
          <div className="status-section">
            <span className="status-section-title">Complete</span>
            <button
              type="button"
              className="status-option option-submitted"
              onClick={() => selectStatus('submitted')}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
