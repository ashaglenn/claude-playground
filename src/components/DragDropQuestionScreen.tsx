'use client'

import { useState, useEffect, DragEvent } from 'react'
import { useGame } from '@/context/GameContext'
import { useTheme } from '@/context/ThemeContext'
import { DragDropQuestion } from '@/lib/types'

interface DragDropQuestionScreenProps {
  question: DragDropQuestion
}

export default function DragDropQuestionScreen({ question }: DragDropQuestionScreenProps) {
  const { dispatch } = useGame()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('question')

  // Count blanks in sentence
  const blankCount = (question.sentence.match(/\[BLANK\]/g) || []).length

  // State: filled blanks (null = empty), available words (shuffled), and dragging state
  const [filledBlanks, setFilledBlanks] = useState<(string | null)[]>(Array(blankCount).fill(null))
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [draggedWord, setDraggedWord] = useState<string | null>(null)
  const [showCorrectMessage, setShowCorrectMessage] = useState(false)
  const [showIncorrectMessage, setShowIncorrectMessage] = useState(false)

  // Shuffle and set available words on mount
  useEffect(() => {
    const allWords = [...question.correctWords, ...question.distractorWords]
    const shuffled = allWords.sort(() => Math.random() - 0.5)
    setAvailableWords(shuffled)
  }, [question.correctWords, question.distractorWords])

  const handleBackToHub = () => {
    dispatch({ type: 'GO_TO_HUB' })
  }

  const handleDragStart = (e: DragEvent<HTMLElement>, word: string) => {
    setDraggedWord(word)
    e.dataTransfer.setData('text/plain', word)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropOnBlank = (e: DragEvent<HTMLElement>, blankIndex: number) => {
    e.preventDefault()
    const word = e.dataTransfer.getData('text/plain')
    if (!word) return

    // If blank already has a word, return it to available
    const currentWord = filledBlanks[blankIndex]
    if (currentWord) {
      setAvailableWords(prev => [...prev, currentWord])
    }

    // Place word in blank
    const newFilled = [...filledBlanks]
    newFilled[blankIndex] = word
    setFilledBlanks(newFilled)

    // Remove word from available
    setAvailableWords(prev => prev.filter((w, i) => {
      // Only remove first occurrence
      const firstIndex = prev.indexOf(word)
      return i !== firstIndex
    }))

    setDraggedWord(null)
    setShowIncorrectMessage(false)
  }

  const handleRemoveFromBlank = (blankIndex: number) => {
    const word = filledBlanks[blankIndex]
    if (word) {
      setAvailableWords(prev => [...prev, word])
      const newFilled = [...filledBlanks]
      newFilled[blankIndex] = null
      setFilledBlanks(newFilled)
    }
  }

  const handleSubmit = () => {
    // Check if all blanks are filled
    if (filledBlanks.some(b => b === null)) return

    // Check if answers are correct (case-insensitive)
    const isCorrect = filledBlanks.every((word, index) =>
      word?.trim().toLowerCase() === question.correctWords[index]?.trim().toLowerCase()
    )

    if (isCorrect) {
      setShowIncorrectMessage(false)
      setShowCorrectMessage(true)
    } else {
      setShowIncorrectMessage(true)
      // Reset blanks - return words to available
      const wordsToReturn = filledBlanks.filter(w => w !== null) as string[]
      setAvailableWords(prev => [...prev, ...wordsToReturn])
      setFilledBlanks(Array(blankCount).fill(null))
    }
  }

  const handleContinue = () => {
    setShowCorrectMessage(false)
    dispatch({ type: 'ANSWER_CORRECT' })
  }

  // Render sentence with drop zones
  const renderSentenceWithDropZones = () => {
    const parts = question.sentence.split('[BLANK]')

    return (
      <span className="leading-loose">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <span
                className={`inline-block mx-1 min-w-[100px] min-h-[36px] align-middle rounded border-2 border-dashed transition-colors ${
                  filledBlanks[index]
                    ? 'bg-opacity-20 border-solid cursor-pointer'
                    : 'border-gray-400'
                }`}
                style={{
                  backgroundColor: filledBlanks[index] ? 'var(--theme-primary)' : 'transparent',
                  borderColor: filledBlanks[index] ? 'var(--theme-primary)' : undefined,
                }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnBlank(e, index)}
                onClick={() => filledBlanks[index] && handleRemoveFromBlank(index)}
                title={filledBlanks[index] ? 'Click to remove' : 'Drop word here'}
              >
                {filledBlanks[index] ? (
                  <span
                    className="inline-block px-3 py-1 rounded font-medium"
                    style={{
                      backgroundColor: 'var(--theme-primary)',
                      color: 'var(--theme-primary-text)',
                    }}
                  >
                    {filledBlanks[index]}
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 text-gray-400">
                    drop here
                  </span>
                )}
              </span>
            )}
          </span>
        ))}
      </span>
    )
  }

  if (showCorrectMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <div
          className="rounded-lg p-8 text-center max-w-2xl"
          style={{
            backgroundColor: 'var(--theme-card-background)',
          }}
        >
          <p className="text-xl font-medium mb-6">{question.correctMessage}</p>
          <button
            onClick={handleContinue}
            className="cursor-pointer rounded-lg px-8 py-3 text-lg font-medium transition-colors"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-primary-text)',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  const allBlanksFilled = filledBlanks.every(b => b !== null)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <button
        onClick={handleBackToHub}
        className={`cursor-pointer absolute top-4 left-4 text-sm hover:opacity-70 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
        style={{ color: 'var(--theme-text-muted)' }}
      >
        ← Back to Hub
      </button>

      <div className="w-full max-w-2xl">
        <h2
          className={`text-xl font-semibold mb-4 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
          style={{ fontFamily: 'var(--theme-font-heading)' }}
        >
          {question.title}
        </h2>

        <p className={`text-xl mb-6 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}>
          {question.question}
        </p>

        {question.imageUrl && (
          <img
            src={question.imageUrl}
            alt="Question"
            className="max-h-64 max-w-full rounded-lg mb-6"
            style={{ borderColor: 'var(--theme-border)', borderWidth: '1px' }}
          />
        )}

        {/* Sentence with drop zones */}
        <div
          className="rounded-lg p-6 mb-6 text-lg"
          style={{
            backgroundColor: 'var(--theme-card-background)',
            borderColor: 'var(--theme-border)',
            borderWidth: '1px',
          }}
        >
          {renderSentenceWithDropZones()}
        </div>

        {/* Available words */}
        <div className="mb-6">
          <p className={`text-sm mb-2 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`} style={{ color: 'var(--theme-text-muted)' }}>
            Drag words to fill the blanks:
          </p>
          <div className="flex flex-wrap gap-2">
            {availableWords.map((word, index) => (
              <div
                key={`${word}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, word)}
                className={`px-4 py-2 rounded-lg cursor-grab active:cursor-grabbing transition-all ${
                  draggedWord === word ? 'opacity-50' : ''
                }`}
                style={{
                  backgroundColor: 'var(--theme-card-background)',
                  borderColor: 'var(--theme-border)',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                }}
              >
                {word}
              </div>
            ))}
            {availableWords.length === 0 && (
              <p className="text-sm text-gray-400 italic">All words have been placed</p>
            )}
          </div>
        </div>

        {showIncorrectMessage && (
          <div
            className="mb-4 p-4 rounded-lg text-center"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--theme-text)',
            }}
          >
            {question.incorrectMessage || 'Not quite. Try again!'}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!allBlanksFilled}
          className="cursor-pointer w-full rounded-lg px-6 py-3 text-lg font-medium transition-colors disabled:opacity-50"
          style={{
            backgroundColor: 'var(--theme-primary)',
            color: 'var(--theme-primary-text)',
          }}
        >
          Check Answer
        </button>
      </div>
    </div>
  )
}
