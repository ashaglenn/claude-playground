import { GameContent, Question, CheckpointLetter, AnswerKey, CustomThemeBackgrounds } from './types'

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

export interface QuestionData {
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
}

// Create an empty checkpoint
export function createEmptyCheckpoint(num: number, questionsPerCheckpoint: number = 4): CheckpointData {
  const createEmptyReflection = (): ReflectionData => ({
    question: '',
    answers: { A: '', B: '', C: '' },
    correct: 'A',
    wrongMessages: { A: '', B: '', C: '' },
  })

  const createEmptyAnswer = (): AnswerData => ({
    text: '',
    teaching: '',
    reflection: createEmptyReflection(),
  })

  const createEmptyQuestion = (checkpointNum: number, questionNum: number): QuestionData => ({
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
  })

  return {
    letter: '',
    letterMessage: `Great job completing Checkpoint ${num}!`,
    questions: Array.from({ length: questionsPerCheckpoint }, (_, i) => createEmptyQuestion(num, i + 1)),
  }
}

// Create empty builder state with configurable checkpoints
export function createEmptyBuilderState(numCheckpoints: number = 3, questionsPerCheckpoint: number = 4): BuilderState {
  return {
    title: '',
    theme: 'classic',
    welcomeMessage: '',
    checkpoints: Array.from({ length: numCheckpoints }, (_, i) => createEmptyCheckpoint(i + 1, questionsPerCheckpoint)),
  }
}

// Convert BuilderState to GameContent for saving
export function builderStateToGameContent(state: BuilderState): GameContent {
  const questions: Question[] = []
  let questionId = 1

  for (let cp = 0; cp < state.checkpoints.length; cp++) {
    const checkpoint = state.checkpoints[cp]
    for (const q of checkpoint.questions) {
      questions.push({
        id: questionId,
        checkpoint: cp + 1,
        title: q.title,
        question: q.question,
        imageUrl: q.imageUrl,
        answers: {
          A: {
            text: q.answers.A.text,
            teaching: q.answers.A.teaching,
            reflectionQuestion: q.answers.A.reflection.question,
            reflectionAnswers: q.answers.A.reflection.answers,
            reflectionCorrect: q.answers.A.reflection.correct,
            reflectionWrongMessages: q.answers.A.reflection.wrongMessages,
          },
          B: {
            text: q.answers.B.text,
            teaching: q.answers.B.teaching,
            reflectionQuestion: q.answers.B.reflection.question,
            reflectionAnswers: q.answers.B.reflection.answers,
            reflectionCorrect: q.answers.B.reflection.correct,
            reflectionWrongMessages: q.answers.B.reflection.wrongMessages,
          },
          C: {
            text: q.answers.C.text,
            teaching: q.answers.C.teaching,
            reflectionQuestion: q.answers.C.reflection.question,
            reflectionAnswers: q.answers.C.reflection.answers,
            reflectionCorrect: q.answers.C.reflection.correct,
            reflectionWrongMessages: q.answers.C.reflection.wrongMessages,
          },
        },
        correct: q.correct,
        correctMessage: q.correctMessage,
      })
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
      questions: cpQuestions.map(q => ({
        title: q.title,
        question: q.question,
        imageUrl: q.imageUrl,
        answers: {
          A: {
            text: q.answers.A.text,
            teaching: q.answers.A.teaching,
            reflection: {
              question: q.answers.A.reflectionQuestion,
              answers: q.answers.A.reflectionAnswers,
              correct: q.answers.A.reflectionCorrect,
              wrongMessages: getWrongMessages(q.answers.A),
            },
          },
          B: {
            text: q.answers.B.text,
            teaching: q.answers.B.teaching,
            reflection: {
              question: q.answers.B.reflectionQuestion,
              answers: q.answers.B.reflectionAnswers,
              correct: q.answers.B.reflectionCorrect,
              wrongMessages: getWrongMessages(q.answers.B),
            },
          },
          C: {
            text: q.answers.C.text,
            teaching: q.answers.C.teaching,
            reflection: {
              question: q.answers.C.reflectionQuestion,
              answers: q.answers.C.reflectionAnswers,
              correct: q.answers.C.reflectionCorrect,
              wrongMessages: getWrongMessages(q.answers.C),
            },
          },
        },
        correct: q.correct,
        correctMessage: q.correctMessage,
      })),
    }
  })

  return { title, theme, backgroundImage, welcomeMessage, customThemeId, customThemeBackgrounds, checkpoints }
}
