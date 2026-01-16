'use client'

import { useGame } from '@/context/GameContext'
import { useTheme } from '@/context/ThemeContext'

export default function WelcomeScreen() {
  const { state, dispatch } = useGame()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('welcome')

  const welcomeMessage = state.gameContent?.welcomeMessage

  const handleContinue = () => {
    dispatch({ type: 'GO_TO_HUB' })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-2xl">
        <h1
          className={`text-3xl font-bold mb-6 text-center ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
          style={{ fontFamily: 'var(--theme-font-heading)' }}
        >
          Welcome
        </h1>

        {welcomeMessage && (
          <div
            className="rounded-lg border-2 p-6 mb-6"
            style={{
              backgroundColor: 'var(--theme-card-background)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{welcomeMessage}</p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            className="rounded-lg px-8 py-4 text-lg font-medium transition-colors"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-primary-text)',
            }}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  )
}
