'use client'

import { useGame } from '@/context/GameContext'

export default function LetterReveal() {
  const { state, dispatch } = useGame()

  const latestLetter = state.unlockedLetters[state.unlockedLetters.length - 1]

  if (!latestLetter) return null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h2
        className="text-xl font-semibold"
        style={{ color: 'var(--theme-text-muted)', fontFamily: 'var(--theme-font-heading)' }}
      >
        Checkpoint Complete!
      </h2>

      <div
        className="flex h-32 w-32 items-center justify-center rounded-lg border-4"
        style={{
          backgroundColor: 'var(--theme-success)',
          borderColor: 'var(--theme-success)',
        }}
      >
        <span className="text-6xl font-bold" style={{ color: 'var(--theme-accent)' }}>
          {latestLetter.letter}
        </span>
      </div>

      <p className="max-w-md text-center text-lg">{latestLetter.message}</p>

      <div className="mt-4 flex gap-2">
        <span className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
          Letters unlocked:
        </span>
        {state.unlockedLetters.map((l, i) => (
          <span key={i} className="font-bold" style={{ color: 'var(--theme-accent)' }}>
            {l.letter}
          </span>
        ))}
      </div>

      <button
        onClick={() => dispatch({ type: 'GO_TO_HUB' })}
        className="mt-4 rounded-lg px-8 py-4 text-lg font-medium transition-colors"
        style={{
          backgroundColor: 'var(--theme-primary)',
          color: 'var(--theme-primary-text)',
        }}
      >
        Continue
      </button>
    </div>
  )
}
