'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { parseGameFile, parseQuizFile, parseEscapeRoomFile, parseFlashcardFile } from '@/lib/parser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ActivityType } from '@/lib/types'

function generateShareCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

type Mode = 'activity-type' | 'escape-room-choose' | 'quiz-choose' | 'flashcard-choose' | 'upload' | 'paste'

export default function CreatePage() {
  const [mode, setMode] = useState<Mode>('activity-type')
  const [activityType, setActivityType] = useState<ActivityType>('escape_room')
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [pastedContent, setPastedContent] = useState('')
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

    const content = mode === 'paste' ? pastedContent : fileContent

    if (!content) {
      setError(mode === 'paste' ? 'Please paste your questions' : 'Please upload a question file')
      return
    }

    setLoading(true)

    try {
      // Use the appropriate parser based on activity type
      let gameContent
      if (activityType === 'flashcard') {
        gameContent = parseFlashcardFile(content)
        if (gameContent.cards.length === 0) {
          setError('No flashcards found. Please check the format.')
          setLoading(false)
          return
        }
      } else {
        gameContent = activityType === 'quiz'
          ? parseQuizFile(content)
          : parseEscapeRoomFile(content)

        if (gameContent.questions.length === 0) {
          setError('No questions found. Please check the format.')
          setLoading(false)
          return
        }
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
        activity_type: activityType,
      })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Failed to parse the content. Please check the format.')
      setLoading(false)
    }
  }

  const resetState = () => {
    setTitle('')
    setError('')
    setFileName('')
    setFileContent(null)
    setPastedContent('')
  }

  // Activity type selection screen
  if (mode === 'activity-type') {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/dashboard"
            className="mb-6 inline-block text-gray-600 hover:text-black"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mb-2 text-3xl font-bold">Create New Activity</h1>
          <p className="mb-8 text-gray-600">What type of activity would you like to create?</p>

          <div className="grid gap-4 sm:grid-cols-3">
            <button
              onClick={() => {
                setActivityType('escape_room')
                setMode('escape-room-choose')
                resetState()
              }}
              className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-indigo-500 hover:shadow-lg"
            >
              <div className="mb-3 text-4xl">🔐</div>
              <h2 className="mb-2 text-xl font-semibold">Escape Room</h2>
              <p className="text-sm text-gray-600">
                A multi-checkpoint adventure where students earn letters to solve a final puzzle.
              </p>
              <div className="mt-4 text-sm font-medium text-indigo-600">
                In-depth learning →
              </div>
            </button>

            <button
              onClick={() => {
                setActivityType('quiz')
                setMode('quiz-choose')
                resetState()
              }}
              className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-blue-500 hover:shadow-lg"
            >
              <div className="mb-3 text-4xl">📋</div>
              <h2 className="mb-2 text-xl font-semibold">Quiz</h2>
              <p className="text-sm text-gray-600">
                A simple question flow: answer → feedback → next question → results.
              </p>
              <div className="mt-4 text-sm font-medium text-blue-600">
                Quick assessments →
              </div>
            </button>

            <button
              onClick={() => {
                setActivityType('flashcard')
                setMode('flashcard-choose')
                resetState()
              }}
              className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-purple-500 hover:shadow-lg"
            >
              <div className="mb-3 text-4xl">🃏</div>
              <h2 className="mb-2 text-xl font-semibold">Flashcards</h2>
              <p className="text-sm text-gray-600">
                Study cards with questions on front, answers on back. Click to flip, navigate through cards.
              </p>
              <div className="mt-4 text-sm font-medium text-purple-600">
                Study & review →
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Escape Room creation method selection
  if (mode === 'escape-room-choose') {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={() => setMode('activity-type')}
            className="mb-6 inline-block text-gray-600 hover:text-black"
          >
            ← Back to activity type
          </button>

          <h1 className="mb-2 text-3xl font-bold">Create Escape Room</h1>
          <p className="mb-8 text-gray-600">Choose how you want to create your escape room</p>

          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/builder"
              className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">📝</div>
              <h2 className="mb-2 text-lg font-semibold">Form Builder</h2>
              <p className="text-sm text-gray-600">
                Visual form to create questions step by step.
              </p>
              <div className="mt-4 text-sm font-medium text-black">
                Recommended →
              </div>
            </Link>

            <button
              onClick={() => setMode('paste')}
              className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">📋</div>
              <h2 className="mb-2 text-lg font-semibold">Paste Text</h2>
              <p className="text-sm text-gray-600">
                Paste formatted questions directly.
              </p>
              <div className="mt-4 text-sm font-medium text-gray-500">
                Quick import →
              </div>
            </button>

            <button
              onClick={() => setMode('upload')}
              className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">📄</div>
              <h2 className="mb-2 text-lg font-semibold">Upload File</h2>
              <p className="text-sm text-gray-600">
                Upload a .txt file with questions.
              </p>
              <div className="mt-4 text-sm font-medium text-gray-500">
                From file →
              </div>
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Need a template?</p>
            <a
              href="/templates/escape-room-template.txt"
              download
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              Download Escape Room Template →
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Quiz creation method selection
  if (mode === 'quiz-choose') {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={() => setMode('activity-type')}
            className="mb-6 inline-block text-gray-600 hover:text-black"
          >
            ← Back to activity type
          </button>

          <h1 className="mb-2 text-3xl font-bold">Create Quiz</h1>
          <p className="mb-8 text-gray-600">Choose how you want to create your quiz</p>

          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/quiz-builder"
              className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">📝</div>
              <h2 className="mb-2 text-lg font-semibold">Form Builder</h2>
              <p className="text-sm text-gray-600">
                Visual form to create questions step by step.
              </p>
              <div className="mt-4 text-sm font-medium text-black">
                Recommended →
              </div>
            </Link>

            <button
              onClick={() => setMode('paste')}
              className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">📋</div>
              <h2 className="mb-2 text-lg font-semibold">Paste Text</h2>
              <p className="text-sm text-gray-600">
                Paste formatted questions directly.
              </p>
              <div className="mt-4 text-sm font-medium text-gray-500">
                Quick import →
              </div>
            </button>

            <button
              onClick={() => setMode('upload')}
              className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">📄</div>
              <h2 className="mb-2 text-lg font-semibold">Upload File</h2>
              <p className="text-sm text-gray-600">
                Upload a .txt file with questions.
              </p>
              <div className="mt-4 text-sm font-medium text-gray-500">
                From file →
              </div>
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Need a template?</p>
            <a
              href="/templates/quiz-template.txt"
              download
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Download Quiz Template →
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Flashcard creation method selection
  if (mode === 'flashcard-choose') {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={() => setMode('activity-type')}
            className="mb-6 inline-block text-gray-600 hover:text-black"
          >
            ← Back to activity type
          </button>

          <h1 className="mb-2 text-3xl font-bold">Create Flashcards</h1>
          <p className="mb-8 text-gray-600">Choose how you want to create your flashcard set</p>

          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/flashcard-builder"
              className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">📝</div>
              <h2 className="mb-2 text-lg font-semibold">Form Builder</h2>
              <p className="text-sm text-gray-600">
                Create cards one by one with a visual form.
              </p>
              <div className="mt-4 text-sm font-medium text-black">
                Recommended →
              </div>
            </Link>

            <button
              onClick={() => setMode('paste')}
              className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">📋</div>
              <h2 className="mb-2 text-lg font-semibold">Paste Text</h2>
              <p className="text-sm text-gray-600">
                Paste formatted flashcards directly.
              </p>
              <div className="mt-4 text-sm font-medium text-gray-500">
                Quick import →
              </div>
            </button>

            <button
              onClick={() => setMode('upload')}
              className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">📄</div>
              <h2 className="mb-2 text-lg font-semibold">Upload File</h2>
              <p className="text-sm text-gray-600">
                Upload a .txt file with flashcards.
              </p>
              <div className="mt-4 text-sm font-medium text-gray-500">
                From file →
              </div>
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Need a template?</p>
            <a
              href="/templates/flashcard-template.txt"
              download
              className="text-sm font-medium text-purple-600 hover:text-purple-800"
            >
              Download Flashcard Template →
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Paste mode
  if (mode === 'paste') {
    const backMode = activityType === 'flashcard' ? 'flashcard-choose' : activityType === 'quiz' ? 'quiz-choose' : 'escape-room-choose'
    const label = activityType === 'flashcard' ? 'Flashcards' : activityType === 'quiz' ? 'Quiz' : 'Escape Room'

    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={() => {
              setMode(backMode)
              resetState()
            }}
            className="mb-6 inline-block text-gray-600 hover:text-black"
          >
            ← Back to options
          </button>

          <h1 className="mb-2 text-3xl font-bold">Paste {label} Questions</h1>
          <p className="mb-4 text-gray-600">
            Paste your formatted {activityType === 'flashcard' ? 'flashcards' : 'questions'} below.{' '}
            <a
              href={activityType === 'flashcard' ? '/templates/flashcard-template.txt' : activityType === 'quiz' ? '/templates/quiz-template.txt' : '/templates/escape-room-template.txt'}
              download
              className="text-indigo-600 hover:underline"
            >
              Download template
            </a>
          </p>

          <form onSubmit={handleCreate} className="flex flex-col gap-6">
            <div>
              <label className="mb-2 block font-medium">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`e.g., Chapter 5 ${label}`}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-black focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">{activityType === 'flashcard' ? 'Flashcards' : 'Questions'}</label>
              <textarea
                value={pastedContent}
                onChange={(e) => setPastedContent(e.target.value)}
                placeholder={activityType === 'flashcard'
                  ? `Paste your flashcards here...\n\nExample:\n\nCARD 1\nFRONT: What is photosynthesis?\nBACK: The process by which plants convert sunlight into energy.\n\nCARD 2\nFRONT: What is the mitochondria?\nBACK: The powerhouse of the cell.`
                  : `Paste your formatted questions here...\n\nExample:\n\nQUESTION 1\nTYPE: multiple-choice\nQUESTION: What is 2 + 2?\nA. 3\nB. 4 *\nC. 5\nCORRECT_MESSAGE: Correct!`}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-black focus:outline-none font-mono text-sm"
                rows={15}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-8 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : `Create ${label}`}
            </button>
          </form>

          {activityType === 'flashcard' ? (
            <div className="mt-8 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">Supported Flashcard Formats</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li><strong>Numbered:</strong> CARD 1, CARD 2 with FRONT: and BACK:</li>
                <li><strong>Q/A pairs:</strong> Q: question / A: answer separated by blank lines</li>
                <li><strong>Tab-separated:</strong> front{'\t'}back (one card per line)</li>
                <li><strong>Dash format:</strong> term - definition</li>
              </ul>
            </div>
          ) : (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Supported Question Types</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li><strong>Multiple Choice:</strong> Use A. B. C. options, mark correct with *</li>
                <li><strong>Fill in the Blank:</strong> TYPE: fill-blank with SENTENCE: and ANSWER:</li>
                <li><strong>Drag & Drop:</strong> TYPE: drag-drop with CORRECT_WORDS: and DISTRACTOR_WORDS:</li>
                <li><strong>Hotspot:</strong> TYPE: hotspot - complete image upload in builder</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Upload mode
  const backMode = activityType === 'flashcard' ? 'flashcard-choose' : activityType === 'quiz' ? 'quiz-choose' : 'escape-room-choose'
  const label = activityType === 'flashcard' ? 'Flashcards' : activityType === 'quiz' ? 'Quiz' : 'Escape Room'

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-xl">
        <button
          onClick={() => {
            setMode(backMode)
            resetState()
          }}
          className="mb-6 inline-block text-gray-600 hover:text-black"
        >
          ← Back to options
        </button>

        <h1 className="mb-2 text-3xl font-bold">Upload {label} File</h1>
        <p className="mb-8 text-gray-600">
          Upload a .txt file with your {activityType === 'flashcard' ? 'flashcards' : 'questions'}.{' '}
          <a
            href={activityType === 'flashcard' ? '/templates/flashcard-template.txt' : activityType === 'quiz' ? '/templates/quiz-template.txt' : '/templates/escape-room-template.txt'}
            download
            className="text-indigo-600 hover:underline"
          >
            Download template
          </a>
        </p>

        <form onSubmit={handleCreate} className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g., Chapter 5 ${label}`}
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
            {loading ? 'Creating...' : `Create ${label}`}
          </button>
        </form>
      </div>
    </div>
  )
}
