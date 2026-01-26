'use client'

import { useState, FormEvent } from 'react'
import { useGame } from '@/context/GameContext'
import { useTheme } from '@/context/ThemeContext'
import { FillBlankQuestion } from '@/lib/types'

interface FillBlankQuestionScreenProps {
  question: FillBlankQuestion
}

export default function FillBlankQuestionScreen({ question }: FillBlankQuestionScreenProps) {
  const { dispatch } = useGame()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('question')

  const [userAnswer, setUserAnswer] = useState('')
  const [showCorrectMessage, setShowCorrectMessage] = useState(false)
  const [showIncorrectMessage, setShowIncorrectMessage] = useState(false)

  const handleBackToHub = () => {
    dispatch({ type: 'GO_TO_HUB' })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Case-insensitive comparison, trim whitespace
    const isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()

    if (isCorrect) {
      setShowIncorrectMessage(false)
      setShowCorrectMessage(true)
    } else {
      setShowIncorrectMessage(true)
      setUserAnswer('')
    }
  }

  const handleContinue = () => {
    setShowCorrectMessage(false)
    dispatch({ type: 'ANSWER_CORRECT' })
  }

  // Parse sentence and render with input field
  const renderSentenceWithInput = () => {
    const parts = question.sentence.split('[BLANK]')

    if (parts.length === 1) {
      return <span>{question.sentence}</span>
    }

    return (
      <span className="leading-relaxed">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="inline-block mx-1 px-3 py-1 w-40 text-center border-b-2 rounded focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--theme-card-background)',
                  borderColor: 'var(--theme-primary)',
                  color: 'var(--theme-text)',
                }}
                autoFocus
                disabled={showCorrectMessage}
              />
            )}
          </span>
        ))}
      </span>
    )
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
            className="cursor-pointer rounded-lg px-8 py-3 text-lg font-medium transition-colors"
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
        className={`cursor-pointer absolute top-4 left-4 text-sm hover:opacity-70 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
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

        <p className={`text-xl mb-6 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}>
          {question.question}
        </p>

        {question.imageUrl && (
          <img
            src={question.imageUrl}
            alt="Question"
            className="max-h-64 max-w-full rounded-lg mb-6"
            style={{ borderColor: 'var(--theme-border)', borderWidth: '1px' }}
          />
        )}

        <form onSubmit={handleSubmit}>
          <div
            className="rounded-lg p-6 mb-6 text-lg"
            style={{
              backgroundColor: 'var(--theme-card-background)',
              borderColor: 'var(--theme-border)',
              borderWidth: '1px',
            }}
          >
            {renderSentenceWithInput()}
          </div>

          {showIncorrectMessage && (
            <div
              className="mb-4 p-4 rounded-lg text-center"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--theme-text)',
              }}
            >
              {question.incorrectMessage || 'Not quite. Try again!'}
            </div>
          )}

          <button
            type="submit"
            disabled={!userAnswer.trim()}
            className="cursor-pointer w-full rounded-lg px-6 py-3 text-lg font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-primary-text)',
            }}
          >
            Check Answer
          </button>
        </form>
      </div>
    </div>
  )
}
