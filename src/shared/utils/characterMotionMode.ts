import type { CharacterMotionMode } from '../assets/characterMotion';
import type { VoiceSessionStatus } from '../types/chat';

interface ResolveCharacterMotionModeParams {
  status?: VoiceSessionStatus;
  step?: string;
  chatComplete?: boolean;
  botAnimating?: boolean;
  farewell?: boolean;
}

export function resolveCharacterMotionMode({
  status = 'idle',
  step,
  chatComplete = false,
  botAnimating = false,
  farewell = false,
}: ResolveCharacterMotionModeParams): CharacterMotionMode {
  if (chatComplete || step === 'done') return 'fly';
  if (status === 'listening') return 'userRecording';
  if (status === 'processing' || botAnimating || farewell || step === 'farewell') {
    return 'botSpeaking';
  }
  return 'idle';
}
