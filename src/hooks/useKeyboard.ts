import { useState, useEffect, useRef } from 'react';

interface KeyboardHandlers {
  onEnter: () => void;
  onEscape: () => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onSpace?: () => void;
}

export function useKeyboard(handlers: KeyboardHandlers) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onSpace } = handlers;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          onEnter();
          break;
        case 'Escape':
          e.preventDefault();
          onEscape();
          break;
        case 'ArrowUp':
          e.preventDefault();
          onArrowUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          onArrowDown();
          break;
        case 'ArrowLeft':
          if (onArrowLeft) {
            e.preventDefault();
            onArrowLeft();
          }
          break;
        case 'ArrowRight':
          if (onArrowRight) {
            e.preventDefault();
            onArrowRight();
          }
          break;
        case ' ':
          if (onSpace) {
            e.preventDefault();
            onSpace();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onSpace]);

  return { selectedIndex, setSelectedIndex, containerRef };
}
