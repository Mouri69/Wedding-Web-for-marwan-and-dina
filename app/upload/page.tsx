'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

const MAX_FILES = 10
const MAX_VIDEO_BYTES = 50 * 1024 * 1024 // 50 MB limit (now uploaded directly to Storage, bypassing Vercel)
const USED_UPLOAD_SLOTS_KEY = 'guestUploadUsedSlots'

interface UploadItem {
  preview: string
  file: File | Blob
  name: string
  type: string
}

function compressImage(file: File): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      const canvas = document.createElement('canvas')
      const MAX_WIDTH = 1200
      const MAX_HEIGHT = 1200
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width)
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height)
          height = MAX_HEIGHT
        }
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context could not be created'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      canvas.toBlob((blob) => {
        if (blob) {
          resolve({ dataUrl, blob })
        } else {
          reject(new Error('Canvas toBlob failed'))
        }
      }, 'image/jpeg', 0.8)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image for compression'))
    }
  })
}

async function processFile(file: File): Promise<UploadItem> {
  if (file.type.startsWith('image/') && file.type !== 'image/gif' && file.size > 500 * 1024) {
    try {
      const { dataUrl, blob } = await compressImage(file)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
      return {
        preview: dataUrl,
        file: blob,
        name: `${nameWithoutExt}.jpg`,
        type: 'image/jpeg'
      }
    } catch (err) {
      console.error('Image compression failed, falling back to original:', err)
    }
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })

  return {
    preview: dataUrl,
    file: file,
    name: file.name,
    type: file.type
  }
}

export default function UploadPage() {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
  const [usedSlots, setUsedSlots] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    const saved = Number(localStorage.getItem(USED_UPLOAD_SLOTS_KEY) || 0)
    if (!Number.isFinite(saved) || saved < 0) return 0
    return Math.min(MAX_FILES, saved)
  })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; text: string; details?: string[] } | null>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = Number(localStorage.getItem(USED_UPLOAD_SLOTS_KEY) || 0)
    const parsed =
      Number.isFinite(saved) && saved > 0 ? Math.min(MAX_FILES, saved) : 0
    setUsedSlots(parsed)
  }, [])

  useEffect(() => {
    localStorage.setItem(USED_UPLOAD_SLOTS_KEY, String(Math.min(MAX_FILES, Math.max(0, usedSlots))))
  }, [usedSlots])

  const left = useMemo(() => Math.max(0, MAX_FILES - usedSlots - uploadItems.length), [usedSlots, uploadItems.length])

  async function handleSelectFiles(list: FileList | null) {
    if (!list) return
    const allFiles = Array.from(list)
    const errors: string[] = []

    // 1. Check for non-image/non-video files
    const validFormatFiles = allFiles.filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    )
    const invalidCount = allFiles.length - validFormatFiles.length
    if (invalidCount > 0) {
      errors.push(`${invalidCount} file(s) ignored (only images and videos are supported).`)
    }

    // 2. Check video size limit
    const tooLargeVideos = validFormatFiles.filter(
      (f) => f.type.startsWith('video/') && f.size > MAX_VIDEO_BYTES
    )
    if (tooLargeVideos.length > 0) {
      tooLargeVideos.forEach((v) => {
        const sizeMb = (v.size / (1024 * 1024)).toFixed(1)
        errors.push(`Video "${v.name}" is too large (${sizeMb} MB). Video limit is 50 MB.`)
      })
    }

    // Filter out too large videos
    const sizeOkFiles = validFormatFiles.filter(
      (f) => !(f.type.startsWith('video/') && f.size > MAX_VIDEO_BYTES)
    )

    if (sizeOkFiles.length === 0) {
      if (errors.length > 0) {
        setStatus({
          type: 'error',
          text: 'No valid files selected:',
          details: errors,
        })
      }
      return
    }

    // 3. Check slots limit
    if (left <= 0) {
      errors.push(`No slots left. You have already reached the limit of ${MAX_FILES} uploads.`)
      setStatus({
        type: 'error',
        text: 'Cannot add files:',
        details: errors,
      })
      return
    }

    let allowed = sizeOkFiles
    if (sizeOkFiles.length > left) {
      errors.push(`Only ${left} slot(s) left. Ignored ${sizeOkFiles.length - left} file(s).`)
      allowed = sizeOkFiles.slice(0, left)
    }

    // Show errors if any
    if (errors.length > 0) {
      setStatus({
        type: 'error',
        text: 'Some files had issues:',
        details: errors,
      })
    } else {
      setStatus(null)
    }

    const processed = await Promise.all(allowed.map(processFile))
    setUploadItems((prev) => [...prev, ...processed].slice(0, MAX_FILES))
  }

  function removeMedia(index: number) {
    setUploadItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function submitUploads() {
    if (!uploadItems.length) {
      setStatus({ type: 'error', text: 'Please add at least one photo or video.' })
      return
    }

    if (usedSlots + uploadItems.length > MAX_FILES) {
      setStatus({ type: 'error', text: `Upload limit reached. You can upload max ${MAX_FILES} files.` })
      return
    }

    setSubmitting(true)
    setStatus(null)
    try {
      const supabase = getSupabase()
      const imageUrls: string[] = []

      for (let i = 0; i < uploadItems.length; i++) {
        const item = uploadItems[i]
        const fileExt = item.name.split('.').pop() || 'jpg'
        const randomStr = Math.random().toString(36).substring(2, 10)
        const fileName = `${Date.now()}-${randomStr}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('wedding-uploads')
          .upload(fileName, item.file, {
            contentType: item.type,
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Failed to upload "${item.name}": ${uploadError.message}`)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('wedding-uploads')
          .getPublicUrl(fileName)

        imageUrls.push(publicUrl)
      }

      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media: imageUrls }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Upload failed')
      }

      const persisted = Number(localStorage.getItem(USED_UPLOAD_SLOTS_KEY) || usedSlots || 0)
      const currentUsed = Number.isFinite(persisted) && persisted > 0 ? persisted : 0
      const nextUsed = Math.min(MAX_FILES, currentUsed + uploadItems.length)
      localStorage.setItem(USED_UPLOAD_SLOTS_KEY, String(nextUsed))
      setUsedSlots(nextUsed)
      setUploadItems([])
      setStatus({
        type: 'ok',
        text: 'Upload successful. Media will appear after admin approval.',
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
          ← Back to Engagment page
        </Link>

        <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.9)', border: '0.5px solid rgba(201,121,140,.25)', borderRadius: 18, padding: '1.5rem' }}>
          <h1 style={{ margin: 0, fontFamily: 'Cormorant Garamond, serif', fontSize: '2.1rem', color: '#8a3f52', fontWeight: 500 }}>
            Upload Engagment Media
          </h1>
          <p style={{ marginTop: '.7rem', color: '#7a5060', fontSize: '.95rem' }}>
            You can upload images and videos. Max {MAX_FILES} total uploads per person. (Videos are limited to 50 MB).
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={left <= 0 || submitting}
              style={pickButton(left > 0 && !submitting)}
            >
              Select Files
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
            accept="image/*,video/*"
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

          {uploadItems.length > 0 && (
            <div style={{ marginTop: '1.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 10 }}>
              {uploadItems.map((item, idx) => (
                <div key={`${idx}-${item.preview.slice(0, 20)}`} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(201,121,140,.2)' }}>
                  {item.preview.startsWith('data:video/') ? (
                    <video src={item.preview} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} muted playsInline />
                  ) : (
                    <img src={item.preview} alt={`Selected ${idx + 1}`} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(idx)}
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
            disabled={!uploadItems.length || submitting}
            style={{ marginTop: '1.3rem', width: '100%', padding: '.95rem 1rem', borderRadius: 40, border: 'none', background: !uploadItems.length || submitting ? '#d8c1c9' : '#c97b8c', color: '#fff', cursor: !uploadItems.length || submitting ? 'not-allowed' : 'pointer', fontSize: '.85rem', letterSpacing: '.12em', textTransform: 'uppercase' }}
          >
            {submitting ? 'Uploading...' : 'Upload Files'}
          </button>

          {status && (
            <div style={{ marginTop: '.9rem', color: status.type === 'ok' ? '#6e9e82' : '#e07070', fontSize: '.88rem' }}>
              <p style={{ margin: 0, fontWeight: 500 }}>{status.text}</p>
              {status.details && status.details.length > 0 && (
                <ul style={{ marginTop: '.3rem', paddingLeft: '1.2rem', margin: 0, listStyleType: 'disc' }}>
                  {status.details.map((detail, idx) => (
                    <li key={idx} style={{ marginTop: '.2rem' }}>
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
