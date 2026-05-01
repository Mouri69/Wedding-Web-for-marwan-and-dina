import { getSupabase } from './supabase'

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
export async function getRSVPs(): Promise<RSVP[]> {
  const { data, error } = await getSupabase()
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addRSVP(name: string, answer: RSVP['answer']): Promise<RSVP> {
  const { data, error } = await getSupabase()
    .from('rsvps')
    .insert({ name, answer })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Messages ──
export async function getMessages(): Promise<Message[]> {
  const { data, error } = await getSupabase()
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addMessage(name: string, message: string): Promise<Message> {
  const { data, error } = await getSupabase()
    .from('messages')
    .insert({ name, message, approved: false })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function approveMessage(id: number, approved: boolean) {
  const { error } = await getSupabase()
    .from('messages')
    .update({ approved })
    .eq('id', id)
  if (error) throw error
}

export async function deleteMessage(id: number) {
  const { error } = await getSupabase()
    .from('messages')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getApprovedMessages(): Promise<Message[]> {
  const { data, error } = await getSupabase()
    .from('messages')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ── Drawings ──
export async function getDrawings(): Promise<Drawing[]> {
  const { data, error } = await getSupabase()
    .from('drawings')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addDrawing(name: string, image_data: string): Promise<Drawing> {
  const { data, error } = await getSupabase()
    .from('drawings')
    .insert({ name, image_data, votes: 0, approved: false, rank: null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function approveDrawing(id: number, approved: boolean, rank: number | null = null) {
  const { error } = await getSupabase()
    .from('drawings')
    .update({ approved, rank })
    .eq('id', id)
  if (error) throw error
}

export async function deleteDrawing(id: number) {
  const { error } = await getSupabase()
    .from('drawings')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function voteDrawing(id: number) {
  const { data: current, error: fetchErr } = await getSupabase()
    .from('drawings')
    .select('votes')
    .eq('id', id)
    .single()

  if (fetchErr) throw fetchErr

  const { error: updateErr } = await getSupabase()
    .from('drawings')
    .update({ votes: (current?.votes ?? 0) + 1 })
    .eq('id', id)

  if (updateErr) throw updateErr
}

export async function getApprovedDrawings(): Promise<Drawing[]> {
  const { data, error } = await getSupabase()
    .from('drawings')
    .select('*')
    .eq('approved', true)
    .order('rank', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data || []
}

// ── Admin Auth ──
export function checkAdminPassword(pw: string): boolean {
  const stored = process.env.ADMIN_PASSWORD?.trim()
  if (!stored) return false
  return pw.trim() === stored
}