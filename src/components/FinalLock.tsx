'use client'

import { useState } from 'react'
import { useGame } from '@/context/GameContext'

export default function FinalLock() {
  const { state, dispatch } = useGame()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [filledLetters, setFilledLetters] = useState<(string | null)[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const earnedLetters = state.unlockedLetters.map(l => l.letter.toUpperCase())
  const finalWord = state.gameContent?.finalWord?.toUpperCase() || ''
  const finalClue = state.gameContent?.finalClue || 'Solve the puzzle to escape!'

  // Initialize filled letters based on earned letters
  const getInitialFilledLetters = (): (string | null)[] => {
    if (!finalWord) return []
    return finalWord.split('').map(letter => {
      // If this letter was earned, pre-fill it
      if (earnedLetters.includes(letter)) {
        return letter
      }
      return null
    })
  }

  // Initialize on first render if needed
  if (filledLetters.length === 0 && finalWord) {
    setFilledLetters(getInitialFilledLetters())
  }

  const handleLetterClick = (letter: string) => {
    if (selectedIndex === null) {
      setErrorMessage('Click on a blank box first!')
      return
    }

    const newFilled = [...filledLetters]
    newFilled[selectedIndex] = letter
    setFilledLetters(newFilled)
    setSelectedIndex(null)
    setErrorMessage(null)

    // Check if word is complete
    if (newFilled.every(l => l !== null)) {
      const enteredWord = newFilled.join('')
      if (enteredWord === finalWord) {
        setTimeout(() => {
          dispatch({ type: 'ESCAPED' })
        }, 500)
      } else {
        setErrorMessage('Not quite right! Try again.')
        setShake(true)
        setTimeout(() => setShake(false), 500)
        // Reset only the non-earned letters
        setFilledLetters(getInitialFilledLetters())
      }
    }
  }

  const handleBoxClick = (index: number) => {
    // Can only click on empty boxes (not pre-filled earned letters)
    const letter = finalWord[index]
    if (earnedLetters.includes(letter)) {
      return // Can't change earned letters
    }
    setSelectedIndex(index)
    setErrorMessage(null)
  }

  const handleBackToHub = () => {
    dispatch({ type: 'GO_TO_HUB' })
  }

  // Fallback for games without finalWord set - use old alphabetical logic
  if (!finalWord) {
    const letters = state.unlockedLetters.map(l => l.letter)
    const sortedLetters = [...letters].sort()
    const clickedLetters = state.lockClickOrder

    const handleOldLetterClick = (letter: string) => {
      if (clickedLetters.includes(letter)) return

      const nextIndex = clickedLetters.length
      const expectedLetter = sortedLetters[nextIndex]

      if (letter === expectedLetter) {
        dispatch({ type: 'LOCK_CLICK', letter })

        if (clickedLetters.length + 1 === letters.length) {
          setTimeout(() => {
            dispatch({ type: 'ESCAPED' })
          }, 500)
        }
        setErrorMessage(null)
      } else {
        setErrorMessage('Wrong order! Click the letters in alphabetical order.')
        setShake(true)
        setTimeout(() => setShake(false), 500)
        dispatch({ type: 'LOCK_RESET' })
      }
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <button
          onClick={handleBackToHub}
          className="absolute top-4 left-4 text-sm hover:opacity-70"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          ← Back to Hub
        </button>

        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--theme-font-heading)' }}
        >
          Final Lock
        </h2>
        <p style={{ color: 'var(--theme-text-muted)' }}>
          Click the letters in alphabetical order to escape!
        </p>

        <div className={`flex gap-4 ${shake ? 'animate-shake' : ''}`}>
          {letters.map((letter, i) => {
            const isClicked = clickedLetters.includes(letter)

            return (
              <button
                key={i}
                onClick={() => handleOldLetterClick(letter)}
                disabled={isClicked}
                className="flex h-24 w-24 items-center justify-center rounded-lg border-4 text-4xl font-bold transition-all"
                style={{
                  borderColor: isClicked ? 'var(--theme-success)' : 'var(--theme-border)',
                  backgroundColor: isClicked ? 'var(--theme-success)' : 'var(--theme-card-background)',
                  color: isClicked ? 'var(--theme-accent)' : 'var(--theme-accent)',
                  cursor: isClicked ? 'not-allowed' : 'pointer',
                }}
              >
                {letter}
              </button>
            )
          })}
        </div>

        {errorMessage && (
          <p className="font-medium" style={{ color: 'var(--theme-error)' }}>
            {errorMessage}
          </p>
        )}

        <p className="mt-4 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
          Clicked: {clickedLetters.length > 0 ? clickedLetters.join(' → ') : 'None'}
        </p>
      </div>
    )
  }

  // New word puzzle UI
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <button
        onClick={handleBackToHub}
        className="absolute top-4 left-4 text-sm hover:opacity-70"
        style={{ color: 'var(--theme-text-muted)' }}
      >
        ← Back to Hub
      </button>

      <h2
        className="text-2xl font-bold text-center"
        style={{ fontFamily: 'var(--theme-font-heading)' }}
      >
        Final Challenge
      </h2>

      <p
        className="text-lg text-center max-w-md"
        style={{ color: 'var(--theme-text-muted)' }}
      >
        {finalClue}
      </p>

      {/* Word boxes */}
      <div className={`flex gap-2 flex-wrap justify-center ${shake ? 'animate-shake' : ''}`}>
        {finalWord.split('').map((letter, i) => {
          const isFilled = filledLetters[i] !== null
          const isEarned = earnedLetters.includes(letter)
          const isSelected = selectedIndex === i

          return (
            <button
              key={i}
              onClick={() => handleBoxClick(i)}
              disabled={isEarned}
              className="flex h-16 w-16 items-center justify-center rounded-lg border-4 text-3xl font-bold transition-all sm:h-20 sm:w-20 sm:text-4xl"
              style={{
                borderColor: isSelected
                  ? 'var(--theme-primary)'
                  : isEarned
                    ? 'var(--theme-success)'
                    : 'var(--theme-border)',
                backgroundColor: isEarned
                  ? 'var(--theme-success)'
                  : isFilled
                    ? 'var(--theme-card-background)'
                    : 'var(--theme-background-secondary)',
                color: 'var(--theme-accent)',
                cursor: isEarned ? 'not-allowed' : 'pointer',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {filledLetters[i] || ''}
            </button>
          )
        })}
      </div>

      {errorMessage && (
        <p className="font-medium" style={{ color: 'var(--theme-error)' }}>
          {errorMessage}
        </p>
      )}

      {selectedIndex !== null && (
        <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
          Select a letter for position {selectedIndex + 1}
        </p>
      )}

      {/* Letter keyboard */}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => handleLetterClick(letter)}
            className="flex h-10 w-10 items-center justify-center rounded-md border-2 text-lg font-semibold transition-all hover:scale-105"
            style={{
              borderColor: 'var(--theme-border)',
              backgroundColor: 'var(--theme-card-background)',
              color: 'var(--theme-text)',
            }}
          >
            {letter}
          </button>
        ))}
      </div>

      <p className="text-sm text-center" style={{ color: 'var(--theme-text-muted)' }}>
        Hint: You&apos;ve earned {earnedLetters.length} letter{earnedLetters.length !== 1 ? 's' : ''} from completing checkpoints!
      </p>
    </div>
  )
}
