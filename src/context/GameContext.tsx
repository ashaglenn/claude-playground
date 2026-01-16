'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { GameState, GameContent, AnswerKey, CheckpointLetter, Screen } from '@/lib/types'
import { generateAnswerOrders } from '@/lib/parser'

const STORAGE_KEY = 'escape-room-state'

type Action =
  | { type: 'LOAD_GAME'; content: GameContent }
  | { type: 'GO_TO_QUESTION'; questionId: number }
  | { type: 'ANSWER_CORRECT' }
  | { type: 'ANSWER_WRONG'; answer: AnswerKey }
  | { type: 'CONTINUE_TO_REFLECTION' }
  | { type: 'REFLECTION_CORRECT' }
  | { type: 'REFLECTION_WRONG' }
  | { type: 'GO_TO_HUB' }
  | { type: 'SHOW_LETTER'; letter: CheckpointLetter }
  | { type: 'GO_TO_FINAL_LOCK' }
  | { type: 'LOCK_CLICK'; letter: string }
  | { type: 'LOCK_RESET' }
  | { type: 'ESCAPED' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'HYDRATE'; state: GameState }

const initialState: GameState = {
  currentScreen: 'start',
  gameContent: null,
  currentQuestionId: 1,
  completedQuestions: [],
  unlockedLetters: [],
  currentWrongAnswer: null,
  answerOrder: {},
  lockClickOrder: [],
}

// Get checkpoint number for a question from game content
function getCheckpointForQuestion(questionId: number, gameContent: GameContent | null): number {
  const question = gameContent?.questions.find(q => q.id === questionId)
  return question?.checkpoint || 1
}

// Get all question IDs for a checkpoint from game content
function getQuestionsForCheckpoint(checkpoint: number, gameContent: GameContent | null): number[] {
  if (!gameContent) return []
  return gameContent.questions.filter(q => q.checkpoint === checkpoint).map(q => q.id)
}

function isCheckpointComplete(checkpoint: number, completedQuestions: number[], gameContent: GameContent | null): boolean {
  const questions = getQuestionsForCheckpoint(checkpoint, gameContent)
  return questions.length > 0 && questions.every(q => completedQuestions.includes(q))
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'LOAD_GAME':
      return {
        ...initialState,
        currentScreen: action.content.welcomeMessage ? 'welcome' : 'hub',
        gameContent: action.content,
        answerOrder: generateAnswerOrders(action.content.questions.length),
      }

    case 'GO_TO_QUESTION':
      return {
        ...state,
        currentScreen: 'question',
        currentQuestionId: action.questionId,
        currentWrongAnswer: null,
      }

    case 'ANSWER_CORRECT': {
      const newCompleted = state.completedQuestions.includes(state.currentQuestionId)
        ? state.completedQuestions
        : [...state.completedQuestions, state.currentQuestionId]

      const checkpoint = getCheckpointForQuestion(state.currentQuestionId, state.gameContent)
      const checkpointQuestions = getQuestionsForCheckpoint(checkpoint, state.gameContent)
      const nextInCheckpoint = checkpointQuestions.find(q => !newCompleted.includes(q))

      if (nextInCheckpoint) {
        return {
          ...state,
          completedQuestions: newCompleted,
          currentQuestionId: nextInCheckpoint,
          currentWrongAnswer: null,
        }
      }

      const letter = state.gameContent?.letters[checkpoint - 1]
      if (letter && !state.unlockedLetters.find(l => l.letter === letter.letter)) {
        return {
          ...state,
          currentScreen: 'letter-reveal',
          completedQuestions: newCompleted,
          unlockedLetters: [...state.unlockedLetters, letter],
        }
      }

      return {
        ...state,
        currentScreen: 'hub',
        completedQuestions: newCompleted,
      }
    }

    case 'ANSWER_WRONG':
      return {
        ...state,
        currentScreen: 'teaching',
        currentWrongAnswer: action.answer,
      }

    case 'CONTINUE_TO_REFLECTION':
      return {
        ...state,
        currentScreen: 'reflection',
      }

    case 'REFLECTION_CORRECT':
      return {
        ...state,
        currentScreen: 'question',
        currentWrongAnswer: null,
      }

    case 'REFLECTION_WRONG':
      return state

    case 'GO_TO_HUB':
      return {
        ...state,
        currentScreen: 'hub',
        currentWrongAnswer: null,
      }

    case 'SHOW_LETTER':
      return {
        ...state,
        currentScreen: 'letter-reveal',
      }

    case 'GO_TO_FINAL_LOCK':
      return {
        ...state,
        currentScreen: 'final-lock',
        lockClickOrder: [],
      }

    case 'LOCK_CLICK':
      return {
        ...state,
        lockClickOrder: [...state.lockClickOrder, action.letter],
      }

    case 'LOCK_RESET':
      return {
        ...state,
        lockClickOrder: [],
      }

    case 'ESCAPED':
      return {
        ...state,
        currentScreen: 'escaped',
      }

    case 'RESET_GAME':
      return initialState

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

interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<Action>
  getCurrentQuestion: () => ReturnType<typeof getQuestion>
  isCheckpointComplete: (checkpoint: number) => boolean
  isCheckpointUnlocked: (checkpoint: number) => boolean
  allCheckpointsComplete: () => boolean
}

function getQuestion(state: GameState) {
  return state.gameContent?.questions.find(q => q.id === state.currentQuestionId)
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        dispatch({ type: 'HYDRATE', state: parsed })
      } catch {
        // Invalid saved state, start fresh
      }
    }
  }, [])

  useEffect(() => {
    if (state.gameContent) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state])

  const value: GameContextValue = {
    state,
    dispatch,
    getCurrentQuestion: () => getQuestion(state),
    isCheckpointComplete: (checkpoint: number) =>
      isCheckpointComplete(checkpoint, state.completedQuestions, state.gameContent),
    isCheckpointUnlocked: (checkpoint: number) => {
      if (checkpoint === 1) return true
      return isCheckpointComplete(checkpoint - 1, state.completedQuestions, state.gameContent)
    },
    allCheckpointsComplete: () => {
      const numCheckpoints = state.gameContent?.letters.length || 3
      return Array.from({ length: numCheckpoints }, (_, i) => i + 1)
        .every(cp => isCheckpointComplete(cp, state.completedQuestions, state.gameContent))
    },
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
