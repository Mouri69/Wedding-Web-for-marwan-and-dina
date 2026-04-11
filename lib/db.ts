import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data')

function ensureDir() {
  if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true })
}

function readFile<T>(name: string, def: T): T {
  ensureDir()
  const filePath = path.join(DB_PATH, `${name}.json`)
  if (!fs.existsSync(filePath)) return def
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeFile<T>(name: string, data: T) {
  ensureDir()
  fs.writeFileSync(path.join(DB_PATH, `${name}.json`), JSON.stringify(data, null, 2))
}

let idCounter = Date.now()
function nextId() { return ++idCounter }

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

// ── RSVPs ──
export function getRSVPs(): RSVP[] {
  return readFile<RSVP[]>('rsvps', [])
}
export function addRSVP(name: string, answer: RSVP['answer']): RSVP {
  const rsvps = getRSVPs()
  const entry: RSVP = { id: nextId(), name, answer, created_at: new Date().toISOString() }
  rsvps.push(entry)
  writeFile('rsvps', rsvps)
  return entry
}

// ── Messages ──
export function getMessages(): Message[] {
  return readFile<Message[]>('messages', [])
}
export function addMessage(name: string, message: string): Message {
  const msgs = getMessages()
  const entry: Message = { id: nextId(), name, message, approved: false, created_at: new Date().toISOString() }
  msgs.push(entry)
  writeFile('messages', msgs)
  return entry
}
export function approveMessage(id: number, approved: boolean) {
  const msgs = getMessages()
  const m = msgs.find(m => m.id === id)
  if (m) { m.approved = approved; writeFile('messages', msgs) }
}
export function deleteMessage(id: number) {
  writeFile('messages', getMessages().filter(m => m.id !== id))
}
export function getApprovedMessages(): Message[] {
  return getMessages().filter(m => m.approved)
}

// ── Drawings ──
export function getDrawings(): Drawing[] {
  return readFile<Drawing[]>('drawings', [])
}
export function addDrawing(name: string, image_data: string): Drawing {
  const drawings = getDrawings()
  const entry: Drawing = { id: nextId(), name, image_data, votes: 0, approved: false, rank: null, created_at: new Date().toISOString() }
  drawings.push(entry)
  writeFile('drawings', drawings)
  return entry
}
export function approveDrawing(id: number, approved: boolean, rank: number | null = null) {
  const drawings = getDrawings()
  const d = drawings.find(d => d.id === id)
  if (d) { d.approved = approved; d.rank = rank; writeFile('drawings', drawings) }
}
export function deleteDrawing(id: number) {
  writeFile('drawings', getDrawings().filter(d => d.id !== id))
}
export function voteDrawing(id: number) {
  const drawings = getDrawings()
  const d = drawings.find(d => d.id === id)
  if (d) { d.votes++; writeFile('drawings', drawings) }
}
export function getApprovedDrawings(): Drawing[] {
  return getDrawings()
    .filter(d => d.approved)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
}

// ── Admin Auth ──
export function checkAdminPassword(pw: string): boolean {
  const stored = process.env.ADMIN_PASSWORD 
  return pw === stored
}
