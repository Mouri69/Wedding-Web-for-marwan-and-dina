'use client'
import { useEffect, useRef, useState } from 'react'

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

  const galleryImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=600&fit=crop'
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
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
            alt="Marwan & Dina"
            style={{ 
              maxWidth: 'min(500px, 600px)', 
              height: 'auto',
              display: 'block',
              margin: '0 auto'
            }}
          />
          <div style={{ marginTop: '2rem' }}>
            <p style={{ 
              fontFamily: 'great vibes',
              fontStyle: 'italic',
              fontSize: 'clamp(1.8rem, 4vw, 3rem)', 
              color: 'white',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              marginBottom: '1rem'
            }}>
              Are getting engaged
            </p>
            <p style={{ 
              fontFamily: 'Inter, sans-serif', 
              fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)', 
              color: 'white',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              letterSpacing: '0.15em',
              marginBottom: '0.5rem'
            }}>
              MAY 26 2026
            </p>
            <p style={{ 
              fontFamily: 'Inter, sans-serif', 
              fontSize: 'clamp(1rem, 2.2vw, 1.4rem)', 
              color: 'white',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              letterSpacing: '0.15em'
            }}>
              TANTA, EGYPT
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <Section id="story">
        <RevealSection>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 500, color: 'var(--black)', marginBottom: '1rem' }}>
              Our Story
            </h2>
            <Divider />
            <p style={{ 
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              color: 'var(--text-mid)'
            }}>
              From the moment we met, we knew there was something special. What started as a chance encounter 
              has blossomed into a lifetime of love and laughter. We can't wait to begin this next chapter 
              together and celebrate with all of you.
            </p>
          </div>
        </RevealSection>
      </Section>

      {/* Event Details */}
      <Section id="event">
        <RevealSection>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 500, color: 'var(--black)', marginBottom: '1rem' }}>
              Event Details
            </h2>
            <Divider />
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {[
              { icon: '📅', title: 'Date', detail: 'May 26, 2026' },
              { icon: '🕔', title: 'Time', detail: '6:00 PM' },
              { icon: '📍', title: 'Location', detail: 'Tanta, Egypt' }
            ].map((item, index) => (
              <div key={index} style={{ 
                textAlign: 'center',
                padding: '2.5rem 1.5rem',
                border: '1px solid rgba(198, 167, 105, 0.3)',
                background: 'white'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ 
                  fontSize: '0.9rem', 
                  letterSpacing: '0.2em', 
                  textTransform: 'uppercase',
                  color: 'var(--light-gold)',
                  marginBottom: '0.75rem'
                }}>
                  {item.title}
                </h3>
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--text-dark)' }}>
                  {item.detail}
                </p>
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
        </RevealSection>
      </Section>

      {/* Gallery */}
      <Section id="gallery">
        <RevealSection>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 500, color: 'var(--black)', marginBottom: '1rem' }}>
              Gallery
            </h2>
            <Divider />
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem'
          }}>
            {galleryImages.map((src, index) => (
              <div key={index} style={{ 
                overflow: 'hidden',
                aspectRatio: '1',
                cursor: 'pointer'
              }}>
                <img 
                  src={src} 
                  alt={`Gallery image ${index + 1}`}
                  loading="lazy"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
            ))}
          </div>
        </RevealSection>
      </Section>

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
