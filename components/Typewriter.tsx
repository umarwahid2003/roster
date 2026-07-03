'use client'

import { useState, useEffect } from 'react'

export default function Typewriter({
  text,
  speed = 110,
  delay = 0,
  onDone,
  className = '',
}: {
  text: string
  speed?: number
  delay?: number
  onDone?: () => void
  className?: string
}) {
  const [displayedText, setDisplayedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let intervalId: NodeJS.Timeout

    timeoutId = setTimeout(() => {
      let i = 0
      intervalId = setInterval(() => {
        // Use functional state update to safely append text
        setDisplayedText((prev) => {
          const next = text.slice(0, prev.length + 1)
          if (next.length >= text.length) {
            clearInterval(intervalId)
            setTimeout(() => {
              setShowCursor(false)
              if (onDone) onDone()
            }, 500)
          }
          return next
        })
      }, speed)
    }, delay)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [text, speed, delay, onDone])

  return (
    <span className={className}>
      {displayedText}
      {showCursor && <span className="cursor" />}
    </span>
  )
}
