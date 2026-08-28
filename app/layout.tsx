import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Climate Globe - Global Greenhouse Gas Emissions',
  description: 'Interactive 3D globe of global greenhouse gas emissions from Climate TRACE',
}

export const viewport: Viewport = {
  themeColor: '#0a0e1a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
