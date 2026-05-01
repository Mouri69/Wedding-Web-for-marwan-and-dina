'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

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

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '3rem 0' }}>
      <div style={{ height: '1px', width: '60px', background: 'var(--light-gold)' }} />
      <span style={{ color: 'var(--light-gold)', fontSize: '0.8rem', letterSpacing: '0.2em' }}>✦</span>
      <div style={{ height: '1px', width: '60px', background: 'var(--light-gold)' }} />
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

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    attendance: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('RSVP Submitted:', formData)
    setSubmitted(true)
    setFormData({ name: '', email: '', attendance: '', message: '' })
    setTimeout(() => setSubmitted(false), 3000)
  }

  const WEDDING_DATE = new Date('2026-05-26T18:00:00')
  const countdown = useCountdown(WEDDING_DATE)



  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)', overflowX: 'hidden' }}>
      <style>{`
        @media (max-width: 768px) {
          #details-section,
          #our-story {
            min-height: 70vh !important;
          }
          #details-section img,
          #our-story img {
            max-width: 100vw !important;
          }
        }
      `}</style>
      {/* Hero Section */}
      <section id="hero" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        backgroundImage: 'url(/oil-paint.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        padding: '2rem 1rem'
      }}>
        {/* Overlay to darken background if needed */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'rgba(0,0,0,0.35)' 
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, animation: 'fadeIn 1.5s ease'}}>
          <img 
            src="/realcloth-marwandena.png" 
            alt="Marwan & Dena"
            style={{ 
              maxWidth: 'min(500px, 90vw)', 
              height: 'auto',
              display: 'block',
              margin: '0 auto'
            }}
          />
          <div style={{ marginTop: '2rem' }}>
            <p style={{ 
              fontFamily: '"Great Vibes", cursive',
              fontSize: 'clamp(1rem, 5.5vw, 2rem)', 
              fontWeight: 400,
              color: '#FEFDFA',
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              marginBottom: '1rem'
            }}>
              Are getting engaged
            </p>
            <p style={{ 
              fontFamily: 'Inter, sans-serif', 
              fontSize: 'clamp(1rem, 2.5vw, 1rem)', 
              color: 'white',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              letterSpacing: '0.15em',
              marginBottom: '0.5rem'
            }}>
              MAY 26 2026
            </p>
            <p style={{ 
              fontFamily: 'Inter, sans-serif', 
              fontSize: 'clamp(1rem, 2.2vw, 1rem)', 
              color: 'white',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              letterSpacing: '0.15em'
            }}>
              TANTA, EGYPT
            </p>
          </div>
        </div>
      </section>

      {/* Plate Image */}
      <Section id="plate">
        <RevealSection>
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
            <img 
              src="/marwan-dina-plate.png" 
              alt="Marwan & Dena"
              style={{ 
                maxWidth: 'min(700px, 90vw)', 
                height: 'auto',
                display: 'block',
                margin: '0 auto 2.5rem auto'
              }}
            />
            <div style={{ 
              fontFamily: 'Playfair Display, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1rem, 1vw, 1rem)',
              textAlign: 'center',
              width: '70%',
              color: 'var(--text-dark)',
              lineHeight: 1.7,
              margin: '0 auto 2rem auto'
            }}>
              <p style={{ marginBottom: '1.2rem' }}>
                As we step into this new chapter, it would mean so much to have you by our 
                side on our special day. On this page, you’ll discover everything you need – 
                the schedule, venue details and a few extra touches.
              </p>
              <p>
                Here’s to love, joy, and the beginning of our forever!
              </p>
            </div>
            <div style={{ 
              fontFamily: '"Great Vibes", cursive',
              fontSize: 'clamp(4rem, 4.5vw, 4rem)',
              marginBottom: '1rem'
            }}>
              Marwan & Dena
            </div>
          </div>
        </RevealSection>
      </Section>

      {/* Details Section */}
      <section id="details-section" style={{ 
        position: 'relative',
        minHeight: '130vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundImage: 'url(/details-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '2rem 1rem'
      }}>
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'rgba(0,0,0,0.25)' 
        }} />
        <RevealSection>
          <Link href="/details" style={{ textDecoration: 'none', position: 'relative', zIndex: 1 }}>
            <img 
              src="/details-removebg.png" 
              alt="Details"
              style={{ 
                maxWidth: 'min(500px, 80vw)', 
                height: 'auto',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            />
          </Link>
        </RevealSection>
      </section>

      {/* Countdown */}
      <Section id="countdown">
        <RevealSection>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ 
              fontFamily: '"Great Vibes", cursive',
              fontSize: '2.5rem', 
              fontWeight: 500, 
              color: 'var(--black)', 
              marginBottom: '1rem'
            }}>
              The countdown is on!
            </h2>
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
              <div key={index} style={{ textAlign: 'center', minWidth: '10px' }}>
                <div style={{ 
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(1rem, 6vw, 2.5rem)',
                  fontWeight: 600
                }}>
                  {item.val}
                </div>
                <div style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: 'var(--text-mid)',
                  marginTop: '0.5rem'
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3427.177883181425!2d30.936254499999997!3d30.797645499999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f7cb73586b070d%3A0x5a4ecc6f12cf58ca!2z2YbYp9iv2Yog2KfZhNi52KjYryDYp9mE2LHZitin2LbZiiAtIEVsIEFiZCBTcG9ydGluZyBDbHVi!5e0!3m2!1sen!2seg!4v1777583920604!5m2!1sen!2seg"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
            />
          </div>
        </RevealSection>
      </Section>

      {/* Our Story Section */}
      <section id="our-story" style={{ 
        position: 'relative',
        minHeight: '130vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundImage: 'url(/ourstory-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '2rem 1rem'
      }}>
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'rgba(0,0,0,0.25)' 
        }} />
        <RevealSection>
          <Link href="/ourstory" style={{ textDecoration: 'none', position: 'relative', zIndex: 1 }}>
            <img 
              src="/ourstory-removebg.png" 
              alt="Our Story"
              style={{ 
                maxWidth: 'min(500px, 80vw)', 
                height: 'auto',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            />
          </Link>
        </RevealSection>
      </section>

      {/* RSVP */}
      <Section id="rsvp">
        <RevealSection>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 500, color: 'var(--black)', marginBottom: '1rem' }}>
              RSVP
            </h2>
            <Divider />
            
            {submitted ? (
              <div style={{ 
                padding: '3rem', 
                background: 'white', 
                border: '1px solid rgba(198, 167, 105, 0.3)',
                textAlign: 'center'
              }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--light-gold)', marginBottom: '1rem' }}>
                  Thank You!
                </h3>
                <p style={{ color: 'var(--text-mid)' }}>Your RSVP has been submitted successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.85rem', 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase',
                    color: 'var(--text-mid)',
                    marginBottom: '0.5rem'
                  }}>
                    Name
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '1rem', 
                      border: '1px solid rgba(198, 167, 105, 0.4)',
                      background: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Inter, sans-serif',
                      color: 'var(--text-dark)'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.85rem', 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase',
                    color: 'var(--text-mid)',
                    marginBottom: '0.5rem'
                  }}>
                    Email
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '1rem', 
                      border: '1px solid rgba(198, 167, 105, 0.4)',
                      background: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Inter, sans-serif',
                      color: 'var(--text-dark)'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.85rem', 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase',
                    color: 'var(--text-mid)',
                    marginBottom: '0.5rem'
                  }}>
                    Will you attend?
                  </label>
                  <select 
                    name="attendance" 
                    value={formData.attendance}
                    onChange={handleInputChange}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '1rem', 
                      border: '1px solid rgba(198, 167, 105, 0.4)',
                      background: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Inter, sans-serif',
                      color: 'var(--text-dark)'
                    }}
                  >
                    <option value="">Select an option</option>
                    <option value="yes">Yes, I'll be there!</option>
                    <option value="no">Unfortunately, I can't make it</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.85rem', 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase',
                    color: 'var(--text-mid)',
                    marginBottom: '0.5rem'
                  }}>
                    Message (Optional)
                  </label>
                  <textarea 
                    name="message" 
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    style={{ 
                      width: '100%', 
                      padding: '1rem', 
                      border: '1px solid rgba(198, 167, 105, 0.4)',
                      background: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Inter, sans-serif',
                      color: 'var(--text-dark)',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <button 
                  type="submit"
                  style={{ 
                    width: '100%', 
                    padding: '1.25rem', 
                    background: 'var(--light-gold)',
                    color: 'white',
                    border: 'none',
                    fontSize: '0.95rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'opacity 0.3s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Send RSVP
                </button>
              </form>
            )}
          </div>
        </RevealSection>
      </Section>

      {/* Footer */}
      <footer style={{ 
        padding: '3rem 0', 
        textAlign: 'center', 
        borderTop: '1px solid rgba(198, 167, 105, 0.2)'
      }}>
        <p style={{ 
          fontFamily: 'Playfair Display, serif',
          fontStyle: 'italic',
          fontSize: '1.2rem',
          color: 'var(--text-mid)',
          marginBottom: '1rem'
        }}>
          With love, Marwan & Dina
        </p>
        <p style={{ fontSize: '0.85rem', color: 'rgba(74, 74, 74, 0.6)' }}>
          May 26, 2026 • Tanta, Egypt
        </p>
      </footer>
    </div>
  )
}
