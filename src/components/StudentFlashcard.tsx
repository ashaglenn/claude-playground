'use client'

import { useEffect } from 'react'
import { FlashcardProvider, useFlashcard } from '@/context/FlashcardContext'
import type { FlashcardContent } from '@/lib/types'

interface StudentFlashcardProps {
  content: FlashcardContent
  title?: string
}

function FlashcardStudyScreen() {
  const { state, dispatch, getCurrentCard, getProgress } = useFlashcard()
  const currentCard = getCurrentCard()
  const { current, total } = getProgress()

  if (!currentCard) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center">
          <p className="text-gray-600">No flashcards available</p>
        </div>
      </div>
    )
  }

  const handleFlip = () => {
    dispatch({ type: 'FLIP_CARD' })
  }

  const handlePrev = () => {
    dispatch({ type: 'PREV_CARD' })
  }

  const handleNext = () => {
    dispatch({ type: 'NEXT_CARD' })
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleFlip()
    } else if (e.key === 'ArrowLeft') {
      handlePrev()
    } else if (e.key === 'ArrowRight') {
      handleNext()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-4">
      {/* Title */}
      {state.flashcardContent?.title && (
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          {state.flashcardContent.title}
        </h1>
      )}

      {/* Card Counter - Top */}
      <div className="text-white/90 text-lg font-medium mb-4">
        Card {current} of {total}
      </div>

      {/* Flashcard */}
      <div
        className="flashcard-container w-full max-w-3xl cursor-pointer"
        style={{ height: currentCard.frontImageUrl || currentCard.backImageUrl ? '450px' : '400px' }}
        onClick={handleFlip}
      >
        <div className={`flashcard ${state.isFlipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="flashcard-face glass-card">
            {currentCard.frontImageUrl ? (
              <div className="flex items-center gap-6 w-full h-full p-6">
                <div className="flex-1 text-left">
                  <div className="text-xs uppercase tracking-wider text-gray-400 mb-4">
                    Question
                  </div>
                  <p className="text-xl font-semibold text-gray-800 leading-relaxed">
                    {currentCard.front}
                  </p>
                  <p className="text-sm text-gray-400 mt-6">
                    Click to flip
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <img
                    src={currentCard.frontImageUrl}
                    alt="Card front"
                    className="max-h-80 max-w-64 rounded-lg object-contain shadow-md"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-4">
                  Question
                </div>
                <p className="text-2xl font-semibold text-gray-800 leading-relaxed">
                  {currentCard.front}
                </p>
                <p className="text-sm text-gray-400 mt-8">
                  Click to flip
                </p>
              </div>
            )}
          </div>

          {/* Back */}
          <div className="flashcard-face flashcard-back glass-card bg-gradient-to-br from-indigo-50 to-purple-50">
            {currentCard.backImageUrl ? (
              <div className="flex items-center gap-6 w-full h-full p-6">
                <div className="flex-1 text-left">
                  <div className="text-xs uppercase tracking-wider text-indigo-400 mb-4">
                    Answer
                  </div>
                  <p className="text-xl font-semibold text-gray-800 leading-relaxed">
                    {currentCard.back}
                  </p>
                  <p className="text-sm text-gray-400 mt-6">
                    Click to flip back
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <img
                    src={currentCard.backImageUrl}
                    alt="Card back"
                    className="max-h-80 max-w-64 rounded-lg object-contain shadow-md"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-xs uppercase tracking-wider text-indigo-400 mb-4">
                  Answer
                </div>
                <p className="text-2xl font-semibold text-gray-800 leading-relaxed">
                  {currentCard.back}
                </p>
                <p className="text-sm text-gray-400 mt-8">
                  Click to flip back
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handlePrev()
          }}
          disabled={state.currentCardIndex === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            handleNext()
          }}
          className="btn-primary flex items-center gap-2"
        >
          {current === total ? 'Finish' : 'Next'}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Card Progress Dots */}
      <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-lg">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation()
              dispatch({ type: 'GO_TO_CARD', index: i })
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              i === state.currentCardIndex
                ? 'bg-white scale-125'
                : state.viewedCards.includes(i)
                ? 'bg-white/60'
                : 'bg-white/30'
            }`}
            aria-label={`Go to card ${i + 1}`}
          />
        ))}
      </div>

      {/* Keyboard Hint */}
      <p className="text-white/60 text-sm mt-6">
        Use arrow keys to navigate, space to flip
      </p>
    </div>
  )
}

function FlashcardCompletedScreen() {
  const { state, dispatch, getProgress } = useFlashcard()
  const { total } = getProgress()

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Great job!
        </h2>

        <p className="text-gray-600 mb-8">
          You&apos;ve reviewed all {total} flashcards.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="btn-primary"
          >
            Study Again
          </button>
          <button
            onClick={() => dispatch({ type: 'GO_TO_CARD', index: 0 })}
            className="btn-secondary"
          >
            Review Cards
          </button>
        </div>
      </div>
    </div>
  )
}

function FlashcardMain({ content, title }: StudentFlashcardProps) {
  const { state, dispatch } = useFlashcard()

  useEffect(() => {
    const contentWithTitle = {
      ...content,
      title: title || content.title,
    }
    dispatch({ type: 'LOAD_FLASHCARDS', content: contentWithTitle })
  }, [content, title, dispatch])

  if (state.currentScreen === 'completed') {
    return <FlashcardCompletedScreen />
  }

  return <FlashcardStudyScreen />
}

export default function StudentFlashcard({ content, title }: StudentFlashcardProps) {
  return (
    <FlashcardProvider>
      <FlashcardMain content={content} title={title} />
    </FlashcardProvider>
  )
}
