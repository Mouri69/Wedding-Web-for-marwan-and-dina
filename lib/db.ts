import fs from 'fs'
import path from 'path'

// ── Types ──
export interface RSVP {
  id: number
  name: string
  answer: 'yes' | 'maybe' | 'no'
  created_at: string
}

export interface Message {
  id: number
  name: string
  message: string
  approved: boolean
  created_at: string
}

export interface Drawing {
  id: number
  name: string
  image_data: string
  votes: number
  approved: boolean
  rank: number | null
  created_at: string
}

// ── File helpers ──
const dataDir = path.join(process.cwd(), 'data')
const messagesPath = path.join(dataDir, 'messages.json')
const drawingsPath = path.join(dataDir, 'drawings.json')

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readJSON<T>(filePath: string, defaultData: T): T {
  ensureDataDir()
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2))
    return defaultData
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content)
  } catch {
    return defaultData
  }
}

function writeJSON<T>(filePath: string, data: T) {
  ensureDataDir()
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

// ── RSVPs ──
export async function getRSVPs(): Promise<RSVP[]> {
  const rsvpsPath = path.join(dataDir, 'rsvps.json')
  return readJSON<RSVP[]>(rsvpsPath, []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function addRSVP(name: string, answer: RSVP['answer']): Promise<RSVP> {
  const rsvpsPath = path.join(dataDir, 'rsvps.json')
  const rsvps = readJSON<RSVP[]>(rsvpsPath, [])
  const rsvp: RSVP = {
    id: Date.now(),
    name,
    answer,
    created_at: new Date().toISOString()
  }
  rsvps.push(rsvp)
  writeJSON(rsvpsPath, rsvps)
  return rsvp
}

// ── Messages ──
export async function getMessages(): Promise<Message[]> {
  return readJSON<Message[]>(messagesPath, []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function addMessage(name: string, message: string): Promise<Message> {
  const messages = readJSON<Message[]>(messagesPath, [])
  const newMessage: Message = {
    id: Date.now(),
    name,
    message,
    approved: false,
    created_at: new Date().toISOString()
  }
  messages.push(newMessage)
  writeJSON(messagesPath, messages)
  return newMessage
}

export async function approveMessage(id: number, approved: boolean) {
  const messages = readJSON<Message[]>(messagesPath, [])
  const index = messages.findIndex(m => m.id === id)
  if (index !== -1) {
    messages[index].approved = approved
    writeJSON(messagesPath, messages)
  }
}

export async function deleteMessage(id: number) {
  const messages = readJSON<Message[]>(messagesPath, [])
  const filtered = messages.filter(m => m.id !== id)
  writeJSON(messagesPath, filtered)
}

export async function getApprovedMessages(): Promise<Message[]> {
  return readJSON<Message[]>(messagesPath, [])
    .filter(m => m.approved)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// ── Drawings ──
export async function getDrawings(): Promise<Drawing[]> {
  return readJSON<Drawing[]>(drawingsPath, []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function addDrawing(name: string, image_data: string): Promise<Drawing> {
  const drawings = readJSON<Drawing[]>(drawingsPath, [])
  const newDrawing: Drawing = {
    id: Date.now(),
    name,
    image_data,
    votes: 0,
    approved: false,
    rank: null,
    created_at: new Date().toISOString()
  }
  drawings.push(newDrawing)
  writeJSON(drawingsPath, drawings)
  return newDrawing
}

export async function approveDrawing(id: number, approved: boolean, rank: number | null = null) {
  const drawings = readJSON<Drawing[]>(drawingsPath, [])
  const index = drawings.findIndex(d => d.id === id)
  if (index !== -1) {
    drawings[index].approved = approved
    if (rank !== undefined) {
      drawings[index].rank = rank
    }
    writeJSON(drawingsPath, drawings)
  }
}

export async function deleteDrawing(id: number) {
  const drawings = readJSON<Drawing[]>(drawingsPath, [])
  const filtered = drawings.filter(d => d.id !== id)
  writeJSON(drawingsPath, filtered)
}

export async function voteDrawing(id: number) {
  const drawings = readJSON<Drawing[]>(drawingsPath, [])
  const index = drawings.findIndex(d => d.id === id)
  if (index !== -1) {
    drawings[index].votes += 1
    writeJSON(drawingsPath, drawings)
  }
}

export async function getApprovedDrawings(): Promise<Drawing[]> {
  return readJSON<Drawing[]>(drawingsPath, [])
    .filter(d => d.approved)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
}

// ── Admin Auth ──
export function checkAdminPassword(pw: string): boolean {
  const stored = process.env.ADMIN_PASSWORD?.trim()
  if (!stored) return false
  return pw.trim() === stored
}
