import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zkwqzdyrxyfkgymglmng.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprenF6ZHl5eGlnZ2ltZ2xuZyIsInJlc291cmNlIjoic3VwYWJhcyIsImlhdCI6MTczNjY5NDY3NCwiZXhwIjoyMDUyMjcwNjc0fQ.b5i8ZiUZR5LQfB40KTL2aWpB3s6HrMk6eHJb88aJw0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function importData() {
  console.log('Starting import to Supabase...')

  // Import messages
  const messagesPath = path.join(__dirname, '..', 'data', 'messages.json')
  if (fs.existsSync(messagesPath)) {
    console.log('Importing messages...')
    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'))
    for (const msg of messages) {
      const { error } = await supabase
        .from('messages')
        .upsert(msg) // upsert so it doesn't fail if already exists
      
      if (error) {
        console.error('Error importing message:', msg.id, error)
      } else {
        console.log('✓ Imported message:', msg.id)
      }
    }
  }

  // Import drawings
  const drawingsPath = path.join(__dirname, '..', 'data', 'drawings.json')
  if (fs.existsSync(drawingsPath)) {
    console.log('Importing drawings...')
    const drawings = JSON.parse(fs.readFileSync(drawingsPath, 'utf8'))
    for (const drw of drawings) {
      const { error } = await supabase
        .from('drawings')
        .upsert(drw)
      
      if (error) {
        console.error('Error importing drawing:', drw.id, error)
      } else {
        console.log('✓ Imported drawing:', drw.id)
      }
    }
  }

  console.log('✅ Import complete!')
}

importData().catch(console.error)
