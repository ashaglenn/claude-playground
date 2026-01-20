'use client'

import { useState } from 'react'
import {
  QuestionData,
  AnswerData,
  MultipleChoiceQuestionData,
  LegacyQuestionData,
  HotspotQuestionData,
  DragDropQuestionData,
  FillBlankQuestionData,
  isMultipleChoiceQuestionData,
  isHotspotQuestionData,
  isDragDropQuestionData,
  isFillBlankQuestionData,
  createEmptyMultipleChoiceQuestion,
  createEmptyHotspotQuestion,
  createEmptyDragDropQuestion,
  createEmptyFillBlankQuestion,
} from '@/lib/builder-types'
import { QuestionType, AnswerKey, HotspotRegion } from '@/lib/types'
import QuestionTypeSelector from './QuestionTypeSelector'
import WrongAnswerEditor from './WrongAnswerEditor'
import ImageUpload from './ImageUpload'
import HotspotDrawingCanvas from './HotspotDrawingCanvas'

interface QuestionEditorProps {
  questionNumber: number
  checkpointNumber: number
  data: QuestionData
  onChange: (data: QuestionData) => void
}

// Get question type from data
function getQuestionType(data: QuestionData): QuestionType {
  if (isHotspotQuestionData(data)) return 'hotspot'
  if (isDragDropQuestionData(data)) return 'drag-drop'
  if (isFillBlankQuestionData(data)) return 'fill-blank'
  return 'multiple-choice'
}

// Get type label and color
function getTypeInfo(type: QuestionType) {
  switch (type) {
    case 'hotspot':
      return { label: 'Hotspot', color: 'bg-orange-100 text-orange-700' }
    case 'drag-drop':
      return { label: 'Drag & Drop', color: 'bg-green-100 text-green-700' }
    case 'fill-blank':
      return { label: 'Fill Blank', color: 'bg-purple-100 text-purple-700' }
    default:
      return { label: 'Multiple Choice', color: 'bg-gray-100 text-gray-600' }
  }
}

export default function QuestionEditor({
  questionNumber,
  checkpointNumber,
  data,
  onChange,
}: QuestionEditorProps) {
  const [expanded, setExpanded] = useState(false)
  const [showTypeSelector, setShowTypeSelector] = useState(false)

  const currentType = getQuestionType(data)
  const typeInfo = getTypeInfo(currentType)

  // Handle type change - creates new empty question of that type
  const handleTypeChange = (newType: QuestionType) => {
    const questionNum = questionNumber - (checkpointNumber - 1) * 4

    let newData: QuestionData
    switch (newType) {
      case 'hotspot':
        newData = {
          ...createEmptyHotspotQuestion(checkpointNumber, questionNum),
          title: data.title,
          question: data.question,
          imageUrl: data.imageUrl,
          correctMessage: data.correctMessage,
        }
        break
      case 'drag-drop':
        newData = {
          ...createEmptyDragDropQuestion(checkpointNumber, questionNum),
          title: data.title,
          question: data.question,
          imageUrl: data.imageUrl,
          correctMessage: data.correctMessage,
        }
        break
      case 'fill-blank':
        newData = {
          ...createEmptyFillBlankQuestion(checkpointNumber, questionNum),
          title: data.title,
          question: data.question,
          imageUrl: data.imageUrl,
          correctMessage: data.correctMessage,
        }
        break
      default:
        newData = {
          ...createEmptyMultipleChoiceQuestion(checkpointNumber, questionNum),
          title: data.title,
          question: data.question,
          imageUrl: data.imageUrl,
          correctMessage: data.correctMessage,
        }
    }

    onChange(newData)
    setShowTypeSelector(false)
  }

  const preview = data.question || 'Click to edit question...'

  // Render the collapsed header - all types show this
  const renderHeader = () => (
    <button
      type="button"
      onClick={() => setExpanded(!expanded)}
      className="flex w-full items-center justify-between px-4 py-3 text-left"
    >
      <div className="flex items-center gap-3">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${typeInfo.color}`}>
          {questionNumber}
        </span>
        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
        <span className="text-gray-700">
          {preview.length > 45 ? preview.substring(0, 45) + '...' : preview}
        </span>
      </div>
      <span className="text-gray-400">{expanded ? '▼' : '►'}</span>
    </button>
  )

  // If expanded, show type selector option and the appropriate editor
  if (expanded) {
    return (
      <div className="rounded-lg border-2 border-gray-200 bg-white">
        {renderHeader()}
        <div className="border-t px-4 py-4">
          {/* Type change button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowTypeSelector(!showTypeSelector)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showTypeSelector ? 'Cancel type change' : 'Change question type...'}
            </button>
          </div>

          {/* Type selector */}
          {showTypeSelector && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">
                Select a new question type (current content will be preserved where possible):
              </p>
              <QuestionTypeSelector
                currentType={currentType}
                onChange={handleTypeChange}
              />
            </div>
          )}

          {/* Render the appropriate editor based on type */}
          {!showTypeSelector && (
            <>
              {isMultipleChoiceQuestionData(data) && (
                <MultipleChoiceEditorInline
                  questionNumber={questionNumber}
                  data={data}
                  onChange={onChange}
                />
              )}
              {isHotspotQuestionData(data) && (
                <HotspotEditorInline
                  questionNumber={questionNumber}
                  data={data}
                  onChange={onChange}
                />
              )}
              {isDragDropQuestionData(data) && (
                <DragDropEditorInline
                  questionNumber={questionNumber}
                  data={data}
                  onChange={onChange}
                />
              )}
              {isFillBlankQuestionData(data) && (
                <FillBlankEditorInline
                  questionNumber={questionNumber}
                  data={data}
                  onChange={onChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // Collapsed state - just show the header
  return (
    <div className="rounded-lg border-2 border-gray-200 bg-white">
      {renderHeader()}
    </div>
  )
}

// Inline versions of editors that don't have their own expand/collapse
// These are embedded in the QuestionEditor when expanded

type MCQuestionData = MultipleChoiceQuestionData | LegacyQuestionData

function MultipleChoiceEditorInline({
  questionNumber,
  data,
  onChange,
}: {
  questionNumber: number
  data: MCQuestionData
  onChange: (data: MCQuestionData) => void
}) {
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

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          placeholder="e.g., Checkpoint 1 - Question 1"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Question</label>
        <textarea
          value={data.question}
          onChange={(e) => updateField('question', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          rows={2}
          placeholder="Enter your question..."
        />
      </div>

      <ImageUpload
        imageUrl={data.imageUrl}
        onImageChange={updateImage}
        questionId={`q${questionNumber}`}
      />

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Answer Options</label>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Correct Answer</label>
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
          <label className="mb-1 block text-sm font-medium text-gray-700">Correct Message</label>
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
  )
}

function HotspotEditorInline({
  questionNumber,
  data,
  onChange,
}: {
  questionNumber: number
  data: HotspotQuestionData
  onChange: (data: HotspotQuestionData) => void
}) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [shapeType, setShapeType] = useState<'rectangle' | 'circle' | 'polygon'>('rectangle')

  const updateField = <K extends keyof HotspotQuestionData>(field: K, value: HotspotQuestionData[K]) => {
    onChange({ ...data, [field]: value })
  }

  const handleRegionChange = (region: HotspotRegion) => {
    onChange({ ...data, hotspotRegion: region })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Instructions</label>
        <textarea
          value={data.question}
          onChange={(e) => updateField('question', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          rows={2}
        />
      </div>

      <div>
        <ImageUpload
          imageUrl={data.imageUrl}
          onImageChange={(url) => updateField('imageUrl', url)}
          questionId={`q${questionNumber}-main`}
          label="Image (required)"
        />
      </div>

      {data.imageUrl && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Hotspot Region</label>
          <div className="flex gap-2 mb-2">
            {(['rectangle', 'circle', 'polygon'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setShapeType(type)}
                className={`px-3 py-1 rounded text-sm ${
                  shapeType === type ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setIsDrawing(!isDrawing)}
              className={`px-4 py-2 rounded text-sm ${isDrawing ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {isDrawing ? 'Drawing...' : 'Draw Region'}
            </button>
            {data.hotspotRegion && (
              <button
                type="button"
                onClick={() => updateField('hotspotRegion', undefined)}
                className="px-4 py-2 rounded text-sm bg-red-100 text-red-700"
              >
                Clear Region
              </button>
            )}
          </div>
          <HotspotDrawingCanvas
            imageUrl={data.imageUrl}
            region={data.hotspotRegion}
            shapeType={shapeType}
            onRegionChange={handleRegionChange}
            isDrawing={isDrawing}
            onDrawingComplete={() => setIsDrawing(false)}
          />
        </div>
      )}

      <div>
        <ImageUpload
          imageUrl={data.labeledImageUrl}
          onImageChange={(url) => updateField('labeledImageUrl', url)}
          questionId={`q${questionNumber}-labeled`}
          label="Labeled Image (optional)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Correct Message</label>
          <input
            type="text"
            value={data.correctMessage}
            onChange={(e) => updateField('correctMessage', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Incorrect Message</label>
          <input
            type="text"
            value={data.incorrectMessage}
            onChange={(e) => updateField('incorrectMessage', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          />
        </div>
      </div>
    </div>
  )
}

function DragDropEditorInline({
  questionNumber,
  data,
  onChange,
}: {
  questionNumber: number
  data: DragDropQuestionData
  onChange: (data: DragDropQuestionData) => void
}) {
  const [newCorrectWord, setNewCorrectWord] = useState('')
  const [newDistractorWord, setNewDistractorWord] = useState('')

  const updateField = <K extends keyof DragDropQuestionData>(field: K, value: DragDropQuestionData[K]) => {
    onChange({ ...data, [field]: value })
  }

  const blankCount = (data.sentence.match(/\[BLANK\]/g) || []).length

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Instructions</label>
        <textarea
          value={data.question}
          onChange={(e) => updateField('question', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          rows={2}
        />
      </div>

      <ImageUpload
        imageUrl={data.imageUrl}
        onImageChange={(url) => updateField('imageUrl', url)}
        questionId={`q${questionNumber}`}
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Sentence (use [BLANK] for each blank)</label>
        <textarea
          value={data.sentence}
          onChange={(e) => updateField('sentence', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          rows={2}
        />
        <p className="mt-1 text-xs text-gray-500">Found {blankCount} blank(s)</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Correct Words (in order)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {data.correctWords.map((word, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {i + 1}. {word}
              <button type="button" onClick={() => onChange({ ...data, correctWords: data.correctWords.filter((_, j) => j !== i) })} className="text-green-600">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCorrectWord}
            onChange={(e) => setNewCorrectWord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (newCorrectWord.trim()) {
                  onChange({ ...data, correctWords: [...data.correctWords, newCorrectWord.trim()] })
                  setNewCorrectWord('')
                }
              }
            }}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            placeholder="Add correct word..."
          />
          <button
            type="button"
            onClick={() => {
              if (newCorrectWord.trim()) {
                onChange({ ...data, correctWords: [...data.correctWords, newCorrectWord.trim()] })
                setNewCorrectWord('')
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Distractor Words</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {data.distractorWords.map((word, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
              {word}
              <button type="button" onClick={() => onChange({ ...data, distractorWords: data.distractorWords.filter((_, j) => j !== i) })} className="text-red-600">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newDistractorWord}
            onChange={(e) => setNewDistractorWord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (newDistractorWord.trim()) {
                  onChange({ ...data, distractorWords: [...data.distractorWords, newDistractorWord.trim()] })
                  setNewDistractorWord('')
                }
              }
            }}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            placeholder="Add distractor word..."
          />
          <button
            type="button"
            onClick={() => {
              if (newDistractorWord.trim()) {
                onChange({ ...data, distractorWords: [...data.distractorWords, newDistractorWord.trim()] })
                setNewDistractorWord('')
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Correct Message</label>
          <input
            type="text"
            value={data.correctMessage}
            onChange={(e) => updateField('correctMessage', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Incorrect Message</label>
          <input
            type="text"
            value={data.incorrectMessage}
            onChange={(e) => updateField('incorrectMessage', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          />
        </div>
      </div>
    </div>
  )
}

function FillBlankEditorInline({
  questionNumber,
  data,
  onChange,
}: {
  questionNumber: number
  data: FillBlankQuestionData
  onChange: (data: FillBlankQuestionData) => void
}) {
  const updateField = <K extends keyof FillBlankQuestionData>(field: K, value: FillBlankQuestionData[K]) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Instructions</label>
        <textarea
          value={data.question}
          onChange={(e) => updateField('question', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          rows={2}
        />
      </div>

      <ImageUpload
        imageUrl={data.imageUrl}
        onImageChange={(url) => updateField('imageUrl', url)}
        questionId={`q${questionNumber}`}
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Sentence (use [BLANK] for the blank)</label>
        <textarea
          value={data.sentence}
          onChange={(e) => updateField('sentence', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          rows={2}
          placeholder="e.g., The capital of France is [BLANK]."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Correct Answer</label>
        <input
          type="text"
          value={data.correctAnswer}
          onChange={(e) => updateField('correctAnswer', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          placeholder="e.g., Paris"
        />
        <p className="mt-1 text-xs text-gray-500">Case-insensitive comparison</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Correct Message</label>
          <input
            type="text"
            value={data.correctMessage}
            onChange={(e) => updateField('correctMessage', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Incorrect Message</label>
          <input
            type="text"
            value={data.incorrectMessage}
            onChange={(e) => updateField('incorrectMessage', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          />
        </div>
      </div>
    </div>
  )
}
