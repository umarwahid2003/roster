'use client'

import { usePathname } from 'next/navigation'
import Typewriter from './Typewriter'

export default function LayoutHeader() {
  const pathname = usePathname()

  // Do not show the main layout logo header on the login screen
  if (pathname === '/login') return null

  return (
    <div className="layout-brand">
      <div className="title-wordmark wordmark">
        <Typewriter text="roster" speed={110} />
      </div>
    </div>
  )
}
