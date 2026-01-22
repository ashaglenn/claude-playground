'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface EscapeRoom {
  id: string
  title: string
  share_code: string
  created_at: string
  student_sessions: { id: string; completed_at: string | null }[]
}

export default function DashboardPage() {
  const [escapeRooms, setEscapeRooms] = useState<EscapeRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
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
        student_sessions (id, completed_at)
      `)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setEscapeRooms(data)
    }
    setLoading(false)
  }

  const loadSessions = async (roomId: string) => {
    const { data } = await supabase
      .from('student_sessions')
      .select('*')
      .eq('escape_room_id', roomId)
      .order('started_at', { ascending: false })

    if (data) {
      setSessions(data)
      setSelectedRoom(roomId)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDelete = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this escape room?')) return

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
          <h2 className="text-2xl font-bold text-gray-900">My Escape Rooms</h2>
          <p className="mt-1 text-gray-600">Create and manage your interactive quizzes</p>
        </div>

        {escapeRooms.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No escape rooms yet</h3>
            <p className="mt-2 text-gray-600 max-w-sm mx-auto">
              Create your first escape room to start engaging your students with interactive quizzes.
            </p>
            <Link
              href="/create"
              className="btn-primary inline-block mt-6"
            >
              Create Your First Escape Room
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {escapeRooms.map((room) => {
              const completedCount = room.student_sessions?.filter(s => s.completed_at).length || 0
              const totalCount = room.student_sessions?.length || 0

              return (
                <div
                  key={room.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{room.title}</h3>
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
                        href={`/builder/${room.id}`}
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
                      <h4 className="font-medium text-gray-900 mb-4">Student Results</h4>
                      {sessions.length === 0 ? (
                        <p className="text-sm text-gray-500">No students have played yet.</p>
                      ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Started</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {sessions.map((session) => (
                                <tr key={session.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 font-medium text-gray-900">{session.student_name}</td>
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
