import { useState, useMemo } from 'react';
import { Prompt } from '../types/prompt';

export function useSearch(prompts: Prompt[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrompts = useMemo(() => {
    if (!searchQuery.trim()) return prompts;

    const query = searchQuery.toLowerCase();
    
    if (query.startsWith('#')) {
      const tag = query.slice(1);
      return prompts.filter(prompt => 
        prompt.tags.some(t => t.toLowerCase().includes(tag))
      );
    }

    return prompts.filter(prompt =>
      prompt.title.toLowerCase().includes(query) ||
      prompt.content.toLowerCase().includes(query) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [prompts, searchQuery]);

  return { searchQuery, setSearchQuery, filteredPrompts };
}
