'use client'

import { useGame } from '@/context/GameContext'
import StartScreen from './StartScreen'
import GameHub from './GameHub'
import QuestionScreen from './QuestionScreen'
import TeachingScreen from './TeachingScreen'
import ReflectionScreen from './ReflectionScreen'
import LetterReveal from './LetterReveal'
import FinalLock from './FinalLock'
import EscapedScreen from './EscapedScreen'

export default function EscapeRoom() {
  const { state } = useGame()

  switch (state.currentScreen) {
    case 'start':
      return <StartScreen />
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
      return <StartScreen />
  }
}
