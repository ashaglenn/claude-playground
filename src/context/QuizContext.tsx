'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { QuizState, QuizContent, QuizScreen, QuizAnswer, AnswerKey, Question } from '@/lib/types'
import { generateAnswerOrders } from '@/lib/parser'

const STORAGE_KEY_PREFIX = 'quiz-state-'

type Action =
  | { type: 'LOAD_QUIZ'; content: QuizContent }
  | { type: 'ANSWER_CORRECT'; questionId: number }
  | { type: 'ANSWER_INCORRECT'; questionId: number; correctAnswer: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'SHOW_RESULTS' }
  | { type: 'RESET_QUIZ' }
  | { type: 'SET_SCREEN'; screen: QuizScreen }
  | { type: 'HYDRATE'; state: QuizState }

const initialState: QuizState = {
  currentScreen: 'start',
  quizContent: null,
  currentQuestionIndex: 0,
  answers: [],
  lastAnswerCorrect: null,
  lastCorrectAnswer: null,
  answerOrder: {},
}

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'LOAD_QUIZ':
      return {
        ...initialState,
        currentScreen: action.content.welcomeMessage ? 'welcome' : 'question',
        quizContent: action.content,
        answerOrder: generateAnswerOrders(action.content.questions.length),
      }

    case 'ANSWER_CORRECT': {
      const newAnswer: QuizAnswer = {
        questionId: action.questionId,
        correct: true,
      }
      return {
        ...state,
        currentScreen: 'feedback',
        answers: [...state.answers, newAnswer],
        lastAnswerCorrect: true,
        lastCorrectAnswer: null,
      }
    }

    case 'ANSWER_INCORRECT': {
      const newAnswer: QuizAnswer = {
        questionId: action.questionId,
        correct: false,
      }
      return {
        ...state,
        currentScreen: 'feedback',
        answers: [...state.answers, newAnswer],
        lastAnswerCorrect: false,
        lastCorrectAnswer: action.correctAnswer,
      }
    }

    case 'NEXT_QUESTION': {
      const nextIndex = state.currentQuestionIndex + 1
      const totalQuestions = state.quizContent?.questions.length || 0

      if (nextIndex >= totalQuestions) {
        return {
          ...state,
          currentScreen: 'completed',
        }
      }

      return {
        ...state,
        currentScreen: 'question',
        currentQuestionIndex: nextIndex,
        lastAnswerCorrect: null,
        lastCorrectAnswer: null,
      }
    }

    case 'SHOW_RESULTS':
      return {
        ...state,
        currentScreen: 'completed',
      }

    case 'RESET_QUIZ':
      return {
        ...initialState,
        quizContent: state.quizContent,
        currentScreen: state.quizContent?.welcomeMessage ? 'welcome' : 'question',
        answerOrder: state.quizContent
          ? generateAnswerOrders(state.quizContent.questions.length)
          : {},
      }

    case 'SET_SCREEN':
      return {
        ...state,
        currentScreen: action.screen,
      }

    case 'HYDRATE':
      return action.state

    default:
      return state
  }
}

interface QuizContextValue {
  state: QuizState
  dispatch: React.Dispatch<Action>
  getCurrentQuestion: () => Question | undefined
  getScore: () => { correct: number; total: number; percentage: number }
  isLastQuestion: () => boolean
}

const QuizContext = createContext<QuizContextValue | null>(null)

interface QuizProviderProps {
  children: ReactNode
  quizId?: string
}

export function QuizProvider({ children, quizId }: QuizProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const storageKey = quizId ? `${STORAGE_KEY_PREFIX}${quizId}` : null

  useEffect(() => {
    if (!storageKey) return

    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        dispatch({ type: 'HYDRATE', state: parsed })
      } catch {
        // Invalid saved state, start fresh
      }
    }
  }, [storageKey])

  useEffect(() => {
    if (storageKey && state.quizContent) {
      localStorage.setItem(storageKey, JSON.stringify(state))
    }
  }, [state, storageKey])

  const value: QuizContextValue = {
    state,
    dispatch,
    getCurrentQuestion: () => {
      return state.quizContent?.questions[state.currentQuestionIndex]
    },
    getScore: () => {
      const correct = state.answers.filter(a => a.correct).length
      const total = state.quizContent?.questions.length || 0
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
      return { correct, total, percentage }
    },
    isLastQuestion: () => {
      const totalQuestions = state.quizContent?.questions.length || 0
      return state.currentQuestionIndex >= totalQuestions - 1
    },
  }

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider')
  }
  return context
}
