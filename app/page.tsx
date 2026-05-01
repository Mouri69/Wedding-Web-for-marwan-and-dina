'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

function useCountdown(target: Date) {
  const [mounted, setMounted] = useState(false)
  const [diff, setDiff] = useState(0)

  useEffect(() => {
    setMounted(true)
    setDiff(target.getTime() - Date.now())
    const t = setInterval(() => setDiff(target.getTime() - Date.now()), 1000)
    return () => clearInterval(t)
  }, [target.getTime()]) // 👈 use the primitive number, not the Date object

  if (!mounted) return { d: '--', h: '--', m: '--', s: '--' }

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

interface Message {
  id: number
  name: string
  message: string
  approved: boolean
  created_at: string
}

interface Drawing {
  id: number
  name: string
  image_data: string
  votes: number
  approved: boolean
  rank: number | null
  created_at: string
}

interface UploadPhoto {
  id: number
  image_data: string
  approved: boolean
  created_at: string
}

export default function Home() {
  const WEDDING_DATE = useMemo(() => new Date('2026-05-26T18:00:00'), [])
  const countdown = useCountdown(WEDDING_DATE)

  const [messages, setMessages] = useState<Message[]>([])
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [uploads, setUploads] = useState<UploadPhoto[]>([])
  const [loading, setLoading] = useState(true)

  const [messageForm, setMessageForm] = useState({ name: '', message: '' })
  const [messageSubmitted, setMessageSubmitted] = useState(false)

  const [drawingForm, setDrawingForm] = useState({ name: '' })
  const [drawingSubmitted, setDrawingSubmitted] = useState(false)
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false)
  const [canvasImageData, setCanvasImageData] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [currentTool, setCurrentTool] = useState<'brush' | 'eraser' | 'line' | 'circle'>('brush')
  const [brushSize, setBrushSize] = useState(5)
  const [startCoords, setStartCoords] = useState<{ x: number; y: number } | null>(null)
  const [canvasSnapshot, setCanvasSnapshot] = useState<ImageData | null>(null)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [lastScale, setLastScale] = useState(1)
  const [lastTranslate, setLastTranslate] = useState({ x: 0, y: 0 })
  const [isPinching, setIsPinching] = useState(false)
  const [pinchStartDistance, setPinchStartDistance] = useState(0)
  const [pinchStartCenter, setPinchStartCenter] = useState({ x: 0, y: 0 })

  const loadData = async () => {
  try {
    const [mRes, dRes, uRes] = await Promise.all([
      fetch('/api/messages'),
      fetch('/api/drawings'),
      fetch('/api/uploads')
    ])

    const mData = await mRes.json()
    const dData = await dRes.json()
    const uData = await uRes.json()

    setMessages(Array.isArray(mData) ? mData : [])
    setDrawings(Array.isArray(dData) ? dData : [])
    setUploads(Array.isArray(uData) ? uData : [])
  } catch (e) {
    console.error('Failed to load data:', e)
    setMessages([])
    setDrawings([])
    setUploads([])
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    loadData()
  }, [])

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageForm)
    })
    setMessageSubmitted(true)
    setMessageForm({ name: '', message: '' })
    setTimeout(() => setMessageSubmitted(false), 5000)
    loadData()
  }

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = 'touches' in e 
      ? (e.touches[0].clientX - rect.left) * scaleX
      : (e.clientX - rect.left) * scaleX
    const y = 'touches' in e
      ? (e.touches[0].clientY - rect.top) * scaleY
      : (e.clientY - rect.top) * scaleY
    return { x, y }
  }

  const getTouchDistance = (t1: React.Touch, t2: React.Touch) => {
    return Math.sqrt(Math.pow(t2.clientX - t1.clientX, 2) + Math.pow(t2.clientY - t1.clientY, 2))
  }

  const getTouchCenter = (t1: React.Touch, t2: React.Touch) => {
    return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if ('touches' in e && e.touches.length === 2) {
      e.preventDefault()
      setIsPinching(true)
      setIsDrawing(false)
      const t1 = e.touches[0]
      const t2 = e.touches[1]
      setPinchStartDistance(getTouchDistance(t1, t2))
      setPinchStartCenter(getTouchCenter(t1, t2))
      setLastScale(scale)
      setLastTranslate(translate)
      return
    }

    if (isPinching) return

    setIsDrawing(true)
    const { x, y } = getCanvasCoords(e)

    if (currentTool === 'brush' || currentTool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(x, y)
    } else if (currentTool === 'line' || currentTool === 'circle') {
      setStartCoords({ x, y })
      setCanvasSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height))
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    if ('touches' in e && e.touches.length === 2) {
      e.preventDefault()
      if (!isPinching) return

      const t1 = e.touches[0]
      const t2 = e.touches[1]
      const currentDistance = getTouchDistance(t1, t2)
      const currentCenter = getTouchCenter(t1, t2)

      const scaleFactor = currentDistance / pinchStartDistance
      const newScale = Math.max(1, Math.min(lastScale * scaleFactor, 4))

      const dx = currentCenter.x - pinchStartCenter.x
      const dy = currentCenter.y - pinchStartCenter.y

      const newTranslate = {
        x: lastTranslate.x + dx,
        y: lastTranslate.y + dy
      }

      setScale(newScale)
      setTranslate(constrainTranslate(newTranslate, newScale))
      return
    }

    if (!isDrawing || isPinching) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { x, y } = getCanvasCoords(e)

    if (currentTool === 'brush') {
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = currentColor
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (currentTool === 'eraser') {
      ctx.lineWidth = brushSize * 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.globalCompositeOperation = 'source-over'
    } else if ((currentTool === 'line' || currentTool === 'circle') && startCoords && canvasSnapshot) {
      ctx.putImageData(canvasSnapshot, 0, 0)
      ctx.beginPath()
      ctx.lineWidth = brushSize
      ctx.strokeStyle = currentColor
      ctx.lineCap = 'round'

      if (currentTool === 'line') {
        ctx.moveTo(startCoords.x, startCoords.y)
        ctx.lineTo(x, y)
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startCoords.x, 2) + Math.pow(y - startCoords.y, 2))
        ctx.arc(startCoords.x, startCoords.y, radius, 0, 2 * Math.PI)
      }
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setStartCoords(null)
    setCanvasSnapshot(null)
    setIsPinching(false)
  }

  const resetView = () => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    resetView()
  }

  const constrainTranslate = (newTranslate: { x: number; y: number }, currentScale: number) => {
    const canvasWidth = 330
    const canvasHeight = 310
    const minVisible = 50 // Keep at least 50px visible
    const maxX = (canvasWidth * currentScale) / 2 - minVisible
    const maxY = (canvasHeight * currentScale) / 2 - minVisible
    return {
      x: Math.max(-maxX, Math.min(maxX, newTranslate.x)),
      y: Math.max(-maxY, Math.min(maxY, newTranslate.y))
    }
  }

  const handleDrawingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canvasImageData || !drawingForm.name) return
    
    await fetch('/api/drawings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: drawingForm.name, image_data: canvasImageData })
    })
    
    setDrawingSubmitted(true)
    setDrawingForm({ name: '' })
    setCanvasImageData(null)
    setTimeout(() => setDrawingSubmitted(false), 5000)
    loadData()
  }

  const [votedDrawings, setVotedDrawings] = useState<Set<number>>(new Set())

  useEffect(() => {
    const saved = localStorage.getItem('votedDrawings')
    if (saved) {
      setVotedDrawings(new Set(JSON.parse(saved)))
    }
  }, [])

  const handleVote = async (id: number) => {
    if (votedDrawings.has(id)) return
    await fetch(`/api/drawings/${id}/vote`, { method: 'POST' })
    const newVoted = new Set(votedDrawings)
    newVoted.add(id)
    setVotedDrawings(newVoted)
    localStorage.setItem('votedDrawings', JSON.stringify([...newVoted]))
    loadData()
  }

  const approvedMessages = messages.filter(m => m.approved)
  const approvedDrawings = drawings
    .filter(d => d.approved)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    .slice(0, 5)
  const approvedUploads = uploads.filter(u => u.approved).slice(0, 20)

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
            max-width: 90vw !important;
          }
          #plate {
            padding: 1rem 0 !important;
          }
          #plate > div {
            margin-bottom: 1rem !important;
          }
        }
      `}</style>
      
      {/* Hero Section */}
      <section id="hero" style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        backgroundImage: 'url(/oil-paint.jpeg)',
        backgroundPosition: '55% 80%',
        position: 'relative',
        padding: '2rem 1rem'
      }}>
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
              fontSize: 'clamp(2rem, 5.5vw, 2rem)', 
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
              width: 'clamp(90%, 70%, 70%)',
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
              fontSize: 'clamp(3rem, 4.5vw, 3rem)',
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

      {/* Messages Section */}
      <Section id="messages">
        <RevealSection>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 500, color: 'var(--black)', marginBottom: '1rem' }}>
              Leave a Message
            </h2>
            <Divider />
          </div>

          {/* Message Form */}
          <div style={{ maxWidth: '600px', margin: '0 auto 4rem auto' }}>
            {messageSubmitted ? (
              <div style={{ 
                padding: '2rem', 
                background: 'white', 
                border: '1px solid rgba(198, 167, 105, 0.3)',
                textAlign: 'center',
                borderRadius: '8px'
              }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--light-gold)', marginBottom: '0.5rem' }}>
                  Thank You!
                </h3>
                <p style={{ color: 'var(--text-mid)' }}>
                  Your message has been sent! It will appear on the website after admin approval.
                </p>
              </div>
            ) : (
              <form onSubmit={handleMessageSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid rgba(198, 167, 105, 0.2)' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.85rem', 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase',
                    color: 'var(--text-mid)',
                    marginBottom: '0.5rem'
                  }}>
                    Your Name
                  </label>
                  <input 
                    type="text" 
                    value={messageForm.name}
                    onChange={(e) => setMessageForm({ ...messageForm, name: e.target.value })}
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
                    Your Message
                  </label>
                  <textarea 
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                    required
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
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Approved Messages */}
          {approvedMessages.length > 0 && (
            <div>
              <h3 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '2rem', fontFamily: 'Playfair Display, serif' }}>
                Guest Messages
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '1.5rem'
              }}>
                {approvedMessages.map((msg) => (
                  <div key={msg.id} style={{ 
                    background: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(198, 167, 105, 0.2)'
                  }}>
                    <p style={{ 
                      fontFamily: 'Playfair Display, serif',
                      fontStyle: 'italic',
                      color: 'var(--text-dark)',
                      marginBottom: '1rem',
                      lineHeight: 1.6
                    }}>
                      "{msg.message}"
                    </p>
                    <p style={{ 
                      fontFamily: '"Great Vibes", cursive',
                      fontSize: '1.3rem',
                      color: 'var(--light-gold)',
                      textAlign: 'right'
                    }}>
                      — {msg.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </RevealSection>
      </Section>

      {/* Drawings Section */}
      <Section id="drawings">
        <RevealSection>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 500, color: 'var(--black)', marginBottom: '1rem' }}>
              Draw Something
            </h2>
            <Divider />
          </div>

          {/* Drawing Form */}
          <div style={{ maxWidth: '600px', margin: '0 auto 4rem auto' }}>
            {drawingSubmitted ? (
              <div style={{ 
                padding: '2rem', 
                background: 'white', 
                border: '1px solid rgba(198, 167, 105, 0.3)',
                textAlign: 'center',
                borderRadius: '8px'
              }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--light-gold)', marginBottom: '0.5rem' }}>
                  Thank You!
                </h3>
                <p style={{ color: 'var(--text-mid)' }}>
                  Your drawing has been sent! It will appear on the website after admin approval.
                </p>
              </div>
            ) : (
              <div>
                <form onSubmit={handleDrawingSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid rgba(198, 167, 105, 0.2)' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.85rem', 
                      letterSpacing: '0.1em', 
                      textTransform: 'uppercase',
                      color: 'var(--text-mid)',
                      marginBottom: '0.5rem'
                    }}>
                      Your Name
                    </label>
                    <input 
                      type="text" 
                      value={drawingForm.name}
                      onChange={(e) => setDrawingForm({ ...drawingForm, name: e.target.value })}
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
                      Your Drawing
                    </label>
                    {canvasImageData ? (
                      <div style={{ 
                        border: '2px solid rgba(198, 167, 105, 0.3)', 
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <img 
                          src={canvasImageData} 
                          alt="Your drawing" 
                          style={{ width: '100%', display: 'block' }} 
                        />
                      </div>
                    ) : (
                      <div 
                        onClick={() => {
                          setScale(1)
                          setTranslate({ x: 0, y: 0 })
                          setIsDrawingModalOpen(true)
                        }}
                        style={{ 
                          border: '2px dashed rgba(198, 167, 105, 0.5)', 
                          borderRadius: '8px',
                          padding: '3rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: 'rgba(198, 167, 105, 0.05)'
                        }}
                      >
                        <p style={{ color: 'var(--text-mid)', fontSize: '1.1rem', margin: 0 }}>
                          🎨 Click to draw something!
                        </p>
                      </div>
                    )}
                    {canvasImageData && (
                      <button
                        type="button"
                        onClick={() => {
                          setCanvasImageData(null)
                          setScale(1)
                          setTranslate({ x: 0, y: 0 })
                          setIsDrawingModalOpen(true)
                        }}
                        style={{
                          width: '100%',
                          marginTop: '0.5rem',
                          padding: '0.75rem',
                          border: '1px solid rgba(198, 167, 105, 0.4)',
                          background: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        Redraw
                      </button>
                    )}
                  </div>

                  <button 
                    type="submit"
                    disabled={!canvasImageData}
                    style={{ 
                      width: '100%', 
                      padding: '1.25rem', 
                      background: canvasImageData ? 'var(--light-gold)' : '#ccc',
                      color: 'white',
                      border: 'none',
                      fontSize: '0.95rem',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      cursor: canvasImageData ? 'pointer' : 'not-allowed',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    Submit Drawing
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Drawing Modal */}
          {isDrawingModalOpen && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 2147483647,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{
                background: '#f0ebe5',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '100%',
                maxHeight: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 15px',
                  background: '#ffffff',
                  borderBottom: '1px solid #e0d8ce',
                  flexShrink: 0,
                  minHeight: '50px'
                }}>
                  <h3 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#333' }}>Draw Something</h3>
                  <button
                    onClick={() => {
                      setIsDrawingModalOpen(false)
                    }}
                    style={{
                      background: '#f0f0f0',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      padding: '8px 14px',
                      color: '#333',
                      borderRadius: '8px'
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Canvas Area */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#e8e2da',
                  overflow: 'hidden',
                  padding: '20px'
                }}>
                  <div style={{
                    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                    transformOrigin: 'center center'
                  }}>
                    <canvas
                      ref={canvasRef}
                      width={330}
                      height={310}
                      style={{
                        background: '#ffffff',
                        border: '2px solid #888888',
                        borderRadius: '4px',
                        touchAction: 'none',
                        cursor: currentTool === 'eraser' ? 'cell' : 'crosshair',
                        display: 'block',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
                      }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                </div>

                {/* Toolbar */}
              <div style={{
                padding: '12px',
                background: '#ffffff',
                borderTop: '1px solid #e0d8ce',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                flexShrink: 0
              }}>
                {/* Tools */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { tool: 'brush', icon: '✏️', label: 'Brush' },
                    { tool: 'eraser', icon: '🧽', label: 'Eraser' },
                    { tool: 'line', icon: '📏', label: 'Line' },
                    { tool: 'circle', icon: '⭕', label: 'Circle' }
                  ].map(({ tool, icon, label }) => (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => setCurrentTool(tool as any)}
                      title={label}
                      style={{
                        padding: '10px 12px',
                        border: currentTool === tool ? '2px solid #C6A769' : '1px solid #dddddd',
                        background: currentTool === tool ? 'rgba(198, 167, 105, 0.15)' : '#ffffff',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        minWidth: '44px',
                        minHeight: '44px'
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                {/* Colors */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['#000000', '#C6A769', '#8a3f52', '#6e9e82', '#e07070', '#3333ff', '#ff9900', '#ffffff'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCurrentColor(color)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: color,
                        border: currentColor === color ? '3px solid #333333' : color === '#ffffff' ? '2px solid #bbbbbb' : '1px solid #dddddd',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>

                {/* Brush Size */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Size: {brushSize}
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                </div>

                {/* Clear */}
                <button
                  type="button"
                  onClick={clearCanvas}
                  style={{
                    padding: '10px 16px',
                    border: '1px solid #dddddd',
                    background: '#ffffff',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#333333'
                  }}
                >
                  Clear
                </button>

                {/* Reset View */}
                <button
                  type="button"
                  onClick={resetView}
                  style={{
                    padding: '10px 16px',
                    border: '1px solid #dddddd',
                    background: '#ffffff',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#333333'
                  }}
                >
                  Reset View
                </button>

                {/* Done */}
                <button
                  type="button"
                  onClick={() => {
                    const canvas = canvasRef.current
                    if (canvas) {
                      setCanvasImageData(canvas.toDataURL('image/png'))
                      setIsDrawingModalOpen(false)
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    background: '#C6A769',
                    color: '#ffffff',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  Done
                </button>
              </div>
              </div>
            </div>
          )}

          {/* Approved Drawings */}
          {approvedDrawings.length > 0 && (
            <div>
              <h3 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '2rem', fontFamily: 'Playfair Display, serif' }}>
                Top Drawings
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem'
              }}>
                {approvedDrawings.map((drawing) => (
                  <div key={drawing.id} style={{ 
                    background: 'white', 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid rgba(198, 167, 105, 0.2)'
                  }}>
                    <img 
                      src={drawing.image_data} 
                      alt={`Drawing by ${drawing.name}`}
                      style={{ width: '100%', display: 'block' }}
                    />
                    <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: '"Great Vibes", cursive', fontSize: '1.2rem' }}>
                        {drawing.name}
                      </span>
                      <button
                        onClick={() => handleVote(drawing.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          fontSize: '1.2rem',
                          cursor: votedDrawings.has(drawing.id) ? 'default' : 'pointer',
                          padding: '0.5rem',
                          borderRadius: '50%',
                          transition: 'all 0.2s ease',
                          color: votedDrawings.has(drawing.id) ? '#C6A769' : 'inherit',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      >
                        {votedDrawings.has(drawing.id) ? '♥' : '♡'} {drawing.votes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </RevealSection>
      </Section>

      {/* Guest Uploads Section */}
      <Section id="guest-uploads">
        <RevealSection>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 500, color: 'var(--black)', marginBottom: '1rem' }}>
              Guest Photo Wall
            </h2>
            <p style={{ color: 'var(--text-mid)', marginBottom: '1.2rem' }}>
              Scan the QR code or tap the button below to upload up to 10 photos.
            </p>
            <Link
              href="/upload"
              style={{
                display: 'inline-block',
                padding: '.85rem 1.4rem',
                borderRadius: 999,
                background: 'var(--light-gold)',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '.8rem',
                letterSpacing: '.12em',
                textTransform: 'uppercase',
              }}
            >
              Open Upload Page
            </Link>
            <Divider />
          </div>

          {approvedUploads.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {approvedUploads.map((photo) => (
                <div key={photo.id} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(198, 167, 105, 0.2)', background: '#fff' }}>
                  <img src={photo.image_data} alt={`Guest upload ${photo.id}`} style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-mid)', fontStyle: 'italic' }}>
              Photos will appear here after admin approval.
            </div>
          )}
        </RevealSection>
      </Section>

      {/* Footer */}
      <footer style={{ 
        padding: '3rem 0', 
        textAlign: 'center', 
        borderTop: '1px solid rgba(198, 167, 105, 0.2)'
      }}>
        <div style={{ marginBottom: '1.2rem' }}>
        </div>
        <p style={{ 
          fontFamily: 'Playfair Display, serif',
          fontStyle: 'italic',
          fontSize: '1.2rem',
          color: 'var(--text-mid)',
          marginBottom: '1rem'
        }}>
          With love, Marwan & Dena
        </p>
        <p style={{ fontSize: '0.85rem', color: 'rgba(74, 74, 74, 0.6)' }}>
          May 26, 2026 • Tanta, Egypt
        </p>
      </footer>
    </div>
  )
}
