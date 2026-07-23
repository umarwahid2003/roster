import './globals.css'
import { Inter, Space_Grotesk } from 'next/font/google'
import SpaceMesh from '@/components/SpaceMesh'
import LayoutHeader from '@/components/LayoutHeader'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata = {
  title: 'Roster',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <div className="glow">
          <span></span>
          <span></span>
        </div>
        <SpaceMesh />
        <div className="grain"></div>
        <div className="vignette"></div>

        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <filter id="grainFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" result="noise" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0" />
          </filter>
        </svg>
        <LayoutHeader />
        {children}
        <Analytics />
      </body>
    </html>
  )
}