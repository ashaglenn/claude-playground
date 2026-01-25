'use client'

import { useEffect } from 'react'
import { QuizContent, QuizScreen } from '@/lib/types'
import { QuizProvider, useQuiz } from '@/context/QuizContext'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import QuizWelcomeScreen from './quiz/QuizWelcomeScreen'
import QuizQuestionScreen from './quiz/QuizQuestionScreen'
import QuizFeedbackScreen from './quiz/QuizFeedbackScreen'
import QuizCompletedScreen from './quiz/QuizCompletedScreen'

interface StudentQuizProps {
  quizContent: QuizContent
  quizId: string
  onComplete: () => void
}

function QuizScreens({ onComplete }: { onComplete: () => void }) {
  const { state } = useQuiz()

  useEffect(() => {
    if (state.currentScreen === 'completed') {
      onComplete()
    }
  }, [state.currentScreen, onComplete])

  switch (state.currentScreen) {
    case 'welcome':
      return <QuizWelcomeScreen />
    case 'question':
      return <QuizQuestionScreen />
    case 'feedback':
      return <QuizFeedbackScreen />
    case 'completed':
      return <QuizCompletedScreen />
    default:
      return <QuizQuestionScreen />
  }
}

function QuizLoader({ quizContent, onComplete }: { quizContent: QuizContent; onComplete: () => void }) {
  const { state, dispatch } = useQuiz()

  useEffect(() => {
    if (!state.quizContent) {
      dispatch({ type: 'LOAD_QUIZ', content: quizContent })
    }
  }, [quizContent, state.quizContent, dispatch])

  if (!state.quizContent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading quiz...</p>
      </div>
    )
  }

  return <QuizScreens onComplete={onComplete} />
}

function QuizContainer({ quizContent, quizId, onComplete }: StudentQuizProps) {
  const { state } = useQuiz()
  const { getBackgroundForScreen } = useTheme()

  const isClassicTheme = !quizContent.theme || quizContent.theme === 'classic'
  const hasCustomTheme = !!quizContent.customThemeBackgrounds

  // Map quiz screens to game screens for background selection
  const screenMapping: Record<QuizScreen, string> = {
    start: 'nameEntry',
    welcome: 'welcome',
    question: 'question',
    feedback: 'correct',
    completed: 'correct',
  }

  let backgroundImage: string | undefined

  if (hasCustomTheme && state.currentScreen) {
    const mappedScreen = screenMapping[state.currentScreen] || 'default'
    const screenBackground = getBackgroundForScreen(mappedScreen as any)
    if (screenBackground) {
      backgroundImage = `url(${screenBackground})`
    }
  } else if (quizContent.backgroundImage) {
    backgroundImage = isClassicTheme
      ? `url(${quizContent.backgroundImage})`
      : `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${quizContent.backgroundImage})`
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
      <QuizLoader quizContent={quizContent} onComplete={onComplete} />
    </div>
  )
}

export default function StudentQuiz({ quizContent, quizId, onComplete }: StudentQuizProps) {
  return (
    <ThemeProvider
      initialTheme={quizContent.theme}
      customBackgrounds={quizContent.customThemeBackgrounds}
    >
      <QuizProvider quizId={quizId}>
        <QuizContainer quizContent={quizContent} quizId={quizId} onComplete={onComplete} />
      </QuizProvider>
    </ThemeProvider>
  )
}
