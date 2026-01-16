'use client'

import { useEffect } from 'react'
import { GameContent } from '@/lib/types'
import { GameProvider, useGame } from '@/context/GameContext'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import WelcomeScreen from './WelcomeScreen'
import GameHub from './GameHub'
import QuestionScreen from './QuestionScreen'
import TeachingScreen from './TeachingScreen'
import ReflectionScreen from './ReflectionScreen'
import LetterReveal from './LetterReveal'
import FinalLock from './FinalLock'
import EscapedScreen from './EscapedScreen'

interface StudentGameProps {
  gameContent: GameContent
  onComplete: () => void
}

function GameScreens({ onComplete }: { onComplete: () => void }) {
  const { state } = useGame()

  useEffect(() => {
    if (state.currentScreen === 'escaped') {
      onComplete()
    }
  }, [state.currentScreen, onComplete])

  switch (state.currentScreen) {
    case 'welcome':
      return <WelcomeScreen />
    case 'hub':
      return <GameHub />
    case 'question':
      return <QuestionScreen />
    case 'teaching':
      return <TeachingScreen />
    case 'reflection':
      return <ReflectionScreen />
    case 'letter-reveal':
      return <LetterReveal />
    case 'final-lock':
      return <FinalLock />
    case 'escaped':
      return <EscapedScreen />
    default:
      return <GameHub />
  }
}

function GameLoader({ gameContent, onComplete }: StudentGameProps) {
  const { state, dispatch } = useGame()

  useEffect(() => {
    // Load the game content when component mounts
    if (!state.gameContent) {
      dispatch({ type: 'LOAD_GAME', content: gameContent })
    }
  }, [gameContent, state.gameContent, dispatch])

  if (!state.gameContent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading game...</p>
      </div>
    )
  }

  return <GameScreens onComplete={onComplete} />
}

function GameContainer({ gameContent, onComplete }: StudentGameProps) {
  const { state } = useGame()
  const { getBackgroundForScreen } = useTheme()

  const isClassicTheme = !gameContent.theme || gameContent.theme === 'classic'
  const hasCustomTheme = !!gameContent.customThemeBackgrounds

  // Determine background image for current screen
  let backgroundImage: string | undefined

  if (hasCustomTheme && state.currentScreen) {
    // Custom theme: use screen-specific background
    const screenBackground = getBackgroundForScreen(state.currentScreen)
    if (screenBackground) {
      backgroundImage = `url(${screenBackground})`
    }
  } else if (gameContent.backgroundImage) {
    // Regular background: apply overlay for non-classic themes
    backgroundImage = isClassicTheme
      ? `url(${gameContent.backgroundImage})`
      : `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${gameContent.backgroundImage})`
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed transition-all duration-500"
      style={{
        backgroundColor: 'var(--theme-background)',
        backgroundImage,
        color: 'var(--theme-text)',
        fontFamily: 'var(--theme-font-body)',
      }}
    >
      <GameLoader gameContent={gameContent} onComplete={onComplete} />
    </div>
  )
}

export default function StudentGame({ gameContent, onComplete }: StudentGameProps) {
  return (
    <ThemeProvider
      initialTheme={gameContent.theme}
      customBackgrounds={gameContent.customThemeBackgrounds}
    >
      <GameProvider>
        <GameContainer gameContent={gameContent} onComplete={onComplete} />
      </GameProvider>
    </ThemeProvider>
  )
}
