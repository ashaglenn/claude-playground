'use client'

import { useEffect, useState } from 'react'
import { themeList } from '@/lib/themes'
import { createClient } from '@/lib/supabase'
import { CustomThemeBackgrounds } from '@/lib/types'

interface CustomTheme {
  id: string
  name: string
  description: string | null
  default_background: string | null
  name_entry_background: string | null
  welcome_background: string | null
  hub_background: string | null
  question_background: string | null
  correct_background: string | null
  teaching_background: string | null
  reflection_background: string | null
  reflection_wrong_background: string | null
}

interface ThemeSelectorProps {
  selectedTheme: string
  selectedCustomThemeId?: string
  onThemeChange: (themeId: string) => void
  onCustomThemeSelect?: (themeId: string, backgrounds: CustomThemeBackgrounds) => void
}

export default function ThemeSelector({
  selectedTheme,
  selectedCustomThemeId,
  onThemeChange,
  onCustomThemeSelect,
}: ThemeSelectorProps) {
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadCustomThemes()
  }, [])

  const loadCustomThemes = async () => {
    const { data, error } = await supabase
      .from('custom_themes')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (!error && data) {
      setCustomThemes(data)
    }
    setLoading(false)
  }

  const handleCustomThemeSelect = (theme: CustomTheme) => {
    if (onCustomThemeSelect) {
      const backgrounds: CustomThemeBackgrounds = {
        default: theme.default_background,
        nameEntry: theme.name_entry_background,
        welcome: theme.welcome_background,
        hub: theme.hub_background,
        question: theme.question_background,
        correct: theme.correct_background,
        teaching: theme.teaching_background,
        reflection: theme.reflection_background,
        reflectionWrong: theme.reflection_wrong_background,
      }
      onCustomThemeSelect(theme.id, backgrounds)
    }
  }

  return (
    <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-700">Choose Theme</h3>

      {/* Built-in color themes */}
      <div className="mb-4">
        <p className="mb-2 text-xs text-gray-500">Color Themes</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {themeList.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => onThemeChange(theme.id)}
              className={`relative rounded-lg border-2 p-3 text-left transition-all ${
                selectedTheme === theme.id && !selectedCustomThemeId
                  ? 'border-black ring-2 ring-black ring-offset-2'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div
                className="mb-2 h-12 rounded"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.backgroundSecondary} 50%, ${theme.colors.primary} 100%)`,
                }}
              >
                <div className="flex h-full items-center justify-center gap-1 px-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: theme.colors.text }}
                  />
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">{theme.name}</div>
              <div className="text-xs text-gray-500 truncate">{theme.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom image themes */}
      {!loading && customThemes.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-gray-500">Custom Image Themes</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {customThemes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleCustomThemeSelect(theme)}
                className={`relative rounded-lg border-2 p-3 text-left transition-all ${
                  selectedCustomThemeId === theme.id
                    ? 'border-black ring-2 ring-black ring-offset-2'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div
                  className="mb-2 h-12 rounded bg-cover bg-center"
                  style={{
                    backgroundImage: theme.default_background
                      ? `url(${theme.default_background})`
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundColor: '#e5e7eb',
                  }}
                />
                <div className="text-sm font-medium text-gray-900">{theme.name}</div>
                <div className="text-xs text-gray-500 truncate">{theme.description || 'Custom theme'}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <p className="text-xs text-gray-400">Loading custom themes...</p>
      )}
    </div>
  )
}
