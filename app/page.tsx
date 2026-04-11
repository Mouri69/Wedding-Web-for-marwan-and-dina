'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

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

export default function Home() {
  const WEDDING_DATE = new Date('2027-03-17T18:00:00')
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
  const [drawColor, setDrawColor] = useState('#613F21')
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
    ctx.strokeStyle = isEraser ? '#5B4242' : drawColor
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

  const colors = ['#613F21','#c19f7c','#291B12','#6e9e82','#7590bf','#1a1410','#f5e6d3']

  /* ══════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a1410 0%, #2d2219 50%, #3d2817 100%)' }}>
      {/* Hidden canvas for capturing video frame */}
      <canvas ref={frameCanvasRef} style={{ display:'none' }} />

      {/* ── LANG TOGGLE ── */}
      {phase === 'main' && (
        <div style={{ position:'fixed', top:'1rem', right:'1rem', zIndex:999, display:'flex', background:'rgba(41,27,18,0.94)', border:'0.5px solid rgba(193,159,124,0.35)', borderRadius:30, overflow:'hidden', backdropFilter:'blur(8px)', boxShadow:'0 2px 16px rgba(0,0,0,0.3)' }}>
          {(['en','ar'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ padding:'.4rem 1rem', fontSize:'.72rem', letterSpacing:'.1em', border:'none', background: lang===l ? '#613F21' : 'transparent', color: lang===l ? '#f5e6d3' : '#c19f7c', cursor:'pointer', borderRadius:30, fontFamily:'Montserrat,sans-serif' }}>
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
                  alt="Marwan & Dina"
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
                  <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.6rem,4vw,2.8rem)', fontWeight:300, color:'#f5e6cc', fontStyle:'italic', textShadow:'0 3px 30px rgba(0,0,0,.45)', lineHeight:1.4, margin:'0.8rem 0 0', opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .25s, transform .9s ease .25s' }}>&amp;</div>
                  <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(3rem,8vw,5.4rem)', fontWeight:300, color:'#fff', textShadow:'0 3px 30px rgba(0,0,0,.55)', letterSpacing:'.08em', lineHeight:1.05, margin:'0 auto', opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .3s, transform .9s ease .3s' }}>
                    Dina
                  </h1>
                  <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1rem,2.5vw,1.4rem)', color:'#f5e6cc', letterSpacing:'.2em', marginTop:'.7rem', fontStyle:'italic', textShadow:'0 2px 12px rgba(0,0,0,0.55)', opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .35s, transform .9s ease .35s' }}>
                    {ar ? '١٧ مارس ٢٠٢٧' : 'March 17, 2027'}
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
                alt="Marwan & Dina"
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
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.6rem,4vw,2.8rem)', fontWeight:300, color:'#f5e6cc', fontStyle:'italic', textShadow:'0 3px 30px rgba(0,0,0,.45)', lineHeight:1.4, margin:'0.8rem 0 0', opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .25s, transform .9s ease .25s' }}>&amp;</div>
                <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(3rem,8vw,5.4rem)', fontWeight:300, color:'#fff', textShadow:'0 3px 30px rgba(0,0,0,.55)', letterSpacing:'.08em', lineHeight:1.05, opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .3s, transform .9s ease .3s' }}>
                  Dina
                </h1>
                <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1rem,2.5vw,1.4rem)', color:'#f5e6cc', letterSpacing:'.2em', marginTop:'.7rem', fontStyle:'italic', textShadow:'0 2px 12px rgba(0,0,0,0.55)', opacity: heroStage === 'names' ? 1 : 0, transform: heroStage === 'names' ? 'translateY(0)' : 'translateY(-30px)', transition:'opacity .9s ease .35s, transform .9s ease .35s' }}>
                  {ar ? '١٧ مارس ٢٠٢٧' : 'March 17, 2027'}
                </p>
              </div>
            </div>
          </div>

          {/* ── CARDS SECTION ── */}
          <div style={{ width:'100%', maxWidth:720, padding:'3rem 1.2rem', display:'flex', flexDirection:'column', gap:'2rem', paddingBottom:'4rem', direction: ar ? 'rtl' : 'ltr' }}>

            {/* ── NAME CARD ── */}
            <div ref={nameCardRef} style={card}>
              <div style={cardTitle}>{ar ? 'أهلاً، ما اسمك؟' : "Welcome, what's your name?"}</div>
              <div style={cardSub}>{ar ? 'سنستخدمه في كل أقسام الدعوة' : "We'll use it across the invitation"}</div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <input
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  placeholder={ar ? 'اسمك' : 'Your name'}
                  style={{ ...inputStyle, flex:1, marginBottom:0 }}
                />
                <button onClick={saveName} style={btnStyle}>{ar ? 'متابعة' : 'Continue'}</button>
              </div>
              {nameMsg && <div style={{ marginTop:'1rem', fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', color:'#c19f7c', textAlign:'center', fontSize:'1.1rem' }}>{nameMsg}</div>}
            </div>

            {/* ── DATE + COUNTDOWN + MAP ── */}
            <div style={card}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:'1.4rem', marginBottom:'1.2rem', flexWrap:'wrap' }}>
                <div style={{ flex:1, textAlign:'center', minWidth:120 }}>
                  <div style={{ fontSize:'.6rem', textTransform:'uppercase', letterSpacing:'.18em', color:'#c19f7c', marginBottom:5 }}>{ar ? 'تاريخ الزفاف' : 'Wedding Date'}</div>
                  <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.25rem', color:'#f5e6d3' }}>{ar ? '١٧ مارس ٢٠٢٧' : 'March 17, 2027'}</div>
                </div>
                <div style={{ flex:1, textAlign:'center', minWidth:120 }}>
                  <div style={{ fontSize:'.6rem', textTransform:'uppercase', letterSpacing:'.18em', color:'#c19f7c', marginBottom:5 }}>{ar ? 'المكان' : 'Location'}</div>
                  <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.25rem', color:'#f5e6d3' }}>{ar ? 'طنطا، مصر' : 'Tanta, Egypt'}</div>
                </div>
              </div>

              <div style={{ textAlign:'center', color:'#c19f7c', letterSpacing:'.5em', fontSize:'.78rem', margin:'.9rem 0', opacity:.7 }}>✦ &nbsp;✦ &nbsp;✦</div>

              <p style={{ fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', fontSize:'1rem', color:'#c19f7c', textAlign:'center', marginBottom:'.6rem' }}>
                {ar ? 'العد التنازلي ليومنا المميز' : 'Counting down to our big day'}
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                {[
                  { val: countdown.d, lbl: ar ? 'أيام' : 'Days' },
                  { val: countdown.h, lbl: ar ? 'ساعات' : 'Hours' },
                  { val: countdown.m, lbl: ar ? 'دقائق' : 'Minutes' },
                  { val: countdown.s, lbl: ar ? 'ثواني' : 'Seconds' },
                ].map(({ val, lbl }) => (
                  <div key={lbl} style={{ background:'rgba(97,63,33,0.3)', border:'0.5px solid rgba(193,159,124,.28)', borderRadius:14, padding:'1rem .4rem', textAlign:'center' }}>
                    <span style={{ display:'block', fontFamily:'Cormorant Garamond,serif', fontSize:'2.4rem', fontWeight:600, color:'#c19f7c', lineHeight:1 }}>{val}</span>
                    <span style={{ display:'block', fontSize:'.55rem', textTransform:'uppercase', letterSpacing:'.13em', color:'#a67d5f', marginTop:4 }}>{lbl}</span>
                  </div>
                ))}
              </div>

              <div style={{ textAlign:'center', color:'#c19f7c', letterSpacing:'.5em', fontSize:'.78rem', margin:'1.4rem 0 .8rem', opacity:.7 }}>✦ &nbsp;✦ &nbsp;✦</div>
              <p style={{ fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', fontSize:'1rem', color:'#c19f7c', textAlign:'center', marginBottom:'.8rem' }}>
                {ar ? 'قاعة الأفراح' : 'Wedding Venue'}
              </p>
              <div style={{ borderRadius:12, overflow:'hidden', border:'0.5px solid rgba(201,121,140,0.22)', marginTop:'.4rem' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55215.78!2d30.9985!3d30.7987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f7c4dc6e7b7b33%3A0x2bb5c0ca2c495e05!2sTanta%2C+Gharbia+Governorate!5e0!3m2!1sen!2seg!4v1234567890"
                  width="100%"
                  height="220"
                  style={{ border:'1px solid rgba(193,159,124,.25)', display:'block', filter:'invert(0.85) hue-rotate(200deg)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* ── RSVP ── */}
            <div style={card}>
              <div style={cardTitle}>{ar ? 'هل ستحضر؟' : 'Will you attend?'}</div>
              <div style={cardSub}>{ar ? 'أخبرنا — سيتم حفظ إجابتك' : 'Let us know — your answer is saved'}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { ans:'yes',   icon:'🎉', en:"Yes, I'll be there!", ar:'نعم، سأكون هناك!' },
                  { ans:'maybe', icon:'🤞', en:'I hope to make it',   ar:'أتمنى أن أكون هناك' },
                  { ans:'no',    icon:'💔', en:"Unfortunately I can't", ar:'للأسف لن أتمكن' },
                ].map(({ ans, icon, en, ar: arTxt }) => (
                  <button
                    key={ans}
                    onClick={() => submitRsvp(ans)}
                    style={{ padding:'.85rem 1.4rem', border: rsvpAnswer===ans ? '1px solid rgba(193,159,124,.3)' : '1px solid rgba(193,159,124,.25)', borderRadius:10, background: rsvpAnswer===ans ? '#613F21' : 'transparent', color: rsvpAnswer===ans ? '#f5e6d3' : '#c19f7c', fontFamily:'Montserrat,sans-serif', fontSize:'.78rem', letterSpacing:'.08em', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'all .2s' }}
                  >
                    <span>{icon}</span> {lang==='ar' ? arTxt : en}
                  </button>
                ))}
              </div>
              {rsvpMsg && <div style={{ marginTop:'1rem', fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', color:'#c19f7c', textAlign:'center', fontSize:'1.1rem' }}>{rsvpMsg}</div>}
            </div>

            {/* ── MESSAGE ── */}
            <div style={card}>
              <div style={cardTitle}>{ar ? 'اكتب رسالة' : 'Write a message'}</div>
              <div style={cardSub}>{ar ? 'شارك أمنياتك مع مروان ودينا' : 'Share your wishes with Marwan & Dina'}</div>
              <textarea
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                placeholder={ar ? 'اكتب رسالتك هنا...' : 'Write your heartfelt message...'}
                style={{ width:'100%', border:'1px solid rgba(193,159,124,.35)', borderRadius:10, padding:'.85rem 1rem', fontFamily:'Cormorant Garamond,serif', fontSize:'1.05rem', color:'#f5e6d3', background:'rgba(41,27,18,.8)', resize:'vertical', minHeight:100, outline:'none', lineHeight:1.6 }}
              />
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap', marginTop:'.8rem' }}>
                <button onClick={submitMessage} style={btnStyle}>{ar ? 'أرسل التهاني' : 'Send Wishes'}</button>
                {msgSent && <span style={{ fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', color:'#c19f7c', fontSize:'1rem' }}>{ar ? '💌 تم! سيسعدهم قراءة رسالتك.' : '💌 Sent! They\'ll love reading this.'}</span>}
              </div>

              {/* Approved messages wall */}
              {messages.length > 0 && (
                <>
                  <div style={{ fontSize:'.65rem', textTransform:'uppercase', letterSpacing:'.16em', color:'#c19f7c', marginTop:'1.8rem', marginBottom:'.8rem' }}>
                    {ar ? 'تهاني الضيوف' : 'Guest Wishes'}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10, maxHeight:310, overflowY:'auto', paddingRight:4 }}>
                    {messages.map(m => (
                      <div key={m.id} style={{ background:'rgba(97,63,33,0.25)', border:'0.5px solid rgba(193,159,124,.2)', borderRadius:14, padding:'.85rem 1rem' }}>
                        <div style={{ fontSize:'.65rem', textTransform:'uppercase', letterSpacing:'.12em', color:'#c19f7c', marginBottom:4 }}>{m.name}</div>
                        <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1rem', color:'#f5e6d3', lineHeight:1.55 }}>{m.message}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ── DRAWING CANVAS ── */}
            <div style={card}>
              <div style={cardTitle}>{ar ? 'ارسم لنا شيئاً' : 'Draw something for us'}</div>
              <div style={cardSub}>{ar ? 'ستُحفظ للأبد' : 'Saved forever for Marwan & Dina'}</div>

              <div style={{ border:'1px solid rgba(193,159,124,.25)', borderRadius:14, overflow:'hidden', background:'#fff', position:'relative' }}>
                <canvas ref={canvasRef} width={660} height={280} style={{ display:'block', width:'100%', height:'auto' }} />
              </div>

              {/* Toolbar */}
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:'.9rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  {colors.map(c => (
                    <div
                      key={c}
                      onClick={() => { setDrawColor(c); setIsEraser(false) }}
                      style={{ width:22, height:22, borderRadius:'50%', background:c, border: drawColor===c && !isEraser ? '2.5px solid #f5e6d3' : c==='#f5e6d3' ? '1px solid #ddd' : '2px solid transparent', cursor:'pointer', transition:'transform .15s', flexShrink:0 }}
                    />
                  ))}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <input type="range" min={2} max={22} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} style={{ flex:1, accentColor:'#613F21', minWidth:80 }} />
                  <button onClick={() => setIsEraser(e => !e)} style={{ ...toolBtn, background: isEraser ? 'rgba(97,63,33,0.4)' : 'transparent', borderColor: isEraser ? '#c19f7c' : 'rgba(193,159,124,.35)', color: isEraser ? '#f5e6d3' : '#c19f7c' }}>
                    {ar ? 'ممحاة ✏️' : '✏️ Eraser'}
                  </button>
                  <button onClick={undoCanvas} style={toolBtn}>{ar ? 'تراجع ↩' : '↩ Undo'}</button>
                  <button onClick={clearCanvas} style={toolBtn}>{ar ? 'مسح 🗑' : '🗑 Clear'}</button>
                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap', marginTop:'1rem' }}>
                <button onClick={submitDrawing} style={btnStyle}>{ar ? 'أرسل الرسمة' : 'Submit Drawing'}</button>
                {drawSent && <span style={{ fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', color:'#c19f7c', fontSize:'1rem' }}>{ar ? '🎨 رائع! تمّ إرسالها.' : '🎨 Beautiful! Submitted for review.'}</span>}
              </div>
            </div>

            {/* ── APPROVED DRAWINGS GALLERY ── */}
            {drawings.length > 0 && (
              <div style={card}>
                <div style={cardTitle}>{ar ? 'معرض لوحات الضيوف' : 'Guest Artwork Gallery'}</div>
                <div style={cardSub}>{ar ? 'صوّت للمفضلة' : 'Vote for your favourites'}</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
                  {drawings.map((d, idx) => (
                    <div key={d.id} style={{ border:'0.5px solid rgba(193,159,124,.22)', borderRadius:14, overflow:'hidden', background:'#fff', position:'relative', transition:'transform .2s', cursor:'default' }}>
                      {d.rank && (
                        <div style={{ position:'absolute', top:8, left:8, width:26, height:26, borderRadius:'50%', background:'#c19f7c', color:'#1a1410', fontFamily:'Cormorant Garamond,serif', fontSize:'.85rem', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {d.rank}
                        </div>
                      )}
                      <img src={d.image_data} alt={d.name} style={{ width:'100%', aspectRatio:'4/3', objectFit:'cover', display:'block' }} />
                      <div style={{ padding:'.55rem .8rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:'.65rem', color:'#a67d5f', textTransform:'uppercase', letterSpacing:'.1em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:80 }}>{d.name}</span>
                        <button onClick={() => voteDrawing(d.id)} style={{ display:'flex', alignItems:'center', gap:5, padding:'.3rem .65rem', border:'0.5px solid rgba(193,159,124,.35)', borderRadius:20, background:'transparent', color:'#c19f7c', fontSize:'.7rem', fontFamily:'Montserrat,sans-serif', cursor:'pointer' }}>
                          ♥ {d.votes || 0}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── FOOTER ── */}
            <footer style={{ textAlign:'center', padding:'2.5rem 1rem', width:'100%' }}>
              <div style={{ width:50, height:1, background:'#c19f7c', margin:'1.2rem auto', opacity:.55 }} />
              <p style={{ fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', fontSize:'1.05rem', color:'#c19f7c', letterSpacing:'.04em' }}>
                {ar ? 'بكل محبة، مروان ودينا' : 'With love, Marwan & Dina'}
              </p>
              <div style={{ textAlign:'center', color:'#c19f7c', letterSpacing:'.5em', fontSize:'.78rem', margin:'.8rem 0 0', opacity:.7 }}>✦ &nbsp;✦ &nbsp;✦</div>
            </footer>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeDown { from{opacity:0;transform:translateY(-40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(60px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}

/* ── Shared style objects ── */
const card: React.CSSProperties = {
  background: 'rgba(41,27,18,0.65)',
  border: '1px solid rgba(193,159,124,0.25)',
  borderRadius: 16,
  padding: '2.2rem 2.4rem',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 16px 60px rgba(0,0,0,0.4)',
}
const cardTitle: React.CSSProperties = {
  fontFamily: 'Cormorant Garamond, serif',
  fontSize: '1.55rem',
  fontWeight: 400,
  color: '#f5e6d3',
  letterSpacing: '.06em',
  lineHeight: 1.2,
}
const cardSub: React.CSSProperties = {
  fontSize: '.68rem',
  textTransform: 'uppercase',
  letterSpacing: '.18em',
  color: '#c19f7c',
  marginTop: 3,
  marginBottom: '1.2rem',
}
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '.85rem 1.2rem',
  border: '1px solid rgba(193,159,124,.4)',
  borderRadius: 10,
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '.88rem',
  color: '#f5e6d3',
  background: 'rgba(41,27,18,.8)',
  outline: 'none',
  marginBottom: 12,
}
const btnStyle: React.CSSProperties = {
  padding: '.78rem 2.2rem',
  background: '#613F21',
  color: '#f5e6d3',
  border: '1px solid rgba(193,159,124,.3)',
  borderRadius: 10,
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '.74rem',
  letterSpacing: '.14em',
  cursor: 'pointer',
}
const toolBtn: React.CSSProperties = {
  padding: '.42rem 1rem',
  border: '1px solid rgba(193,159,124,.35)',
  borderRadius: 8,
  background: 'rgba(41,27,18,.6)',
  color: '#c19f7c',
  fontSize: '.7rem',
  fontFamily: 'Montserrat, sans-serif',
  letterSpacing: '.07em',
  cursor: 'pointer',
}
