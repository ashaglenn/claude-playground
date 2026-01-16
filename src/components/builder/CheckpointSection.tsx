'use client'

import { CheckpointData, QuestionData } from '@/lib/builder-types'
import QuestionEditor from './QuestionEditor'

interface CheckpointSectionProps {
  checkpointNumber: number
  data: CheckpointData
  onChange: (data: CheckpointData) => void
  onRemove?: () => void
}

export default function CheckpointSection({
  checkpointNumber,
  data,
  onChange,
  onRemove,
}: CheckpointSectionProps) {
  const updateQuestion = (index: number, questionData: QuestionData) => {
    const newQuestions = [...data.questions]
    newQuestions[index] = questionData
    onChange({ ...data, questions: newQuestions })
  }

  const updateLetter = (letter: string) => {
    onChange({ ...data, letter: letter.toUpperCase().slice(0, 1) })
  }

  const updateLetterMessage = (letterMessage: string) => {
    onChange({ ...data, letterMessage })
  }

  return (
    <div className="rounded-xl border-2 border-gray-300 bg-gray-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-800">
            Checkpoint {checkpointNumber}
          </h2>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">
            Unlock Letter:
          </label>
          <input
            type="text"
            value={data.letter}
            onChange={(e) => updateLetter(e.target.value)}
            className="h-12 w-12 rounded-lg border-2 border-gray-300 text-center text-2xl font-bold text-gray-900 uppercase"
            maxLength={1}
            placeholder="?"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-600">
          Letter Unlock Message
        </label>
        <input
          type="text"
          value={data.letterMessage}
          onChange={(e) => updateLetterMessage(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          placeholder="Message shown when students unlock this letter..."
        />
      </div>

      <div className="space-y-3">
        {data.questions.map((question, index) => (
          <QuestionEditor
            key={index}
            questionNumber={(checkpointNumber - 1) * 4 + index + 1}
            data={question}
            onChange={(q) => updateQuestion(index, q)}
          />
        ))}
      </div>
    </div>
  )
}
