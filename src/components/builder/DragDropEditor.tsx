'use client'

import { useState } from 'react'
import { DragDropQuestionData } from '@/lib/builder-types'
import ImageUpload from './ImageUpload'

interface DragDropEditorProps {
  questionNumber: number
  data: DragDropQuestionData
  onChange: (data: DragDropQuestionData) => void
}

export default function DragDropEditor({
  questionNumber,
  data,
  onChange,
}: DragDropEditorProps) {
  const [expanded, setExpanded] = useState(false)
  const [newCorrectWord, setNewCorrectWord] = useState('')
  const [newDistractorWord, setNewDistractorWord] = useState('')

  const updateField = <K extends keyof DragDropQuestionData>(field: K, value: DragDropQuestionData[K]) => {
    onChange({ ...data, [field]: value })
  }

  const addCorrectWord = () => {
    if (newCorrectWord.trim()) {
      onChange({ ...data, correctWords: [...data.correctWords, newCorrectWord.trim()] })
      setNewCorrectWord('')
    }
  }

  const removeCorrectWord = (index: number) => {
    onChange({ ...data, correctWords: data.correctWords.filter((_, i) => i !== index) })
  }

  const addDistractorWord = () => {
    if (newDistractorWord.trim()) {
      onChange({ ...data, distractorWords: [...data.distractorWords, newDistractorWord.trim()] })
      setNewDistractorWord('')
    }
  }

  const removeDistractorWord = (index: number) => {
    onChange({ ...data, distractorWords: data.distractorWords.filter((_, i) => i !== index) })
  }

  const preview = data.question || 'Click to add drag-and-drop question...'

  // Count blanks in sentence
  const blankCount = (data.sentence.match(/\[BLANK\]/g) || []).length

  // Render sentence preview with blank slots
  const renderSentencePreview = () => {
    if (!data.sentence) return <span className="text-gray-400 italic">No sentence entered</span>

    const parts = data.sentence.split('[BLANK]')
    if (parts.length === 1) {
      return <span>{data.sentence}</span>
    }

    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="inline-block mx-1 px-3 py-1 bg-green-100 border-2 border-dashed border-green-400 rounded min-w-[80px] text-center text-green-700">
                {data.correctWords[index] || `blank ${index + 1}`}
              </span>
            )}
          </span>
        ))}
      </>
    )
  }

  return (
    <div className="rounded-lg border-2 border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
            {questionNumber}
          </span>
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
            Drag & Drop
          </span>
          <span className="text-gray-700">
            {preview.length > 50 ? preview.substring(0, 50) + '...' : preview}
          </span>
        </div>
        <span className="text-gray-400">{expanded ? '▼' : '►'}</span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t px-4 py-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title (shown at top of question)
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              placeholder="e.g., Checkpoint 1 - Question 1"
            />
          </div>

          {/* Question/Instructions */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Instructions
            </label>
            <textarea
              value={data.question}
              onChange={(e) => updateField('question', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              rows={2}
              placeholder="Instructions for the student (e.g., 'Drag the words into the correct blanks:')"
            />
          </div>

          {/* Optional Image */}
          <ImageUpload
            imageUrl={data.imageUrl}
            onImageChange={(url) => updateField('imageUrl', url)}
            questionId={`q${questionNumber}`}
          />

          {/* Sentence with blanks */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Sentence (use [BLANK] for each blank)
            </label>
            <textarea
              value={data.sentence}
              onChange={(e) => updateField('sentence', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              rows={2}
              placeholder="e.g., The [BLANK] is the center of our [BLANK] system."
            />
            <p className="mt-1 text-xs text-gray-500">
              Use [BLANK] for each position where students should drag a word. Found {blankCount} blank(s).
            </p>
          </div>

          {/* Correct Words */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Correct Words (in order, one per blank)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {data.correctWords.map((word, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  <span className="text-green-600 font-medium">{index + 1}.</span>
                  {word}
                  <button
                    type="button"
                    onClick={() => removeCorrectWord(index)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCorrectWord}
                onChange={(e) => setNewCorrectWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCorrectWord())}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="Add a correct word..."
              />
              <button
                type="button"
                onClick={addCorrectWord}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>
            {blankCount !== data.correctWords.length && (
              <p className="mt-1 text-xs text-amber-600">
                Warning: You have {blankCount} blank(s) but {data.correctWords.length} correct word(s).
              </p>
            )}
          </div>

          {/* Distractor Words */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Distractor Words (extra words that don&apos;t belong)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {data.distractorWords.map((word, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                >
                  {word}
                  <button
                    type="button"
                    onClick={() => removeDistractorWord(index)}
                    className="ml-1 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDistractorWord}
                onChange={(e) => setNewDistractorWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDistractorWord())}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="Add a distractor word..."
              />
              <button
                type="button"
                onClick={addDistractorWord}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-sm font-medium text-gray-700">Preview:</p>
            <p className="text-gray-900 leading-relaxed">{renderSentencePreview()}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Available words (shuffled for students):</span>
              {[...data.correctWords, ...data.distractorWords].map((word, i) => (
                <span key={i} className="px-2 py-1 bg-white border border-gray-300 rounded text-sm">
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Correct Message
              </label>
              <input
                type="text"
                value={data.correctMessage}
                onChange={(e) => updateField('correctMessage', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="Great job! That's correct!"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Incorrect Message (Try Again)
              </label>
              <input
                type="text"
                value={data.incorrectMessage}
                onChange={(e) => updateField('incorrectMessage', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="Not quite. Try again!"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
