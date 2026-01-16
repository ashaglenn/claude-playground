'use client'

import { useGame } from '@/context/GameContext'
import { useTheme } from '@/context/ThemeContext'

export default function GameHub() {
  const { state, dispatch, isCheckpointComplete, isCheckpointUnlocked, allCheckpointsComplete } = useGame()
  const { themeId, getBackgroundForScreen } = useTheme()
  const isClassicTheme = themeId === 'classic'
  const hasBackground = !!getBackgroundForScreen('hub')

  const handleCheckpointClick = (checkpoint: number) => {
    if (!isCheckpointUnlocked(checkpoint)) return
    if (isCheckpointComplete(checkpoint)) return

    // Find all questions for this checkpoint from game content
    const checkpointQuestions = state.gameContent?.questions
      .filter(q => q.checkpoint === checkpoint)
      .map(q => q.id) || []

    const firstIncomplete = checkpointQuestions.find(q => !state.completedQuestions.includes(q))

    if (firstIncomplete) {
      dispatch({ type: 'GO_TO_QUESTION', questionId: firstIncomplete })
    }
  }

  const handleFinalLock = () => {
    if (allCheckpointsComplete()) {
      dispatch({ type: 'GO_TO_FINAL_LOCK' })
    }
  }

  const handleNewGame = () => {
    localStorage.removeItem('escape-room-state')
    dispatch({ type: 'RESET_GAME' })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className={`text-3xl font-bold ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`} style={{ fontFamily: 'var(--theme-font-heading)' }}>
        Game Hub
      </h1>
      <p className={isClassicTheme && hasBackground ? 'text-highlight' : ''} style={{ color: 'var(--theme-text-muted)' }}>
        Complete all checkpoints to unlock the final lock
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
        {Array.from({ length: state.gameContent?.letters.length || 3 }, (_, i) => i + 1).map(checkpoint => {
          const unlocked = isCheckpointUnlocked(checkpoint)
          const complete = isCheckpointComplete(checkpoint)
          const letter = state.unlockedLetters[checkpoint - 1]

          return (
            <button
              key={checkpoint}
              onClick={() => handleCheckpointClick(checkpoint)}
              disabled={!unlocked || complete}
              className="flex h-32 w-32 flex-col items-center justify-center rounded-lg border-2 transition-all"
              style={{
                borderColor: complete
                  ? 'var(--theme-success)'
                  : unlocked
                  ? 'var(--theme-border)'
                  : 'var(--theme-border)',
                backgroundColor: complete
                  ? 'var(--theme-success)'
                  : unlocked
                  ? 'var(--theme-card-background)'
                  : 'var(--theme-background-secondary)',
                color: complete
                  ? 'var(--theme-text)'
                  : unlocked
                  ? 'var(--theme-text)'
                  : 'var(--theme-text-muted)',
                cursor: !unlocked || complete ? 'not-allowed' : 'pointer',
                opacity: !unlocked ? 0.6 : 1,
              }}
            >
              <span className="text-sm font-medium">Checkpoint {checkpoint}</span>
              {complete && letter && (
                <span className="mt-2 text-3xl font-bold" style={{ color: 'var(--theme-accent)' }}>
                  {letter.letter}
                </span>
              )}
              {!complete && unlocked && (
                <span className="mt-2 text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                  Click to start
                </span>
              )}
              {!unlocked && (
                <span className="mt-2 text-xs">Locked</span>
              )}
            </button>
          )
        })}
      </div>

      <button
        onClick={handleFinalLock}
        disabled={!allCheckpointsComplete()}
        className="mt-4 rounded-lg px-8 py-4 text-lg font-medium transition-colors"
        style={{
          backgroundColor: allCheckpointsComplete()
            ? 'var(--theme-primary)'
            : 'var(--theme-background-secondary)',
          color: allCheckpointsComplete()
            ? 'var(--theme-primary-text)'
            : 'var(--theme-text-muted)',
          cursor: allCheckpointsComplete() ? 'pointer' : 'not-allowed',
        }}
      >
        {allCheckpointsComplete() ? 'Open Final Lock' : 'Complete all checkpoints to unlock'}
      </button>

      <button
        onClick={handleNewGame}
        className={`mt-4 text-sm underline ${isClassicTheme && hasBackground ? 'text-highlight' : ''}`}
        style={{ color: 'var(--theme-text-muted)' }}
      >
        Start New Game
      </button>
    </div>
  )
}
