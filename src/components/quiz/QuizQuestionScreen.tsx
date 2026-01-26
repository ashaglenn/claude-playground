'use client'

import { useState, useRef, useEffect, MouseEvent } from 'react'
import { useQuiz } from '@/context/QuizContext'
import { useTheme } from '@/context/ThemeContext'
import {
  AnswerKey,
  isMultipleChoiceQuestion,
  isHotspotQuestion,
  isDragDropQuestion,
  isFillBlankQuestion,
  MultipleChoiceQuestion,
  LegacyQuestion,
  HotspotQuestion,
  DragDropQuestion,
  FillBlankQuestion,
  HotspotRegion,
} from '@/lib/types'

export default function QuizQuestionScreen() {
  const { state, dispatch, getCurrentQuestion } = useQuiz()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('question' as any)

  const question = getCurrentQuestion()
  const questionNumber = state.currentQuestionIndex + 1
  const totalQuestions = state.quizContent?.questions.length || 0

  if (!question) return null

  if (isHotspotQuestion(question)) {
    return <HotspotQuizQuestion question={question} questionNumber={questionNumber} totalQuestions={totalQuestions} />
  }

  if (isDragDropQuestion(question)) {
    return <DragDropQuizQuestion question={question} questionNumber={questionNumber} totalQuestions={totalQuestions} />
  }

  if (isFillBlankQuestion(question)) {
    return <FillBlankQuizQuestion question={question} questionNumber={questionNumber} totalQuestions={totalQuestions} />
  }

  if (isMultipleChoiceQuestion(question)) {
    return <MultipleChoiceQuizQuestion question={question} questionNumber={questionNumber} totalQuestions={totalQuestions} />
  }

  return null
}

// Progress indicator component
function ProgressIndicator({ current, total }: { current: number; total: number }) {
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('question' as any)

  return (
    <div className={`text-sm mb-4 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`} style={{ color: 'var(--theme-text-muted)' }}>
      Question {current} of {total}
    </div>
  )
}

// Multiple Choice Quiz Question
function MultipleChoiceQuizQuestion({
  question,
  questionNumber,
  totalQuestions,
}: {
  question: MultipleChoiceQuestion | LegacyQuestion
  questionNumber: number
  totalQuestions: number
}) {
  const { state, dispatch } = useQuiz()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('question' as any)

  const answerOrder = state.answerOrder[question.id] || ['A', 'B', 'C']

  const handleAnswer = (originalKey: AnswerKey) => {
    if (originalKey === question.correct) {
      dispatch({ type: 'ANSWER_CORRECT', questionId: question.id })
    } else {
      const correctAnswer = question.answers[question.correct].text
      dispatch({ type: 'ANSWER_INCORRECT', questionId: question.id, correctAnswer })
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-2xl">
        <ProgressIndicator current={questionNumber} total={totalQuestions} />

        <h2
          className={`text-xl font-semibold mb-4 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
          style={{ fontFamily: 'var(--theme-font-heading)' }}
        >
          {question.title}
        </h2>
        <p className={`text-xl mb-6 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}>{question.question}</p>

        {question.imageUrl && (
          <img
            src={question.imageUrl}
            alt="Question"
            className="max-h-64 max-w-full rounded-lg mb-6"
            style={{ borderColor: 'var(--theme-border)', borderWidth: '1px' }}
          />
        )}

        <div className="flex flex-col gap-3">
          {answerOrder.map((originalKey, index) => {
            const answer = question.answers[originalKey]
            const displayLetter = ['A', 'B', 'C'][index]

            return (
              <button
                key={originalKey}
                onClick={() => handleAnswer(originalKey)}
                className="cursor-pointer rounded-lg border-2 px-6 py-4 text-left transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--theme-card-background)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
              >
                <span className="font-medium" style={{ color: 'var(--theme-accent)' }}>
                  {displayLetter}.
                </span>{' '}
                {answer.text}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Hotspot Quiz Question
function HotspotQuizQuestion({
  question,
  questionNumber,
  totalQuestions,
}: {
  question: HotspotQuestion
  questionNumber: number
  totalQuestions: number
}) {
  const { dispatch } = useQuiz()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('question' as any)

  const containerRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageLoaded(true)
      const container = containerRef.current
      if (container) {
        const maxWidth = Math.min(img.naturalWidth, container.clientWidth, 800)
        const ratio = maxWidth / img.naturalWidth
        const displayHeight = img.naturalHeight * ratio
        setImageSize({ width: maxWidth, height: displayHeight })
      }
    }
    img.src = question.imageUrl
  }, [question.imageUrl])

  const isPointInRegion = (x: number, y: number, region: HotspotRegion): boolean => {
    const { type, coords } = region

    if (type === 'rectangle') {
      const [rx, ry, rw, rh] = coords
      return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh
    }

    if (type === 'circle') {
      const [cx, cy, r] = coords
      const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2))
      return dist <= r
    }

    if (type === 'polygon') {
      const points: { x: number; y: number }[] = []
      for (let i = 0; i < coords.length; i += 2) {
        points.push({ x: coords[i], y: coords[i + 1] })
      }

      let inside = false
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x, yi = points[i].y
        const xj = points[j].x, yj = points[j].y

        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
          inside = !inside
        }
      }
      return inside
    }

    return false
  }

  const handleImageClick = (e: MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const isCorrect = isPointInRegion(x, y, question.hotspotRegion)

    if (isCorrect) {
      dispatch({ type: 'ANSWER_CORRECT', questionId: question.id })
    } else {
      dispatch({ type: 'ANSWER_INCORRECT', questionId: question.id, correctAnswer: 'the highlighted area' })
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-4xl text-center">
        <ProgressIndicator current={questionNumber} total={totalQuestions} />

        <h2
          className={`text-xl font-semibold mb-4 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
          style={{ fontFamily: 'var(--theme-font-heading)' }}
        >
          {question.title}
        </h2>

        <p className={`text-xl mb-6 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}>
          {question.question}
        </p>

        <div ref={containerRef} className="relative w-full mb-4 flex justify-center">
          <img
            src={question.imageUrl}
            alt="Click to answer"
            className="rounded-lg object-contain cursor-pointer"
            style={{
              borderColor: 'var(--theme-border)',
              borderWidth: '1px',
              width: imageSize.width || 'auto',
              height: imageSize.height || 'auto',
              maxHeight: '500px',
            }}
            onClick={handleImageClick}
          />
        </div>

        <p
          className={`text-sm ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
          style={{ color: 'var(--theme-text-muted)' }}
        >
          Click on the image to select your answer
        </p>
      </div>
    </div>
  )
}

// Drag and Drop Quiz Question
function DragDropQuizQuestion({
  question,
  questionNumber,
  totalQuestions,
}: {
  question: DragDropQuestion
  questionNumber: number
  totalQuestions: number
}) {
  const { dispatch } = useQuiz()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('question' as any)

  const [placedWords, setPlacedWords] = useState<(string | null)[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])

  const blankCount = (question.sentence.match(/\[BLANK\]/g) || []).length

  useEffect(() => {
    setPlacedWords(Array(blankCount).fill(null))
    const allWords = [...question.correctWords, ...question.distractorWords]
    setAvailableWords(allWords.sort(() => Math.random() - 0.5))
  }, [question, blankCount])

  const handleWordClick = (word: string) => {
    const firstEmptyIndex = placedWords.findIndex(w => w === null)
    if (firstEmptyIndex !== -1) {
      const newPlaced = [...placedWords]
      newPlaced[firstEmptyIndex] = word
      setPlacedWords(newPlaced)
      setAvailableWords(availableWords.filter(w => w !== word))
    }
  }

  const handleBlankClick = (index: number) => {
    const word = placedWords[index]
    if (word) {
      const newPlaced = [...placedWords]
      newPlaced[index] = null
      setPlacedWords(newPlaced)
      setAvailableWords([...availableWords, word])
    }
  }

  const handleSubmit = () => {
    const isCorrect = placedWords.every((word, index) => word === question.correctWords[index])

    if (isCorrect) {
      dispatch({ type: 'ANSWER_CORRECT', questionId: question.id })
    } else {
      const correctAnswer = question.correctWords.join(', ')
      dispatch({ type: 'ANSWER_INCORRECT', questionId: question.id, correctAnswer })
    }
  }

  const renderSentence = () => {
    const parts = question.sentence.split('[BLANK]')
    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {index < parts.length - 1 && (
          <button
            onClick={() => handleBlankClick(index)}
            className="cursor-pointer inline-block mx-1 px-3 py-1 rounded border-2 border-dashed min-w-[80px]"
            style={{
              backgroundColor: placedWords[index] ? 'var(--theme-primary)' : 'var(--theme-card-background)',
              borderColor: 'var(--theme-border)',
              color: placedWords[index] ? 'var(--theme-primary-text)' : 'var(--theme-text-muted)',
            }}
          >
            {placedWords[index] || '___'}
          </button>
        )}
      </span>
    ))
  }

  const allFilled = placedWords.every(w => w !== null)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-2xl">
        <ProgressIndicator current={questionNumber} total={totalQuestions} />

        <h2
          className={`text-xl font-semibold mb-4 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
          style={{ fontFamily: 'var(--theme-font-heading)' }}
        >
          {question.title}
        </h2>
        <p className={`text-xl mb-6 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}>{question.question}</p>

        <div
          className="rounded-lg p-6 mb-6 text-lg leading-relaxed"
          style={{ backgroundColor: 'var(--theme-card-background)' }}
        >
          {renderSentence()}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {availableWords.map((word, index) => (
            <button
              key={`${word}-${index}`}
              onClick={() => handleWordClick(word)}
              className="cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-80"
              style={{
                backgroundColor: 'var(--theme-accent)',
                color: 'var(--theme-primary-text)',
              }}
            >
              {word}
            </button>
          ))}
        </div>

        {allFilled && (
          <button
            onClick={handleSubmit}
            className="cursor-pointer w-full rounded-lg px-8 py-3 text-lg font-medium transition-colors"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-primary-text)',
            }}
          >
            Submit Answer
          </button>
        )}
      </div>
    </div>
  )
}

// Fill in the Blank Quiz Question
function FillBlankQuizQuestion({
  question,
  questionNumber,
  totalQuestions,
}: {
  question: FillBlankQuestion
  questionNumber: number
  totalQuestions: number
}) {
  const { dispatch } = useQuiz()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('question' as any)

  const [answer, setAnswer] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const isCorrect = answer.trim().toLowerCase() === question.correctAnswer.toLowerCase()

    if (isCorrect) {
      dispatch({ type: 'ANSWER_CORRECT', questionId: question.id })
    } else {
      dispatch({ type: 'ANSWER_INCORRECT', questionId: question.id, correctAnswer: question.correctAnswer })
    }
  }

  const renderSentence = () => {
    const parts = question.sentence.split('[BLANK]')
    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {index < parts.length - 1 && (
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="inline-block mx-1 px-3 py-1 rounded border-2 w-32 text-center"
            style={{
              backgroundColor: 'var(--theme-card-background)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text)',
            }}
            placeholder="type here"
            autoFocus
          />
        )}
      </span>
    ))
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-2xl">
        <ProgressIndicator current={questionNumber} total={totalQuestions} />

        <h2
          className={`text-xl font-semibold mb-4 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
          style={{ fontFamily: 'var(--theme-font-heading)' }}
        >
          {question.title}
        </h2>
        <p className={`text-xl mb-6 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}>{question.question}</p>

        <form onSubmit={handleSubmit}>
          <div
            className="rounded-lg p-6 mb-6 text-lg leading-relaxed"
            style={{ backgroundColor: 'var(--theme-card-background)' }}
          >
            {renderSentence()}
          </div>

          <button
            type="submit"
            disabled={!answer.trim()}
            className="cursor-pointer w-full rounded-lg px-8 py-3 text-lg font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-primary-text)',
            }}
          >
            Submit Answer
          </button>
        </form>
      </div>
    </div>
  )
}
