import { useEffect, useRef } from 'react';
import { Prompt } from '../types/prompt';
import { PromptItem } from './PromptItem';

interface PromptListProps {
  prompts: Prompt[];
  selectedIndex: number;
  onSelectPrompt: (prompt: Prompt) => void;
  onEditPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (id: number) => void;
}

export function PromptList({ prompts, selectedIndex, onSelectPrompt, onEditPrompt, onDeletePrompt }: PromptListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedItemRef.current && listRef.current) {
      const listContainer = listRef.current;
      const selectedItem = selectedItemRef.current;
      
      const listRect = listContainer.getBoundingClientRect();
      const itemRect = selectedItem.getBoundingClientRect();
      
      const isItemVisible = 
        itemRect.top >= listRect.top && 
        itemRect.bottom <= listRect.bottom;
      
      if (!isItemVisible) {
        const itemOffsetTop = selectedItem.offsetTop;
        const listHeight = listContainer.clientHeight;
        const itemHeight = selectedItem.clientHeight;
        
        const targetScrollTop = itemOffsetTop - (listHeight / 2) + (itemHeight / 2);
        
        listContainer.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  if (prompts.length === 0) {
    return <div className="empty-state">No prompts found</div>;
  }

  return (
    <div className="prompt-list" ref={listRef}>
      {prompts.map((prompt, index) => (
        <PromptItem
          key={prompt.id}
          ref={index === selectedIndex ? selectedItemRef : undefined}
          prompt={prompt}
          isSelected={index === selectedIndex}
          onSelect={() => onSelectPrompt(prompt)}
          onEdit={() => onEditPrompt(prompt)}
          onDelete={() => onDeletePrompt(prompt.id)}
        />
      ))}
    </div>
  );
}
