'use client'

import { useGame } from '@/context/GameContext'
import { isMultipleChoiceQuestion, isHotspotQuestion, isDragDropQuestion, isFillBlankQuestion } from '@/lib/types'
import MultipleChoiceScreen from './MultipleChoiceScreen'
import HotspotQuestionScreen from './HotspotQuestionScreen'
import DragDropQuestionScreen from './DragDropQuestionScreen'
import FillBlankQuestionScreen from './FillBlankQuestionScreen'

export default function QuestionScreen() {
  const { getCurrentQuestion } = useGame()
  const question = getCurrentQuestion()

  if (!question) return null

  // Route to the appropriate screen based on question type
  if (isHotspotQuestion(question)) {
    return <HotspotQuestionScreen question={question} />
  }

  if (isDragDropQuestion(question)) {
    return <DragDropQuestionScreen question={question} />
  }

  if (isFillBlankQuestion(question)) {
    return <FillBlankQuestionScreen question={question} />
  }

  // Default: multiple choice (includes legacy questions without type field)
  if (isMultipleChoiceQuestion(question)) {
    return <MultipleChoiceScreen question={question} />
  }

  // Fallback for any unhandled type
  return <MultipleChoiceScreen question={question as any} />
}
