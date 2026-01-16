export interface Answer {
  text: string
  teaching: string
  reflectionQuestion: string
  reflectionAnswers: { A: string; B: string; C: string }
  reflectionCorrect: 'A' | 'B' | 'C'
  reflectionWrongMessages: { A: string; B: string; C: string }
}

export interface Question {
  id: number
  checkpoint: number
  title: string
  question: string
  imageUrl?: string
  answers: { A: Answer; B: Answer; C: Answer }
  correct: 'A' | 'B' | 'C'
  correctMessage: string
}

export interface CheckpointLetter {
  letter: string
  message: string
}

export interface CustomThemeBackgrounds {
  default?: string | null
  nameEntry?: string | null
  welcome?: string | null
  hub?: string | null
  question?: string | null
  correct?: string | null
  teaching?: string | null
  reflection?: string | null
  reflectionWrong?: string | null
}

export interface GameContent {
  questions: Question[]
  letters: CheckpointLetter[]
  theme?: string
  backgroundImage?: string
  welcomeMessage?: string
  customThemeId?: string
  customThemeBackgrounds?: CustomThemeBackgrounds
  finalWord?: string
  finalClue?: string
}

export type AnswerKey = 'A' | 'B' | 'C'

export type Screen =
  | 'start'
  | 'welcome'
  | 'hub'
  | 'question'
  | 'teaching'
  | 'reflection'
  | 'letter-reveal'
  | 'final-lock'
  | 'escaped'

export interface GameState {
  currentScreen: Screen
  gameContent: GameContent | null
  currentQuestionId: number
  completedQuestions: number[]
  unlockedLetters: CheckpointLetter[]
  currentWrongAnswer: AnswerKey | null
  answerOrder: Record<number, AnswerKey[]>
  lockClickOrder: string[]
}
