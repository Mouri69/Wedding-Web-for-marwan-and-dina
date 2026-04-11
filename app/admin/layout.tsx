import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — Marwan & Dina Wedding',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
