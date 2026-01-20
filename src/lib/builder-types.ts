import { GameContent, Question, CheckpointLetter, AnswerKey, CustomThemeBackgrounds, QuestionType, HotspotRegion, isHotspotQuestion, isDragDropQuestion, isFillBlankQuestion } from './types'

export interface ReflectionData {
  question: string
  answers: { A: string; B: string; C: string }
  correct: AnswerKey
  wrongMessages: { A: string; B: string; C: string }
}

export interface AnswerData {
  text: string
  teaching: string
  reflection: ReflectionData
}

// Multiple choice question data (builder format)
export interface MultipleChoiceQuestionData {
  type: 'multiple-choice'
  title: string
  question: string
  imageUrl?: string
  answers: {
    A: AnswerData
    B: AnswerData
    C: AnswerData
  }
  correct: AnswerKey
  correctMessage: string
}

// Hotspot question data (builder format)
export interface HotspotQuestionData {
  type: 'hotspot'
  title: string
  question: string
  imageUrl?: string
  hotspotRegion?: HotspotRegion
  correctMessage: string
  incorrectMessage: string
  labeledImageUrl?: string
}

// Drag and drop question data (builder format)
export interface DragDropQuestionData {
  type: 'drag-drop'
  title: string
  question: string
  imageUrl?: string
  sentence: string
  correctWords: string[]
  distractorWords: string[]
  correctMessage: string
  incorrectMessage: string
}

// Fill in the blank question data (builder format)
export interface FillBlankQuestionData {
  type: 'fill-blank'
  title: string
  question: string
  imageUrl?: string
  sentence: string
  correctAnswer: string
  correctMessage: string
  incorrectMessage: string
}

// Legacy question data (no type field)
export interface LegacyQuestionData {
  type?: undefined
  title: string
  question: string
  imageUrl?: string
  answers: {
    A: AnswerData
    B: AnswerData
    C: AnswerData
  }
  correct: AnswerKey
  correctMessage: string
}

// Union type for all question data types
export type QuestionData = MultipleChoiceQuestionData | HotspotQuestionData | DragDropQuestionData | FillBlankQuestionData | LegacyQuestionData

// Type guard functions for builder data
export function isMultipleChoiceQuestionData(q: QuestionData): q is MultipleChoiceQuestionData | LegacyQuestionData {
  return !q.type || q.type === 'multiple-choice'
}

export function isHotspotQuestionData(q: QuestionData): q is HotspotQuestionData {
  return q.type === 'hotspot'
}

export function isDragDropQuestionData(q: QuestionData): q is DragDropQuestionData {
  return q.type === 'drag-drop'
}

export function isFillBlankQuestionData(q: QuestionData): q is FillBlankQuestionData {
  return q.type === 'fill-blank'
}

export interface CheckpointData {
  letter: string
  letterMessage: string
  questions: QuestionData[]
}

export interface BuilderState {
  title: string
  theme: string
  backgroundImage?: string
  welcomeMessage: string
  customThemeId?: string
  customThemeBackgrounds?: CustomThemeBackgrounds
  checkpoints: CheckpointData[]
  finalWord: string
  finalClue: string
}

// Factory functions for creating empty question data

export function createEmptyReflection(): ReflectionData {
  return {
    question: '',
    answers: { A: '', B: '', C: '' },
    correct: 'A',
    wrongMessages: { A: '', B: '', C: '' },
  }
}

export function createEmptyAnswer(): AnswerData {
  return {
    text: '',
    teaching: '',
    reflection: createEmptyReflection(),
  }
}

export function createEmptyMultipleChoiceQuestion(checkpointNum: number, questionNum: number): MultipleChoiceQuestionData {
  return {
    type: 'multiple-choice',
    title: `Checkpoint ${checkpointNum} - Question ${questionNum}`,
    question: '',
    imageUrl: undefined,
    answers: {
      A: createEmptyAnswer(),
      B: createEmptyAnswer(),
      C: createEmptyAnswer(),
    },
    correct: 'A',
    correctMessage: '',
  }
}

export function createEmptyHotspotQuestion(checkpointNum: number, questionNum: number): HotspotQuestionData {
  return {
    type: 'hotspot',
    title: `Checkpoint ${checkpointNum} - Question ${questionNum}`,
    question: '',
    imageUrl: undefined,
    hotspotRegion: undefined,
    correctMessage: '',
    incorrectMessage: '',
    labeledImageUrl: undefined,
  }
}

export function createEmptyDragDropQuestion(checkpointNum: number, questionNum: number): DragDropQuestionData {
  return {
    type: 'drag-drop',
    title: `Checkpoint ${checkpointNum} - Question ${questionNum}`,
    question: '',
    imageUrl: undefined,
    sentence: '',
    correctWords: [],
    distractorWords: [],
    correctMessage: '',
    incorrectMessage: '',
  }
}

export function createEmptyFillBlankQuestion(checkpointNum: number, questionNum: number): FillBlankQuestionData {
  return {
    type: 'fill-blank',
    title: `Checkpoint ${checkpointNum} - Question ${questionNum}`,
    question: '',
    imageUrl: undefined,
    sentence: '',
    correctAnswer: '',
    correctMessage: '',
    incorrectMessage: '',
  }
}

// Create an empty question of a specific type
export function createEmptyQuestion(checkpointNum: number, questionNum: number, questionType: QuestionType = 'multiple-choice'): QuestionData {
  switch (questionType) {
    case 'hotspot':
      return createEmptyHotspotQuestion(checkpointNum, questionNum)
    case 'drag-drop':
      return createEmptyDragDropQuestion(checkpointNum, questionNum)
    case 'fill-blank':
      return createEmptyFillBlankQuestion(checkpointNum, questionNum)
    case 'multiple-choice':
    default:
      return createEmptyMultipleChoiceQuestion(checkpointNum, questionNum)
  }
}

// Create an empty checkpoint
export function createEmptyCheckpoint(num: number, questionsPerCheckpoint: number = 4): CheckpointData {
  return {
    letter: '',
    letterMessage: `Great job completing Checkpoint ${num}!`,
    questions: Array.from({ length: questionsPerCheckpoint }, (_, i) => createEmptyMultipleChoiceQuestion(num, i + 1)),
  }
}

// Create empty builder state with configurable checkpoints
export function createEmptyBuilderState(numCheckpoints: number = 3, questionsPerCheckpoint: number = 4): BuilderState {
  return {
    title: '',
    theme: 'classic',
    welcomeMessage: '',
    checkpoints: Array.from({ length: numCheckpoints }, (_, i) => createEmptyCheckpoint(i + 1, questionsPerCheckpoint)),
    finalWord: '',
    finalClue: '',
  }
}

// Convert BuilderState to GameContent for saving
export function builderStateToGameContent(state: BuilderState): GameContent {
  const questions: Question[] = []
  let questionId = 1

  for (let cp = 0; cp < state.checkpoints.length; cp++) {
    const checkpoint = state.checkpoints[cp]
    for (const q of checkpoint.questions) {
      const baseQuestion = {
        id: questionId,
        checkpoint: cp + 1,
        title: q.title,
        question: q.question,
        imageUrl: q.imageUrl,
        correctMessage: q.correctMessage,
      }

      if (isHotspotQuestionData(q)) {
        questions.push({
          ...baseQuestion,
          type: 'hotspot',
          imageUrl: q.imageUrl || '',
          hotspotRegion: q.hotspotRegion || { type: 'rectangle', coords: [0, 0, 100, 100] },
          incorrectMessage: q.incorrectMessage,
          labeledImageUrl: q.labeledImageUrl,
        })
      } else if (isDragDropQuestionData(q)) {
        questions.push({
          ...baseQuestion,
          type: 'drag-drop',
          sentence: q.sentence,
          correctWords: q.correctWords,
          distractorWords: q.distractorWords,
          incorrectMessage: q.incorrectMessage,
        })
      } else if (isFillBlankQuestionData(q)) {
        questions.push({
          ...baseQuestion,
          type: 'fill-blank',
          sentence: q.sentence,
          correctAnswer: q.correctAnswer,
          incorrectMessage: q.incorrectMessage,
        })
      } else {
        // Multiple choice or legacy question
        const mcq = q as MultipleChoiceQuestionData | LegacyQuestionData
        questions.push({
          ...baseQuestion,
          type: 'multiple-choice',
          answers: {
            A: {
              text: mcq.answers.A.text,
              teaching: mcq.answers.A.teaching,
              reflectionQuestion: mcq.answers.A.reflection.question,
              reflectionAnswers: mcq.answers.A.reflection.answers,
              reflectionCorrect: mcq.answers.A.reflection.correct,
              reflectionWrongMessages: mcq.answers.A.reflection.wrongMessages,
            },
            B: {
              text: mcq.answers.B.text,
              teaching: mcq.answers.B.teaching,
              reflectionQuestion: mcq.answers.B.reflection.question,
              reflectionAnswers: mcq.answers.B.reflection.answers,
              reflectionCorrect: mcq.answers.B.reflection.correct,
              reflectionWrongMessages: mcq.answers.B.reflection.wrongMessages,
            },
            C: {
              text: mcq.answers.C.text,
              teaching: mcq.answers.C.teaching,
              reflectionQuestion: mcq.answers.C.reflection.question,
              reflectionAnswers: mcq.answers.C.reflection.answers,
              reflectionCorrect: mcq.answers.C.reflection.correct,
              reflectionWrongMessages: mcq.answers.C.reflection.wrongMessages,
            },
          },
          correct: mcq.correct,
        })
      }
      questionId++
    }
  }

  const letters: CheckpointLetter[] = state.checkpoints.map(cp => ({
    letter: cp.letter,
    message: cp.letterMessage,
  }))

  return {
    questions,
    letters,
    theme: state.theme,
    backgroundImage: state.backgroundImage,
    welcomeMessage: state.welcomeMessage || undefined,
    customThemeId: state.customThemeId,
    customThemeBackgrounds: state.customThemeBackgrounds,
    finalWord: state.finalWord || undefined,
    finalClue: state.finalClue || undefined,
  }
}

// Helper to convert old single message format to new format
function getWrongMessages(answer: any): { A: string; B: string; C: string } {
  if (answer.reflectionWrongMessages) {
    return answer.reflectionWrongMessages
  }
  // Old format: single message - use it for all wrong answers
  const msg = answer.reflectionWrongMessage || ''
  return { A: msg, B: msg, C: msg }
}

// Convert a single question from GameContent to QuestionData
function convertQuestionToBuilderData(q: Question): QuestionData {
  if (isHotspotQuestion(q)) {
    return {
      type: 'hotspot',
      title: q.title,
      question: q.question,
      imageUrl: q.imageUrl,
      hotspotRegion: q.hotspotRegion,
      correctMessage: q.correctMessage,
      incorrectMessage: q.incorrectMessage,
      labeledImageUrl: q.labeledImageUrl,
    }
  }

  if (isDragDropQuestion(q)) {
    return {
      type: 'drag-drop',
      title: q.title,
      question: q.question,
      imageUrl: q.imageUrl,
      sentence: q.sentence,
      correctWords: q.correctWords,
      distractorWords: q.distractorWords,
      correctMessage: q.correctMessage,
      incorrectMessage: q.incorrectMessage,
    }
  }

  if (isFillBlankQuestion(q)) {
    return {
      type: 'fill-blank',
      title: q.title,
      question: q.question,
      imageUrl: q.imageUrl,
      sentence: q.sentence,
      correctAnswer: q.correctAnswer,
      correctMessage: q.correctMessage,
      incorrectMessage: q.incorrectMessage,
    }
  }

  // Multiple choice or legacy question
  const mcq = q as any
  return {
    type: 'multiple-choice',
    title: q.title,
    question: q.question,
    imageUrl: q.imageUrl,
    answers: {
      A: {
        text: mcq.answers.A.text,
        teaching: mcq.answers.A.teaching,
        reflection: {
          question: mcq.answers.A.reflectionQuestion,
          answers: mcq.answers.A.reflectionAnswers,
          correct: mcq.answers.A.reflectionCorrect,
          wrongMessages: getWrongMessages(mcq.answers.A),
        },
      },
      B: {
        text: mcq.answers.B.text,
        teaching: mcq.answers.B.teaching,
        reflection: {
          question: mcq.answers.B.reflectionQuestion,
          answers: mcq.answers.B.reflectionAnswers,
          correct: mcq.answers.B.reflectionCorrect,
          wrongMessages: getWrongMessages(mcq.answers.B),
        },
      },
      C: {
        text: mcq.answers.C.text,
        teaching: mcq.answers.C.teaching,
        reflection: {
          question: mcq.answers.C.reflectionQuestion,
          answers: mcq.answers.C.reflectionAnswers,
          correct: mcq.answers.C.reflectionCorrect,
          wrongMessages: getWrongMessages(mcq.answers.C),
        },
      },
    },
    correct: mcq.correct,
    correctMessage: q.correctMessage,
  }
}

// Convert GameContent back to BuilderState for editing
export function gameContentToBuilderState(content: GameContent, title: string): BuilderState {
  const theme = content.theme || 'classic'
  const backgroundImage = content.backgroundImage
  const welcomeMessage = content.welcomeMessage || ''
  const customThemeId = content.customThemeId
  const customThemeBackgrounds = content.customThemeBackgrounds

  // Dynamically determine number of checkpoints from the letters array
  const numCheckpoints = content.letters.length || 3

  const checkpoints: CheckpointData[] = Array.from({ length: numCheckpoints }, (_, cpIndex) => {
    const cpNum = cpIndex + 1
    const cpQuestions = content.questions.filter(q => q.checkpoint === cpNum)
    const letter = content.letters[cpIndex] || { letter: '', message: '' }

    return {
      letter: letter.letter,
      letterMessage: letter.message,
      questions: cpQuestions.map(q => convertQuestionToBuilderData(q)),
    }
  })

  const finalWord = content.finalWord || ''
  const finalClue = content.finalClue || ''

  return { title, theme, backgroundImage, welcomeMessage, customThemeId, customThemeBackgrounds, checkpoints, finalWord, finalClue }
}
