'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'

interface BackgroundUploadProps {
  imageUrl?: string
  onImageChange: (url: string | undefined) => void
  onThemeChange?: (theme: string) => void
}

export default function BackgroundUpload({ imageUrl, onImageChange, onThemeChange }: BackgroundUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log('File selected:', file?.name)
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 10MB for backgrounds)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB')
      return
    }

    setError('')
    setUploading(true)
    console.log('Starting upload...')

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `bg-${Date.now()}.${fileExt}`
      console.log('Uploading as:', fileName)

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Images')
        .upload(fileName, file)

      console.log('Upload result:', { uploadData, uploadError })

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        setError(`Upload failed: ${uploadError.message}`)
        setUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      // Get public URL
      const { data } = supabase.storage
        .from('Images')
        .getPublicUrl(fileName)

      console.log('Public URL:', data.publicUrl)

      onImageChange(data.publicUrl)
      console.log('Called onImageChange')

      // Auto-switch to classic theme when background is uploaded
      if (onThemeChange) {
        onThemeChange('classic')
        console.log('Switched to classic theme')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload image')
    }

    setUploading(false)
    console.log('Upload complete, setUploading(false)')

    // Reset file input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
    <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-700">
        Custom Background Image (optional)
      </h3>
      <p className="mb-3 text-xs text-gray-500">
        Upload a background image to customize the look of your escape room. Works best with dark, subtle images.
      </p>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />

      {imageUrl ? (
        <div className="space-y-3">
          <div
            className="relative h-32 w-full rounded-lg border border-gray-300 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          >
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
              <span className="text-sm text-white">Background Preview</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Change image'}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-gray-400 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Click to upload background image'}
        </button>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
