'use client'

import { useQuiz } from '@/context/QuizContext'
import { useTheme } from '@/context/ThemeContext'

export default function QuizCompletedScreen() {
  const { dispatch, getScore } = useQuiz()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('correct' as any)

  const { correct, total, percentage } = getScore()

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_QUIZ' })
  }

  // Determine message based on score
  let message = ''
  let emoji = ''
  if (percentage === 100) {
    message = 'Perfect score! Excellent work!'
    emoji = '🎉'
  } else if (percentage >= 80) {
    message = 'Great job! You did really well!'
    emoji = '⭐'
  } else if (percentage >= 60) {
    message = 'Good effort! Keep practicing!'
    emoji = '👍'
  } else {
    message = 'Keep trying! Practice makes perfect!'
    emoji = '💪'
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-2xl text-center">
        <div
          className="rounded-lg p-8"
          style={{
            backgroundColor: 'var(--theme-card-background)',
          }}
        >
          <div className="text-6xl mb-4">{emoji}</div>

          <h1
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: 'var(--theme-font-heading)' }}
          >
            Quiz Complete!
          </h1>

          <div className="mb-6">
            <div
              className="text-5xl font-bold mb-2"
              style={{ color: 'var(--theme-primary)' }}
            >
              {correct}/{total}
            </div>
            <div
              className="text-2xl"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              {percentage}%
            </div>
          </div>

          <p className="text-lg mb-8">{message}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handlePlayAgain}
              className="rounded-lg px-8 py-3 text-lg font-medium transition-colors"
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-primary-text)',
              }}
            >
              Play Again
            </button>
            <a
              href="/"
              className="rounded-lg px-8 py-3 text-lg font-medium transition-colors border-2"
              style={{
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
              }}
            >
              Exit
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
