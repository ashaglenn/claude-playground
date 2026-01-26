export interface Theme {
  id: string
  name: string
  description: string
  colors: {
    background: string
    backgroundSecondary: string
    text: string
    textMuted: string
    primary: string
    primaryHover: string
    primaryText: string
    accent: string
    border: string
    cardBackground: string
    success: string
    error: string
  }
  fonts: {
    heading: string
    body: string
  }
}

export const themes: Record<string, Theme> = {
  classic: {
    id: 'classic',
    name: 'Modern Light',
    description: 'Clean white with indigo accents',
    colors: {
      background: '#f8fafc',
      backgroundSecondary: '#f1f5f9',
      text: '#1e293b',
      textMuted: '#64748b',
      primary: '#4f46e5',
      primaryHover: '#4338ca',
      primaryText: '#ffffff',
      accent: '#4f46e5',
      border: '#e2e8f0',
      cardBackground: '#ffffff',
      success: '#dcfce7',
      error: '#fef2f2',
    },
    fonts: {
      heading: 'Inter, system-ui, -apple-system, sans-serif',
      body: 'Inter, system-ui, -apple-system, sans-serif',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Deep blues and teals, calm and focused',
    colors: {
      background: '#0c1222',
      backgroundSecondary: '#1e293b',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      primary: '#0ea5e9',
      primaryHover: '#0284c7',
      primaryText: '#ffffff',
      accent: '#22d3ee',
      border: '#334155',
      cardBackground: '#1e293b',
      success: '#134e4a',
      error: '#7f1d1d',
    },
    fonts: {
      heading: 'Inter, system-ui, -apple-system, sans-serif',
      body: 'Inter, system-ui, -apple-system, sans-serif',
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm oranges and purples, vibrant energy',
    colors: {
      background: '#1c1017',
      backgroundSecondary: '#2d1f2b',
      text: '#fef3f2',
      textMuted: '#d6bcbc',
      primary: '#f97316',
      primaryHover: '#ea580c',
      primaryText: '#ffffff',
      accent: '#fb923c',
      border: '#44333e',
      cardBackground: '#2d1f2b',
      success: '#365314',
      error: '#7f1d1d',
    },
    fonts: {
      heading: 'Inter, system-ui, -apple-system, sans-serif',
      body: 'Inter, system-ui, -apple-system, sans-serif',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest Path',
    description: 'Earthy greens and browns, natural and grounded',
    colors: {
      background: '#0f1a14',
      backgroundSecondary: '#1a2e23',
      text: '#ecfdf5',
      textMuted: '#a7c4b5',
      primary: '#10b981',
      primaryHover: '#059669',
      primaryText: '#ffffff',
      accent: '#34d399',
      border: '#2d4a3e',
      cardBackground: '#1a2e23',
      success: '#14532d',
      error: '#7f1d1d',
    },
    fonts: {
      heading: 'Inter, system-ui, -apple-system, sans-serif',
      body: 'Inter, system-ui, -apple-system, sans-serif',
    },
  },
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic Night',
    description: 'Deep purples and pinks, mysterious and exciting',
    colors: {
      background: '#0f0a1a',
      backgroundSecondary: '#1a1333',
      text: '#f5f3ff',
      textMuted: '#a78bfa',
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      primaryText: '#ffffff',
      accent: '#c4b5fd',
      border: '#3b2d5e',
      cardBackground: '#1a1333',
      success: '#14532d',
      error: '#7f1d1d',
    },
    fonts: {
      heading: 'Inter, system-ui, -apple-system, sans-serif',
      body: 'Inter, system-ui, -apple-system, sans-serif',
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Blue',
    description: 'Sophisticated dark blue with gold accents',
    colors: {
      background: '#020617',
      backgroundSecondary: '#0f172a',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryText: '#ffffff',
      accent: '#fbbf24',
      border: '#1e293b',
      cardBackground: '#0f172a',
      success: '#166534',
      error: '#991b1b',
    },
    fonts: {
      heading: 'Inter, system-ui, -apple-system, sans-serif',
      body: 'Inter, system-ui, -apple-system, sans-serif',
    },
  },
}

export const themeList = Object.values(themes)

export const defaultTheme = 'classic'
