'use client'

import { QuestionType } from '@/lib/types'

interface QuestionTypeSelectorProps {
  currentType: QuestionType | undefined
  onChange: (type: QuestionType) => void
}

const questionTypes: { type: QuestionType; label: string; description: string; color: string }[] = [
  {
    type: 'multiple-choice',
    label: 'Multiple Choice',
    description: 'Traditional A/B/C answers with teaching feedback',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  {
    type: 'fill-blank',
    label: 'Fill in the Blank',
    description: 'Type a word to complete a sentence',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  {
    type: 'drag-drop',
    label: 'Drag & Drop',
    description: 'Drag words into blanks in a sentence',
    color: 'bg-green-100 text-green-700 border-green-300',
  },
  {
    type: 'hotspot',
    label: 'Hotspot',
    description: 'Click on the correct region of an image',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
  },
]

export default function QuestionTypeSelector({ currentType, onChange }: QuestionTypeSelectorProps) {
  const effectiveType = currentType || 'multiple-choice'

  return (
    <div className="grid grid-cols-2 gap-2">
      {questionTypes.map(({ type, label, description, color }) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`p-3 rounded-lg border-2 text-left transition-all ${
            effectiveType === type
              ? `${color} border-current ring-2 ring-offset-1`
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <p className={`font-medium text-sm ${effectiveType === type ? '' : 'text-gray-700'}`}>
            {label}
          </p>
          <p className={`text-xs mt-0.5 ${effectiveType === type ? 'opacity-80' : 'text-gray-500'}`}>
            {description}
          </p>
        </button>
      ))}
    </div>
  )
}
