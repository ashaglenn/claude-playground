'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { FlashcardState, FlashcardContent, FlashcardScreen, Flashcard } from '@/lib/types'

type Action =
  | { type: 'LOAD_FLASHCARDS'; content: FlashcardContent }
  | { type: 'NEXT_CARD' }
  | { type: 'PREV_CARD' }
  | { type: 'GO_TO_CARD'; index: number }
  | { type: 'FLIP_CARD' }
  | { type: 'START_STUDYING' }
  | { type: 'RESET' }
  | { type: 'SET_SCREEN'; screen: FlashcardScreen }

const initialState: FlashcardState = {
  currentScreen: 'start',
  flashcardContent: null,
  currentCardIndex: 0,
  isFlipped: false,
  viewedCards: [],
}

function reducer(state: FlashcardState, action: Action): FlashcardState {
  switch (action.type) {
    case 'LOAD_FLASHCARDS':
      return {
        ...initialState,
        currentScreen: 'study',
        flashcardContent: action.content,
      }

    case 'NEXT_CARD': {
      const totalCards = state.flashcardContent?.cards.length || 0
      const nextIndex = state.currentCardIndex + 1

      if (nextIndex >= totalCards) {
        return {
          ...state,
          currentScreen: 'completed',
          viewedCards: [...new Set([...state.viewedCards, state.currentCardIndex])],
        }
      }

      return {
        ...state,
        currentCardIndex: nextIndex,
        isFlipped: false,
        viewedCards: [...new Set([...state.viewedCards, state.currentCardIndex])],
      }
    }

    case 'PREV_CARD': {
      const prevIndex = Math.max(0, state.currentCardIndex - 1)
      return {
        ...state,
        currentCardIndex: prevIndex,
        isFlipped: false,
      }
    }

    case 'GO_TO_CARD':
      return {
        ...state,
        currentCardIndex: action.index,
        isFlipped: false,
        currentScreen: 'study',
      }

    case 'FLIP_CARD':
      return {
        ...state,
        isFlipped: !state.isFlipped,
      }

    case 'START_STUDYING':
      return {
        ...state,
        currentScreen: 'study',
        currentCardIndex: 0,
        isFlipped: false,
        viewedCards: [],
      }

    case 'RESET':
      return {
        ...initialState,
        flashcardContent: state.flashcardContent,
        currentScreen: 'study',
      }

    case 'SET_SCREEN':
      return {
        ...state,
        currentScreen: action.screen,
      }

    default:
      return state
  }
}

interface FlashcardContextValue {
  state: FlashcardState
  dispatch: React.Dispatch<Action>
  getCurrentCard: () => Flashcard | undefined
  getProgress: () => { current: number; total: number }
}

const FlashcardContext = createContext<FlashcardContextValue | null>(null)

interface FlashcardProviderProps {
  children: ReactNode
}

export function FlashcardProvider({ children }: FlashcardProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const value: FlashcardContextValue = {
    state,
    dispatch,
    getCurrentCard: () => {
      return state.flashcardContent?.cards[state.currentCardIndex]
    },
    getProgress: () => {
      const total = state.flashcardContent?.cards.length || 0
      return { current: state.currentCardIndex + 1, total }
    },
  }

  return <FlashcardContext.Provider value={value}>{children}</FlashcardContext.Provider>
}

export function useFlashcard() {
  const context = useContext(FlashcardContext)
  if (!context) {
    throw new Error('useFlashcard must be used within a FlashcardProvider')
  }
  return context
}
