'use client';

import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  onClick?: () => void;
}

export function Avatar({ avatarId, size = 'md', animated = false, className = '', onClick, ...props }: AvatarProps) {
  const sizeStyles = { sm: 'w-10 h-10', md: 'w-16 h-16', lg: 'w-24 h-24', xl: 'w-32 h-32' };
  const content = (
    <div className={`${sizeStyles[size]} rounded-full bg-gradient-to-br from-kawaii-purple/30 to-kawaii-pink/30 flex items-center justify-center text-4xl shadow-[0_4px_15px_rgba(224,176,255,0.3)] border-4 border-white ${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick} {...props}>
      <span className="select-none">{getAvatarEmoji(avatarId)}</span>
    </div>
  );
  if (animated || onClick) {
    return (
      <motion.div whileHover={onClick ? { scale: 1.1, rotate: 5 } : {}} whileTap={onClick ? { scale: 0.95 } : {}} animate={animated ? { y: [0, -5, 0], rotate: [0, 2, -2, 0] } : {}} transition={{ duration: 2, repeat: animated ? Infinity : 0, ease: 'easeInOut' }}>
        {content}
      </motion.div>
    );
  }
  return content;
}

function getAvatarEmoji(avatarId: string): string {
  const avatars: Record<string, string> = { cat: '😺', dog: '🐶', rabbit: '🐰', bear: '🐻', panda: '🐼', koala: '🐨', fox: '🦊', tiger: '🐯', lion: '🦁', unicorn: '🦄', dragon: '🐲', owl: '🦉' };
  return avatars[avatarId] || avatars.cat;
}

export const AVATAR_IDS = ['cat','dog','rabbit','bear','panda','koala','fox','tiger','lion','unicorn','dragon','owl'];
