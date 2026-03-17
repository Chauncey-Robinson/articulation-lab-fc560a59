import { supabase } from "@/integrations/supabase/client";

export interface GeneratedLesson {
  title: string;
  content: string;
  key_idea: string;
}

export interface GeneratedLessonsResult {
  title: string;
  lessons: GeneratedLesson[];
}

export interface GeneratedQuestion {
  question: string;
  question_type: "open" | "multiple_choice" | "true_false";
  options: string[];
  correct_answer: string;
}

export interface EvaluationResult {
  is_correct: boolean;
  feedback: string;
}

export interface ApplicationEvaluation {
  score: number;
  feedback: string;
  improved_response: string;
}

export async function generateLessons(content: string): Promise<GeneratedLessonsResult> {
  const { data, error } = await supabase.functions.invoke("ai-tutor", {
    body: { type: "generate_lessons", content },
  });
  if (error) throw new Error(error.message || "AI request failed");
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function generateQuiz(lessonTitle: string, lessonContent: string, keyIdea: string): Promise<{ questions: GeneratedQuestion[] }> {
  const { data, error } = await supabase.functions.invoke("ai-tutor", {
    body: { type: "generate_quiz", lessonTitle, lessonContent, keyIdea },
  });
  if (error) throw new Error(error.message || "AI request failed");
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function evaluateAnswer(question: string, correctAnswer: string, userAnswer: string, questionType: string): Promise<EvaluationResult> {
  const { data, error } = await supabase.functions.invoke("ai-tutor", {
    body: { type: "evaluate_answer", question, correctAnswer, userAnswer, questionType },
  });
  if (error) throw new Error(error.message || "AI request failed");
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function getTeachBackFeedback(keyIdea: string, explanation: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai-tutor", {
    body: { type: "teach_back", keyIdea, explanation },
  });
  if (error) throw new Error(error.message || "AI request failed");
  if (data?.error) throw new Error(data.error);
  return data.content;
}

export async function getApplyScenario(lessonTitle: string, keyIdea: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai-tutor", {
    body: { type: "apply_scenario", lessonTitle, keyIdea },
  });
  if (error) throw new Error(error.message || "AI request failed");
  if (data?.error) throw new Error(data.error);
  return data.content;
}

export async function evaluateApplication(scenario: string, keyIdea: string, response: string): Promise<ApplicationEvaluation> {
  const { data, error } = await supabase.functions.invoke("ai-tutor", {
    body: { type: "evaluate_application", scenario, keyIdea, response },
  });
  if (error) throw new Error(error.message || "AI request failed");
  if (data?.error) throw new Error(data.error);
  return data;
}
