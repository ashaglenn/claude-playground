'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'

interface ImageUploadProps {
  imageUrl?: string
  onImageChange: (url: string | undefined) => void
  questionId: string
  label?: string | null  // Pass null to hide label entirely
}

export default function ImageUpload({ imageUrl, onImageChange, questionId, label = 'Question Image (optional)' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setError('')
    setUploading(true)

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${questionId}-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('Images')
        .upload(fileName, file)

      if (uploadError) {
        setError(uploadError.message)
        setUploading(false)
        return
      }

      // Get public URL
      const { data } = supabase.storage
        .from('Images')
        .getPublicUrl(fileName)

      onImageChange(data.publicUrl)
    } catch {
      setError('Failed to upload image')
    }

    setUploading(false)
  }

  const handleRemove = async () => {
    if (!imageUrl) return

    // Extract filename from URL
    const fileName = imageUrl.split('/').pop()
    if (fileName) {
      await supabase.storage.from('Images').remove([fileName])
    }

    onImageChange(undefined)
  }

  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {imageUrl ? (
        <div className="relative inline-block">
          <img
            src={imageUrl}
            alt="Question"
            className="max-h-48 rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-gray-400 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Click to add image'}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
