'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  BuilderState,
  CheckpointData,
  createEmptyBuilderState,
  createEmptyCheckpoint,
  builderStateToGameContent,
} from '@/lib/builder-types'
import { CustomThemeBackgrounds } from '@/lib/types'
import CheckpointSection from '@/components/builder/CheckpointSection'
import ThemeSelector from '@/components/builder/ThemeSelector'
import BackgroundUpload from '@/components/builder/BackgroundUpload'

function generateShareCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function BuilderPage() {
  const [state, setState] = useState<BuilderState>(createEmptyBuilderState())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const updateTitle = (title: string) => {
    setState(prev => ({ ...prev, title }))
  }

  const updateTheme = (theme: string) => {
    setState(prev => ({ ...prev, theme, customThemeId: undefined, customThemeBackgrounds: undefined }))
  }

  const updateCustomTheme = (customThemeId: string, customThemeBackgrounds: CustomThemeBackgrounds) => {
    setState(prev => ({ ...prev, customThemeId, customThemeBackgrounds }))
  }

  const updateBackgroundImage = (backgroundImage: string | undefined) => {
    setState(prev => ({ ...prev, backgroundImage }))
  }

  const updateWelcomeMessage = (welcomeMessage: string) => {
    setState(prev => ({ ...prev, welcomeMessage }))
  }

  const updateFinalWord = (finalWord: string) => {
    setState(prev => ({ ...prev, finalWord: finalWord.toUpperCase() }))
  }

  const updateFinalClue = (finalClue: string) => {
    setState(prev => ({ ...prev, finalClue }))
  }

  const updateCheckpoint = (index: number, data: CheckpointData) => {
    setState(prev => {
      const newCheckpoints = [...prev.checkpoints]
      newCheckpoints[index] = data
      return { ...prev, checkpoints: newCheckpoints }
    })
  }

  const addCheckpoint = () => {
    setState(prev => ({
      ...prev,
      checkpoints: [...prev.checkpoints, createEmptyCheckpoint(prev.checkpoints.length + 1)],
    }))
  }

  const removeCheckpoint = (index: number) => {
    if (state.checkpoints.length <= 1) return
    setState(prev => ({
      ...prev,
      checkpoints: prev.checkpoints.filter((_, i) => i !== index),
    }))
  }

  const validateState = (): string | null => {
    if (!state.title.trim()) {
      return 'Please enter a title for your escape room'
    }

    let questionCounter = 0
    for (let cp = 0; cp < state.checkpoints.length; cp++) {
      const checkpoint = state.checkpoints[cp]
      if (!checkpoint.letter.trim()) {
        return `Please enter a letter for Checkpoint ${cp + 1}`
      }

      for (let q = 0; q < checkpoint.questions.length; q++) {
        questionCounter++
        const question = checkpoint.questions[q]
        const qNum = questionCounter

        if (!question.question.trim()) {
          return `Please enter the question text for Question ${qNum}`
        }

        if (!question.answers.A.text.trim() || !question.answers.B.text.trim() || !question.answers.C.text.trim()) {
          return `Please enter all answer options for Question ${qNum}`
        }

        if (!question.correctMessage.trim()) {
          return `Please enter a correct message for Question ${qNum}`
        }

        // Validate wrong answers have teaching text
        const wrongAnswers = ['A', 'B', 'C'].filter(k => k !== question.correct) as ('A' | 'B' | 'C')[]
        for (const key of wrongAnswers) {
          if (!question.answers[key].teaching.trim()) {
            return `Please enter teaching text for wrong answer ${key} in Question ${qNum}`
          }
        }
      }
    }

    return null
  }

  const handleSave = async () => {
    setError('')
    const validationError = validateState()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in')
        setSaving(false)
        return
      }

      const gameContent = builderStateToGameContent(state)

      const { error: insertError } = await supabase.from('escape_rooms').insert({
        teacher_id: user.id,
        title: state.title,
        game_content: gameContent,
        share_code: generateShareCode(),
      })

      if (insertError) {
        setError(insertError.message)
        setSaving(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Failed to save escape room')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      <div className="sticky top-0 z-10 border-b bg-white px-8 py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-black"
            >
              ← Back
            </Link>
            <input
              type="text"
              value={state.title}
              onChange={(e) => updateTitle(e.target.value)}
              placeholder="Escape Room Title..."
              className="border-b-2 border-transparent bg-transparent text-2xl font-bold text-gray-900 focus:border-black focus:outline-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-black px-6 py-2 font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Escape Room'}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-8 pt-6">
        {error && (
          <div className="mb-6 rounded-lg border-2 border-red-300 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <ThemeSelector
          selectedTheme={state.theme}
          selectedCustomThemeId={state.customThemeId}
          onThemeChange={updateTheme}
          onCustomThemeSelect={updateCustomTheme}
        />

        <BackgroundUpload
          imageUrl={state.backgroundImage}
          onImageChange={updateBackgroundImage}
          onThemeChange={updateTheme}
        />

        <div className="mt-4 rounded-lg border-2 border-gray-200 bg-white p-4">
          <h3 className="mb-1 text-sm font-medium text-gray-700">
            Welcome Message (optional)
          </h3>
          <p className="mb-3 text-xs text-gray-500">
            This message is shown to students after they enter their name, before starting the game.
          </p>
          <textarea
            value={state.welcomeMessage}
            onChange={(e) => updateWelcomeMessage(e.target.value)}
            placeholder="Welcome to this escape room! Read each question carefully and work together to find the answers..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            rows={3}
          />
        </div>

        <div className="mt-4 rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
          <h3 className="mb-1 text-sm font-medium text-purple-800">
            Final Challenge (Word Puzzle)
          </h3>
          <p className="mb-3 text-xs text-purple-600">
            Students will solve a word puzzle at the end. The letters they earn from checkpoints will be pre-filled.
          </p>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Final Answer Word
              </label>
              <input
                type="text"
                value={state.finalWord}
                onChange={(e) => updateFinalWord(e.target.value)}
                placeholder="e.g., AORTA"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 uppercase text-gray-900"
              />
              <p className="mt-1 text-xs text-gray-500">
                Make sure checkpoint letters are part of this word. Currently: {state.checkpoints.map(cp => cp.letter || '?').join(', ')}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Clue / Question
              </label>
              <textarea
                value={state.finalClue}
                onChange={(e) => updateFinalClue(e.target.value)}
                placeholder="e.g., What is the largest artery in the human body?"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {state.checkpoints.map((checkpoint, index) => (
            <CheckpointSection
              key={index}
              checkpointNumber={index + 1}
              data={checkpoint}
              onChange={(data) => updateCheckpoint(index, data)}
              onRemove={state.checkpoints.length > 1 ? () => removeCheckpoint(index) : undefined}
            />
          ))}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={addCheckpoint}
            className="rounded-lg border-2 border-dashed border-gray-300 px-6 py-3 text-gray-600 hover:border-gray-400 hover:text-gray-700"
          >
            + Add Checkpoint
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-black px-8 py-3 text-lg font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Escape Room'}
          </button>
        </div>
      </div>
    </div>
  )
}
