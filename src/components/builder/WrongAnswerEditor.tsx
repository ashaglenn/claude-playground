'use client'

import { useState } from 'react'
import { AnswerData } from '@/lib/builder-types'
import { AnswerKey } from '@/lib/types'

interface WrongAnswerEditorProps {
  answerKey: AnswerKey
  data: AnswerData
  isCorrect: boolean
  onChange: (data: AnswerData) => void
}

export default function WrongAnswerEditor({
  answerKey,
  data,
  isCorrect,
  onChange,
}: WrongAnswerEditorProps) {
  const [expanded, setExpanded] = useState(false)

  if (isCorrect) {
    return null // Don't show wrong answer settings for correct answer
  }

  const updateTeaching = (teaching: string) => {
    onChange({ ...data, teaching })
  }

  const updateReflection = (field: string, value: string) => {
    onChange({
      ...data,
      reflection: { ...data.reflection, [field]: value },
    })
  }

  const updateReflectionAnswer = (key: AnswerKey, value: string) => {
    onChange({
      ...data,
      reflection: {
        ...data.reflection,
        answers: { ...data.reflection.answers, [key]: value },
      },
    })
  }

  const updateReflectionWrongMessage = (key: AnswerKey, value: string) => {
    onChange({
      ...data,
      reflection: {
        ...data.reflection,
        wrongMessages: { ...data.reflection.wrongMessages, [key]: value },
      },
    })
  }

  return (
    <div className="mt-2 rounded-lg border border-orange-200 bg-orange-50">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium text-orange-800"
      >
        <span>If student picks {answerKey} (wrong answer settings)</span>
        <span>{expanded ? '▼' : '►'}</span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-orange-200 px-4 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Teaching Text
            </label>
            <textarea
              value={data.teaching}
              onChange={(e) => updateTeaching(e.target.value)}
              placeholder="Explain why this answer is wrong and teach the correct concept..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
              rows={3}
            />
          </div>

          <div className="border-t border-orange-200 pt-4">
            <h4 className="mb-3 text-sm font-medium text-gray-700">Reflection Question</h4>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-gray-600">Question</label>
                <input
                  type="text"
                  value={data.reflection.question}
                  onChange={(e) => updateReflection('question', e.target.value)}
                  placeholder="Follow-up question to check understanding..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['A', 'B', 'C'] as AnswerKey[]).map((key) => (
                  <div key={key}>
                    <label className="mb-1 block text-xs text-gray-600">Answer {key}</label>
                    <input
                      type="text"
                      value={data.reflection.answers[key]}
                      onChange={(e) => updateReflectionAnswer(key, e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-xs text-gray-600">Correct Answer</label>
                <select
                  value={data.reflection.correct}
                  onChange={(e) => updateReflection('correct', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>

              <div className="mt-3 space-y-2">
                <label className="block text-xs text-gray-600">Wrong Answer Messages</label>
                {(['A', 'B', 'C'] as AnswerKey[]).map((key) => {
                  if (key === data.reflection.correct) return null
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-6 text-center text-sm font-medium text-gray-600">{key}:</span>
                      <input
                        type="text"
                        value={data.reflection.wrongMessages[key]}
                        onChange={(e) => updateReflectionWrongMessage(key, e.target.value)}
                        placeholder={`Message if they pick ${key}...`}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
