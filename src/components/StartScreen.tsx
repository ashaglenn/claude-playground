'use client'

import { useRef } from 'react'
import { useGame } from '@/context/GameContext'
import { parseGameFile } from '@/lib/parser'

export default function StartScreen() {
  const { dispatch } = useGame()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const content = parseGameFile(text)
    dispatch({ type: 'LOAD_GAME', content })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Escape Room</h1>
      <p className="max-w-md text-center text-lg text-gray-600">
        Upload a question file to begin your escape room adventure.
        Complete all 3 checkpoints and unlock the final lock to escape!
      </p>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".txt"
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="rounded-lg bg-black px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-gray-800"
      >
        Upload Question File
      </button>
    </div>
  )
}
