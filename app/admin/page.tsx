'use client'
import { useState, useEffect, useCallback } from 'react'

interface RSVP { id:number; name:string; answer:string; created_at:string }
interface Message { id:number; name:string; message:string; approved:boolean; created_at:string }
interface Drawing { id:number; name:string; image_data:string; votes:number; approved:boolean; rank:number|null; created_at:string }
interface UploadPhoto { id:number; image_data:string; votes:number; approved:boolean; created_at:string }

const TIMELINE_OPTIONS = [
  { key: 'meet-greet', label: 'Meet & Greet' },
  { key: 'ceremony', label: 'The Ceremony' },
  { key: 'party', label: 'Party' },
  { key: 'caricateur-sketch', label: 'Caricateur Sketch' },
  { key: 'photos', label: 'Photos' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'break', label: 'Break' },
  { key: 'farewell', label: 'Farewell' },
]

function encPw(password: string) {
  return encodeURIComponent(password.trim())
}

export default function AdminPage() {
  const [pw, setPw] = useState('')
  const [inputPw, setInputPw] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [authed, setAuthed] = useState(false)

  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [uploads, setUploads] = useState<UploadPhoto[]>([])
  const [rsvpFilter, setRsvpFilter] = useState('all')
  const [activeTab, setActiveTab] = useState<'rsvps'|'messages'|'drawings'|'uploads'|'timeline'>('rsvps')
  const [loading, setLoading] = useState(false)
  const [rankInput, setRankInput] = useState<Record<number, string>>({})
  const [currentTimelineEvent, setCurrentTimelineEvent] = useState<string | null>(null)

  const api = useCallback(async (path: string, opts?: RequestInit) => {
    const res = await fetch(path, opts)
    return res
  }, [])

  const loadAll = useCallback(async (password: string) => {
    setLoading(true)
    try {
      const q = encPw(password)
      const [rRes, mRes, dRes, uRes, tRes] = await Promise.all([
        api(`/api/admin/rsvps?password=${q}`),
        api(`/api/admin/messages?password=${q}`),
        api(`/api/admin/drawings?password=${q}`),
        api(`/api/admin/uploads?password=${q}`),
        api(`/api/admin/timeline/current?password=${q}`),
      ])
      
      const r = await rRes.json()
      const m = await mRes.json()
      const d = await dRes.json()
      const u = await uRes.json()
      const t = await tRes.json()
      
      setRsvps(Array.isArray(r) ? r : [])
      setMessages(Array.isArray(m) ? m : [])
      setDrawings(Array.isArray(d) ? d : [])
      setUploads(Array.isArray(u) ? u : [])
      setCurrentTimelineEvent(typeof t?.currentEvent === 'string' ? t.currentEvent : null)
    } catch (e) {
      console.error('Failed to load data:', e)
      setRsvps([])
      setMessages([])
      setDrawings([])
      setUploads([])
      setCurrentTimelineEvent(null)
    } finally {
      setLoading(false)
    }
  }, [api])

  // Auto-login from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('weddingAdminPw')
    if (!saved) return
    const trimmed = saved.trim()
    fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password: trimmed }) })
      .then(r => { if (r.ok) { setPw(trimmed); setAuthed(true); loadAll(trimmed) } else { localStorage.removeItem('weddingAdminPw') } })
  }, [loadAll])

  async function login() {
    const trimmed = inputPw.trim()
    if (!trimmed) return
    const res = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password: trimmed }) })
    if (res.ok) {
      setPw(trimmed)
      setAuthed(true)
      localStorage.setItem('weddingAdminPw', trimmed)
      loadAll(trimmed)
    } else {
      setLoginErr('❌ Wrong password, try again')
    }
  }

  function logout() {
    setAuthed(false)
    setPw('')
    localStorage.removeItem('weddingAdminPw')
  }

  async function toggleMessageApproval(id: number, approved: boolean) {
    await api(`/api/admin/messages/${id}?password=${encPw(pw)}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ approved }) })
    setMessages(prev => prev.map(m => m.id===id ? {...m, approved} : m))
  }

  async function deleteMessage(id: number) {
    if (!confirm('Delete this message? Cannot be undone.')) return
    await api(`/api/admin/messages/${id}?password=${encPw(pw)}`, { method:'DELETE' })
    setMessages(prev => prev.filter(m => m.id!==id))
  }

  async function toggleDrawingApproval(id: number, approved: boolean, rank: number|null) {
    await api(`/api/admin/drawings/${id}?password=${encPw(pw)}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ approved, rank }) })
    setDrawings(prev => prev.map(d => d.id===id ? {...d, approved, rank} : d))
  }

  async function updateRank(id: number) {
    const r = rankInput[id]
    const rankVal = r ? Number(r) : null
    await api(`/api/admin/drawings/${id}?password=${encPw(pw)}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ approved: drawings.find(d=>d.id===id)?.approved ?? false, rank: rankVal }) })
    setDrawings(prev => prev.map(d => d.id===id ? {...d, rank: rankVal} : d))
  }

  async function deleteDrawing(id: number) {
    if (!confirm('Delete this drawing? Cannot be undone.')) return
    await api(`/api/admin/drawings/${id}?password=${encPw(pw)}`, { method:'DELETE' })
    setDrawings(prev => prev.filter(d => d.id!==id))
  }

  async function toggleUploadApproval(id: number, approved: boolean) {
    await api(`/api/admin/uploads/${id}?password=${encPw(pw)}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ approved }) })
    setUploads(prev => prev.map(u => u.id===id ? {...u, approved} : u))
  }

  async function deleteUpload(id: number) {
    if (!confirm('Delete this photo? Cannot be undone.')) return
    await api(`/api/admin/uploads/${id}?password=${encPw(pw)}`, { method:'DELETE' })
    setUploads(prev => prev.filter(u => u.id!==id))
  }

  async function updateCurrentTimelineEvent(nextEvent: string | null) {
    const res = await api(`/api/admin/timeline/current?password=${encPw(pw)}`, {
      method: 'PATCH',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ currentEvent: nextEvent }),
    })
    if (!res.ok) return
    const data = await res.json()
    setCurrentTimelineEvent(typeof data.currentEvent === 'string' ? data.currentEvent : null)
  }

  function fmtDate(iso: string) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
  }

  const yes   = rsvps.filter(r => r.answer==='yes').length
  const maybe = rsvps.filter(r => r.answer==='maybe').length
  const no    = rsvps.filter(r => r.answer==='no').length
  const filteredRsvps = rsvpFilter==='all' ? rsvps : rsvps.filter(r => r.answer===rsvpFilter)

  /* ── LOGIN SCREEN ── */
  if (!authed) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(155deg,#fdf0f3,#fdf8f5,#f8efe8)' }}>
      <div style={{ background:'rgba(255,255,255,0.88)', border:'0.5px solid rgba(201,121,140,.25)', borderRadius:20, padding:'2.5rem 2.2rem', width:'100%', maxWidth:380, backdropFilter:'blur(8px)', textAlign:'center', boxShadow:'0 8px 40px rgba(138,63,82,0.1)' }}>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'2rem', fontWeight:400, color:'#8a3f52', marginBottom:'.3rem' }}>Admin Panel</h1>
        <p style={{ fontSize:'.75rem', color:'#b08898', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:'1.8rem' }}>Marwan & Dena · Engagment</p>
        <input
          type="password"
          value={inputPw}
          onChange={e => setInputPw(e.target.value)}
          onKeyDown={e => e.key==='Enter' && login()}
          placeholder="Enter password"
          style={{ width:'100%', padding:'.7rem 1rem', border:'0.5px solid rgba(201,121,140,.35)', borderRadius:10, fontFamily:'Montserrat,sans-serif', fontSize:'.85rem', color:'#3d2630', background:'rgba(253,240,243,.5)', outline:'none', marginBottom:'1rem', textAlign:'center', letterSpacing:'.15em' }}
        />
        <button onClick={login} style={{ width:'100%', padding:'.8rem', background:'#c97b8c', color:'#fff', border:'none', borderRadius:50, fontFamily:'Montserrat,sans-serif', fontSize:'.78rem', letterSpacing:'.14em', cursor:'pointer' }}>Enter</button>
        {loginErr && <p style={{ marginTop:'.8rem', fontSize:'.8rem', color:'#e07070' }}>{loginErr}</p>}
      </div>
    </div>
  )

  /* ── DASHBOARD ── */
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(155deg,#fdf0f3,#fdf8f5,#f8efe8)' }}>
      {/* Header */}
      <div style={{ background:'rgba(255,255,255,0.92)', borderBottom:'0.5px solid rgba(201,121,140,.2)', padding:'1.2rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10, backdropFilter:'blur(8px)' }}>
        <div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.5rem', fontWeight:400, color:'#8a3f52' }}>Engagment Dashboard</h1>
          <span style={{ fontSize:'.7rem', color:'#b08898', letterSpacing:'.1em', textTransform:'uppercase' }}>Marwan & Dena · May 26, 2026</span>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <button onClick={() => loadAll(pw)} style={adminToolBtn}>🔄 Refresh</button>
          <button onClick={logout} style={adminToolBtn}>Log out</button>
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'2rem 1.5rem 4rem', display:'flex', flexDirection:'column', gap:'2rem' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12 }}>
          {[
            { num: rsvps.length, lbl:'Total Responses', color:'#8a3f52' },
            { num: yes,   lbl:'Attending ✅',    color:'#6e9e82' },
            { num: maybe, lbl:'Maybe 🤞',         color:'#b8923a' },
            { num: no,    lbl:"Can't Make It ❌", color:'#e07070' },
            { num: messages.length,  lbl:'Messages 💌',  color:'#c9a96e' },
            { num: drawings.length,  lbl:'Drawings 🎨',  color:'#c97b8c' },
            { num: uploads.length,   lbl:'Uploads 📸',   color:'#8a3f52' },
          ].map(({ num, lbl, color }) => (
            <div key={lbl} style={{ background:'rgba(255,255,255,0.82)', border:'0.5px solid rgba(201,121,140,.2)', borderRadius:16, padding:'1.2rem 1rem', textAlign:'center' }}>
              <span style={{ display:'block', fontFamily:'Cormorant Garamond,serif', fontSize:'2.8rem', fontWeight:600, color, lineHeight:1 }}>{num}</span>
              <span style={{ display:'block', fontSize:'.62rem', textTransform:'uppercase', letterSpacing:'.14em', color:'#b08898', marginTop:5 }}>{lbl}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8 }}>
          {(['rsvps','messages','drawings','uploads','timeline'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...adminToolBtn, background: activeTab===tab ? '#c97b8c' : 'transparent', color: activeTab===tab ? '#fff' : '#7a5060', borderColor: activeTab===tab ? '#c97b8c' : 'rgba(201,121,140,.35)', padding:'.5rem 1.4rem' }}>
              {tab === 'rsvps' ? '👥 Guests' : tab === 'messages' ? '💌 Messages' : tab === 'drawings' ? '🎨 Drawings' : tab === 'uploads' ? '📸 Uploads' : '🕒 Timeline'}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign:'center', padding:'3rem', color:'#b08898', fontFamily:'Cormorant Garamond,serif', fontStyle:'italic' }}>Loading...</div>}

        {/* ── RSVP TAB ── */}
        {!loading && activeTab==='rsvps' && (
          <div style={adminSection}>
            <div style={sectionTitle}>Guest List</div>
            <div style={sectionSub}>Everyone who responded to the invitation</div>
            <div style={{ display:'flex', gap:8, marginBottom:'1.2rem', flexWrap:'wrap' }}>
              {['all','yes','maybe','no'].map(f => (
                <button key={f} onClick={() => setRsvpFilter(f)} style={{ ...adminToolBtn, background: rsvpFilter===f ? '#c97b8c' : 'transparent', color: rsvpFilter===f ? '#fff' : '#7a5060', borderColor: rsvpFilter===f ? '#c97b8c' : 'rgba(201,121,140,.35)' }}>
                  {f==='all' ? 'All' : f==='yes' ? '✅ Attending' : f==='maybe' ? '🤞 Maybe' : '❌ No'}
                </button>
              ))}
            </div>
            {filteredRsvps.length === 0 ? <div style={emptyState}>No responses yet</div> : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr>
                      {['Name','Response','Date'].map(h => (
                        <th key={h} style={{ fontSize:'.62rem', textTransform:'uppercase', letterSpacing:'.14em', color:'#b08898', padding:'.5rem .8rem', textAlign:'left', borderBottom:'0.5px solid rgba(201,121,140,.2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRsvps.map(r => (
                      <tr key={r.id}>
                        <td style={{ padding:'.75rem .8rem', fontSize:'.85rem', borderBottom:'0.5px solid rgba(201,121,140,.1)', color:'#3d2630' }}>{r.name}</td>
                        <td style={{ padding:'.75rem .8rem', borderBottom:'0.5px solid rgba(201,121,140,.1)' }}>
                          <span style={{ display:'inline-block', padding:'.25rem .75rem', borderRadius:20, fontSize:'.68rem', fontWeight:500, letterSpacing:'.08em', background: r.answer==='yes' ? 'rgba(110,158,130,.15)' : r.answer==='maybe' ? 'rgba(224,184,74,.15)' : 'rgba(224,112,112,.15)', color: r.answer==='yes' ? '#6e9e82' : r.answer==='maybe' ? '#b8923a' : '#e07070' }}>
                            {r.answer==='yes' ? '✅ Attending' : r.answer==='maybe' ? '🤞 Maybe' : "❌ Can't make it"}
                          </span>
                        </td>
                        <td style={{ padding:'.75rem .8rem', fontSize:'.78rem', color:'#b08898', borderBottom:'0.5px solid rgba(201,121,140,.1)' }}>{fmtDate(r.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES TAB ── */}
        {!loading && activeTab==='messages' && (
          <div style={adminSection}>
            <div style={sectionTitle}>Guest Messages</div>
            <div style={sectionSub}>Approve messages to show them on the public website</div>
            {messages.length===0 ? <div style={emptyState}>No messages yet</div> : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {messages.map(m => (
                  <div key={m.id} style={{ background: m.approved ? 'rgba(110,158,130,0.08)' : '#f9edf0', border: `0.5px solid ${m.approved ? 'rgba(110,158,130,.4)' : 'rgba(201,121,140,.2)'}`, borderRadius:14, padding:'.9rem 1rem', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'.65rem', textTransform:'uppercase', letterSpacing:'.12em', color:'#c97b8c', marginBottom:4, display:'flex', alignItems:'center', gap:8 }}>
                        {m.name}
                        {m.approved && <span style={{ background:'rgba(110,158,130,.2)', color:'#6e9e82', padding:'.1rem .5rem', borderRadius:10, fontSize:'.6rem' }}>APPROVED</span>}
                      </div>
                      <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1rem', color:'#3d2630', lineHeight:1.5 }}>{m.message}</div>
                      <div style={{ fontSize:'.62rem', color:'#b08898', marginTop:5 }}>{fmtDate(m.created_at)}</div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
                      <button
                        onClick={() => toggleMessageApproval(m.id, !m.approved)}
                        style={{ padding:'.3rem .8rem', border:`0.5px solid ${m.approved ? 'rgba(224,112,112,.4)' : 'rgba(110,158,130,.4)'}`, borderRadius:20, background:'transparent', color: m.approved ? '#e07070' : '#6e9e82', fontSize:'.68rem', fontFamily:'Montserrat,sans-serif', cursor:'pointer', whiteSpace:'nowrap' }}>
                        {m.approved ? '✕ Unapprove' : '✓ Approve'}
                      </button>
                      <button onClick={() => deleteMessage(m.id)} style={{ padding:'.3rem .7rem', border:'0.5px solid rgba(224,112,112,.4)', borderRadius:20, background:'transparent', color:'#e07070', fontSize:'.68rem', fontFamily:'Montserrat,sans-serif', cursor:'pointer' }}>
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── DRAWINGS TAB ── */}
        {!loading && activeTab==='drawings' && (
          <div style={adminSection}>
            <div style={sectionTitle}>Guest Drawings</div>
            <div style={sectionSub}>Approve drawings to publish them. Set a rank to order them in the gallery.</div>
            {drawings.length===0 ? <div style={emptyState}>No drawings yet</div> : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
                {drawings.map(d => (
                  <div key={d.id} style={{ border: `0.5px solid ${d.approved ? 'rgba(110,158,130,.4)' : 'rgba(201,121,140,.2)'}`, borderRadius:14, overflow:'hidden', background:'#fff', position:'relative' }}>
                    {d.approved && <div style={{ position:'absolute', top:8, left:8, background:'rgba(110,158,130,.85)', color:'#fff', fontSize:'.6rem', padding:'.2rem .6rem', borderRadius:10, letterSpacing:'.08em', fontFamily:'Montserrat,sans-serif' }}>LIVE</div>}
                    <img src={d.image_data} alt={d.name} style={{ width:'100%', aspectRatio:'4/3', objectFit:'cover', display:'block' }} />
                    <div style={{ padding:'.7rem .8rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:'.65rem', color:'#7a5060', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:500 }}>{d.name}</span>
                      <span style={{ fontSize:'.72rem', color:'#c97b8c', fontWeight:500 }}>♥ {d.votes||0}</span>
                    </div>
                    {/* Rank input */}
                    <div style={{ padding:'0 .8rem .5rem', display:'flex', gap:6, alignItems:'center' }}>
                      <input
                        type="number"
                        placeholder="Rank #"
                        value={rankInput[d.id] ?? (d.rank ?? '')}
                        onChange={e => setRankInput(prev => ({...prev, [d.id]: e.target.value}))}
                        style={{ width:70, padding:'.3rem .5rem', border:'0.5px solid rgba(201,121,140,.35)', borderRadius:8, fontSize:'.75rem', fontFamily:'Montserrat,sans-serif', color:'#3d2630', outline:'none' }}
                      />
                      <button onClick={() => updateRank(d.id)} style={{ fontSize:'.65rem', padding:'.3rem .6rem', border:'0.5px solid rgba(201,169,110,.5)', borderRadius:8, background:'rgba(201,169,110,.1)', color:'#8a6a2a', fontFamily:'Montserrat,sans-serif', cursor:'pointer' }}>Set</button>
                    </div>
                    <div style={{ padding:'0 .8rem .8rem', display:'flex', flexDirection:'column', gap:6 }}>
                      <button
                        onClick={() => toggleDrawingApproval(d.id, !d.approved, d.rank)}
                        style={{ width:'100%', padding:'.4rem', border:`0.5px solid ${d.approved ? 'rgba(224,112,112,.4)' : 'rgba(110,158,130,.4)'}`, borderRadius:10, background: d.approved ? 'rgba(224,112,112,.08)' : 'rgba(110,158,130,.08)', color: d.approved ? '#e07070' : '#6e9e82', fontSize:'.7rem', fontFamily:'Montserrat,sans-serif', cursor:'pointer' }}>
                        {d.approved ? '✕ Remove from Gallery' : '✓ Publish to Gallery'}
                      </button>
                      <button onClick={() => deleteDrawing(d.id)} style={{ width:'100%', padding:'.4rem', border:'0.5px solid rgba(224,112,112,.4)', borderRadius:10, background:'transparent', color:'#e07070', fontSize:'.7rem', fontFamily:'Montserrat,sans-serif', cursor:'pointer' }}>
                        🗑 Delete Drawing
                      </button>
                    </div>
                    <div style={{ padding:'0 .8rem .8rem', fontSize:'.6rem', color:'#b08898' }}>{fmtDate(d.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── UPLOADS TAB ── */}
        {!loading && activeTab==='uploads' && (
          <div style={adminSection}>
            <div style={sectionTitle}>Guest Uploads</div>
            <div style={sectionSub}>Approve photos to publish them on the public website</div>
            {uploads.length===0 ? <div style={emptyState}>No uploaded photos yet</div> : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
                {uploads.map(u => (
                  <div key={u.id} style={{ border: `0.5px solid ${u.approved ? 'rgba(110,158,130,.4)' : 'rgba(201,121,140,.2)'}`, borderRadius:14, overflow:'hidden', background:'#fff', position:'relative' }}>
                    {u.approved && <div style={{ position:'absolute', top:8, left:8, background:'rgba(110,158,130,.85)', color:'#fff', fontSize:'.6rem', padding:'.2rem .6rem', borderRadius:10, letterSpacing:'.08em', fontFamily:'Montserrat,sans-serif' }}>LIVE</div>}
                    {u.image_data.startsWith('data:video/') ? (
                      <video src={u.image_data} style={{ width:'100%', aspectRatio:'4/3', objectFit:'cover', display:'block' }} muted playsInline />
                    ) : (
                      <img src={u.image_data} alt={`Upload ${u.id}`} style={{ width:'100%', aspectRatio:'4/3', objectFit:'cover', display:'block' }} />
                    )}
                    <div style={{ padding:'.6rem .8rem 0', fontSize:'.75rem', color:'#c97b8c', fontWeight:500 }}>♥ {u.votes || 0}</div>
                    <div style={{ padding:'0 .8rem .8rem', display:'flex', flexDirection:'column', gap:6, marginTop:'.7rem' }}>
                      <button
                        onClick={() => toggleUploadApproval(u.id, !u.approved)}
                        style={{ width:'100%', padding:'.4rem', border:`0.5px solid ${u.approved ? 'rgba(224,112,112,.4)' : 'rgba(110,158,130,.4)'}`, borderRadius:10, background: u.approved ? 'rgba(224,112,112,.08)' : 'rgba(110,158,130,.08)', color: u.approved ? '#e07070' : '#6e9e82', fontSize:'.7rem', fontFamily:'Montserrat,sans-serif', cursor:'pointer' }}>
                        {u.approved ? '✕ Remove from Website' : '✓ Publish to Website'}
                      </button>
                      <button onClick={() => deleteUpload(u.id)} style={{ width:'100%', padding:'.4rem', border:'0.5px solid rgba(224,112,112,.4)', borderRadius:10, background:'transparent', color:'#e07070', fontSize:'.7rem', fontFamily:'Montserrat,sans-serif', cursor:'pointer' }}>
                        🗑 Delete Photo
                      </button>
                    </div>
                    <div style={{ padding:'0 .8rem .8rem', fontSize:'.6rem', color:'#b08898' }}>{fmtDate(u.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TIMELINE TAB ── */}
        {!loading && activeTab==='timeline' && (
          <div style={adminSection}>
            <div style={sectionTitle}>Live Timeline Highlight</div>
            <div style={sectionSub}>Choose what is happening now on the Details page</div>

            <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
              <select
                value={currentTimelineEvent ?? ''}
                onChange={(e) => updateCurrentTimelineEvent(e.target.value || null)}
                style={{
                  minWidth: 260,
                  padding: '.6rem .75rem',
                  border: '0.5px solid rgba(201,121,140,.35)',
                  borderRadius: 10,
                  fontFamily: 'Montserrat,sans-serif',
                  fontSize: '.8rem',
                  color: '#3d2630',
                  background: '#fff',
                }}
              >
                <option value="">No highlight selected</option>
                {TIMELINE_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button onClick={() => updateCurrentTimelineEvent(null)} style={adminToolBtn}>
                Clear Highlight
              </button>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '.75rem', color: '#7a5060' }}>
              Current selection:{' '}
              <strong>
                {TIMELINE_OPTIONS.find((option) => option.key === currentTimelineEvent)?.label || 'None'}
              </strong>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

const adminSection: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  border: '0.5px solid rgba(201,121,140,.2)',
  borderRadius: 20,
  padding: '1.8rem 2rem',
}
const sectionTitle: React.CSSProperties = {
  fontFamily: 'Cormorant Garamond, serif',
  fontSize: '1.4rem',
  fontWeight: 400,
  color: '#8a3f52',
  marginBottom: '.3rem',
}
const sectionSub: React.CSSProperties = {
  fontSize: '.65rem',
  textTransform: 'uppercase',
  letterSpacing: '.16em',
  color: '#b08898',
  marginBottom: '1.4rem',
}
const emptyState: React.CSSProperties = {
  textAlign: 'center',
  padding: '2rem',
  fontFamily: 'Cormorant Garamond, serif',
  fontStyle: 'italic',
  color: '#b08898',
  fontSize: '1rem',
}
const adminToolBtn: React.CSSProperties = {
  padding: '.4rem 1.1rem',
  border: '0.5px solid rgba(201,121,140,.35)',
  borderRadius: 20,
  background: 'transparent',
  color: '#7a5060',
  fontSize: '.72rem',
  fontFamily: 'Montserrat, sans-serif',
  letterSpacing: '.08em',
  cursor: 'pointer',
}
