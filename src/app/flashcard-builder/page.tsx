'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  FlashcardBuilderState,
  createEmptyFlashcardBuilderState,
  flashcardBuilderStateToContent,
} from '@/lib/builder-types'
import ImageUpload from '@/components/builder/ImageUpload'

function generateShareCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function FlashcardBuilderPage() {
  const [state, setState] = useState<FlashcardBuilderState>(createEmptyFlashcardBuilderState(5))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const updateTitle = (title: string) => {
    setState(prev => ({ ...prev, title }))
  }

  const updateDescription = (description: string) => {
    setState(prev => ({ ...prev, description }))
  }

  const updateCard = (index: number, field: 'front' | 'back', value: string) => {
    setState(prev => {
      const newCards = [...prev.cards]
      newCards[index] = { ...newCards[index], [field]: value }
      return { ...prev, cards: newCards }
    })
  }

  const updateCardImage = (index: number, field: 'frontImageUrl' | 'backImageUrl', value: string | undefined) => {
    setState(prev => {
      const newCards = [...prev.cards]
      newCards[index] = { ...newCards[index], [field]: value }
      return { ...prev, cards: newCards }
    })
  }

  const addCard = () => {
    setState(prev => ({
      ...prev,
      cards: [...prev.cards, { front: '', back: '', frontImageUrl: undefined, backImageUrl: undefined }],
    }))
  }

  const removeCard = (index: number) => {
    if (state.cards.length <= 1) return
    setState(prev => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index),
    }))
  }

  const validateState = (): string | null => {
    if (!state.title.trim()) {
      return 'Please enter a title for your flashcard set'
    }

    const nonEmptyCards = state.cards.filter(c => c.front.trim() || c.back.trim())
    if (nonEmptyCards.length === 0) {
      return 'Please add at least one flashcard'
    }

    for (let i = 0; i < state.cards.length; i++) {
      const card = state.cards[i]
      const hasContent = card.front.trim() || card.back.trim()
      if (hasContent && (!card.front.trim() || !card.back.trim())) {
        return `Card ${i + 1} must have both a front and back`
      }
    }

    return null
  }

  const handleSave = async () => {
    setError('')
    const validationError = validateState()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in')
        setSaving(false)
        return
      }

      // Filter out empty cards
      const filledCards = state.cards.filter(c => c.front.trim() && c.back.trim())
      const contentToSave = flashcardBuilderStateToContent({
        ...state,
        cards: filledCards,
      })

      const { error: insertError } = await supabase.from('escape_rooms').insert({
        teacher_id: user.id,
        title: state.title,
        game_content: contentToSave,
        share_code: generateShareCode(),
        activity_type: 'flashcard',
      })

      if (insertError) {
        setError(insertError.message)
        setSaving(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Failed to save flashcard set')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      <div className="sticky top-0 z-10 border-b bg-white px-8 py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-black"
            >
              ← Back
            </Link>
            <input
              type="text"
              value={state.title}
              onChange={(e) => updateTitle(e.target.value)}
              placeholder="Flashcard Set Title..."
              className="border-b-2 border-transparent bg-transparent text-2xl font-bold text-gray-900 focus:border-black focus:outline-none"
            />
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
              Flashcards
            </span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-black px-6 py-2 font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Flashcards'}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-8 pt-6">
        {error && (
          <div className="mb-6 rounded-lg border-2 border-red-300 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
          <h3 className="mb-1 text-sm font-medium text-gray-700">
            Description (optional)
          </h3>
          <p className="mb-3 text-xs text-gray-500">
            Add a description to help students understand what these flashcards cover.
          </p>
          <textarea
            value={state.description}
            onChange={(e) => updateDescription(e.target.value)}
            placeholder="These flashcards cover vocabulary for Chapter 3..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            rows={2}
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Cards ({state.cards.filter(c => c.front.trim() && c.back.trim()).length} filled)
            </h2>
          </div>

          <div className="space-y-4">
            {state.cards.map((card, index) => (
              <div
                key={index}
                className="rounded-lg border-2 border-gray-200 bg-white p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    Card {index + 1}
                  </span>
                  {state.cards.length > 1 && (
                    <button
                      onClick={() => removeCard(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Front (Question)
                      </label>
                      <textarea
                        value={card.front}
                        onChange={(e) => updateCard(index, 'front', e.target.value)}
                        placeholder="Enter the question or term..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                        rows={3}
                      />
                    </div>
                    <ImageUpload
                      imageUrl={card.frontImageUrl}
                      onImageChange={(url) => updateCardImage(index, 'frontImageUrl', url)}
                      questionId={`flashcard-${index}-front`}
                      label="Front Image (optional)"
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Back (Answer)
                      </label>
                      <textarea
                        value={card.back}
                        onChange={(e) => updateCard(index, 'back', e.target.value)}
                        placeholder="Enter the answer or definition..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                        rows={3}
                      />
                    </div>
                    <ImageUpload
                      imageUrl={card.backImageUrl}
                      onImageChange={(url) => updateCardImage(index, 'backImageUrl', url)}
                      questionId={`flashcard-${index}-back`}
                      label="Back Image (optional)"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={addCard}
            className="rounded-lg border-2 border-dashed border-gray-300 px-6 py-3 text-gray-600 hover:border-gray-400 hover:text-gray-700"
          >
            + Add Card
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-black px-8 py-3 text-lg font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Flashcards'}
          </button>
        </div>
      </div>
    </div>
  )
}
