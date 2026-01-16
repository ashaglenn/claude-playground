'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { parseGameFile } from '@/lib/parser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function generateShareCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function CreatePage() {
  const [mode, setMode] = useState<'choose' | 'upload'>('choose')
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const text = await file.text()
    setFileContent(text)

    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      setTitle(nameWithoutExt)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fileContent) {
      setError('Please upload a question file')
      return
    }

    setLoading(true)

    try {
      const gameContent = parseGameFile(fileContent)

      if (gameContent.questions.length === 0) {
        setError('No questions found in the file')
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in')
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase.from('escape_rooms').insert({
        teacher_id: user.id,
        title,
        game_content: gameContent,
        share_code: generateShareCode(),
      })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Failed to parse the file. Please check the format.')
      setLoading(false)
    }
  }

  // Choose mode screen
  if (mode === 'choose') {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/dashboard"
            className="mb-6 inline-block text-gray-600 hover:text-black"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mb-2 text-3xl font-bold">Create Escape Room</h1>
          <p className="mb-8 text-gray-600">Choose how you want to create your escape room</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/builder"
              className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
            >
              <div className="mb-3 text-4xl">📝</div>
              <h2 className="mb-2 text-xl font-semibold">Form Builder</h2>
              <p className="text-sm text-gray-600">
                Create your escape room using a visual form. See all questions at once and fill them in step by step.
              </p>
              <div className="mt-4 text-sm font-medium text-black">
                Recommended for most users →
              </div>
            </Link>

            <button
              onClick={() => setMode('upload')}
              className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
            >
              <div className="mb-3 text-4xl">📄</div>
              <h2 className="mb-2 text-xl font-semibold">Upload File</h2>
              <p className="text-sm text-gray-600">
                Upload a pre-formatted .txt file with your questions. Great if you have questions in a spreadsheet.
              </p>
              <div className="mt-4 text-sm font-medium text-gray-500">
                For advanced users →
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // File upload mode
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-xl">
        <button
          onClick={() => setMode('choose')}
          className="mb-6 inline-block text-gray-600 hover:text-black"
        >
          ← Back to options
        </button>

        <h1 className="mb-8 text-3xl font-bold">Upload Question File</h1>

        <form onSubmit={handleCreate} className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 5 Review"
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-black focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Question File</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-8 text-center hover:border-gray-400"
            >
              {fileName ? (
                <span className="text-green-600">{fileName}</span>
              ) : (
                <span className="text-gray-500">Click to upload .txt file</span>
              )}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-black px-8 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Escape Room'}
          </button>
        </form>
      </div>
    </div>
  )
}
