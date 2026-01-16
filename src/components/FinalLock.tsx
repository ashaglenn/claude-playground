'use client'

import { useState } from 'react'
import { useGame } from '@/context/GameContext'

export default function FinalLock() {
  const { state, dispatch } = useGame()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  const letters = state.unlockedLetters.map(l => l.letter)
  const sortedLetters = [...letters].sort()
  const clickedLetters = state.lockClickOrder

  const handleLetterClick = (letter: string) => {
    if (clickedLetters.includes(letter)) return

    const nextIndex = clickedLetters.length
    const expectedLetter = sortedLetters[nextIndex]

    if (letter === expectedLetter) {
      const newOrder = [...clickedLetters, letter]
      dispatch({ type: 'LOCK_CLICK', letter })

      if (newOrder.length === letters.length) {
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

  const handleBackToHub = () => {
    dispatch({ type: 'GO_TO_HUB' })
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
              onClick={() => handleLetterClick(letter)}
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
