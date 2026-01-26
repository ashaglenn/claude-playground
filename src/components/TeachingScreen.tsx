'use client'

import { useGame } from '@/context/GameContext'
import { useTheme } from '@/context/ThemeContext'
import { isMultipleChoiceQuestion } from '@/lib/types'

export default function TeachingScreen() {
  const { state, dispatch, getCurrentQuestion } = useGame()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('teaching')
  const question = getCurrentQuestion()

  // Teaching screen only applies to multiple choice questions
  if (!question || !state.currentWrongAnswer || !isMultipleChoiceQuestion(question)) return null

  const wrongAnswer = question.answers[state.currentWrongAnswer]

  const handleStartOver = () => {
    dispatch({ type: 'RESET_GAME' })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <button
        onClick={handleStartOver}
        className={`absolute top-4 left-4 text-sm hover:opacity-70 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
        style={{ color: 'var(--theme-text-muted)' }}
      >
        ← Start Over
      </button>

      <div className="w-full max-w-2xl">
        <h2
          className={`text-xl font-semibold mb-4 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
          style={{ color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-heading)' }}
        >
          Not Quite. Let&apos;s Review.
        </h2>

        <div
          className="rounded-lg border-2 p-6 mb-6"
          style={{
            backgroundColor: 'var(--theme-card-background)',
            borderColor: 'var(--theme-accent)',
          }}
        >
          <p className="text-lg leading-relaxed">{wrongAnswer.teaching}</p>
        </div>

        <button
          onClick={() => dispatch({ type: 'CONTINUE_TO_REFLECTION' })}
          className="rounded-lg px-8 py-4 text-lg font-medium transition-colors"
          style={{
            backgroundColor: 'var(--theme-primary)',
            color: 'var(--theme-primary-text)',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
