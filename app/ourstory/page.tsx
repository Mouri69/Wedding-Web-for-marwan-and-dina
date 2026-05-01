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
          </h1>
          <div
            style={{
              maxWidth: '820px',
              margin: '2.5rem auto 0 auto',
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(198, 167, 105, 0.28)',
              borderRadius: '16px',
              padding: '1.25rem',
              boxShadow: '0 14px 40px rgba(0, 0, 0, 0.08)',
            }}
          >
            <img
              src="/ourstory-image.jpeg"
              alt="Our story memory"
              style={{
                width: '100%',
                maxHeight: '520px',
                objectFit: 'cover',
                borderRadius: '12px',
                display: 'block',
              }}
            />
            <p
              style={{
                marginTop: '1.25rem',
                color: '#3B3131',
                fontSize: '1.1rem',
                lineHeight: 1.85,
                fontFamily: 'Lora, serif',
                textAlign: 'center',
              }}
            >
              "Same roots, shared childhood, and a lifetime of memories - that&apos;s where our story begins.
              We&apos;ve been part of each other&apos;s journey every step of the way. What started as a familiar
              connection slowly blossomed into a love story we never saw coming, but always felt."
            </p>
          </div>
        </Container>
      </div>
    </div>
  )
}
