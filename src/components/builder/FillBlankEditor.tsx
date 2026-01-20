'use client'

import { useState } from 'react'
import { FillBlankQuestionData } from '@/lib/builder-types'
import ImageUpload from './ImageUpload'

interface FillBlankEditorProps {
  questionNumber: number
  data: FillBlankQuestionData
  onChange: (data: FillBlankQuestionData) => void
}

export default function FillBlankEditor({
  questionNumber,
  data,
  onChange,
}: FillBlankEditorProps) {
  const [expanded, setExpanded] = useState(false)

  const updateField = <K extends keyof FillBlankQuestionData>(field: K, value: FillBlankQuestionData[K]) => {
    onChange({ ...data, [field]: value })
  }

  const preview = data.question || 'Click to add fill-in-the-blank question...'

  // Parse sentence to show preview with blank
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
              <span className="inline-block mx-1 px-3 py-1 bg-blue-100 border-b-2 border-blue-400 rounded text-blue-600 font-medium min-w-[60px] text-center">
                {data.correctAnswer || '___'}
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
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
            {questionNumber}
          </span>
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
            Fill Blank
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
              placeholder="Instructions for the student (e.g., 'Fill in the missing word:')"
            />
          </div>

          {/* Optional Image */}
          <ImageUpload
            imageUrl={data.imageUrl}
            onImageChange={(url) => updateField('imageUrl', url)}
            questionId={`q${questionNumber}`}
          />

          {/* Sentence with blank */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Sentence (use [BLANK] for the blank)
            </label>
            <textarea
              value={data.sentence}
              onChange={(e) => updateField('sentence', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              rows={2}
              placeholder="e.g., The capital of France is [BLANK]."
            />
            <p className="mt-1 text-xs text-gray-500">
              Use [BLANK] to indicate where the student should type their answer.
            </p>
          </div>

          {/* Correct Answer */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Correct Answer
            </label>
            <input
              type="text"
              value={data.correctAnswer}
              onChange={(e) => updateField('correctAnswer', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              placeholder="e.g., Paris"
            />
            <p className="mt-1 text-xs text-gray-500">
              Answer comparison is case-insensitive.
            </p>
          </div>

          {/* Preview */}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-sm font-medium text-gray-700">Preview:</p>
            <p className="text-gray-900">{renderSentencePreview()}</p>
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
