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
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Escape Rooms</h1>
          <div className="flex gap-4">
            <Link
              href="/create"
              className="rounded-lg bg-black px-6 py-2 font-medium text-white hover:bg-gray-800"
            >
              + Create New
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg border-2 border-gray-300 px-6 py-2 font-medium hover:bg-gray-100"
            >
              Log Out
            </button>
          </div>
        </div>

        {escapeRooms.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-600">You haven&apos;t created any escape rooms yet.</p>
            <Link
              href="/create"
              className="mt-4 inline-block rounded-lg bg-black px-6 py-2 font-medium text-white hover:bg-gray-800"
            >
              Create Your First Escape Room
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {escapeRooms.map((room) => {
              const completedCount = room.student_sessions?.filter(s => s.completed_at).length || 0
              const totalCount = room.student_sessions?.length || 0

              return (
                <div
                  key={room.id}
                  className="rounded-lg border-2 border-gray-200 bg-white p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{room.title}</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Created {new Date(room.created_at).toLocaleDateString()}
                      </p>
                      <p className="mt-2 text-sm">
                        <span className="font-medium">{completedCount}</span> of{' '}
                        <span className="font-medium">{totalCount}</span> students completed
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyShareLink(room.id, room.share_code)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${
                          copiedId === room.id
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {copiedId === room.id ? 'Copied!' : 'Copy Link'}
                      </button>
                      <Link
                        href={`/builder/${room.id}`}
                        className="rounded-lg bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-200"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => loadSessions(room.id)}
                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                      >
                        View Results
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {selectedRoom === room.id && (
                    <div className="mt-4 border-t pt-4">
                      <h3 className="mb-3 font-medium">Student Results</h3>
                      {sessions.length === 0 ? (
                        <p className="text-sm text-gray-500">No students have played yet.</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-left">
                              <th className="pb-2">Name</th>
                              <th className="pb-2">Started</th>
                              <th className="pb-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sessions.map((session) => (
                              <tr key={session.id} className="border-b">
                                <td className="py-2 text-gray-900">{session.student_name}</td>
                                <td className="py-2 text-gray-600">
                                  {new Date(session.started_at).toLocaleString()}
                                </td>
                                <td className="py-2">
                                  {session.completed_at ? (
                                    <span className="text-green-600">Completed</span>
                                  ) : (
                                    <span className="text-yellow-600">In Progress</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
