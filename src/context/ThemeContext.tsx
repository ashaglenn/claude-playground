'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { themes, defaultTheme, Theme } from '@/lib/themes'
import { CustomThemeBackgrounds, Screen } from '@/lib/types'

interface ThemeContextValue {
  theme: Theme
  themeId: string
  setThemeId: (id: string) => void
  customBackgrounds: CustomThemeBackgrounds | null
  getBackgroundForScreen: (screen: Screen) => string | null
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({
  children,
  initialTheme,
  customBackgrounds: initialCustomBackgrounds,
}: {
  children: ReactNode
  initialTheme?: string
  customBackgrounds?: CustomThemeBackgrounds
}) {
  const [themeId, setThemeId] = useState(initialTheme || defaultTheme)
  const [customBackgrounds, setCustomBackgrounds] = useState<CustomThemeBackgrounds | null>(initialCustomBackgrounds || null)
  const theme = themes[themeId] || themes[defaultTheme]

  // Map screen types to background keys
  const getBackgroundForScreen = (screen: Screen): string | null => {
    if (!customBackgrounds) return null

    const screenToBackgroundKey: Record<Screen, keyof CustomThemeBackgrounds | null> = {
      start: 'nameEntry',
      welcome: 'welcome',
      hub: 'hub',
      question: 'question',
      teaching: 'teaching',
      reflection: 'reflection',
      'letter-reveal': 'correct',
      'final-lock': 'hub',
      escaped: 'correct',
    }

    const key = screenToBackgroundKey[screen]
    if (!key) return customBackgrounds.default || null

    const specificBackground = customBackgrounds[key]
    if (specificBackground) return specificBackground

    // Fall back to default
    return customBackgrounds.default || null
  }

  useEffect(() => {
    // Apply theme CSS variables to the document
    const root = document.documentElement
    root.style.setProperty('--theme-background', theme.colors.background)
    root.style.setProperty('--theme-background-secondary', theme.colors.backgroundSecondary)
    root.style.setProperty('--theme-text', theme.colors.text)
    root.style.setProperty('--theme-text-muted', theme.colors.textMuted)
    root.style.setProperty('--theme-primary', theme.colors.primary)
    root.style.setProperty('--theme-primary-hover', theme.colors.primaryHover)
    root.style.setProperty('--theme-primary-text', theme.colors.primaryText)
    root.style.setProperty('--theme-accent', theme.colors.accent)
    root.style.setProperty('--theme-border', theme.colors.border)
    root.style.setProperty('--theme-card-background', theme.colors.cardBackground)
    root.style.setProperty('--theme-success', theme.colors.success)
    root.style.setProperty('--theme-error', theme.colors.error)
    root.style.setProperty('--theme-font-heading', theme.fonts.heading)
    root.style.setProperty('--theme-font-body', theme.fonts.body)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId, customBackgrounds, getBackgroundForScreen }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
