import type { CharacterMotionMode } from '../../assets/characterMotion';
import { useCharacterMotion } from '../../hooks/useCharacterMotion';
import './AnimatedCharacter.css';

interface AnimatedCharacterProps {
  mode: CharacterMotionMode;
  className?: string;
}

export default function AnimatedCharacter({ mode, className = '' }: AnimatedCharacterProps) {
  const src = useCharacterMotion(mode);

  return (
    <img
      src={src}
      alt=""
      className={`animated-character ${className}`.trim()}
      draggable={false}
    />
  );
}
