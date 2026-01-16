'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { GameContent } from '@/lib/types'
import { ThemeProvider } from '@/context/ThemeContext'
import StudentGame from '@/components/StudentGame'

interface EscapeRoom {
  id: string
  title: string
  game_content: GameContent
}

export default function PlayPage() {
  const params = useParams()
  const shareCode = params.shareCode as string
  const [escapeRoom, setEscapeRoom] = useState<EscapeRoom | null>(null)
  const [studentName, setStudentName] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nameSubmitted, setNameSubmitted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadEscapeRoom()
  }, [shareCode])

  const loadEscapeRoom = async () => {
    const { data, error } = await supabase
      .from('escape_rooms')
      .select('id, title, game_content')
      .eq('share_code', shareCode)
      .single()

    if (error || !data) {
      setError('Escape room not found')
    } else {
      setEscapeRoom(data)
    }
    setLoading(false)
  }

  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!escapeRoom || !studentName.trim()) return

    // Create student session
    const { data, error } = await supabase
      .from('student_sessions')
      .insert({
        escape_room_id: escapeRoom.id,
        student_name: studentName.trim(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      setError(`Failed to start game: ${error.message}`)
      return
    }

    setSessionId(data.id)
    setNameSubmitted(true)
  }

  const handleGameComplete = async () => {
    if (!sessionId) return

    await supabase
      .from('student_sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', sessionId)
  }

  const theme = escapeRoom?.game_content?.theme
  const backgroundImage = escapeRoom?.game_content?.backgroundImage

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-gray-100">
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8 text-gray-100">
        <h1 className="mb-4 text-2xl font-bold text-red-400">Error</h1>
        <p className="text-gray-400">{error}</p>
      </div>
    )
  }

  if (!escapeRoom) {
    return null
  }

  // Show name entry form
  const isClassicTheme = !theme || theme === 'classic'

  if (!nameSubmitted) {
    return (
      <ThemeProvider initialTheme={theme}>
        <div
          className="flex min-h-screen flex-col items-center justify-center bg-cover bg-center bg-fixed p-8"
          style={{
            backgroundColor: 'var(--theme-background)',
            backgroundImage: backgroundImage
              ? isClassicTheme
                ? `url(${backgroundImage})`
                : `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImage})`
              : undefined,
            color: 'var(--theme-text)',
            fontFamily: 'var(--theme-font-body)',
          }}
        >
          <div className="w-full max-w-md text-center">
            <h1
              className="mb-2 text-3xl font-bold"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              {escapeRoom.title}
            </h1>
            <p className="mb-8" style={{ color: 'var(--theme-text-muted)' }}>
              Enter your name to begin
            </p>

            <form onSubmit={handleStartGame} className="flex flex-col gap-4">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border-2 px-4 py-3 text-center text-lg focus:outline-none"
                style={{
                  backgroundColor: 'var(--theme-card-background)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
                required
                autoFocus
              />
              <button
                type="submit"
                className="rounded-lg px-8 py-3 text-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                  color: 'var(--theme-primary-text)',
                }}
              >
                Start Escape Room
              </button>
            </form>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  // Show the game
  return (
    <StudentGame
      gameContent={escapeRoom.game_content}
      onComplete={handleGameComplete}
    />
  )
}
