import { useEffect, useRef, useState } from 'react';
import {
  CHARACTER_BOT_CYCLE,
  CHARACTER_IDLE_CYCLE,
  CHARACTER_MOTION_FRAME_MS,
  CHARACTER_MOTION_FRAMES,
  type CharacterMotionMode,
} from '../assets/characterMotion';

export function useCharacterMotion(mode: CharacterMotionMode) {
  const [src, setSrc] = useState(CHARACTER_MOTION_FRAMES.default);
  const indexRef = useRef(0);

  useEffect(() => {
    if (mode === 'fly') {
      setSrc(CHARACTER_MOTION_FRAMES.fly);
      return;
    }

    const frames = mode === 'botSpeaking' ? CHARACTER_BOT_CYCLE : CHARACTER_IDLE_CYCLE;
    indexRef.current = 0;
    setSrc(frames[0]);

    const timer = window.setInterval(() => {
      indexRef.current = (indexRef.current + 1) % frames.length;
      setSrc(frames[indexRef.current]);
    }, CHARACTER_MOTION_FRAME_MS);

    return () => window.clearInterval(timer);
  }, [mode]);

  return src;
}
