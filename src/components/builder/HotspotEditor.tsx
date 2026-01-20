'use client'

import { useState } from 'react'
import { HotspotQuestionData } from '@/lib/builder-types'
import { HotspotRegion } from '@/lib/types'
import ImageUpload from './ImageUpload'
import HotspotDrawingCanvas from './HotspotDrawingCanvas'

interface HotspotEditorProps {
  questionNumber: number
  data: HotspotQuestionData
  onChange: (data: HotspotQuestionData) => void
}

export default function HotspotEditor({
  questionNumber,
  data,
  onChange,
}: HotspotEditorProps) {
  const [expanded, setExpanded] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [shapeType, setShapeType] = useState<'rectangle' | 'circle' | 'polygon'>('rectangle')

  const updateField = <K extends keyof HotspotQuestionData>(field: K, value: HotspotQuestionData[K]) => {
    onChange({ ...data, [field]: value })
  }

  const handleRegionChange = (region: HotspotRegion) => {
    onChange({ ...data, hotspotRegion: region })
  }

  const handleDrawingComplete = () => {
    setIsDrawing(false)
  }

  const clearRegion = () => {
    onChange({ ...data, hotspotRegion: undefined })
  }

  const preview = data.question || 'Click to add hotspot question...'

  const getShapeDescription = () => {
    if (!data.hotspotRegion) return 'No region defined'
    const { type, coords } = data.hotspotRegion
    if (type === 'rectangle') {
      return `Rectangle at (${coords[0].toFixed(1)}%, ${coords[1].toFixed(1)}%) size ${coords[2].toFixed(1)}% × ${coords[3].toFixed(1)}%`
    } else if (type === 'circle') {
      return `Circle at (${coords[0].toFixed(1)}%, ${coords[1].toFixed(1)}%) radius ${coords[2].toFixed(1)}%`
    } else {
      return `Polygon with ${coords.length / 2} points`
    }
  }

  return (
    <div className="rounded-lg border-2 border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
            {questionNumber}
          </span>
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded">
            Hotspot
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
              placeholder="Instructions for the student (e.g., 'Click on the mitochondria in the cell diagram:')"
            />
          </div>

          {/* Main Image (required) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Image (required)
            </label>
            <ImageUpload
              imageUrl={data.imageUrl}
              onImageChange={(url) => updateField('imageUrl', url)}
              questionId={`q${questionNumber}-main`}
            />
          </div>

          {/* Hotspot Region Drawing */}
          {data.imageUrl && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Hotspot Region (draw the correct click area)
              </label>

              {/* Shape type selector */}
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setShapeType('rectangle')}
                  className={`px-3 py-1 rounded text-sm ${
                    shapeType === 'rectangle'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Rectangle
                </button>
                <button
                  type="button"
                  onClick={() => setShapeType('circle')}
                  className={`px-3 py-1 rounded text-sm ${
                    shapeType === 'circle'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Circle
                </button>
                <button
                  type="button"
                  onClick={() => setShapeType('polygon')}
                  className={`px-3 py-1 rounded text-sm ${
                    shapeType === 'polygon'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Polygon
                </button>
              </div>

              {/* Drawing controls */}
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setIsDrawing(!isDrawing)}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    isDrawing
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isDrawing ? 'Drawing...' : 'Draw Region'}
                </button>
                {data.hotspotRegion && (
                  <button
                    type="button"
                    onClick={clearRegion}
                    className="px-4 py-2 rounded text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Clear Region
                  </button>
                )}
              </div>

              {/* Canvas */}
              <HotspotDrawingCanvas
                imageUrl={data.imageUrl}
                region={data.hotspotRegion}
                shapeType={shapeType}
                onRegionChange={handleRegionChange}
                isDrawing={isDrawing}
                onDrawingComplete={handleDrawingComplete}
              />

              {/* Region info */}
              <p className="text-xs text-gray-500">{getShapeDescription()}</p>

              {/* Drawing instructions */}
              {isDrawing && (
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  {shapeType === 'rectangle' && 'Click and drag to draw a rectangle.'}
                  {shapeType === 'circle' && 'Click to set center, drag to set radius.'}
                  {shapeType === 'polygon' && 'Click to add points. Double-click or click the first point to close.'}
                </div>
              )}
            </div>
          )}

          {/* Labeled Image (optional - shown when wrong) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Labeled Image (optional - shown when student clicks wrong area)
            </label>
            <ImageUpload
              imageUrl={data.labeledImageUrl}
              onImageChange={(url) => updateField('labeledImageUrl', url)}
              questionId={`q${questionNumber}-labeled`}
            />
            <p className="mt-1 text-xs text-gray-500">
              If not provided, the correct region will be highlighted when wrong.
            </p>
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
                Incorrect Message
              </label>
              <input
                type="text"
                value={data.incorrectMessage}
                onChange={(e) => updateField('incorrectMessage', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="Not quite. The correct area is highlighted."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
