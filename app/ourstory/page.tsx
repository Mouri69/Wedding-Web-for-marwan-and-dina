'use client'
import Link from 'next/link'

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
      {children}
    </div>
  )
}

export default function OurStoryPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8F5F0', overflowX: 'hidden' }}>
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        background: 'rgba(248, 245, 240, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(198, 167, 105, 0.2)',
        padding: '1.5rem 0'
      }}>
        <Container>
          <Link href="/" style={{ 
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#2A2A2A',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ← Back to Home
          </Link>
        </Container>
      </div>

      <div style={{ padding: '5rem 0', textAlign: 'center' }}>
        <Container>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 500, 
            color: '#1A1A1A', 
            marginBottom: '1rem',
            fontFamily: 'Playfair Display, serif'
          }}>
            Our Story
          </h1>
          <p style={{ color: '#4A4A4A', fontSize: '1.1rem' }}>
            Coming soon...
          </p>
        </Container>
      </div>
    </div>
  )
}
