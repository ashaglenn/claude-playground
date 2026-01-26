'use client'

import { useQuiz } from '@/context/QuizContext'
import { useTheme } from '@/context/ThemeContext'

export default function QuizFeedbackScreen() {
  const { state, dispatch, isLastQuestion, getCurrentQuestion } = useQuiz()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('correct' as any)

  const isCorrect = state.lastAnswerCorrect
  const correctAnswer = state.lastCorrectAnswer
  const question = getCurrentQuestion()

  const handleNext = () => {
    dispatch({ type: 'NEXT_QUESTION' })
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
          {isCorrect ? (
            <>
              <div
                className="text-6xl mb-4"
                style={{ color: 'var(--theme-success)' }}
              >
                ✓
              </div>
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: 'var(--theme-success)', fontFamily: 'var(--theme-font-heading)' }}
              >
                Correct!
              </h2>
              {question?.correctMessage && (
                <p className="text-lg mb-6">{question.correctMessage}</p>
              )}
            </>
          ) : (
            <>
              <div
                className="text-6xl mb-4"
                style={{ color: 'var(--theme-error)' }}
              >
                ✗
              </div>
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: 'var(--theme-error)', fontFamily: 'var(--theme-font-heading)' }}
              >
                Incorrect
              </h2>
              {correctAnswer && (
                <p className="text-lg mb-6">
                  The correct answer was: <span className="font-semibold">{correctAnswer}</span>
                </p>
              )}
            </>
          )}

          <button
            onClick={handleNext}
            className="cursor-pointer rounded-lg px-8 py-3 text-lg font-medium transition-colors"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-primary-text)',
            }}
          >
            {isLastQuestion() ? 'See Results' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  )
}
