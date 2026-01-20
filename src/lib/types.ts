export interface Answer {
  text: string
  teaching: string
  reflectionQuestion: string
  reflectionAnswers: { A: string; B: string; C: string }
  reflectionCorrect: 'A' | 'B' | 'C'
  reflectionWrongMessages: { A: string; B: string; C: string }
}

// Question type discriminator
export type QuestionType = 'multiple-choice' | 'hotspot' | 'drag-drop' | 'fill-blank'

// Base question interface shared by all question types
interface BaseQuestion {
  id: number
  checkpoint: number
  title: string
  question: string
  imageUrl?: string
  correctMessage: string
}

// Traditional multiple choice question
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice'
  answers: { A: Answer; B: Answer; C: Answer }
  correct: 'A' | 'B' | 'C'
}

// Hotspot region definition
export interface HotspotRegion {
  type: 'rectangle' | 'circle' | 'polygon'
  // Rectangle: [x, y, width, height] (percentages 0-100)
  // Circle: [cx, cy, radius] (percentages 0-100)
  // Polygon: [x1, y1, x2, y2, ...] (percentage pairs)
  coords: number[]
}

// Hotspot question - click on correct region of image
export interface HotspotQuestion extends BaseQuestion {
  type: 'hotspot'
  imageUrl: string  // Required for hotspot
  hotspotRegion: HotspotRegion
  incorrectMessage: string
  labeledImageUrl?: string  // Optional image with labels shown when wrong
}

// Drag and drop question - drag words into blanks
export interface DragDropQuestion extends BaseQuestion {
  type: 'drag-drop'
  sentence: string  // With [BLANK] placeholders
  correctWords: string[]  // Words that go in blanks (in order)
  distractorWords: string[]  // Extra words that don't belong
  incorrectMessage: string
}

// Fill in the blank question - type a word
export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank'
  sentence: string  // With [BLANK] placeholder
  correctAnswer: string
  incorrectMessage: string
}

// Legacy question interface (for backward compatibility during migration)
export interface LegacyQuestion {
  id: number
  checkpoint: number
  title: string
  question: string
  imageUrl?: string
  answers: { A: Answer; B: Answer; C: Answer }
  correct: 'A' | 'B' | 'C'
  correctMessage: string
  type?: undefined
}

// Union type for all question types
export type Question = MultipleChoiceQuestion | HotspotQuestion | DragDropQuestion | FillBlankQuestion | LegacyQuestion

// Type guard functions
export function isMultipleChoiceQuestion(q: Question): q is MultipleChoiceQuestion | LegacyQuestion {
  return !q.type || q.type === 'multiple-choice'
}

export function isHotspotQuestion(q: Question): q is HotspotQuestion {
  return q.type === 'hotspot'
}

export function isDragDropQuestion(q: Question): q is DragDropQuestion {
  return q.type === 'drag-drop'
}

export function isFillBlankQuestion(q: Question): q is FillBlankQuestion {
  return q.type === 'fill-blank'
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
