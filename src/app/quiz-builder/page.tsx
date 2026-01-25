'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  QuizBuilderState,
  QuestionData,
  createEmptyQuizBuilderState,
  createEmptyQuizQuestion,
  quizBuilderStateToQuizContent,
  isMultipleChoiceQuestionData,
  isHotspotQuestionData,
  isDragDropQuestionData,
  isFillBlankQuestionData,
} from '@/lib/builder-types'
import { CustomThemeBackgrounds } from '@/lib/types'
import ThemeSelector from '@/components/builder/ThemeSelector'
import BackgroundUpload from '@/components/builder/BackgroundUpload'
import QuizQuestionEditor from '@/components/quiz-builder/QuizQuestionEditor'

function generateShareCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function QuizBuilderPage() {
  const [state, setState] = useState<QuizBuilderState>(createEmptyQuizBuilderState(3))
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

  const updateQuestion = (index: number, data: QuestionData) => {
    setState(prev => {
      const newQuestions = [...prev.questions]
      newQuestions[index] = data
      return { ...prev, questions: newQuestions }
    })
  }

  const addQuestion = () => {
    setState(prev => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuizQuestion(prev.questions.length + 1)],
    }))
  }

  const removeQuestion = (index: number) => {
    if (state.questions.length <= 1) return
    setState(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
  }

  const validateState = (): string | null => {
    if (!state.title.trim()) {
      return 'Please enter a title for your quiz'
    }

    for (let i = 0; i < state.questions.length; i++) {
      const question = state.questions[i]
      const qNum = i + 1

      if (!question.question.trim()) {
        return `Please enter the question text for Question ${qNum}`
      }

      if (!question.correctMessage.trim()) {
        return `Please enter a correct message for Question ${qNum}`
      }

      if (isMultipleChoiceQuestionData(question)) {
        if (!question.answers.A.text.trim() || !question.answers.B.text.trim() || !question.answers.C.text.trim()) {
          return `Please enter all answer options for Question ${qNum}`
        }
      } else if (isHotspotQuestionData(question)) {
        if (!question.imageUrl?.trim()) {
          return `Please upload an image for hotspot Question ${qNum}`
        }
        if (!question.hotspotRegion) {
          return `Please draw a hotspot region for Question ${qNum}`
        }
      } else if (isDragDropQuestionData(question)) {
        if (!question.sentence.trim()) {
          return `Please enter a sentence for drag-drop Question ${qNum}`
        }
        const blankCount = (question.sentence.match(/\[BLANK\]/g) || []).length
        if (blankCount === 0) {
          return `Please add at least one [BLANK] placeholder in Question ${qNum}`
        }
        if (question.correctWords.length !== blankCount) {
          return `Question ${qNum} has ${blankCount} blank(s) but ${question.correctWords.length} correct word(s)`
        }
      } else if (isFillBlankQuestionData(question)) {
        if (!question.sentence.trim()) {
          return `Please enter a sentence for fill-blank Question ${qNum}`
        }
        if (!question.sentence.includes('[BLANK]')) {
          return `Please add a [BLANK] placeholder in Question ${qNum}`
        }
        if (!question.correctAnswer.trim()) {
          return `Please enter the correct answer for Question ${qNum}`
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

      const quizContent = quizBuilderStateToQuizContent(state)

      const { error: insertError } = await supabase.from('escape_rooms').insert({
        teacher_id: user.id,
        title: state.title,
        game_content: quizContent,
        share_code: generateShareCode(),
        activity_type: 'quiz',
      })

      if (insertError) {
        setError(insertError.message)
        setSaving(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Failed to save quiz')
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
              placeholder="Quiz Title..."
              className="border-b-2 border-transparent bg-transparent text-2xl font-bold text-gray-900 focus:border-black focus:outline-none"
            />
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              Quiz
            </span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-black px-6 py-2 font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Quiz'}
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
            This message is shown to students after they enter their name, before starting the quiz.
          </p>
          <textarea
            value={state.welcomeMessage}
            onChange={(e) => updateWelcomeMessage(e.target.value)}
            placeholder="Welcome to this quiz! Read each question carefully..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            rows={3}
          />
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions</h2>
          <div className="space-y-4">
            {state.questions.map((question, index) => (
              <QuizQuestionEditor
                key={index}
                questionNumber={index + 1}
                data={question}
                onChange={(data) => updateQuestion(index, data)}
                onRemove={state.questions.length > 1 ? () => removeQuestion(index) : undefined}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={addQuestion}
            className="rounded-lg border-2 border-dashed border-gray-300 px-6 py-3 text-gray-600 hover:border-gray-400 hover:text-gray-700"
          >
            + Add Question
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-black px-8 py-3 text-lg font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      </div>
    </div>
  )
}
