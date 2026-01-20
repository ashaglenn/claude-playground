'use client'

import { useRef, useState, useEffect, MouseEvent } from 'react'
import { HotspotRegion } from '@/lib/types'

interface HotspotDrawingCanvasProps {
  imageUrl: string
  region?: HotspotRegion
  shapeType: 'rectangle' | 'circle' | 'polygon'
  onRegionChange: (region: HotspotRegion) => void
  isDrawing: boolean
  onDrawingComplete: () => void
}

export default function HotspotDrawingCanvas({
  imageUrl,
  region,
  shapeType,
  onRegionChange,
  isDrawing,
  onDrawingComplete,
}: HotspotDrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })

  // Drawing state
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null)
  const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([])

  // Load image and set canvas size
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageLoaded(true)
      // Use displayed size, not natural size (for responsive display)
      const container = containerRef.current
      if (container) {
        const displayWidth = Math.min(img.naturalWidth, container.clientWidth)
        const ratio = displayWidth / img.naturalWidth
        const displayHeight = img.naturalHeight * ratio
        setImageSize({ width: displayWidth, height: displayHeight })
      }
    }
    img.src = imageUrl
  }, [imageUrl])

  // Get mouse position relative to canvas as percentage
  const getMousePos = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
  }

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !imageLoaded) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw existing region
    if (region && !isDrawing) {
      ctx.strokeStyle = '#22c55e'
      ctx.fillStyle = 'rgba(34, 197, 94, 0.2)'
      ctx.lineWidth = 3

      const { type, coords } = region

      if (type === 'rectangle' && coords.length >= 4) {
        const [x, y, w, h] = coords
        const px = (x / 100) * canvas.width
        const py = (y / 100) * canvas.height
        const pw = (w / 100) * canvas.width
        const ph = (h / 100) * canvas.height
        ctx.fillRect(px, py, pw, ph)
        ctx.strokeRect(px, py, pw, ph)
      } else if (type === 'circle' && coords.length >= 3) {
        const [cx, cy, r] = coords
        const px = (cx / 100) * canvas.width
        const py = (cy / 100) * canvas.height
        const pr = (r / 100) * Math.min(canvas.width, canvas.height)
        ctx.beginPath()
        ctx.arc(px, py, pr, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      } else if (type === 'polygon' && coords.length >= 4) {
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

    // Draw in-progress shape
    if (isDrawing) {
      ctx.strokeStyle = '#3b82f6'
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'
      ctx.lineWidth = 2

      if (shapeType === 'rectangle' && startPoint && currentPoint) {
        const sx = (startPoint.x / 100) * canvas.width
        const sy = (startPoint.y / 100) * canvas.height
        const ex = (currentPoint.x / 100) * canvas.width
        const ey = (currentPoint.y / 100) * canvas.height
        const w = ex - sx
        const h = ey - sy
        ctx.fillRect(sx, sy, w, h)
        ctx.strokeRect(sx, sy, w, h)
      } else if (shapeType === 'circle' && startPoint && currentPoint) {
        const cx = (startPoint.x / 100) * canvas.width
        const cy = (startPoint.y / 100) * canvas.height
        const ex = (currentPoint.x / 100) * canvas.width
        const ey = (currentPoint.y / 100) * canvas.height
        const r = Math.sqrt(Math.pow(ex - cx, 2) + Math.pow(ey - cy, 2))
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      } else if (shapeType === 'polygon' && polygonPoints.length > 0) {
        ctx.beginPath()
        polygonPoints.forEach((pt, i) => {
          const px = (pt.x / 100) * canvas.width
          const py = (pt.y / 100) * canvas.height
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        })
        if (currentPoint) {
          const px = (currentPoint.x / 100) * canvas.width
          const py = (currentPoint.y / 100) * canvas.height
          ctx.lineTo(px, py)
        }
        ctx.stroke()

        // Draw points
        polygonPoints.forEach((pt, i) => {
          const px = (pt.x / 100) * canvas.width
          const py = (pt.y / 100) * canvas.height
          ctx.fillStyle = i === 0 ? '#ef4444' : '#3b82f6'
          ctx.beginPath()
          ctx.arc(px, py, 6, 0, Math.PI * 2)
          ctx.fill()
        })
      }
    }
  }, [imageLoaded, region, isDrawing, shapeType, startPoint, currentPoint, polygonPoints])

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const pos = getMousePos(e)
    if (!pos) return

    if (shapeType === 'polygon') {
      // Check if clicking near first point to close
      if (polygonPoints.length >= 3) {
        const first = polygonPoints[0]
        const dist = Math.sqrt(Math.pow(pos.x - first.x, 2) + Math.pow(pos.y - first.y, 2))
        if (dist < 3) {
          // Close polygon
          const coords = polygonPoints.flatMap(p => [p.x, p.y])
          onRegionChange({ type: 'polygon', coords })
          setPolygonPoints([])
          onDrawingComplete()
          return
        }
      }
      setPolygonPoints([...polygonPoints, pos])
    } else {
      setStartPoint(pos)
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const pos = getMousePos(e)
    if (!pos) return

    setCurrentPoint(pos)
  }

  const handleMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const pos = getMousePos(e)
    if (!pos || !startPoint) return

    if (shapeType === 'rectangle') {
      const x = Math.min(startPoint.x, pos.x)
      const y = Math.min(startPoint.y, pos.y)
      const w = Math.abs(pos.x - startPoint.x)
      const h = Math.abs(pos.y - startPoint.y)
      if (w > 1 && h > 1) {
        onRegionChange({ type: 'rectangle', coords: [x, y, w, h] })
        onDrawingComplete()
      }
    } else if (shapeType === 'circle') {
      const dx = pos.x - startPoint.x
      const dy = pos.y - startPoint.y
      const r = Math.sqrt(dx * dx + dy * dy)
      if (r > 1) {
        onRegionChange({ type: 'circle', coords: [startPoint.x, startPoint.y, r] })
        onDrawingComplete()
      }
    }

    setStartPoint(null)
    setCurrentPoint(null)
  }

  const handleDoubleClick = () => {
    if (!isDrawing || shapeType !== 'polygon') return

    if (polygonPoints.length >= 3) {
      const coords = polygonPoints.flatMap(p => [p.x, p.y])
      onRegionChange({ type: 'polygon', coords })
      setPolygonPoints([])
      onDrawingComplete()
    }
  }

  // Reset polygon points when starting new drawing
  useEffect(() => {
    if (isDrawing && shapeType === 'polygon') {
      setPolygonPoints([])
    }
  }, [isDrawing, shapeType])

  return (
    <div ref={containerRef} className="relative w-full">
      <img
        src={imageUrl}
        alt="Hotspot base"
        className="w-full rounded-lg"
        style={{ maxHeight: '400px', objectFit: 'contain' }}
      />
      {imageLoaded && (
        <canvas
          ref={canvasRef}
          width={imageSize.width}
          height={imageSize.height}
          className={`absolute top-0 left-0 rounded-lg ${isDrawing ? 'cursor-crosshair' : 'cursor-default'}`}
          style={{ width: imageSize.width, height: imageSize.height }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        />
      )}
      {isDrawing && shapeType === 'polygon' && polygonPoints.length > 0 && (
        <p className="mt-2 text-xs text-blue-600">
          Click to add points. Double-click or click on the first point (red) to close the shape.
        </p>
      )}
    </div>
  )
}
