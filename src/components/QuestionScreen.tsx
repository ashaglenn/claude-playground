'use client'

import { useState } from 'react'
import { useGame } from '@/context/GameContext'
import { useTheme } from '@/context/ThemeContext'
import { AnswerKey } from '@/lib/types'

export default function QuestionScreen() {
  const { state, dispatch, getCurrentQuestion } = useGame()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('question')
  const [showCorrectMessage, setShowCorrectMessage] = useState(false)
  const question = getCurrentQuestion()

  if (!question) return null

  const answerOrder = state.answerOrder[question.id] || ['A', 'B', 'C']

  const handleAnswer = (originalKey: AnswerKey) => {
    if (originalKey === question.correct) {
      setShowCorrectMessage(true)
    } else {
      dispatch({ type: 'ANSWER_WRONG', answer: originalKey })
    }
  }

  const handleContinue = () => {
    setShowCorrectMessage(false)
    dispatch({ type: 'ANSWER_CORRECT' })
  }

  const handleBackToHub = () => {
    dispatch({ type: 'GO_TO_HUB' })
  }

  if (showCorrectMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <div
          className="rounded-lg p-8 text-center max-w-2xl"
          style={{
            backgroundColor: 'var(--theme-card-background)',
          }}
        >
          <p className="text-xl font-medium mb-6">{question.correctMessage}</p>
          <button
            onClick={handleContinue}
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <button
        onClick={handleBackToHub}
        className={`absolute top-4 left-4 text-sm hover:opacity-70 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
        style={{ color: 'var(--theme-text-muted)' }}
      >
        ← Back to Hub
      </button>

      <div className="w-full max-w-2xl">
        <h2
          className={`text-xl font-semibold mb-4 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
          style={{ fontFamily: 'var(--theme-font-heading)' }}
        >
          {question.title}
        </h2>
        <p className={`text-xl mb-6 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}>{question.question}</p>

        {question.imageUrl && (
          <img
            src={question.imageUrl}
            alt="Question"
            className="max-h-64 max-w-full rounded-lg mb-6"
            style={{ borderColor: 'var(--theme-border)', borderWidth: '1px' }}
          />
        )}

        <div className="flex flex-col gap-3">
          {answerOrder.map((originalKey, index) => {
            const answer = question.answers[originalKey]
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
                {answer.text}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
