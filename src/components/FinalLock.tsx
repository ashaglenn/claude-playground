'use client'

import { useState } from 'react'
import { useGame } from '@/context/GameContext'
import { useTheme } from '@/context/ThemeContext'

export default function FinalLock() {
  const { state, dispatch } = useGame()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('final-lock')
  const [answer, setAnswer] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  const earnedLetters = state.unlockedLetters.map(l => l.letter.toUpperCase())
  const finalWord = state.gameContent?.finalWord?.toUpperCase() || ''
  const finalClue = state.gameContent?.finalClue || 'Use the letters you earned to solve the puzzle!'

  const handleBackToHub = () => {
    dispatch({ type: 'GO_TO_HUB' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!answer.trim()) {
      setErrorMessage('Please enter your answer')
      return
    }

    // Case-insensitive comparison
    if (answer.trim().toUpperCase() === finalWord) {
      setErrorMessage(null)
      dispatch({ type: 'ESCAPED' })
    } else {
      setErrorMessage('Not quite right! Try again.')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  // Build display letters - show earned letters in their correct positions
  const getDisplayLetters = () => {
    if (!finalWord) return []
    return finalWord.split('').map((letter, index) => {
      const isEarned = earnedLetters.includes(letter)
      return {
        letter: isEarned ? letter : '?',
        isEarned,
        position: index,
      }
    })
  }

  const displayLetters = getDisplayLetters()

  // Fallback for games without finalWord - just show earned letters
  if (!finalWord) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <button
          onClick={handleBackToHub}
          className={`cursor-pointer absolute top-4 left-4 text-sm hover:opacity-70 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
          style={{ color: 'var(--theme-text-muted)' }}
        >
          ← Back to Hub
        </button>

        <h2
          className={`text-2xl font-bold ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
          style={{ fontFamily: 'var(--theme-font-heading)' }}
        >
          Congratulations!
        </h2>
        <p className={isClassicTheme && hasBackground ? 'text-highlight' : ''} style={{ color: 'var(--theme-text-muted)' }}>
          You&apos;ve collected all the letters!
        </p>

        <div className="flex gap-4">
          {earnedLetters.map((letter, i) => (
            <div
              key={i}
              className="flex h-16 w-16 items-center justify-center rounded-xl text-3xl font-bold shadow-lg"
              style={{
                backgroundColor: 'var(--theme-success)',
                color: 'var(--theme-accent)',
              }}
            >
              {letter}
            </div>
          ))}
        </div>

        <button
          onClick={() => dispatch({ type: 'ESCAPED' })}
          className="cursor-pointer mt-4 rounded-xl px-8 py-4 text-lg font-semibold transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--theme-primary)',
            color: 'var(--theme-primary-text)',
          }}
        >
          Complete Escape Room
        </button>
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

      <h2
        className={`text-3xl font-bold text-center ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
        style={{ fontFamily: 'var(--theme-font-heading)' }}
      >
        Final Challenge
      </h2>

      <p
        className={`text-lg text-center max-w-md ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
        style={{ color: 'var(--theme-text-muted)' }}
      >
        {finalClue}
      </p>

      {/* Letter boxes showing earned letters as clues */}
      <div className={`flex gap-2 flex-wrap justify-center ${shake ? 'animate-shake' : ''}`}>
        {displayLetters.map((item, i) => (
          <div
            key={i}
            className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-bold shadow-md transition-all sm:h-16 sm:w-16 sm:text-3xl"
            style={{
              backgroundColor: item.isEarned
                ? 'var(--theme-success)'
                : 'var(--theme-background-secondary)',
              color: item.isEarned
                ? 'var(--theme-accent)'
                : 'var(--theme-text-muted)',
              border: item.isEarned
                ? '3px solid var(--theme-success)'
                : '3px dashed var(--theme-border)',
            }}
          >
            {item.letter}
          </div>
        ))}
      </div>

      <p className={`text-sm ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`} style={{ color: 'var(--theme-text-muted)' }}>
        You&apos;ve earned {earnedLetters.length} of {finalWord.length} letters from completing checkpoints
      </p>

      {/* Answer input form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4 mt-4">
        <input
          type="text"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value)
            setErrorMessage(null)
          }}
          placeholder="Type your answer..."
          autoFocus
          className="w-full rounded-xl px-6 py-4 text-xl text-center font-semibold transition-all focus:outline-none focus:ring-4"
          style={{
            backgroundColor: 'var(--theme-card-background)',
            color: 'var(--theme-text)',
            border: '2px solid var(--theme-border)',
          }}
        />

        {errorMessage && (
          <p className={`font-medium text-center ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`} style={{ color: 'var(--theme-error)' }}>
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          className="cursor-pointer w-full rounded-xl px-8 py-4 text-lg font-semibold transition-all hover:scale-105 shadow-lg"
          style={{
            backgroundColor: 'var(--theme-primary)',
            color: 'var(--theme-primary-text)',
          }}
        >
          Submit Answer
        </button>
      </form>
    </div>
  )
}
