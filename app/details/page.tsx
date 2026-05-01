'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const TIMELINE_ITEMS = [
  { key: 'meet-greet', label: 'Meet & Greet', icon: '⛪' },
  { key: 'ceremony', label: 'The Ceremony', icon: '💍' },
  { key: 'cocktails', label: 'Cocktails & Canapes', icon: '🥂' },
  { key: 'photos', label: 'Photos', icon: '📸' },
  { key: 'cake-cutting', label: 'Cake Cutting', icon: '🎂' },
  { key: 'dinner', label: 'Dinner', icon: '🍽️' },
  { key: 'party', label: 'Party', icon: '🪩' },
  { key: 'farewells', label: 'Farewells', icon: '🚗' },
]

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(target.getTime() - Date.now())
  useEffect(() => {
    const t = setInterval(() => setDiff(target.getTime() - Date.now()), 1000)
    return () => clearInterval(t)
  }, [target])
  const d = Math.max(0, Math.floor(diff / 86400000))
  const h = Math.max(0, Math.floor((diff % 86400000) / 3600000))
  const m = Math.max(0, Math.floor((diff % 3600000) / 60000))
  const s = Math.max(0, Math.floor((diff % 60000) / 1000))
  return { d, h: String(h).padStart(2,'0'), m: String(m).padStart(2,'0'), s: String(s).padStart(2,'0') }
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '3rem 0' }}>
      <div style={{ height: '1px', width: '60px', background: '#C6A769' }} />
      <span style={{ color: '#C6A769', fontSize: '0.8rem', letterSpacing: '0.2em' }}>✦</span>
      <div style={{ height: '1px', width: '60px', background: '#C6A769' }} />
    </div>
  )
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
      {children}
    </div>
  )
}

function Section({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ padding: '5rem 0' }}>
      <Container>{children}</Container>
    </section>
  )
}

export default function DetailsPage() {
  const WEDDING_DATE = new Date('2026-05-26T18:00:00')
  const countdown = useCountdown(WEDDING_DATE)
  const [currentTimelineEvent, setCurrentTimelineEvent] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadCurrentEvent() {
      try {
        const res = await fetch('/api/timeline/current')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) {
          setCurrentTimelineEvent(typeof data.currentEvent === 'string' ? data.currentEvent : null)
        }
      } catch (err) {
        console.error('Failed to load timeline current event:', err)
      }
    }

    loadCurrentEvent()
    const timer = setInterval(loadCurrentEvent, 10000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

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

      {/* Countdown */}
      <Section id="countdown">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 500, 
            color: '#1A1A1A', 
            marginBottom: '1rem',
            fontFamily: 'Playfair Display, serif'
          }}>
            The countdown is on!
          </h2>
          <Divider />
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 'clamp(1rem, 4vw, 3rem)',
          flexWrap: 'wrap',
          marginBottom: '3rem'
        }}>
          {[
            { val: countdown.d, label: 'Days' },
            { val: countdown.h, label: 'Hours' },
            { val: countdown.m, label: 'Minutes' },
            { val: countdown.s, label: 'Seconds' }
          ].map((item, index) => (
            <div key={index} style={{ textAlign: 'center', minWidth: '100px' }}>
              <div style={{ 
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                color: '#C6A769',
                fontWeight: 600
              }}>
                {item.val}
              </div>
              <div style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: '#4A4A4A',
                marginTop: '0.5rem'
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55215.78!2d30.9985!3d30.7987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f7c4dc6e7b7b33%3A0x2bb5c0ca2c495e05!2sTanta%2C+Gharbia+Governorate!5e0!3m2!1sen!2seg!4v1234567890"
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
          />
        </div>
      </Section>

      <Section id="timeline">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2
            style={{
              fontSize: '2.5rem',
              fontWeight: 500,
              color: '#1A1A1A',
              marginBottom: '1rem',
              fontFamily: '"Great Vibes", cursive',
            }}
          >
            Our Timeline
          </h2>
          <Divider />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1rem',
          }}
        >
          {TIMELINE_ITEMS.map((item) => {
            const isActive = currentTimelineEvent === item.key
            return (
              <div
                key={item.key}
                style={{
                  borderRadius: '16px',
                  padding: '1.25rem 1rem',
                  textAlign: 'center',
                  border: isActive ? '2px solid #C6A769' : '1px solid rgba(198, 167, 105, 0.25)',
                  background: isActive ? 'rgba(198, 167, 105, 0.18)' : 'rgba(255, 255, 255, 0.65)',
                  boxShadow: isActive ? '0 10px 22px rgba(198, 167, 105, 0.25)' : 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <div
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '1.2rem',
                    color: '#1A1A1A',
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {item.label}
                </div>
                {isActive && (
                  <div
                    style={{
                      marginTop: '0.45rem',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.72rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#7B5A1E',
                    }}
                  >
                    Happening now
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
