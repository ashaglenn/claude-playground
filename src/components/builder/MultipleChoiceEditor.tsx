'use client'

import { useState } from 'react'
import { MultipleChoiceQuestionData, LegacyQuestionData, AnswerData } from '@/lib/builder-types'
import { AnswerKey } from '@/lib/types'
import WrongAnswerEditor from './WrongAnswerEditor'
import ImageUpload from './ImageUpload'

type MCQuestionData = MultipleChoiceQuestionData | LegacyQuestionData

interface MultipleChoiceEditorProps {
  questionNumber: number
  data: MCQuestionData
  onChange: (data: MCQuestionData) => void
}

export default function MultipleChoiceEditor({
  questionNumber,
  data,
  onChange,
}: MultipleChoiceEditorProps) {
  const [expanded, setExpanded] = useState(false)

  const updateField = (field: keyof MCQuestionData, value: string) => {
    onChange({ ...data, [field]: value } as MCQuestionData)
  }

  const updateImage = (url: string | undefined) => {
    onChange({ ...data, imageUrl: url })
  }

  const updateAnswerText = (key: AnswerKey, text: string) => {
    onChange({
      ...data,
      answers: {
        ...data.answers,
        [key]: { ...data.answers[key], text },
      },
    })
  }

  const updateAnswer = (key: AnswerKey, answerData: AnswerData) => {
    onChange({
      ...data,
      answers: {
        ...data.answers,
        [key]: answerData,
      },
    })
  }

  const preview = data.question || 'Click to add question...'

  return (
    <div className="rounded-lg border-2 border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
            {questionNumber}
          </span>
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
            Multiple Choice
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

          {/* Question */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Question
            </label>
            <textarea
              value={data.question}
              onChange={(e) => updateField('question', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              rows={2}
              placeholder="Enter your question..."
            />
          </div>

          {/* Image */}
          <ImageUpload
            imageUrl={data.imageUrl}
            onImageChange={updateImage}
            questionId={`q${questionNumber}`}
          />

          {/* Answers */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Answer Options
            </label>
            {(['A', 'B', 'C'] as AnswerKey[]).map((key) => (
              <div key={key}>
                <div className="flex gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 font-medium text-gray-600">
                    {key}
                  </span>
                  <input
                    type="text"
                    value={data.answers[key].text}
                    onChange={(e) => updateAnswerText(key, e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder={`Answer ${key}...`}
                  />
                </div>
                <WrongAnswerEditor
                  answerKey={key}
                  data={data.answers[key]}
                  isCorrect={data.correct === key}
                  onChange={(answerData) => updateAnswer(key, answerData)}
                />
              </div>
            ))}
          </div>

          {/* Correct Answer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Correct Answer
              </label>
              <select
                value={data.correct}
                onChange={(e) => updateField('correct', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Correct Message
              </label>
              <input
                type="text"
                value={data.correctMessage}
                onChange={(e) => updateField('correctMessage', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="Correct! Great job..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
