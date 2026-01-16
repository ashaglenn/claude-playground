import { GameContent, Question, Answer, CheckpointLetter, AnswerKey } from './types'

function getLine(lines: string[], prefix: string): string {
  const line = lines.find(l => l.startsWith(prefix))
  return line ? line.slice(prefix.length).trim() : ''
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
