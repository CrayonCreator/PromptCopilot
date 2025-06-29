import { useEffect } from 'react';
import { Prompt } from '../types/prompt';
import { MarkdownRenderer } from './MarkdownRenderer';

interface PromptPreviewProps {
  prompt: Prompt;
  isOpen: boolean;
  onClose: () => void;
}

export function PromptPreview({ prompt, isOpen, onClose }: PromptPreviewProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="prompt-preview-overlay" onClick={onClose}>
      <div className="prompt-preview-fullscreen" onClick={(e) => e.stopPropagation()}>
        <div className="prompt-preview-header">
          <h2 className="prompt-preview-title">{prompt.title}</h2>
          <button className="prompt-preview-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="prompt-preview-body">
          <MarkdownRenderer 
            content={prompt.content} 
            className="prompt-preview-markdown"
          />
        </div>
        
        {prompt.tags.length > 0 && (
          <div className="prompt-preview-tags">
            {prompt.tags.map((tag, index) => (
              <span key={index} className="prompt-preview-tag">#{tag}</span>
            ))}
          </div>
        )}
        
        <div className="prompt-preview-footer">
          <span className="prompt-preview-hint">Space or Esc to close</span>
        </div>
      </div>
    </div>
  );
}
