'use client'

import { useEffect, useRef } from 'react'

export default function SpaceMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const gridSize = 36 // space between grid lines
    const influenceRadius = 150 // hover influence radius
    const maxDisplacement = 26 // bending displacement strength

    // Handle Resize
    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    // Handle Mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      mouseRef.current.active = true
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Set mesh line style (subtle grid matching globals.css colors)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)'
      ctx.lineWidth = 1

      const mouse = mouseRef.current

      // Calculate grid size dimensions
      const cols = Math.ceil(width / gridSize) + 1
      const rows = Math.ceil(height / gridSize) + 1

      // Prepare a 2D array of warped grid points
      const points: { x: number; y: number }[][] = []

      for (let r = 0; r < rows; r++) {
        points[r] = []
        for (let c = 0; c < cols; c++) {
          const x0 = c * gridSize
          const y0 = r * gridSize

          let x = x0
          let y = y0

          if (mouse.active) {
            const dx = x0 - mouse.x
            const dy = y0 - mouse.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < influenceRadius) {
              // Smooth interpolation factor (1 at center mouse, 0 at bounds)
              const force = (influenceRadius - dist) / influenceRadius
              // Smooth step ease curve
              const easeForce = force * force * (3 - 2 * force)

              // Push the grid points away from the cursor coordinate
              const displacement = easeForce * maxDisplacement
              x = x0 + (dx / (dist || 1)) * displacement
              y = y0 + (dy / (dist || 1)) * displacement
            }
          }

          points[r][c] = { x, y }
        }
      }

      // Draw grid lines
      // Horizontal lines
      for (let r = 0; r < rows; r++) {
        ctx.beginPath()
        ctx.moveTo(points[r][0].x, points[r][0].y)
        for (let c = 1; c < cols; c++) {
          ctx.lineTo(points[r][c].x, points[r][c].y)
        }
        ctx.stroke()
      }

      // Vertical lines
      for (let c = 0; c < cols; c++) {
        ctx.beginPath()
        ctx.moveTo(points[0][c].x, points[0][c].y)
        for (let r = 1; r < rows; r++) {
          ctx.lineTo(points[r][c].x, points[r][c].y)
        }
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  )
}
