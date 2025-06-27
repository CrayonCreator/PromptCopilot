import { forwardRef } from 'react';
import { Prompt } from '../types/prompt';

interface PromptItemProps {
  prompt: Prompt;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const PromptItem = forwardRef<HTMLDivElement, PromptItemProps>(
  ({ prompt, isSelected, onSelect, onEdit, onDelete }, ref) => {
    return (
      <div 
        ref={ref}
        className={`prompt-item ${isSelected ? 'selected' : ''}`}
        onClick={onSelect}
      >
        <div className="prompt-header">
          <h3 className="prompt-title">{prompt.title}</h3>
          <div className="prompt-actions">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="btn-edit">
              Edit
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="btn-delete">
              Delete
            </button>
          </div>
        </div>
        
        <p className="prompt-content">{prompt.content}</p>
        
        {prompt.tags.length > 0 && (
          <div className="prompt-tags">
            {prompt.tags.map((tag, index) => (
              <span key={index} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    );
  }
);
