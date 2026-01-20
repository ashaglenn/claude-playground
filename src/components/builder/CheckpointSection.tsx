'use client'

import { CheckpointData, QuestionData, createEmptyMultipleChoiceQuestion } from '@/lib/builder-types'
import QuestionEditor from './QuestionEditor'

interface CheckpointSectionProps {
  checkpointNumber: number
  questionStartNumber: number  // Global question number for first question in this checkpoint
  data: CheckpointData
  onChange: (data: CheckpointData) => void
  onRemove?: () => void
}

export default function CheckpointSection({
  checkpointNumber,
  questionStartNumber,
  data,
  onChange,
  onRemove,
}: CheckpointSectionProps) {
  const updateQuestion = (index: number, questionData: QuestionData) => {
    const newQuestions = [...data.questions]
    newQuestions[index] = questionData
    onChange({ ...data, questions: newQuestions })
  }

  const addQuestion = () => {
    const newQuestionNumber = data.questions.length + 1
    const newQuestion = createEmptyMultipleChoiceQuestion(checkpointNumber, newQuestionNumber)
    onChange({ ...data, questions: [...data.questions, newQuestion] })
  }

  const removeQuestion = (index: number) => {
    if (data.questions.length <= 1) return // Keep at least one question
    const newQuestions = data.questions.filter((_, i) => i !== index)
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
          <div key={index} className="relative">
            <QuestionEditor
              questionNumber={questionStartNumber + index}
              checkpointNumber={checkpointNumber}
              data={question}
              onChange={(q) => updateQuestion(index, q)}
            />
            {data.questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 shadow-sm"
                title="Remove question"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          + Add Question
        </button>
      </div>
    </div>
  )
}
