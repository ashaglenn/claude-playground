'use client'

import { useState } from 'react'
import { useGame } from '@/context/GameContext'
import { AnswerKey } from '@/lib/types'
import { shuffleArray } from '@/lib/parser'

export default function ReflectionScreen() {
  const { state, dispatch, getCurrentQuestion } = useGame()
  const [pickedWrongAnswer, setPickedWrongAnswer] = useState<AnswerKey | null>(null)
  const [showCorrectPopup, setShowCorrectPopup] = useState(false)
  const [reflectionOrder] = useState<AnswerKey[]>(() => shuffleArray(['A', 'B', 'C'] as AnswerKey[]))

  const question = getCurrentQuestion()

  if (!question || !state.currentWrongAnswer) return null

  const wrongAnswer = question.answers[state.currentWrongAnswer]

  const handleAnswer = (originalKey: AnswerKey) => {
    if (originalKey === wrongAnswer.reflectionCorrect) {
      setShowCorrectPopup(true)
    } else {
      setPickedWrongAnswer(originalKey)
    }
  }

  const handleBackToQuestion = () => {
    setShowCorrectPopup(false)
    dispatch({ type: 'REFLECTION_CORRECT' })
  }

  const handleTryAgain = () => {
    setPickedWrongAnswer(null)
  }

  if (showCorrectPopup) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <div
          className="max-w-2xl rounded-lg border-2 p-8 text-center"
          style={{
            backgroundColor: 'var(--theme-card-background)',
            borderColor: 'var(--theme-text)',
          }}
        >
          <p className="text-xl font-medium mb-6">
            You got it! Now let&apos;s go back to the original question.
          </p>
          <button
            onClick={handleBackToQuestion}
            className="rounded-lg px-8 py-3 text-lg font-medium transition-colors"
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

  if (pickedWrongAnswer) {
    // Handle both old format (single message) and new format (per-answer messages)
    const wrongMessages = wrongAnswer.reflectionWrongMessages || {}
    const wrongMessage = wrongMessages[pickedWrongAnswer] ||
      (wrongAnswer as any).reflectionWrongMessage ||
      'That is not correct. Try again.'
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <div
          className="max-w-2xl rounded-lg border-2 p-6"
          style={{
            backgroundColor: 'var(--theme-error)',
            borderColor: 'var(--theme-error)',
          }}
        >
          <p className="text-lg leading-relaxed">{wrongMessage}</p>
        </div>

        <button
          onClick={handleTryAgain}
          className="rounded-lg px-8 py-4 text-lg font-medium transition-colors"
          style={{
            backgroundColor: 'var(--theme-primary)',
            color: 'var(--theme-primary-text)',
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-2xl">
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-heading)' }}
        >
          Reflection Question
        </h2>
        <p className="text-xl mb-6">{wrongAnswer.reflectionQuestion}</p>

        <div className="flex flex-col gap-3">
          {reflectionOrder.map((originalKey, index) => {
            const answerText = wrongAnswer.reflectionAnswers[originalKey]
            const displayLetter = ['A', 'B', 'C'][index]

            return (
              <button
                key={originalKey}
                onClick={() => handleAnswer(originalKey)}
                className="rounded-lg border-2 px-6 py-4 text-left transition-colors"
                style={{
                  backgroundColor: 'var(--theme-card-background)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
              >
                <span className="font-medium" style={{ color: 'var(--theme-accent)' }}>
                  {displayLetter}.
                </span>{' '}
                {answerText}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
