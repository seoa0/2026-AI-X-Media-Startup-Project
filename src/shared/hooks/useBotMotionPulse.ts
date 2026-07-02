import { useEffect, useState } from 'react';
import type { ChatMessage } from '../types/chat';

const BOT_PULSE_MS = 1800;

export function useBotMotionPulse(messages: ChatMessage[]) {
  const [botAnimating, setBotAnimating] = useState(false);

  useEffect(() => {
    const last = messages.at(-1);
    if (last?.role !== 'bot') return;

    setBotAnimating(true);
    const timer = window.setTimeout(() => setBotAnimating(false), BOT_PULSE_MS);
    return () => window.clearTimeout(timer);
  }, [messages]);

  return botAnimating;
}
