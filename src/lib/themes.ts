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
    name: 'Classic',
    description: 'Clean & simple, black text on white',
    colors: {
      background: '#ffffff',
      backgroundSecondary: '#f5f5f5',
      text: '#1a1a1a',
      textMuted: '#1a1a1a',
      primary: '#1a1a1a',
      primaryHover: '#374151',
      primaryText: '#ffffff',
      accent: '#1a1a1a',
      border: '#d1d5db',
      cardBackground: '#ffffff',
      success: '#dcfce7',
      error: '#fee2e2',
    },
    fonts: {
      heading: 'system-ui, -apple-system, sans-serif',
      body: 'system-ui, -apple-system, sans-serif',
    },
  },
  mansion: {
    id: 'mansion',
    name: 'Old Mansion',
    description: 'Dark wood, burgundy & gold, gothic elegance',
    colors: {
      background: '#1a1412',
      backgroundSecondary: '#2d2320',
      text: '#f4e8dc',
      textMuted: '#a89080',
      primary: '#8b0000',
      primaryHover: '#a52a2a',
      primaryText: '#f4e8dc',
      accent: '#d4af37',
      border: '#4a3c35',
      cardBackground: '#2d2320',
      success: '#2d5a27',
      error: '#8b0000',
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Georgia, serif',
    },
  },
  library: {
    id: 'library',
    name: 'Ancient Library',
    description: 'Deep greens & browns, scholarly wisdom',
    colors: {
      background: '#1c1e1a',
      backgroundSecondary: '#2a2e25',
      text: '#e8e4d9',
      textMuted: '#9a9680',
      primary: '#2d4a3e',
      primaryHover: '#3d5a4e',
      primaryText: '#e8e4d9',
      accent: '#c9a959',
      border: '#3d4035',
      cardBackground: '#2a2e25',
      success: '#2d4a3e',
      error: '#6b3030',
    },
    fonts: {
      heading: 'Palatino Linotype, serif',
      body: 'Palatino Linotype, serif',
    },
  },
  school: {
    id: 'school',
    name: 'Victorian School',
    description: 'Navy & cream, classic academic',
    colors: {
      background: '#0f1419',
      backgroundSecondary: '#1a2332',
      text: '#f5f0e6',
      textMuted: '#8a9aaa',
      primary: '#1e3a5f',
      primaryHover: '#2e4a6f',
      primaryText: '#f5f0e6',
      accent: '#c9a227',
      border: '#2a3a4a',
      cardBackground: '#1a2332',
      success: '#1e4a3a',
      error: '#5a2a2a',
    },
    fonts: {
      heading: 'Times New Roman, serif',
      body: 'Times New Roman, serif',
    },
  },
  study: {
    id: 'study',
    name: 'Secret Study',
    description: 'Deep purple & gold, mysterious allure',
    colors: {
      background: '#140f1a',
      backgroundSecondary: '#1f1728',
      text: '#e8e0f0',
      textMuted: '#9080a0',
      primary: '#4a2c6a',
      primaryHover: '#5a3c7a',
      primaryText: '#e8e0f0',
      accent: '#d4a844',
      border: '#3a2a4a',
      cardBackground: '#1f1728',
      success: '#2a4a3a',
      error: '#5a2a3a',
    },
    fonts: {
      heading: 'Garamond, serif',
      body: 'Garamond, serif',
    },
  },
}

export const themeList = Object.values(themes)

export const defaultTheme = 'classic'
