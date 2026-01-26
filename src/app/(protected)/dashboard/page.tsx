'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { ActivityType } from '@/lib/types'

interface EscapeRoom {
  id: string
  title: string
  share_code: string
  created_at: string
  activity_type: ActivityType
  student_sessions: { id: string; completed_at: string | null; archived_at: string | null }[]
}

interface StudentSession {
  id: string
  student_name: string
  started_at: string
  completed_at: string | null
  archived_at: string | null
}

export default function DashboardPage() {
  const [escapeRooms, setEscapeRooms] = useState<EscapeRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [sessions, setSessions] = useState<StudentSession[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadEscapeRooms()
  }, [])

  const loadEscapeRooms = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('escape_rooms')
      .select(`
        id,
        title,
        share_code,
        created_at,
        activity_type,
        student_sessions (id, completed_at, archived_at)
      `)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setEscapeRooms(data)
    }
    setLoading(false)
  }

  const loadSessions = async (roomId: string, includeArchived: boolean = showArchived) => {
    let query = supabase
      .from('student_sessions')
      .select('*')
      .eq('escape_room_id', roomId)
      .order('started_at', { ascending: false })

    if (!includeArchived) {
      query = query.is('archived_at', null)
    }

    const { data } = await query

    if (data) {
      setSessions(data)
      setSelectedRoom(roomId)
    }
  }

  // Delete individual session
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return

    const { error } = await supabase.from('student_sessions').delete().eq('id', sessionId)

    if (error) {
      console.error('Error deleting session:', error)
      alert('Failed to delete result. Please try again.')
      return
    }

    setSessions(sessions.filter(s => s.id !== sessionId))
    // Update local escapeRooms state to reflect the change immediately
    setEscapeRooms(escapeRooms.map(room => ({
      ...room,
      student_sessions: room.student_sessions.filter(s => s.id !== sessionId)
    })))
  }

  // Archive individual session
  const handleArchiveSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('student_sessions')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', sessionId)

    if (error) {
      console.error('Error archiving session:', error)
      alert('Failed to archive result. Please try again.')
      return
    }

    const archivedAt = new Date().toISOString()
    if (!showArchived) {
      setSessions(sessions.filter(s => s.id !== sessionId))
    } else {
      setSessions(sessions.map(s =>
        s.id === sessionId ? { ...s, archived_at: archivedAt } : s
      ))
    }
    // Update local escapeRooms state
    setEscapeRooms(escapeRooms.map(room => ({
      ...room,
      student_sessions: room.student_sessions.map(s =>
        s.id === sessionId ? { ...s, archived_at: archivedAt } : s
      )
    })))
  }

  // Restore archived session
  const handleRestoreSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('student_sessions')
      .update({ archived_at: null })
      .eq('id', sessionId)

    if (error) {
      console.error('Error restoring session:', error)
      alert('Failed to restore result. Please try again.')
      return
    }

    setSessions(sessions.map(s =>
      s.id === sessionId ? { ...s, archived_at: null } : s
    ))
    // Update local escapeRooms state
    setEscapeRooms(escapeRooms.map(room => ({
      ...room,
      student_sessions: room.student_sessions.map(s =>
        s.id === sessionId ? { ...s, archived_at: null } : s
      )
    })))
  }

  // Clear all results for an activity
  const handleClearAllResults = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete ALL results for this activity? This cannot be undone.')) return

    const { error } = await supabase.from('student_sessions').delete().eq('escape_room_id', roomId)

    if (error) {
      console.error('Error clearing results:', error)
      alert('Failed to clear results. Please try again.')
      return
    }

    setSessions([])
    // Update local escapeRooms state to reflect the change immediately
    setEscapeRooms(escapeRooms.map(room =>
      room.id === roomId
        ? { ...room, student_sessions: [] }
        : room
    ))
  }

  // Archive all results for an activity
  const handleArchiveAllResults = async (roomId: string) => {
    if (!confirm('Are you sure you want to archive all results for this activity?')) return

    const { error } = await supabase
      .from('student_sessions')
      .update({ archived_at: new Date().toISOString() })
      .eq('escape_room_id', roomId)
      .is('archived_at', null)

    if (error) {
      console.error('Error archiving results:', error)
      alert('Failed to archive results. Please try again.')
      return
    }

    const archivedAt = new Date().toISOString()
    if (!showArchived) {
      setSessions([])
    } else {
      setSessions(sessions.map(s => ({ ...s, archived_at: archivedAt })))
    }
    // Update local escapeRooms state
    setEscapeRooms(escapeRooms.map(room =>
      room.id === roomId
        ? {
            ...room,
            student_sessions: room.student_sessions.map(s =>
              s.archived_at ? s : { ...s, archived_at: archivedAt }
            )
          }
        : room
    ))
  }

  // Toggle archived view
  const handleToggleArchived = () => {
    const newShowArchived = !showArchived
    setShowArchived(newShowArchived)
    if (selectedRoom) {
      loadSessions(selectedRoom, newShowArchived)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDelete = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return

    await supabase.from('escape_rooms').delete().eq('id', roomId)
    setEscapeRooms(escapeRooms.filter(r => r.id !== roomId))
    if (selectedRoom === roomId) {
      setSelectedRoom(null)
      setSessions([])
    }
  }

  const copyShareLink = (roomId: string, shareCode: string) => {
    const link = `${window.location.origin}/play/${shareCode}`
    navigator.clipboard.writeText(link)
    setCopiedId(roomId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your escape rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">Escape Room</h1>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                Dashboard
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/create"
                className="btn-primary text-sm px-4 py-2"
              >
                + Create New
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">My Activities</h2>
          <p className="mt-1 text-gray-600">Create and manage your escape rooms, quizzes, and flashcards</p>
        </div>

        {escapeRooms.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No activities yet</h3>
            <p className="mt-2 text-gray-600 max-w-sm mx-auto">
              Create your first activity to start engaging your students with interactive content.
            </p>
            <Link
              href="/create"
              className="btn-primary inline-block mt-6"
            >
              Create Your First Activity
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {escapeRooms.map((room) => {
              // Only count non-archived sessions
              const activeSessions = room.student_sessions?.filter(s => !s.archived_at) || []
              const completedCount = activeSessions.filter(s => s.completed_at).length
              const totalCount = activeSessions.length
              const archivedCount = room.student_sessions?.filter(s => s.archived_at).length || 0

              return (
                <div
                  key={room.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{room.title}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          room.activity_type === 'quiz'
                            ? 'bg-blue-100 text-blue-700'
                            : room.activity_type === 'flashcard'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {room.activity_type === 'quiz' ? 'Quiz' : room.activity_type === 'flashcard' ? 'Flashcards' : 'Escape Room'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Created {new Date(room.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                          <span className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900">{completedCount}</span> completed
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                          <span className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900">{totalCount - completedCount}</span> in progress
                          </span>
                        </div>
                        {archivedCount > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                            <span className="text-sm text-gray-600">
                              <span className="font-medium text-gray-900">{archivedCount}</span> archived
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyShareLink(room.id, room.share_code)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          copiedId === room.id
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        {copiedId === room.id ? 'Copied!' : 'Copy Link'}
                      </button>
                      <Link
                        href={
                          room.activity_type === 'quiz'
                            ? `/quiz-builder/${room.id}`
                            : room.activity_type === 'flashcard'
                            ? `/flashcard-builder/${room.id}`
                            : `/builder/${room.id}`
                        }
                        className="rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => loadSessions(room.id)}
                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        Results
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {selectedRoom === room.id && (
                    <div className="mt-6 border-t border-gray-100 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Student Results</h4>
                        <div className="flex items-center gap-3">
                          {/* Show Archived Toggle */}
                          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showArchived}
                              onChange={handleToggleArchived}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            Show archived
                          </label>
                          {/* Archive All Button */}
                          <button
                            onClick={() => handleArchiveAllResults(room.id)}
                            className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            Archive All
                          </button>
                          {/* Clear All Button */}
                          <button
                            onClick={() => handleClearAllResults(room.id)}
                            className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                      {sessions.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          {showArchived ? 'No results found.' : 'No students have played yet.'}
                        </p>
                      ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Started</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {sessions.map((session) => (
                                <tr
                                  key={session.id}
                                  className={`hover:bg-gray-50 ${session.archived_at ? 'opacity-60' : ''}`}
                                >
                                  <td className="px-4 py-3 font-medium text-gray-900">
                                    {session.student_name}
                                    {session.archived_at && (
                                      <span className="ml-2 text-xs text-gray-400">(archived)</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-gray-600">
                                    {new Date(session.started_at).toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3">
                                    {session.completed_at ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Completed
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                        In Progress
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {session.archived_at ? (
                                        <button
                                          onClick={() => handleRestoreSession(session.id)}
                                          className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                        >
                                          Restore
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleArchiveSession(session.id)}
                                          className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700"
                                        >
                                          Archive
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDeleteSession(session.id)}
                                        className="cursor-pointer text-xs font-medium text-red-500 hover:text-red-700"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
