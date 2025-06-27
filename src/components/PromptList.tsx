import { useEffect, useRef, useState, useMemo } from 'react';
import { Prompt } from '../types/prompt';
import { PromptItem } from './PromptItem';
import { TagBar } from './TagBar';

interface PromptListProps {
  prompts: Prompt[];
  searchQuery: string;
  selectedIndex: number;
  onSelectPrompt: (prompt: Prompt) => void;
  onEditPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (id: number) => void;
  onFilteredPromptsChange: (prompts: Prompt[]) => void;
}

export function PromptList({ prompts, searchQuery, selectedIndex, onSelectPrompt, onEditPrompt, onDeletePrompt, onFilteredPromptsChange }: PromptListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);
  const tagBarRef = useRef<HTMLDivElement>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    prompts.forEach(prompt => {
      prompt.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    let filtered = prompts;
    
    if (selectedTag) {
      filtered = filtered.filter(prompt => prompt.tags.includes(selectedTag));
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prompt => {
        return prompt.title.toLowerCase().includes(query) ||
               prompt.content.toLowerCase().includes(query) ||
               prompt.tags.some(tag => tag.toLowerCase().includes(query));
      });
    }
    
    return filtered;
  }, [prompts, selectedTag, searchQuery]);

  useEffect(() => {
    onFilteredPromptsChange(filteredPrompts);
  }, [filteredPrompts, onFilteredPromptsChange]);

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
          top: Math.max(0, targetScrollTop), // 确保不会滚动到负值
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  if (prompts.length === 0) {
    return <div className="empty-state">No prompts found</div>;
  }

  return (
    <div className="prompt-list-container">
      <div ref={tagBarRef}>
        <TagBar 
          tags={allTags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />
      </div>
      <div className="prompt-list" ref={listRef}>
        {filteredPrompts.map((prompt, index) => (
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
    </div>
  );
}
