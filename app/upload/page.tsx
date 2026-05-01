'use client'

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'

const MAX_FILES = 10

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export default function UploadPage() {
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const left = useMemo(() => MAX_FILES - images.length, [images.length])

  async function handleSelectFiles(list: FileList | null) {
    if (!list) return
    const files = Array.from(list).filter((f) => f.type.startsWith('image/'))
    if (!files.length) return

    if (images.length >= MAX_FILES) {
      setStatus({ type: 'error', text: `You can upload up to ${MAX_FILES} photos only.` })
      return
    }

    const allowed = files.slice(0, left)
    if (allowed.length < files.length) {
      setStatus({ type: 'error', text: `Only ${MAX_FILES} photos are allowed.` })
    } else {
      setStatus(null)
    }

    const encoded = await Promise.all(allowed.map(fileToDataUrl))
    setImages((prev) => [...prev, ...encoded].slice(0, MAX_FILES))
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function submitUploads() {
    if (!images.length) {
      setStatus({ type: 'error', text: 'Please add at least one photo.' })
      return
    }

    setSubmitting(true)
    setStatus(null)
    try {
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Upload failed')
      }

      setImages([])
      setStatus({
        type: 'ok',
        text: 'Photos uploaded successfully. They will appear after admin approval.',
      })
    } catch (err) {
      setStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Upload failed',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(155deg,#fdf0f3,#fdf8f5,#f8efe8)', padding: '2rem 1rem 3rem' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#8a3f52', fontSize: '.85rem' }}>
          ← Back to wedding page
        </Link>

        <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.9)', border: '0.5px solid rgba(201,121,140,.25)', borderRadius: 18, padding: '1.5rem' }}>
          <h1 style={{ margin: 0, fontFamily: 'Cormorant Garamond, serif', fontSize: '2.1rem', color: '#8a3f52', fontWeight: 500 }}>
            Upload Your Wedding Photos
          </h1>
          <p style={{ marginTop: '.7rem', color: '#7a5060', fontSize: '.95rem' }}>
            You can upload up to {MAX_FILES} photos. No name is needed.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={left <= 0 || submitting}
              style={pickButton(left > 0 && !submitting)}
            >
              Select Photos
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={left <= 0 || submitting}
              style={pickButton(left > 0 && !submitting)}
            >
              Open Camera
            </button>
            <span style={{ alignSelf: 'center', fontSize: '.8rem', color: '#b08898', letterSpacing: '.05em' }}>
              {left} slot{left === 1 ? '' : 's'} left
            </span>
          </div>

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleSelectFiles(e.target.files)}
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => handleSelectFiles(e.target.files)}
          />

          {images.length > 0 && (
            <div style={{ marginTop: '1.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 10 }}>
              {images.map((src, idx) => (
                <div key={`${idx}-${src.slice(0, 20)}`} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(201,121,140,.2)' }}>
                  <img src={src} alt={`Selected ${idx + 1}`} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{ position: 'absolute', top: 6, right: 6, border: 'none', borderRadius: 999, background: 'rgba(0,0,0,.6)', color: '#fff', cursor: 'pointer', width: 24, height: 24, lineHeight: '24px', textAlign: 'center', fontSize: '.85rem' }}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={submitUploads}
            disabled={!images.length || submitting}
            style={{ marginTop: '1.3rem', width: '100%', padding: '.95rem 1rem', borderRadius: 40, border: 'none', background: !images.length || submitting ? '#d8c1c9' : '#c97b8c', color: '#fff', cursor: !images.length || submitting ? 'not-allowed' : 'pointer', fontSize: '.85rem', letterSpacing: '.12em', textTransform: 'uppercase' }}
          >
            {submitting ? 'Uploading...' : 'Upload Photos'}
          </button>

          {status && (
            <p style={{ marginTop: '.9rem', color: status.type === 'ok' ? '#6e9e82' : '#e07070', fontSize: '.88rem' }}>
              {status.text}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function pickButton(enabled: boolean) {
  return {
    padding: '.65rem 1rem',
    borderRadius: 30,
    border: '0.5px solid rgba(201,121,140,.35)',
    background: enabled ? '#fff' : '#f2e4e8',
    color: '#7a5060',
    fontSize: '.76rem',
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    cursor: enabled ? 'pointer' : 'not-allowed',
  }
}
