import birdClosedEye from './motion/bird_closedeye.png';
import birdDefault from './motion/bird_default.png';
import birdFly from './motion/bird_fly.png';
import birdSmile from './motion/bird_smile.png';
import birdSpeak from './motion/bird_speak.png';

export type CharacterMotionMode = 'idle' | 'botSpeaking' | 'userRecording' | 'fly';

export const CHARACTER_MOTION_FRAMES = {
  default: birdDefault,
  closedeye: birdClosedEye,
  smile: birdSmile,
  speak: birdSpeak,
  fly: birdFly,
} as const;

export const CHARACTER_IDLE_CYCLE = [
  CHARACTER_MOTION_FRAMES.closedeye,
  CHARACTER_MOTION_FRAMES.default,
  CHARACTER_MOTION_FRAMES.smile,
] as const;

export const CHARACTER_BOT_CYCLE = [
  CHARACTER_MOTION_FRAMES.closedeye,
  CHARACTER_MOTION_FRAMES.default,
  CHARACTER_MOTION_FRAMES.smile,
  CHARACTER_MOTION_FRAMES.speak,
] as const;

export const CHARACTER_MOTION_FRAME_MS = 360;
