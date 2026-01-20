'use client'

import { useState, useRef, useEffect, MouseEvent } from 'react'
import { useGame } from '@/context/GameContext'
import { useTheme } from '@/context/ThemeContext'
import { HotspotQuestion, HotspotRegion } from '@/lib/types'

interface HotspotQuestionScreenProps {
  question: HotspotQuestion
}

export default function HotspotQuestionScreen({ question }: HotspotQuestionScreenProps) {
  const { dispatch } = useGame()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('question')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [showCorrectMessage, setShowCorrectMessage] = useState(false)
  const [showIncorrect, setShowIncorrect] = useState(false)

  // Load image and set canvas size
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageLoaded(true)
      const container = containerRef.current
      if (container) {
        const maxWidth = Math.min(img.naturalWidth, container.clientWidth, 600)
        const ratio = maxWidth / img.naturalWidth
        const displayHeight = img.naturalHeight * ratio
        setImageSize({ width: maxWidth, height: displayHeight })
      }
    }
    img.src = question.imageUrl
  }, [question.imageUrl])

  // Check if click is inside the hotspot region
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
      // Ray casting algorithm for point-in-polygon
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

  // Draw the hotspot region (for showing correct answer)
  const drawRegion = (ctx: CanvasRenderingContext2D, region: HotspotRegion, canvas: HTMLCanvasElement) => {
    ctx.strokeStyle = '#22c55e'
    ctx.fillStyle = 'rgba(34, 197, 94, 0.3)'
    ctx.lineWidth = 3

    const { type, coords } = region

    if (type === 'rectangle') {
      const [x, y, w, h] = coords
      const px = (x / 100) * canvas.width
      const py = (y / 100) * canvas.height
      const pw = (w / 100) * canvas.width
      const ph = (h / 100) * canvas.height
      ctx.fillRect(px, py, pw, ph)
      ctx.strokeRect(px, py, pw, ph)
    } else if (type === 'circle') {
      const [cx, cy, r] = coords
      const px = (cx / 100) * canvas.width
      const py = (cy / 100) * canvas.height
      const pr = (r / 100) * Math.min(canvas.width, canvas.height)
      ctx.beginPath()
      ctx.arc(px, py, pr, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    } else if (type === 'polygon') {
      ctx.beginPath()
      for (let i = 0; i < coords.length; i += 2) {
        const px = (coords[i] / 100) * canvas.width
        const py = (coords[i + 1] / 100) * canvas.height
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }

  // Update canvas when showing incorrect
  useEffect(() => {
    if (!showIncorrect || question.labeledImageUrl) return

    const canvas = canvasRef.current
    if (!canvas || !imageLoaded) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawRegion(ctx, question.hotspotRegion, canvas)
  }, [showIncorrect, imageLoaded, question.hotspotRegion, question.labeledImageUrl])

  const handleBackToHub = () => {
    dispatch({ type: 'GO_TO_HUB' })
  }

  const handleImageClick = (e: MouseEvent<HTMLCanvasElement | HTMLImageElement>) => {
    if (showCorrectMessage) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const isCorrect = isPointInRegion(x, y, question.hotspotRegion)

    if (isCorrect) {
      setShowIncorrect(false)
      setShowCorrectMessage(true)
    } else {
      setShowIncorrect(true)
    }
  }

  const handleContinue = () => {
    setShowCorrectMessage(false)
    dispatch({ type: 'ANSWER_CORRECT' })
  }

  const handleTryAgain = () => {
    setShowIncorrect(false)
  }

  if (showCorrectMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <div
          className="rounded-lg p-8 text-center max-w-2xl"
          style={{
            backgroundColor: 'var(--theme-card-background)',
          }}
        >
          <p className="text-xl font-medium mb-6">{question.correctMessage}</p>
          <button
            onClick={handleContinue}
            className="rounded-lg px-8 py-3 text-lg font-medium transition-colors"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-primary-text)',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <button
        onClick={handleBackToHub}
        className={`absolute top-4 left-4 text-sm hover:opacity-70 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
        style={{ color: 'var(--theme-text-muted)' }}
      >
        ← Back to Hub
      </button>

      <div className="w-full max-w-2xl">
        <h2
          className={`text-xl font-semibold mb-4 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
          style={{ fontFamily: 'var(--theme-font-heading)' }}
        >
          {question.title}
        </h2>

        <p className={`text-xl mb-6 ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}>
          {question.question}
        </p>

        {/* Image with click detection */}
        <div ref={containerRef} className="relative w-full mb-4">
          {showIncorrect && question.labeledImageUrl ? (
            // Show labeled image when incorrect
            <img
              src={question.labeledImageUrl}
              alt="Labeled answer"
              className="w-full rounded-lg max-h-96 object-contain cursor-pointer"
              style={{ borderColor: 'var(--theme-border)', borderWidth: '1px' }}
              onClick={handleImageClick}
            />
          ) : (
            // Show main image with canvas overlay
            <>
              <img
                src={question.imageUrl}
                alt="Click to answer"
                className="w-full rounded-lg max-h-96 object-contain"
                style={{
                  borderColor: 'var(--theme-border)',
                  borderWidth: '1px',
                  width: imageSize.width || 'auto',
                  height: imageSize.height || 'auto',
                }}
              />
              {imageLoaded && (
                <canvas
                  ref={canvasRef}
                  width={imageSize.width}
                  height={imageSize.height}
                  className="absolute top-0 left-0 cursor-pointer rounded-lg"
                  style={{ width: imageSize.width, height: imageSize.height }}
                  onClick={handleImageClick}
                />
              )}
            </>
          )}
        </div>

        {/* Incorrect feedback */}
        {showIncorrect && (
          <div
            className="mb-4 p-4 rounded-lg"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <p className="mb-3" style={{ color: 'var(--theme-text)' }}>
              {question.incorrectMessage || 'Not quite. The correct area is highlighted above.'}
            </p>
            <button
              onClick={handleTryAgain}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-primary-text)',
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {!showIncorrect && (
          <p
            className="text-sm text-center"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            Click on the image to select your answer
          </p>
        )}
      </div>
    </div>
  )
}
