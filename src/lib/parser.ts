import { GameContent, Question, Answer, CheckpointLetter, AnswerKey, QuizContent, QuestionType } from './types'

function getLine(lines: string[], prefix: string): string {
  const line = lines.find(l => l.toUpperCase().startsWith(prefix.toUpperCase()))
  return line ? line.slice(prefix.length).trim() : ''
}

function getLineValue(lines: string[], prefix: string): string {
  const line = lines.find(l => l.toUpperCase().startsWith(prefix.toUpperCase()))
  if (!line) return ''
  const colonIndex = line.indexOf(':')
  return colonIndex >= 0 ? line.slice(colonIndex + 1).trim() : ''
}

function getAnswerText(lines: string[], key: AnswerKey): string {
  // Match patterns like "A. text", "A.text", "A: text", "A text"
  const patterns = [
    new RegExp(`^${key}\\.\\s*(.+)$`),  // A. text or A.text
    new RegExp(`^${key}:\\s*(.+)$`),     // A: text
    new RegExp(`^${key}\\)\\s*(.+)$`),   // A) text
  ]

  for (const line of lines) {
    // Skip lines that are WRONG_X_REFLECTION_A/B/C patterns
    if (line.includes('WRONG_') && line.includes('REFLECTION_')) continue

    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) return match[1].trim()
    }
  }
  return ''
}

function parseAnswer(lines: string[], key: AnswerKey): Answer {
  const prefix = `WRONG_${key}_`
  // For backwards compatibility, use the single wrong message for all wrong answers
  const singleWrongMsg = getLine(lines, `${prefix}REFLECTION_WRONG_MSG:`)
  return {
    text: getAnswerText(lines, key),
    teaching: getLine(lines, `${prefix}TEACHING:`),
    reflectionQuestion: getLine(lines, `${prefix}REFLECTION_Q:`),
    reflectionAnswers: {
      A: getLine(lines, `${prefix}REFLECTION_A:`),
      B: getLine(lines, `${prefix}REFLECTION_B:`),
      C: getLine(lines, `${prefix}REFLECTION_C:`),
    },
    reflectionCorrect: getLine(lines, `${prefix}REFLECTION_CORRECT:`) as AnswerKey || 'A',
    reflectionWrongMessages: {
      A: singleWrongMsg,
      B: singleWrongMsg,
      C: singleWrongMsg,
    },
  }
}

function parseQuestion(block: string, questionId: number): Question {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l)

  const headerMatch = block.match(/CHECKPOINT\s+(\d+)\s*-\s*DECISION\s+(\d+)/i)
  const checkpoint = headerMatch ? parseInt(headerMatch[1]) : Math.ceil(questionId / 4)

  return {
    id: questionId,
    checkpoint,
    title: getLine(lines, 'TITLE:'),
    question: getLine(lines, 'QUESTION:'),
    answers: {
      A: parseAnswer(lines, 'A'),
      B: parseAnswer(lines, 'B'),
      C: parseAnswer(lines, 'C'),
    },
    correct: getLine(lines, 'CORRECT:') as AnswerKey || 'A',
    correctMessage: getLine(lines, 'CORRECT_MESSAGE:'),
  }
}

function parseLetters(content: string): CheckpointLetter[] {
  const letters: CheckpointLetter[] = []
  const lines = content.split('\n')

  for (let i = 1; i <= 3; i++) {
    const letterLine = lines.find(l => l.trim().startsWith(`LETTER_${i}:`))
    const messageLine = lines.find(l => l.trim().startsWith(`LETTER_${i}_MESSAGE:`))

    if (letterLine) {
      letters.push({
        letter: letterLine.split(':')[1]?.trim() || '',
        message: messageLine?.split(':').slice(1).join(':').trim() || '',
      })
    }
  }

  return letters
}

export function parseGameFile(content: string): GameContent {
  const blocks = content.split(/(?=CHECKPOINT\s+\d+\s*-\s*DECISION\s+\d+)/)
  const questionBlocks = blocks.filter(b => /^CHECKPOINT\s+\d+\s*-\s*DECISION/.test(b))

  const questions: Question[] = questionBlocks.map((block, index) =>
    parseQuestion(block, index + 1)
  )

  const letters = parseLetters(content)

  return { questions, letters }
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function generateAnswerOrders(questionCount: number): Record<number, AnswerKey[]> {
  const orders: Record<number, AnswerKey[]> = {}
  for (let i = 1; i <= questionCount; i++) {
    orders[i] = shuffleArray(['A', 'B', 'C'] as AnswerKey[])
  }
  return orders
}

// ============================================
// Enhanced parser for all question types
// ============================================

function getQuestionType(lines: string[]): QuestionType {
  const typeLine = getLineValue(lines, 'TYPE:').toLowerCase()
  if (typeLine.includes('hotspot') || typeLine.includes('click')) return 'hotspot'
  if (typeLine.includes('drag') || typeLine.includes('drop')) return 'drag-drop'
  if (typeLine.includes('fill') || typeLine.includes('blank')) return 'fill-blank'
  return 'multiple-choice'
}

function getCorrectAnswer(lines: string[]): AnswerKey {
  // Check for * marker on answer lines
  for (const key of ['A', 'B', 'C'] as AnswerKey[]) {
    const patterns = [
      new RegExp(`^${key}[.:\\)]\\s*.+\\s*\\*\\s*$`, 'i'),  // A. text * or A: text*
      new RegExp(`^${key}[.:\\)]\\s*\\*\\s*.+$`, 'i'),      // A. * text
    ]
    for (const line of lines) {
      for (const pattern of patterns) {
        if (pattern.test(line.trim())) return key
      }
    }
  }
  // Fall back to CORRECT: line
  const correct = getLineValue(lines, 'CORRECT:').toUpperCase()
  if (correct === 'A' || correct === 'B' || correct === 'C') return correct
  return 'A'
}

function getAnswerTextEnhanced(lines: string[], key: AnswerKey): string {
  const patterns = [
    new RegExp(`^${key}\\.\\s*\\*?\\s*(.+?)\\s*\\*?\\s*$`, 'i'),  // A. text or A. *text*
    new RegExp(`^${key}:\\s*\\*?\\s*(.+?)\\s*\\*?\\s*$`, 'i'),     // A: text
    new RegExp(`^${key}\\)\\s*\\*?\\s*(.+?)\\s*\\*?\\s*$`, 'i'),   // A) text
  ]

  for (const line of lines) {
    if (line.toUpperCase().includes('WRONG_') && line.toUpperCase().includes('REFLECTION_')) continue

    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) {
        // Remove asterisk markers used to indicate correct answer
        return match[1].replace(/\s*\*\s*/g, '').trim()
      }
    }
  }
  return ''
}

function parseMultipleChoiceQuestion(lines: string[], questionId: number, checkpoint: number): Question {
  const correct = getCorrectAnswer(lines)

  // For simple quiz format, create minimal Answer objects
  const createSimpleAnswer = (key: AnswerKey): Answer => ({
    text: getAnswerTextEnhanced(lines, key),
    teaching: getLineValue(lines, `WRONG_${key}_TEACHING:`) || getLineValue(lines, `INCORRECT_MESSAGE:`) || '',
    reflectionQuestion: '',
    reflectionAnswers: { A: '', B: '', C: '' },
    reflectionCorrect: 'A',
    reflectionWrongMessages: { A: '', B: '', C: '' },
  })

  return {
    type: 'multiple-choice',
    id: questionId,
    checkpoint,
    title: getLineValue(lines, 'TITLE:') || `Question ${questionId}`,
    question: getLineValue(lines, 'QUESTION:') || getQuestionText(lines),
    imageUrl: getLineValue(lines, 'IMAGE:') || undefined,
    answers: {
      A: createSimpleAnswer('A'),
      B: createSimpleAnswer('B'),
      C: createSimpleAnswer('C'),
    },
    correct,
    correctMessage: getLineValue(lines, 'CORRECT_MESSAGE:') || 'Correct!',
  }
}

function parseFillBlankQuestion(lines: string[], questionId: number, checkpoint: number): Question {
  return {
    type: 'fill-blank',
    id: questionId,
    checkpoint,
    title: getLineValue(lines, 'TITLE:') || `Question ${questionId}`,
    question: getLineValue(lines, 'QUESTION:') || getQuestionText(lines),
    imageUrl: getLineValue(lines, 'IMAGE:') || undefined,
    sentence: getLineValue(lines, 'SENTENCE:'),
    correctAnswer: getLineValue(lines, 'ANSWER:'),
    correctMessage: getLineValue(lines, 'CORRECT_MESSAGE:') || 'Correct!',
    incorrectMessage: getLineValue(lines, 'INCORRECT_MESSAGE:') || 'Try again.',
  }
}

function parseDragDropQuestion(lines: string[], questionId: number, checkpoint: number): Question {
  const correctWordsRaw = getLineValue(lines, 'CORRECT_WORDS:')
  const distractorWordsRaw = getLineValue(lines, 'DISTRACTOR_WORDS:')

  return {
    type: 'drag-drop',
    id: questionId,
    checkpoint,
    title: getLineValue(lines, 'TITLE:') || `Question ${questionId}`,
    question: getLineValue(lines, 'QUESTION:') || getQuestionText(lines),
    imageUrl: getLineValue(lines, 'IMAGE:') || undefined,
    sentence: getLineValue(lines, 'SENTENCE:'),
    correctWords: correctWordsRaw ? correctWordsRaw.split(',').map(w => w.trim()).filter(w => w) : [],
    distractorWords: distractorWordsRaw ? distractorWordsRaw.split(',').map(w => w.trim()).filter(w => w) : [],
    correctMessage: getLineValue(lines, 'CORRECT_MESSAGE:') || 'Correct!',
    incorrectMessage: getLineValue(lines, 'INCORRECT_MESSAGE:') || 'Try again.',
  }
}

function parseHotspotQuestion(lines: string[], questionId: number, checkpoint: number): Question {
  return {
    type: 'hotspot',
    id: questionId,
    checkpoint,
    title: getLineValue(lines, 'TITLE:') || `Question ${questionId}`,
    question: getLineValue(lines, 'QUESTION:') || getQuestionText(lines),
    imageUrl: getLineValue(lines, 'IMAGE:') || '',
    hotspotRegion: { type: 'rectangle', coords: [0, 0, 100, 100] }, // Placeholder - user completes in builder
    correctMessage: getLineValue(lines, 'CORRECT_MESSAGE:') || 'Correct!',
    incorrectMessage: getLineValue(lines, 'INCORRECT_MESSAGE:') || 'Try again.',
  }
}

// Get question text from a line that's not a field (for simpler format)
function getQuestionText(lines: string[]): string {
  const fieldPrefixes = ['TYPE:', 'TITLE:', 'QUESTION:', 'IMAGE:', 'SENTENCE:', 'ANSWER:',
    'CORRECT_WORDS:', 'DISTRACTOR_WORDS:', 'CORRECT_MESSAGE:', 'INCORRECT_MESSAGE:',
    'CORRECT:', 'A.', 'A:', 'A)', 'B.', 'B:', 'B)', 'C.', 'C:', 'C)', 'WRONG_', 'CHECKPOINT', 'QUESTION ']

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const isField = fieldPrefixes.some(p => trimmed.toUpperCase().startsWith(p.toUpperCase()))
    if (!isField) return trimmed
  }
  return ''
}

function parseEnhancedQuestion(block: string, questionId: number, defaultCheckpoint: number = 1): Question {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l)

  // Determine checkpoint from header if present
  const headerMatch = block.match(/CHECKPOINT\s+(\d+)/i)
  const checkpoint = headerMatch ? parseInt(headerMatch[1]) : defaultCheckpoint

  const questionType = getQuestionType(lines)

  switch (questionType) {
    case 'fill-blank':
      return parseFillBlankQuestion(lines, questionId, checkpoint)
    case 'drag-drop':
      return parseDragDropQuestion(lines, questionId, checkpoint)
    case 'hotspot':
      return parseHotspotQuestion(lines, questionId, checkpoint)
    default:
      return parseMultipleChoiceQuestion(lines, questionId, checkpoint)
  }
}

// Parse quiz format (simpler - just QUESTION 1, QUESTION 2, etc.)
export function parseQuizFile(content: string): QuizContent {
  // Split by QUESTION markers
  const blocks = content.split(/(?=QUESTION\s+\d+)/i)
  const questionBlocks = blocks.filter(b => /^QUESTION\s+\d+/i.test(b.trim()))

  // If no QUESTION markers, try splitting by blank lines
  let finalBlocks = questionBlocks
  if (finalBlocks.length === 0) {
    finalBlocks = content.split(/\n\s*\n/).filter(b => b.trim())
  }

  const questions: Question[] = finalBlocks.map((block, index) =>
    parseEnhancedQuestion(block, index + 1, 1)
  )

  // Get optional settings
  const lines = content.split('\n')
  const theme = getLineValue(lines, 'THEME:') || undefined
  const welcomeMessage = getLineValue(lines, 'WELCOME_MESSAGE:') || undefined

  return {
    questions,
    theme,
    welcomeMessage,
  }
}

// Parse escape room format (with checkpoints)
export function parseEscapeRoomFile(content: string): GameContent {
  // First try the new format (QUESTION 1, QUESTION 2, etc. within checkpoints)
  const hasNewFormat = /QUESTION\s+\d+/i.test(content)
  const hasOldFormat = /CHECKPOINT\s+\d+\s*-\s*DECISION\s+\d+/i.test(content)

  if (hasOldFormat && !hasNewFormat) {
    // Use original parser for backwards compatibility
    return parseGameFile(content)
  }

  // New format: split by CHECKPOINT markers first
  const checkpointBlocks = content.split(/(?=CHECKPOINT\s+\d+)/i)
  const questions: Question[] = []
  let questionId = 1

  for (const cpBlock of checkpointBlocks) {
    const cpMatch = cpBlock.match(/CHECKPOINT\s+(\d+)/i)
    const checkpoint = cpMatch ? parseInt(cpMatch[1]) : 1

    // Find questions within this checkpoint
    const questionBlocks = cpBlock.split(/(?=QUESTION\s+\d+)/i)
    const qBlocks = questionBlocks.filter(b => /^QUESTION\s+\d+/i.test(b.trim()))

    for (const qBlock of qBlocks) {
      questions.push(parseEnhancedQuestion(qBlock, questionId, checkpoint))
      questionId++
    }
  }

  // If no questions found with new format, fall back to treating whole file as questions
  if (questions.length === 0) {
    const blocks = content.split(/(?=QUESTION\s+\d+)/i)
    const qBlocks = blocks.filter(b => /^QUESTION\s+\d+/i.test(b.trim()))
    for (const block of qBlocks) {
      questions.push(parseEnhancedQuestion(block, questionId, Math.ceil(questionId / 4)))
      questionId++
    }
  }

  const letters = parseLetters(content)

  // Get optional settings
  const lines = content.split('\n')
  const theme = getLineValue(lines, 'THEME:') || undefined
  const welcomeMessage = getLineValue(lines, 'WELCOME_MESSAGE:') || undefined
  const finalWord = getLineValue(lines, 'FINAL_WORD:') || undefined
  const finalClue = getLineValue(lines, 'FINAL_CLUE:') || undefined

  return {
    questions,
    letters,
    theme,
    welcomeMessage,
    finalWord,
    finalClue,
  }
}
