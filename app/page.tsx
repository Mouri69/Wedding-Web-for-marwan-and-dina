'use client'
import { useEffect, useRef, useState, useCallback, Fragment, useId } from 'react'

/* ── Types ── */
interface Message { id: number; name: string; message: string }
interface Drawing { id: number; name: string; image_data: string; votes: number; rank: number | null }

/* ── Countdown helper ── */
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
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setOn(true)
      },
      { threshold: 0.06, rootMargin: '0px 0px -4% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const ease = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  return (
    <div
      ref={ref}
      className="reveal-section"
      style={{
        opacity: on ? 1 : 0,
        transform: on ? 'translateY(0)' : 'translateY(14px)',
        transition: `opacity 0.38s ${ease} ${delay}ms, transform 0.42s ${ease} ${delay}ms`,
        willChange: on ? 'auto' : 'opacity, transform',
      }}
    >
      <div className="inv-section-body">{children}</div>
    </div>
  )
}

type FloraAccent = 'rose' | 'sprig' | 'pair' | 'sparkle' | 'petal'

function PetalMotif({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const gid = useId().replace(/:/g, '')
  return (
    <svg className={className} width={44} height={44} viewBox="0 0 48 48" fill="none" aria-hidden style={style}>
      <defs>
        <linearGradient id={`petal-g-${gid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 210, 225, 0.9)" />
          <stop offset="100%" stopColor="rgba(180, 90, 120, 0.65)" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="14" rx="6" ry="10" transform="rotate(0 24 24)" fill={`url(#petal-g-${gid})`} opacity={0.85} />
      <ellipse cx="24" cy="14" rx="6" ry="10" transform="rotate(72 24 24)" fill={`url(#petal-g-${gid})`} opacity={0.75} />
      <ellipse cx="24" cy="14" rx="6" ry="10" transform="rotate(144 24 24)" fill={`url(#petal-g-${gid})`} opacity={0.7} />
      <ellipse cx="24" cy="14" rx="6" ry="10" transform="rotate(216 24 24)" fill={`url(#petal-g-${gid})`} opacity={0.75} />
      <ellipse cx="24" cy="14" rx="6" ry="10" transform="rotate(288 24 24)" fill={`url(#petal-g-${gid})`} opacity={0.7} />
      <circle cx="24" cy="24" r="3.5" fill="rgba(255, 230, 238, 0.35)" stroke="rgba(255, 200, 218, 0.5)" strokeWidth="0.6" />
    </svg>
  )
}

function FloraRose({ size = 36, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id={`fr-${uid}`} x1="20%" y1="20%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 220, 232, 0.95)" />
          <stop offset="100%" stopColor="rgba(200, 100, 140, 0.9)" />
        </linearGradient>
      </defs>
      <path
        d="M28 10c4 2 7 6 6 11 2-1 5 0 6 3 1 4-2 8-6 9 1 3-1 7-5 8-4 1-8-2-9-6-3 2-7 0-9-3-2-4 1-9 6-10-1-5 3-10 8-11 1-3 5-4 8-2z"
        stroke={`url(#fr-${uid})`}
        strokeWidth="1.6"
        fill="rgba(220, 120, 150, 0.22)"
      />
      <ellipse cx="28" cy="22" rx="5" ry="4" transform="rotate(-12 28 22)" fill="rgba(245, 190, 210, 0.35)" stroke="rgba(255, 210, 225, 0.65)" strokeWidth="1.1" />
      <path d="M28 26v14M24 34c-4 2-6 6-5 10M32 34c4 2 6 6 5 10" stroke="rgba(200, 130, 155, 0.75)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function FloraSprig({ size = 40, flip, className, style }: { size?: number; flip?: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      style={{
        flexShrink: 0,
        ...style,
        transform: [flip ? 'scaleX(-1)' : '', style?.transform].filter(Boolean).join(' ') || undefined,
      }}
    >
      <path
        d="M8 40 Q 22 28, 24 12 Q 26 26, 38 36"
        stroke="rgba(140, 185, 145, 0.85)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M18 30 Q 14 24 10 26 Q 14 28 18 30"
        fill="rgba(120, 175, 130, 0.45)"
        stroke="rgba(170, 220, 175, 0.75)"
        strokeWidth="1"
      />
      <path
        d="M26 22 Q 30 16 34 20 Q 30 24 26 22"
        fill="rgba(110, 165, 120, 0.4)"
        stroke="rgba(165, 215, 170, 0.72)"
        strokeWidth="1"
      />
      <path
        d="M30 32 Q 36 28 40 32 Q 34 36 30 32"
        fill="rgba(105, 160, 115, 0.38)"
        stroke="rgba(160, 210, 165, 0.68)"
        strokeWidth="1"
      />
    </svg>
  )
}

function FloraPair({ className }: { className?: string }) {
  const f = { filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.35))' } as React.CSSProperties
  return (
    <span className={className} style={{ display: 'flex', alignItems: 'center', gap: 6 }} aria-hidden>
      <FloraSprig size={44} style={f} />
      <FloraRose size={40} style={f} />
    </span>
  )
}

const vineStroke = 'rgba(255, 198, 216, 0.62)'
const vineStrokeSoft = 'rgba(255, 198, 216, 0.38)'
const leafFill = 'rgba(130, 185, 140, 0.42)'
const leafStroke = 'rgba(175, 220, 180, 0.55)'

/** Top-left corner art; other corners mirror via CSS scale on the wrapper */
function CornerVineSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 96 96" fill="none" aria-hidden>
      <path
        d="M4 6 C 22 4, 34 18, 28 32 C 24 44, 10 50, 14 64 C 18 76, 32 82, 26 94 M 18 22 Q 32 18 38 32 M 8 38 Q 20 44 16 58"
        stroke={vineStroke}
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <ellipse cx="34" cy="24" rx="7" ry="4" transform="rotate(-35 34 24)" fill={leafFill} stroke={leafStroke} strokeWidth="0.65" />
      <ellipse cx="22" cy="48" rx="6" ry="3.5" transform="rotate(15 22 48)" fill={leafFill} stroke={leafStroke} strokeWidth="0.65" />
      <ellipse cx="30" cy="72" rx="5" ry="3" transform="rotate(-20 30 72)" fill={leafFill} stroke={leafStroke} strokeWidth="0.55" opacity={0.85} />
    </svg>
  )
}

function CornerVine({ flipX, flipY, style }: { flipX?: boolean; flipY?: boolean; style?: React.CSSProperties }) {
  return (
    <div className="inv-flora inv-flora--vine-corner" style={{ width: 104, height: 104, ...style }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
          transformOrigin: 'center center',
        }}
      >
        <CornerVineSvg />
      </div>
    </div>
  )
}

function InvPanelFlora() {
  const glow = { filter: 'drop-shadow(0 0 10px rgba(255, 190, 210, 0.35))' } as React.CSSProperties
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 44 }}>
      {/* Edge vines (inset so corners stay clear for corner flourishes) */}
      <svg
        className="inv-flora inv-flora--vine-edges"
        style={{ position: 'absolute', left: 64, right: 64, top: 16, height: 40 }}
        viewBox="0 0 520 36"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path
          d="M0 20 Q 65 10, 130 18 T 260 16 T 390 19 T 520 17"
          stroke={vineStrokeSoft}
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeDasharray="5 11"
        />
        <path d="M0 24 Q 130 30, 260 22 Q 390 28, 520 23" stroke={vineStroke} strokeWidth="0.9" strokeLinecap="round" opacity={0.55} />
      </svg>
      <svg
        className="inv-flora inv-flora--vine-edges"
        style={{ position: 'absolute', left: 64, right: 64, bottom: 16, height: 40 }}
        viewBox="0 0 520 36"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path
          d="M520 16 Q 455 26, 390 18 T 260 20 T 130 17 T 0 19"
          stroke={vineStrokeSoft}
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeDasharray="5 11"
        />
        <path d="M520 12 Q 390 6, 260 14 Q 130 8, 0 13" stroke={vineStroke} strokeWidth="0.9" strokeLinecap="round" opacity={0.55} />
      </svg>
      <svg
        className="inv-flora inv-flora--vine-edges"
        style={{ position: 'absolute', left: 12, top: 112, bottom: 112, width: 44 }}
        viewBox="0 0 40 400"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path
          d="M22 0 Q 14 80, 24 160 T 18 320 T 22 400"
          stroke={vineStrokeSoft}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="4 12"
        />
        <path d="M16 0 Q 26 100, 14 200 Q 28 300, 16 400" stroke={vineStroke} strokeWidth="0.85" strokeLinecap="round" opacity={0.5} />
      </svg>
      <svg
        className="inv-flora inv-flora--vine-edges"
        style={{ position: 'absolute', right: 12, top: 112, bottom: 112, width: 44 }}
        viewBox="0 0 40 400"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path
          d="M18 0 Q 26 80, 16 160 T 22 320 T 18 400"
          stroke={vineStrokeSoft}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="4 12"
        />
        <path d="M24 0 Q 14 100, 26 200 Q 12 300, 24 400" stroke={vineStroke} strokeWidth="0.85" strokeLinecap="round" opacity={0.5} />
      </svg>

      {/* Corner vines */}
      <CornerVine style={{ position: 'absolute', top: 2, left: 2, opacity: 0.88 }} />
      <CornerVine flipX style={{ position: 'absolute', top: 2, right: 2, opacity: 0.88 }} />
      <CornerVine flipY style={{ position: 'absolute', bottom: 2, left: 2, opacity: 0.88 }} />
      <CornerVine flipX flipY style={{ position: 'absolute', bottom: 2, right: 2, opacity: 0.88 }} />

      <div className="inv-flora inv-flora--a" style={{ position: 'absolute', top: 8, right: 4, opacity: 0.95, ...glow }}>
        <FloraRose size={80} />
      </div>
      <div className="inv-flora inv-flora--b" style={{ position: 'absolute', top: '20%', left: 2, opacity: 0.92, ...glow }}>
        <FloraSprig size={92} flip />
      </div>
      <div className="inv-flora inv-flora--c" style={{ position: 'absolute', bottom: '30%', right: 4, opacity: 0.9, ...glow }}>
        <FloraSprig size={76} />
      </div>
      <div className="inv-flora inv-flora--d" style={{ position: 'absolute', bottom: 12, left: 6, opacity: 0.92, ...glow }}>
        <FloraRose size={64} />
      </div>
      <div
        className="inv-flora inv-flora--e"
        style={{ position: 'absolute', left: '50%', top: '42%', width: 'min(88%, 320px)', height: 72, transform: 'translateX(-50%)', opacity: 0.35 }}
      >
        <svg width="100%" height="100%" viewBox="0 0 280 72" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden>
          <path
            d="M0 38 Q 70 8 140 38 T 280 34"
            stroke="rgba(255, 200, 218, 0.9)"
            strokeWidth="1.8"
            strokeDasharray="6 14"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}

function FlowDivider({ accent = 'sparkle' }: { accent?: FloraAccent }) {
  const center =
    accent === 'rose' ? (
      <FloraRose size={44} className="inv-flora inv-flora--divider" style={{ filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.4))' }} />
    ) : accent === 'sprig' ? (
      <FloraSprig size={46} className="inv-flora inv-flora--divider" style={{ filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.4))' }} />
    ) : accent === 'pair' ? (
      <FloraPair className="inv-flora inv-flora--divider" />
    ) : accent === 'petal' ? (
      <PetalMotif className="inv-flora inv-flora--divider" style={{ filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.35))' }} />
    ) : (
      <span style={{ color: 'rgba(255, 210, 225, 0.8)', fontSize: '0.7rem', letterSpacing: '0.45em' }}>✦</span>
    )
  return (
    <div className="section-blend" aria-hidden>
      <div className="section-blend__veil section-blend__veil--from-above" />
      <div className="section-blend__veil section-blend__veil--from-below" />
      <div className="section-blend__bloom" />
      <div className="section-blend__vine-hint" />
      <div className="section-blend__motif">{center}</div>
    </div>
  )
}

export default function Home() {
  const WEDDING_DATE = new Date('2026-05-26T18:00:00')
  const countdown = useCountdown(WEDDING_DATE)

  /* ── State ── */
  const [phase, setPhase] = useState<'video'|'main'>('video')
  const [heroStage, setHeroStage] = useState<'hidden'|'fade-in'|'image'|'names'>('hidden')
  const [lang, setLang] = useState<'en'|'ar'>('en')
  const [guestName, setGuestName] = useState('')
  const [savedName, setSavedName] = useState('')
  const [nameMsg, setNameMsg] = useState('')
  const [rsvpAnswer, setRsvpAnswer] = useState<string|null>(null)
  const [rsvpMsg, setRsvpMsg] = useState('')
  const [msgText, setMsgText] = useState('')
  const [msgSent, setMsgSent] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [drawColor, setDrawColor] = useState('#6b2540')
  const [isEraser, setIsEraser] = useState(false)
  const [brushSize, setBrushSize] = useState(5)
  const [drawSent, setDrawSent] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const frameCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D|null>(null)
  const isDrawingRef = useRef(false)
  const undoStack = useRef<string[]>([])
  const nameCardRef = useRef<HTMLDivElement>(null)
  const [videoFrameData, setVideoFrameData] = useState<string>('')

  const ar = lang === 'ar'

  /* ── Load data ── */
  const loadData = useCallback(async () => {
    const [msgs, draws] = await Promise.all([
      fetch('/api/messages').then(r => r.json()).catch(() => []),
      fetch('/api/drawings').then(r => r.json()).catch(() => []),
    ])
    setMessages(msgs)
    setDrawings(draws)
  }, [])

  useEffect(() => {
    if (phase === 'main') loadData()
  }, [phase, loadData])

  /* ── Video ends →  capture last frame ── */
  const handleVideoEnd = () => {
    // Capture the last frame from the video
    const canvas = frameCanvasRef.current
    const video = videoRef.current
    if (canvas && video && video.videoWidth > 0) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        setVideoFrameData(canvas.toDataURL('image/jpeg', 0.95))
      }
    }
    setPhase('main')
    setHeroStage('fade-in')
  }

  useEffect(() => {
    if (heroStage === 'fade-in') {
      const timeout = window.setTimeout(() => setHeroStage('image'), 1200)
      return () => window.clearTimeout(timeout)
    }
  }, [heroStage])

  useEffect(() => {
    if (heroStage === 'image') {
      const timeout = window.setTimeout(() => setHeroStage('names'), 1400)
      return () => window.clearTimeout(timeout)
    }
  }, [heroStage])

  /* ── Canvas init ── */
  useEffect(() => {
    if (phase !== 'main') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctxRef.current = ctx
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [phase])

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const r = canvas.getBoundingClientRect()
    const sx = canvas.width / r.width
    const sy = canvas.height / r.height
    const src = 'touches' in e ? e.touches[0] : e
    return { x: (src.clientX - r.left) * sx, y: (src.clientY - r.top) * sy }
  }

  const startDraw = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    undoStack.current.push(canvas.toDataURL())
    if (undoStack.current.length > 20) undoStack.current.shift()
    isDrawingRef.current = true
    const p = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }, [])

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawingRef.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    const p = getPos(e, canvas)
    ctx.strokeStyle = isEraser ? '#3a2430' : drawColor
    ctx.lineWidth = brushSize
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }, [drawColor, brushSize, isEraser])

  const stopDraw = useCallback(() => { isDrawingRef.current = false }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || phase !== 'main') return
    canvas.addEventListener('mousedown', startDraw)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDraw)
    canvas.addEventListener('mouseleave', stopDraw)
    canvas.addEventListener('touchstart', startDraw, { passive: false })
    canvas.addEventListener('touchmove', draw, { passive: false })
    canvas.addEventListener('touchend', stopDraw)
    return () => {
      canvas.removeEventListener('mousedown', startDraw)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', stopDraw)
      canvas.removeEventListener('mouseleave', stopDraw)
      canvas.removeEventListener('touchstart', startDraw)
      canvas.removeEventListener('touchmove', draw)
      canvas.removeEventListener('touchend', stopDraw)
    }
  }, [phase, startDraw, draw, stopDraw])

  /* ── Actions ── */
  function saveName() {
    const n = guestName.trim()
    if (!n) {
      nameCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setNameMsg(ar ? 'رجاءً أدخل اسمك أولاً 👆' : 'Please enter your name first 👆')
      return
    }
    setSavedName(n)
    setNameMsg(ar ? `أهلاً ${n}! 🌸` : `Welcome, ${n}! 🌸`)
  }

  async function submitRsvp(answer: string) {
    if (!savedName) { nameCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return }
    setRsvpAnswer(answer)
    await fetch('/api/rsvps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: savedName, answer }) })
    const m: Record<string, {en:string, ar:string}> = {
      yes:   { en: "🎉 We can't wait to celebrate with you!", ar: "🎉 لا يسعنا الانتظار للاحتفال معك!" },
      maybe: { en: "🤞 We hope to see you there!",            ar: "🤞 نأمل أن نراك هناك!" },
      no:    { en: "💔 You'll be missed dearly.",             ar: "💔 ستشتاق إليك قلوبنا." }
    }
    setRsvpMsg(m[answer][ar ? 'ar' : 'en'])
  }

  async function submitMessage() {
    if (!savedName || !msgText.trim()) return
    await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: savedName, message: msgText }) })
    setMsgText('')
    setMsgSent(true)
    setTimeout(() => setMsgSent(false), 3500)
  }

  function undoCanvas() {
    const prev = undoStack.current.pop()
    if (!prev || !ctxRef.current) return
    const img = new Image()
    img.onload = () => ctxRef.current!.drawImage(img, 0, 0)
    img.src = prev
  }

  function clearCanvas() {
    const c = canvasRef.current
    if (!c || !ctxRef.current) return
    ctxRef.current.fillStyle = '#fff'
    ctxRef.current.fillRect(0, 0, c.width, c.height)
  }

  async function submitDrawing() {
    if (!savedName) { nameCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return }
    const c = canvasRef.current
    if (!c) return
    const image_data = c.toDataURL('image/png')
    await fetch('/api/drawings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: savedName, image_data }) })
    clearCanvas()
    setDrawSent(true)
    setTimeout(() => setDrawSent(false), 3500)
    await loadData()
  }

  async function voteDrawing(id: number) {
    await fetch(`/api/drawings/${id}/vote`, { method: 'POST' })
    await loadData()
  }

  const colors = ['#6b2540', '#c9788c', '#3d1522', '#6e9e82', '#7a8ebf', '#c9a27a', '#faf2f5']

  /* ══════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(175deg, #0c0508 0%, #1a0a12 38%, #2a101c 72%, #1f0a14 100%)' }}>
      {/* Hidden canvas for capturing video frame */}
      <canvas ref={frameCanvasRef} style={{ display:'none' }} />

      {/* ── LANG TOGGLE ── */}
      {phase === 'main' && (
        <div style={{ position:'fixed', top:'1rem', right:'1rem', zIndex:999, display:'flex', background:'rgba(26,10,20,0.88)', border:'1px solid rgba(232,180,200,0.2)', borderRadius:999, overflow:'hidden', backdropFilter:'blur(14px)', boxShadow:'0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,220,230,0.06)' }}>
          {(['en','ar'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ padding:'.45rem 1.15rem', fontSize:'.72rem', letterSpacing:'.1em', border:'none', background: lang===l ? 'linear-gradient(135deg, #7d2d4a 0%, #5a1f32 100%)' : 'transparent', color: lang===l ? '#faf2f5' : '#d4a0b8', cursor:'pointer', borderRadius:999, fontFamily:'Montserrat,sans-serif', transition:'color .2s, background .2s' }}>
              {l === 'en' ? 'EN' : 'عربي'}
            </button>
          ))}
        </div>
      )}

      {/* ══════ PHASE: VIDEO ══════ */}
      {phase === 'video' && (
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'#000', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.85 }}
            src="/wedding-video.mp4"
          />
          {/* Skip button */}
          <button onClick={handleVideoEnd} style={{ position:'absolute', bottom:'2rem', right:'2rem', padding:'.5rem 1.4rem', background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.4)', borderRadius:30, color:'#fff', fontSize:'.72rem', letterSpacing:'.12em', cursor:'pointer', fontFamily:'Montserrat,sans-serif', backdropFilter:'blur(4px)' }}>
            Skip →
          </button>

          {/* Image & Text Overlays - show on top of video when it ends */}
          {phase === 'video' && (
            <>
              {/* Image from bottom */}
              <div style={{ position:'absolute', left:'50%', bottom:0, width:'92%', maxWidth:620, zIndex:101, transform: heroStage === 'image' || heroStage === 'names' ? 'translate(-50%, 0)' : 'translate(-50%, 120px)', opacity: heroStage === 'image' || heroStage === 'names' ? 1 : 0, transition:'transform 1.8s ease .2s, opacity 1.2s ease .2s' }}>
                <img
                  src="/wedding2.png"
                  alt="Marwan & Dena"
                  style={{ width:'100%', height:'auto', borderRadius:28, boxShadow:'0 32px 90px rgba(15,8,18,0.45)', border:'1px solid rgba(255,255,255,0.18)' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display='none' }}
                />
              </div>

              {/* Text from top */}
              <div style={{ position:'absolute', left:0, right:0, top:0, padding:'2rem 1.2rem 0', zIndex:101, pointerEvents:'none', width:'100%' }}>
                <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center' }}>
                  <p style={{ fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', color:'rgba(245,230,204,0.95)', fontSize:'clamp(.85rem,2vw,1.1rem)', letterSpacing:'.25em', textTransform:'uppercase', textShadow:'0 2px 14px rgba(0,0,0,0.45)', marginBottom:'.6rem', opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .15s, transform .9s ease .15s' }}>
                    {ar ? 'نحن نتزوج' : 'We are getting married'}
                  </p>
                  <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(3rem,8vw,5.4rem)', fontWeight:300, color:'#fff', textShadow:'0 3px 30px rgba(0,0,0,.55)', letterSpacing:'.08em', lineHeight:1.05, opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .2s, transform .9s ease .2s' }}>
                    Marwan
                  </h1>
                  <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.6rem,4vw,2.8rem)', fontWeight:300, color:'#f2dfe8', fontStyle:'italic', textShadow:'0 3px 30px rgba(0,0,0,.45)', lineHeight:1.4, margin:'0.8rem 0 0', opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .25s, transform .9s ease .25s' }}>&amp;</div>
                  <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(3rem,8vw,5.4rem)', fontWeight:300, color:'#fff', textShadow:'0 3px 30px rgba(0,0,0,.55)', letterSpacing:'.08em', lineHeight:1.05, margin:'0 auto', opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .3s, transform .9s ease .3s' }}>
                    Dena
                  </h1>
                  <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1rem,2.5vw,1.4rem)', color:'#f2dfe8', letterSpacing:'.2em', marginTop:'.7rem', fontStyle:'italic', textShadow:'0 2px 12px rgba(0,0,0,0.55)', opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .35s, transform .9s ease .35s' }}>
                    {ar ? '١٧ مارس ٢٠٢٧' : 'May 26, 2026'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {phase === 'main' && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'100%', minHeight:'100vh' }}>

          {/* ── HERO SECTION ── */}
          <div style={{ width:'100%', position:'relative', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #1a0f14 0%, #2d1820 50%, #1a0f14 100%)' }}>
            {/* Frozen video last frame */}
            {videoFrameData && (
              <div style={{ position:'absolute', inset:0, backgroundImage: `url(${videoFrameData})`, backgroundSize:'cover', backgroundPosition:'center', zIndex:1 }} />
            )}

            {/* Dark overlay - smoothly transitions to dark */}
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1.5, opacity: heroStage === 'fade-in' || heroStage === 'image' || heroStage === 'names' ? 1 : 0, transition:'opacity 1.2s ease 0s' }} />

            {/* Image from bottom */}
            <div style={{ position:'absolute', left:'50%', bottom:'0%', width:'92%', maxWidth:620, zIndex:2, transform: heroStage === 'image' || heroStage === 'names' ? 'translate(-50%, 0)' : 'translate(-50%, 120px)', opacity: heroStage === 'image' || heroStage === 'names' ? 1 : 0, transition:'transform 1.8s ease .2s, opacity 1.2s ease .2s' }}>
              <img
                src="/wedding2.png"
                alt="Marwan & Dena"
                style={{ width:'100%', height:'auto', borderRadius:28, boxShadow:'0 32px 90px rgba(15,8,18,0.45)', border:'1px solid rgba(255,255,255,0.18)' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display='none' }}
              />
            </div>

            {/* Text from top */}
            <div style={{ position:'absolute', left:0, right:0, top:'12%', zIndex:2, pointerEvents:'none', width:'100%' }}>
              <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center', padding:'0 1rem' }}>
                <p style={{ fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', color:'rgba(245,230,204,0.95)', fontSize:'clamp(.85rem,2vw,1.1rem)', letterSpacing:'.25em', textTransform:'uppercase', textShadow:'0 2px 14px rgba(0,0,0,0.45)', marginBottom:'.6rem', opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .15s, transform .9s ease .15s' }}>
                  {ar ? 'نحن نتزوج' : 'We are getting married'}
                </p>
                <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(3rem,8vw,5.4rem)', fontWeight:300, color:'#fff', textShadow:'0 3px 30px rgba(0,0,0,.55)', letterSpacing:'.08em', lineHeight:1.05, opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .2s, transform .9s ease .2s' }}>
                  Marwan
                </h1>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.6rem,4vw,2.8rem)', fontWeight:300, color:'#f2dfe8', fontStyle:'italic', textShadow:'0 3px 30px rgba(0,0,0,.45)', lineHeight:1.4, margin:'0.8rem 0 0', opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .25s, transform .9s ease .25s' }}>&amp;</div>
                <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(3rem,8vw,5.4rem)', fontWeight:300, color:'#fff', textShadow:'0 3px 30px rgba(0,0,0,.55)', letterSpacing:'.08em', lineHeight:1.05, opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .3s, transform .9s ease .3s' }}>
                  Dena
                </h1>
                <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1rem,2.5vw,1.4rem)', color:'#f2dfe8', letterSpacing:'.2em', marginTop:'.7rem', fontStyle:'italic', textShadow:'0 2px 12px rgba(0,0,0,0.55)', opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .35s, transform .9s ease .35s' }}>
                  {ar ? '١٧ مارس ٢٠٢٧' : 'May 26, 2026'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Single flowing invitation column (not stacked form cards) ── */}
          <div
            style={{
              width: '100%',
              maxWidth: 672,
              margin: '0 auto',
              padding: 'clamp(1.25rem, 4vw, 2rem) clamp(0.75rem, 3vw, 1.15rem) 3.5rem',
              direction: ar ? 'rtl' : 'ltr',
            }}
          >
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 44,
                padding: 'clamp(1.85rem, 4.5vw, 3rem) clamp(1.1rem, 3.5vw, 2rem)',
                background:
                  'linear-gradient(168deg, rgba(52, 22, 38, 0.42) 0%, rgba(16, 6, 12, 0.55) 42%, rgba(24, 10, 18, 0.48) 100%)',
                border: '1px solid rgba(245, 200, 215, 0.08)',
                boxShadow: '0 40px 120px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255, 210, 220, 0.05)',
                backdropFilter: 'blur(26px) saturate(1.1)',
              }}
            >
              <InvPanelFlora />
              <div className="inv-unified-column" style={{ position: 'relative', zIndex: 1 }}>
              <RevealSection delay={0}>
                <div ref={nameCardRef}>
                  <div style={cardTitle}>{ar ? 'أهلاً، ما اسمك؟' : "Welcome, what's your name?"}</div>
                  <div style={cardSub}>{ar ? 'سنستخدمه في كل أقسام الدعوة' : "We'll use it across the invitation"}</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'stretch' }}>
                    <input
                      className="inv-flow-input"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveName()}
                      placeholder={ar ? 'اسمك' : 'Your name'}
                      style={{ ...inputStyle, flex: 1, minWidth: 200, marginBottom: 0, borderRadius: 999 }}
                    />
                    <button onClick={saveName} style={{ ...btnStyle, borderRadius: 999 }}>{ar ? 'متابعة' : 'Continue'}</button>
                  </div>
                  {nameMsg && (
                    <div
                      style={{
                        marginTop: '1.1rem',
                        fontFamily: 'Cormorant Garamond,serif',
                        fontStyle: 'italic',
                        color: '#d4a0b8',
                        textAlign: 'center',
                        fontSize: '1.1rem',
                        animation: 'fadeIn 0.28s ease',
                      }}
                    >
                      {nameMsg}
                    </div>
                  )}
                </div>
              </RevealSection>

              <FlowDivider accent="rose" />

              <RevealSection delay={35}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.4rem', marginBottom: '1.4rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, textAlign: 'center', minWidth: 120 }}>
                      <div style={{ fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.18em', color: '#d4a0b8', marginBottom: 6 }}>{ar ? 'تاريخ الزفاف' : 'Wedding Date'}</div>
                      <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.28rem', color: '#faf2f5' }}>{ar ? '١٧ مارس ٢٠٢٧' : 'May 26, 2026'}</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', minWidth: 120 }}>
                      <div style={{ fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.18em', color: '#d4a0b8', marginBottom: 6 }}>{ar ? 'المكان' : 'Location'}</div>
                      <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.28rem', color: '#faf2f5' }}>{ar ? 'طنطا، مصر' : 'Tanta, Egypt'}</div>
                    </div>
                  </div>

                  <p style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', fontSize: '1.02rem', color: '#d4a0b8', textAlign: 'center', marginBottom: '1.1rem', opacity: 0.95 }}>
                    {ar ? 'العد التنازلي ليومنا المميز' : 'Counting down to our big day'}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      alignItems: 'baseline',
                      gap: 'clamp(0.35rem, 2vw, 1rem)',
                      marginBottom: '1.5rem',
                    }}
                  >
                    {[
                      { val: countdown.d, lbl: ar ? 'أيام' : 'Days' },
                      { val: countdown.h, lbl: ar ? 'ساعات' : 'Hours' },
                      { val: countdown.m, lbl: ar ? 'دقائق' : 'Minutes' },
                      { val: countdown.s, lbl: ar ? 'ثواني' : 'Seconds' },
                    ].map(({ val, lbl }, i) => (
                      <Fragment key={lbl}>
                        {i > 0 && (
                          <span style={{ color: 'rgba(212, 160, 184, 0.35)', fontSize: '1.4rem', fontWeight: 200, lineHeight: 1, padding: '0 0.15rem' }} aria-hidden>
                            ·
                          </span>
                        )}
                        <div style={{ textAlign: 'center', minWidth: '3.2rem' }}>
                          <span
                            style={{
                              display: 'block',
                              fontFamily: 'Cormorant Garamond,serif',
                              fontSize: 'clamp(2rem, 7vw, 2.85rem)',
                              fontWeight: 500,
                              color: '#f2dfe8',
                              lineHeight: 1,
                              fontVariantNumeric: 'tabular-nums',
                              transition: 'color 0.3s ease',
                            }}
                          >
                            {val}
                          </span>
                          <span style={{ display: 'block', fontSize: '.58rem', textTransform: 'uppercase', letterSpacing: '.14em', color: '#d4a0b8', marginTop: 8, opacity: 0.85 }}>{lbl}</span>
                        </div>
                      </Fragment>
                    ))}
                  </div>

                  <p style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', fontSize: '1rem', color: '#d4a0b8', textAlign: 'center', marginBottom: '.75rem' }}>
                    {ar ? 'قاعة الأفراح' : 'Wedding Venue'}
                  </p>
                  <div style={{ borderRadius: 22, overflow: 'hidden', marginTop: '.25rem', boxShadow: '0 16px 48px rgba(0,0,0,0.28)' }}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55215.78!2d30.9985!3d30.7987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f7c4dc6e7b7b33%3A0x2bb5c0ca2c495e05!2sTanta%2C+Gharbia+Governorate!5e0!3m2!1sen!2seg!4v1234567890"
                      width="100%"
                      height="220"
                      style={{ border: 'none', display: 'block', filter: 'grayscale(0.2) contrast(0.9) sepia(0.25) hue-rotate(285deg) saturate(0.75) brightness(0.92)' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </RevealSection>

              <FlowDivider accent="sprig" />

              <RevealSection delay={55}>
                <div>
                  <div style={cardTitle}>{ar ? 'هل ستحضر؟' : 'Will you attend?'}</div>
                  <div style={cardSub}>{ar ? 'أخبرنا — سيتم حفظ إجابتك' : 'Let us know — your answer is saved'}</div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 12,
                      justifyContent: 'center',
                    }}
                  >
                    {[
                      { ans: 'yes', en: "Yes, I'll be there!", ar: 'نعم، سأكون هناك!' },
                      { ans: 'maybe', en: 'I hope to make it', ar: 'أتمنى أن أكون هناك' },
                      { ans: 'no', en: "Unfortunately I can't", ar: 'للأسف لن أتمكن' },
                    ].map(({ ans, en, ar: arTxt }) => (
                      <button
                        key={ans}
                        onClick={() => submitRsvp(ans)}
                        style={{
                          flex: '1 1 140px',
                          padding: '1rem 1rem',
                          border: rsvpAnswer === ans ? '1px solid rgba(255, 200, 215, 0.38)' : '1px solid rgba(232, 180, 200, 0.12)',
                          borderRadius: 999,
                          background: rsvpAnswer === ans ? 'linear-gradient(135deg, #8b3a56 0%, #5c1a32 100%)' : 'rgba(255, 245, 248, 0.03)',
                          color: rsvpAnswer === ans ? '#faf2f5' : '#e8c4d4',
                          fontFamily: 'Montserrat,sans-serif',
                          fontSize: '.78rem',
                          letterSpacing: '.05em',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                          transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.25s ease',
                          boxShadow: rsvpAnswer === ans ? '0 12px 36px rgba(60, 18, 36, 0.4)' : 'none',
                        }}
                      >
                        <span style={{ fontSize: '1.1rem' }}></span> {lang === 'ar' ? arTxt : en}
                      </button>
                    ))}
                  </div>
                  {rsvpMsg && (
                    <div style={{ marginTop: '1.1rem', fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', color: '#d4a0b8', textAlign: 'center', fontSize: '1.1rem', animation: 'fadeIn 0.25s ease' }}>{rsvpMsg}</div>
                  )}
                </div>
              </RevealSection>

              <FlowDivider accent="petal" />

              <RevealSection delay={75}>
                <div>
                  <div style={cardTitle}>{ar ? 'اكتب رسالة' : 'Write a message'}</div>
                  <div style={cardSub}>{ar ? 'شارك أمنياتك مع مروان ودينا' : 'Share your wishes with Marwan & Dena'}</div>
                  <textarea
                    className="inv-flow-input"
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                    placeholder={ar ? 'اكتب رسالتك هنا...' : 'Write your heartfelt message...'}
                    style={{
                      width: '100%',
                      border: '1px solid rgba(232, 180, 200, 0.16)',
                      borderRadius: 22,
                      padding: '1.1rem 1.2rem',
                      fontFamily: 'Cormorant Garamond,serif',
                      fontSize: '1.05rem',
                      color: '#faf2f5',
                      background: 'rgba(8, 3, 8, 0.35)',
                      resize: 'vertical',
                      minHeight: 120,
                      outline: 'none',
                      lineHeight: 1.65,
                      boxShadow: 'inset 0 2px 14px rgba(0,0,0,0.12)',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <button onClick={submitMessage} style={{ ...btnStyle, borderRadius: 999 }}>{ar ? 'أرسل التهاني' : 'Send Wishes'}</button>
                    {msgSent && (
                      <span style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', color: '#d4a0b8', fontSize: '1rem', animation: 'fadeIn 0.25s ease' }}>
                        {ar ? '💌 تم! سيسعدهم قراءة رسالتك.' : "💌 Sent! They'll love reading this."}
                      </span>
                    )}
                  </div>

                  {messages.length > 0 && (
                    <>
                      <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.16em', color: '#d4a0b8', marginTop: '2rem', marginBottom: '.85rem' }}>{ar ? 'تهاني الضيوف' : 'Guest Wishes'}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 310, overflowY: 'auto', paddingRight: 4 }}>
                        {messages.map(m => (
                          <div
                            key={m.id}
                            style={{
                              padding: '1rem 0',
                              borderBottom: '1px solid rgba(232, 180, 200, 0.1)',
                            }}
                          >
                            <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.12em', color: '#d4a0b8', marginBottom: 6 }}>{m.name}</div>
                            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.02rem', color: '#faf2f5', lineHeight: 1.58 }}>{m.message}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </RevealSection>

              <FlowDivider accent="pair" />

              <RevealSection delay={95}>
                <div>
                  <div style={cardTitle}>{ar ? 'ارسم لنا شيئاً' : 'Draw something for us'}</div>
                  <div style={cardSub}>{ar ? 'ستُحفظ للأبد' : 'Saved forever for Marwan & Dena'}</div>

                  <div style={{ borderRadius: 24, overflow: 'hidden', background: '#fff', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.22)' }}>
                    <canvas ref={canvasRef} width={660} height={280} style={{ display: 'block', width: '100%', height: 'auto' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      {colors.map(c => (
                        <div
                          key={c}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setDrawColor(c)
                              setIsEraser(false)
                            }
                          }}
                          onClick={() => {
                            setDrawColor(c)
                            setIsEraser(false)
                          }}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: c,
                            border: drawColor === c && !isEraser ? '2.5px solid #faf2f5' : c === '#faf2f5' ? '1px solid #ddd' : '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            flexShrink: 0,
                            boxShadow: drawColor === c && !isEraser ? '0 0 0 2px rgba(232,180,200,0.35)' : 'none',
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <input type="range" min={2} max={22} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} style={{ flex: 1, accentColor: '#6b2540', minWidth: 100 }} />
                      <button onClick={() => setIsEraser(e => !e)} style={{ ...toolBtn, background: isEraser ? 'rgba(107,37,64,0.4)' : 'transparent', borderColor: isEraser ? '#d4a0b8' : 'rgba(228,175,195,.35)', color: isEraser ? '#faf2f5' : '#d4a0b8' }}>
                        {ar ? 'ممحاة ✏️' : '✏️ Eraser'}
                      </button>
                      <button onClick={undoCanvas} style={toolBtn}>{ar ? 'تراجع ↩' : '↩ Undo'}</button>
                      <button onClick={clearCanvas} style={toolBtn}>{ar ? 'مسح 🗑' : '🗑 Clear'}</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1.1rem' }}>
                    <button onClick={submitDrawing} style={{ ...btnStyle, borderRadius: 999 }}>{ar ? 'أرسل الرسمة' : 'Submit Drawing'}</button>
                    {drawSent && (
                      <span style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', color: '#d4a0b8', fontSize: '1rem', animation: 'fadeIn 0.25s ease' }}>
                        {ar ? '🎨 رائع! تمّ إرسالها.' : '🎨 Beautiful! Submitted for review.'}
                      </span>
                    )}
                  </div>
                </div>
              </RevealSection>

              {drawings.length > 0 && (
                <>
                  <FlowDivider accent="sprig" />
                  <RevealSection delay={50}>
                    <div>
                      <div style={cardTitle}>{ar ? 'معرض لوحات الضيوف' : 'Guest Artwork Gallery'}</div>
                      <div style={cardSub}>{ar ? 'صوّت للمفضلة' : 'Vote for your favourites'}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(152px, 1fr))', gap: 14 }}>
                        {drawings.map(d => (
                          <div
                            key={d.id}
                            className="gallery-tile"
                            style={{
                              borderRadius: 20,
                              overflow: 'hidden',
                              background: '#fff',
                              position: 'relative',
                              cursor: 'default',
                              boxShadow: '0 12px 32px rgba(0,0,0,0.14)',
                              transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease',
                            }}
                          >
                            {d.rank && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 8,
                                  left: 8,
                                  width: 26,
                                  height: 26,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(145deg, #e8b4c4, #c9788c)',
                                  color: '#14080c',
                                  fontFamily: 'Cormorant Garamond,serif',
                                  fontSize: '.85rem',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                }}
                              >
                                {d.rank}
                              </div>
                            )}
                            <img src={d.image_data} alt={d.name} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                            <div style={{ padding: '.55rem .85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(250,242,245,0.97)' }}>
                              <span style={{ fontSize: '.65rem', color: '#7a5060', textTransform: 'uppercase', letterSpacing: '.1em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>{d.name}</span>
                              <button
                                onClick={() => voteDrawing(d.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  padding: '.32rem .7rem',
                                  border: '1px solid rgba(200, 140, 160, 0.35)',
                                  borderRadius: 999,
                                  background: 'transparent',
                                  color: '#8b3a56',
                                  fontSize: '.7rem',
                                  fontFamily: 'Montserrat,sans-serif',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s ease',
                                }}
                              >
                                ♥ {d.votes || 0}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </RevealSection>
                </>
              )}

              <FlowDivider accent="sparkle" />

              <RevealSection delay={40}>
                <footer style={{ textAlign: 'center', padding: '0.5rem 0.5rem 0.25rem', width: '100%' }}>
                  <div style={{ width: 56, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,160,184,0.5), transparent)', margin: '0.5rem auto 1.25rem' }} />
                  <p style={{ fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic', fontSize: '1.08rem', color: '#d4a0b8', letterSpacing: '.04em' }}>{ar ? 'بكل محبة، مروان ودينا' : 'With love, Marwan & Dena'}</p>
                  <div style={{ textAlign: 'center', color: 'rgba(212,160,184,0.55)', letterSpacing: '.45em', fontSize: '.72rem', margin: '.85rem 0 0' }}>✦</div>
                </footer>
              </RevealSection>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeDown { from{opacity:0;transform:translateY(-40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(60px)} to{opacity:1;transform:translateY(0)} }
        .inv-flow-input { transition: border-color 0.28s ease, box-shadow 0.28s ease; }
        .inv-flow-input:focus {
          border-color: rgba(232, 180, 200, 0.45) !important;
          box-shadow: inset 0 2px 12px rgba(0,0,0,0.12), 0 0 0 1px rgba(232, 180, 200, 0.14) !important;
        }
        .inv-unified-column {
          background: linear-gradient(
            180deg,
            rgba(255, 248, 250, 0.045) 0%,
            transparent 14%,
            transparent 86%,
            rgba(255, 245, 248, 0.04) 100%
          );
        }
        .section-blend {
          position: relative;
          min-height: clamp(56px, 10vw, 88px);
          margin: 0.2rem 0 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
        }
        .section-blend__veil--from-above {
          position: absolute;
          left: 0;
          right: 0;
          top: -4px;
          height: 58%;
          background: linear-gradient(
            to bottom,
            rgba(8, 2, 8, 0) 0%,
            rgba(20, 8, 16, 0.28) 75%,
            rgba(20, 8, 16, 0) 100%
          );
          pointer-events: none;
        }
        .section-blend__veil--from-below {
          position: absolute;
          left: 0;
          right: 0;
          bottom: -4px;
          height: 58%;
          background: linear-gradient(
            to top,
            rgba(8, 2, 8, 0) 0%,
            rgba(20, 8, 16, 0.28) 75%,
            rgba(20, 8, 16, 0) 100%
          );
          pointer-events: none;
        }
        .section-blend__bloom {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: min(240px, 78%);
          height: 52px;
          background: radial-gradient(ellipse at center, rgba(255, 195, 210, 0.16) 0%, transparent 72%);
          pointer-events: none;
        }
        .section-blend__vine-hint {
          position: absolute;
          left: 6%;
          right: 6%;
          top: 50%;
          height: 1px;
          transform: translateY(-50%);
          background: linear-gradient(90deg, transparent, rgba(255, 200, 218, 0.28), transparent);
          opacity: 0.85;
          pointer-events: none;
        }
        .section-blend__motif {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 18px;
        }
        @keyframes sectionBlendMist {
          0%, 100% { opacity: 0.88; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        .section-blend__motif .inv-flora--divider {
          animation: sectionBlendMist 3.5s ease-in-out infinite;
        }
        @media (hover: hover) {
          .gallery-tile:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 20px 48px rgba(0,0,0,0.2);
          }
        }
        @keyframes invFloraSway {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(1.5deg); }
        }
        @keyframes invFloraSwayAlt {
          0%, 100% { transform: translateY(0) rotate(1.5deg); }
          50% { transform: translateY(-6px) rotate(-2deg); }
        }
        @keyframes invFloraLine {
          0%, 100% { opacity: 0.28; }
          50% { opacity: 0.42; }
        }
        @keyframes invDividerBreathe {
          0%, 100% { transform: scale(1); opacity: 0.92; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        .inv-flora--a { animation: invFloraSway 8s ease-in-out infinite; }
        .inv-flora--b { animation: invFloraSwayAlt 11s ease-in-out infinite; animation-delay: -2.5s; }
        .inv-flora--c { animation: invFloraSway 9.5s ease-in-out infinite; animation-delay: -4s; }
        .inv-flora--d { animation: invFloraSwayAlt 7.5s ease-in-out infinite; animation-delay: -1s; }
        .inv-flora--e { animation: invFloraLine 14s ease-in-out infinite; }
        .inv-flora--divider { animation: invDividerBreathe 5s ease-in-out infinite; }
        @keyframes invVineEdgePulse {
          0%, 100% { opacity: 0.68; }
          50% { opacity: 0.88; }
        }
        .inv-flora--vine-edges { animation: invVineEdgePulse 14s ease-in-out infinite; opacity: 0.78; }
        .inv-flora--vine-corner { animation: invFloraSwayAlt 13s ease-in-out infinite; animation-delay: -2.5s; }
        @media (prefers-reduced-motion: reduce) {
          .reveal-section { opacity: 1 !important; transform: none !important; transition: none !important; }
          .section-blend__motif .inv-flora--divider { animation: none !important; }
          .gallery-tile { transition: none !important; }
          .gallery-tile:hover { transform: none !important; }
          .inv-flora--a, .inv-flora--b, .inv-flora--c, .inv-flora--d, .inv-flora--e, .inv-flora--divider,
          .inv-flora--vine-edges, .inv-flora--vine-corner {
            animation: none !important;
          }
          .inv-flora--vine-edges { opacity: 0.8 !important; }
        }
      `}</style>
    </div>
  )
}

/* ── Shared style objects ── */
const cardTitle: React.CSSProperties = {
  fontFamily: 'Cormorant Garamond, serif',
  fontSize: '1.55rem',
  fontWeight: 400,
  color: '#faf2f5',
  letterSpacing: '.06em',
  lineHeight: 1.2,
}
const cardSub: React.CSSProperties = {
  fontSize: '.68rem',
  textTransform: 'uppercase',
  letterSpacing: '.18em',
  color: '#d4a0b8',
  marginTop: 3,
  marginBottom: '1.2rem',
}
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.95rem 1.25rem',
  border: '1px solid rgba(232, 180, 200, 0.22)',
  borderRadius: 14,
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '.88rem',
  color: '#faf2f5',
  background: 'rgba(12, 5, 10, 0.55)',
  outline: 'none',
  marginBottom: 12,
  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
}
const btnStyle: React.CSSProperties = {
  padding: '.82rem 2.35rem',
  background: 'linear-gradient(135deg, #8b3a56 0%, #5c1a32 55%, #4a1528 100%)',
  color: '#faf2f5',
  border: '1px solid rgba(255, 200, 215, 0.22)',
  borderRadius: 14,
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '.74rem',
  letterSpacing: '.14em',
  cursor: 'pointer',
  boxShadow: '0 8px 28px rgba(74, 21, 40, 0.5)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
}
const toolBtn: React.CSSProperties = {
  padding: '.48rem 1.05rem',
  border: '1px solid rgba(232, 180, 200, 0.28)',
  borderRadius: 999,
  background: 'rgba(18, 6, 14, 0.55)',
  color: '#d4a0b8',
  fontSize: '.7rem',
  fontFamily: 'Montserrat, sans-serif',
  letterSpacing: '.07em',
  cursor: 'pointer',
  transition: 'background 0.2s ease, border-color 0.2s ease',
}
