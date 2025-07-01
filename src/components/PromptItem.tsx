import { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Prompt } from '../types/prompt';
import { useLanguage } from '../contexts/LanguageContext';

interface PromptItemProps {
  prompt: Prompt;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDraggable?: boolean;
}

export const PromptItem = forwardRef<HTMLDivElement, PromptItemProps>(
  ({ prompt, isSelected, onSelect, onEdit, onDelete, isDraggable = false }, ref) => {
    const { t } = useLanguage();
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ 
      id: prompt.id.toString(),
      disabled: !isDraggable
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const combinedRef = (node: HTMLDivElement | null) => {
      setNodeRef(node);
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div 
        ref={combinedRef}
        style={style}
        className={`prompt-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
        onClick={onSelect}
        {...attributes}
      >
        <div className="prompt-header">
          <div 
            className="drag-handle" 
            {...listeners}
            style={{ cursor: isDraggable ? 'grab' : 'default' }}
          >
            ⋮⋮
          </div>
          <h3 className="prompt-title">{prompt.title}</h3>
          <div className="prompt-actions">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="btn-edit">
              {t('button.edit')}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="btn-delete">
              {t('button.delete')}
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
