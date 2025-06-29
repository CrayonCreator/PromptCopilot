import { useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
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
  onTagSelectionChange?: (selectedTagIndex: number) => void;
}

export interface PromptListRef {
  navigateTagLeft: () => void;
  navigateTagRight: () => void;
}

export const PromptList = forwardRef<PromptListRef, PromptListProps>(({ 
  prompts, 
  searchQuery, 
  selectedIndex, 
  onSelectPrompt, 
  onEditPrompt, 
  onDeletePrompt, 
  onFilteredPromptsChange,
  onTagSelectionChange 
}, ref) => {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);
  const tagBarRef = useRef<HTMLDivElement>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    prompts.forEach(prompt => {
      prompt.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [prompts]);

  const tagsWithAll = useMemo(() => ['All', ...allTags], [allTags]);

  const handleTagIndexChange = (newIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(newIndex, tagsWithAll.length - 1));
    setSelectedTagIndex(clampedIndex);
    
    if (clampedIndex === 0) {
      setSelectedTag(null);
    } else {
      setSelectedTag(allTags[clampedIndex - 1]);
    }
    
    if (onTagSelectionChange) {
      onTagSelectionChange(clampedIndex);
    }
  };

  const navigateTagLeft = () => {
    handleTagIndexChange(selectedTagIndex - 1);
  };

  const navigateTagRight = () => {
    handleTagIndexChange(selectedTagIndex + 1);
  };

  useImperativeHandle(ref, () => ({
    navigateTagLeft,
    navigateTagRight
  }));

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
    if (filteredPrompts.length > 0 && selectedIndex >= filteredPrompts.length) {
      return;
    }
  }, [filteredPrompts.length, selectedIndex]);

  useEffect(() => {
    if (selectedItemRef.current && listRef.current && filteredPrompts.length > 0) {
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
        
        let targetScrollTop;
        
        if (selectedIndex === 0) {
          targetScrollTop = 0;
        }
        else if (selectedIndex === filteredPrompts.length - 1) {
          targetScrollTop = listContainer.scrollHeight - listHeight;
        }
        else {
          targetScrollTop = itemOffsetTop - (listHeight / 2) + (itemHeight / 2);
        }
        
        listContainer.scrollTo({
          top: Math.max(0, Math.min(targetScrollTop, listContainer.scrollHeight - listHeight)),
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex, filteredPrompts.length]);

  if (prompts.length === 0) {
    return <div className="empty-state">No prompts found</div>;
  }

  return (
    <div className="prompt-list-container">
      <div ref={tagBarRef}>
        <TagBar 
          tags={allTags}
          selectedTag={selectedTag}
          selectedTagIndex={selectedTagIndex}
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
});
