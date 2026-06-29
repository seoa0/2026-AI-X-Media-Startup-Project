import type { ChatMessage } from '../types/chat';
import {
  getFallbackAck,
  getFallbackOnboardingReply,
  type ONBOARDING_QUESTIONS,
} from '../constants/onboardingChat';

/** Firebase AI 무료 할당량 초과 시 API 호출 방지. 필요 시 .env에 VITE_ENABLE_LLM=true */
const LLM_ENABLED = import.meta.env.VITE_ENABLE_LLM === 'true';

let llmDisabledForSession = false;

function isQuotaError(error: unknown) {
  const msg = String(error);
  return msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
}

function markLlmUnavailable(error: unknown) {
  if (isQuotaError(error)) {
    llmDisabledForSession = true;
  }
}

function truncate(text: string, max = 18) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export interface LlmContext {
  packageTitle?: string;
  genre?: string;
  step?: string;
  userTurnCount?: number;
  wrapUpAlreadyAsked?: boolean;
}

export const CREATE_WRAPUP_QUESTION =
  '감사합니다! 말씀해 주신 내용을 잘 정리해 두었어요. 더 추가하고 싶은 부분이 있으신가요?';

export const CREATE_WRAPUP_DONE =
  '알겠습니다! 말씀해 주신 내용을 모두 반영하겠습니다. 이제 플랜 선택으로 넘어가 볼게요!';

const WRAPUP_MARKER = '더 추가하고 싶은 부분';

export function isWrapUpQuestion(text: string) {
  return text.includes(WRAPUP_MARKER);
}

function buildLocalCreateReply(userText: string, _context: LlmContext, userTurnCount: number): string {
  if (userTurnCount >= 4) {
    return CREATE_WRAPUP_QUESTION;
  }

  const snippet = truncate(userText);

  if (userTurnCount <= 1) {
    return `${snippet} 말씀 잘 들었습니다! 어떤 분위기의 곡을 만들고 싶으신지 조금 더 알려주시겠어요?`;
  }
  if (userTurnCount === 2) {
    return `좋은 아이디어예요! ${snippet}을 바탕으로 가사 방향을 함께 잡아보면 좋겠어요. 어떤 감정을 가장 담고 싶으신가요?`;
  }
  return '멋진 방향이에요! 멜로디나 보컬 톤에 대한 생각이 있으시면 편하게 말씀해 주세요.';
}

function buildOnboardingAck(step: keyof typeof ONBOARDING_QUESTIONS, userAnswer: string) {
  const snippet = truncate(userAnswer, 14);
  const ackByStep: Record<keyof typeof ONBOARDING_QUESTIONS, string> = {
    recentSong: `«${snippet}» 즐겨 들으시는군요!`,
    favoriteSong: `«${snippet}», 정말 좋은 곡이에요!`,
    story: `«${snippet}» 이야기, 잘 들었습니다.`,
    songTitle: `«${snippet}», 멋진 제목이에요!`,
  };
  return ackByStep[step];
}

function buildNaturalOnboardingReply(
  step: keyof typeof ONBOARDING_QUESTIONS,
  userAnswer: string,
  nextQuestion: string,
) {
  return `${buildOnboardingAck(step, userAnswer)} ${nextQuestion}`;
}

async function callGeminiChat(messages: ChatMessage[], systemInstruction: string, userText: string) {
  if (!LLM_ENABLED || llmDisabledForSession) return null;

  const { getAI, getGenerativeModel, GoogleAIBackend } = await import('firebase/ai');
  const { app } = await import('./config');

  const mapped = messages
    .slice(0, -1)
    .filter((m) => m.text.trim())
    .map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: m.text }],
    }));

  let start = 0;
  while (start < mapped.length && mapped[start].role === 'model') {
    start += 1;
  }

  const ai = getAI(app, { backend: new GoogleAIBackend() });
  const model = getGenerativeModel(ai, {
    model: 'gemini-2.0-flash',
    systemInstruction,
  });

  const chat = model.startChat({ history: mapped.slice(start) });
  const result = await chat.sendMessage(userText);
  return result.response.text()?.trim() || null;
}

async function callGeminiPrompt(systemInstruction: string, prompt: string) {
  if (!LLM_ENABLED || llmDisabledForSession) return null;

  const { getAI, getGenerativeModel, GoogleAIBackend } = await import('firebase/ai');
  const { app } = await import('./config');

  const ai = getAI(app, { backend: new GoogleAIBackend() });
  const model = getGenerativeModel(ai, {
    model: 'gemini-2.0-flash',
    systemInstruction,
  });

  const result = await model.generateContent(prompt);
  return result.response.text()?.trim() || null;
}

export async function generateMusicAssistantReply(
  messages: ChatMessage[],
  context: LlmContext = {},
): Promise<string> {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUser?.text.trim()) {
    return '말씀을 잘 못 들었습니다. 다시 한번 말씀해 주시겠어요?';
  }

  const userTurnCount = messages.filter((m) => m.role === 'user').length;
  const local = buildLocalCreateReply(lastUser.text, context, userTurnCount);

  if (!LLM_ENABLED || llmDisabledForSession) {
    return local;
  }

  try {
    const contextLines = [
      context.packageTitle && `패키지: ${context.packageTitle}`,
      context.step && `단계: ${context.step}`,
    ]
      .filter(Boolean)
      .join('\n');

    const systemInstruction = `당신은 '나도 가수다' AI 뮤직 메이트입니다. 존댓말. 2~3문장. 이모지 최대 1개.\n${contextLines}`;

    const text = await callGeminiChat(messages, systemInstruction, lastUser.text);
    if (text) return text;
  } catch (error) {
    markLlmUnavailable(error);
  }

  return local;
}

export async function generateOnboardingTransition(
  userAnswer: string,
  step: 'recentSong' | 'favoriteSong' | 'story',
  nextQuestion: string,
): Promise<string> {
  const local = buildNaturalOnboardingReply(step, userAnswer, nextQuestion);

  if (!LLM_ENABLED || llmDisabledForSession) {
    return local;
  }

  try {
    const prompt = `사용자 답변: "${userAnswer}"
1. 공감 한 문장 (존댓말) 2. 이어서 질문: "${nextQuestion}" — 총 2문장 이내. 이모지 금지.`;

    const text = await callGeminiPrompt(
      `당신은 '나도 가수다' AI 뮤직 메이트입니다. 온보딩 대화를 진행합니다.`,
      prompt,
    );
    if (text) return text;
  } catch (error) {
    markLlmUnavailable(error);
  }

  return getFallbackOnboardingReply(step, nextQuestion);
}

export async function generateOnboardingAck(
  userAnswer: string,
  step: 'recentSong' | 'favoriteSong' | 'story',
): Promise<string> {
  const local = buildOnboardingAck(step, userAnswer);

  if (!LLM_ENABLED || llmDisabledForSession) {
    return local;
  }

  try {
    const prompt = `사용자 답변: "${userAnswer}" — 공감 한 문장만. 질문 금지. 존댓말.`;
    const text = await callGeminiPrompt(`당신은 '나도 가수다' AI 뮤직 메이트입니다.`, prompt);
    if (text) return text.replace(/\n+/g, ' ');
  } catch (error) {
    markLlmUnavailable(error);
  }

  return getFallbackAck(step);
}
