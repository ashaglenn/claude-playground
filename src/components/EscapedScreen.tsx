'use client'

import { useGame } from '@/context/GameContext'
import { useTheme } from '@/context/ThemeContext'

export default function EscapedScreen() {
  const { dispatch } = useGame()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('escaped')

  const handlePlayAgain = () => {
    localStorage.removeItem('escape-room-state')
    dispatch({ type: 'RESET_GAME' })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1
        className={`text-5xl font-bold ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
        style={{ color: 'var(--theme-accent)', fontFamily: 'var(--theme-font-heading)' }}
      >
        You Escaped!
      </h1>

      <p
        className={`max-w-md text-center text-xl ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
        style={{ color: 'var(--theme-text-muted)' }}
      >
        Congratulations! You successfully completed all checkpoints and unlocked the final lock.
      </p>

      <div className="mt-4 text-6xl">
        🎉
      </div>

      <button
        onClick={handlePlayAgain}
        className="mt-8 rounded-lg px-8 py-4 text-lg font-medium transition-colors"
        style={{
          backgroundColor: 'var(--theme-primary)',
          color: 'var(--theme-primary-text)',
        }}
      >
        Play Again
      </button>
    </div>
  )
}
