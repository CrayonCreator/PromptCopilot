import { useMemo } from 'react';
import { Prompt } from '../types/prompt';

interface TagStats {
  tag: string;
  count: number;
  lastUsed?: Date;
}

export function useTags(prompts: Prompt[]) {
  const tagStats = useMemo(() => {
    const tagMap = new Map<string, TagStats>();

    prompts.forEach(prompt => {
      prompt.tags.forEach(tag => {
        const existing = tagMap.get(tag);
        const lastUsed = prompt.last_used ? new Date(prompt.last_used) : undefined;

        if (existing) {
          existing.count++;
          if (lastUsed && (!existing.lastUsed || lastUsed > existing.lastUsed)) {
            existing.lastUsed = lastUsed;
          }
        } else {
          tagMap.set(tag, {
            tag,
            count: 1,
            lastUsed
          });
        }
      });
    });

    return Array.from(tagMap.values());
  }, [prompts]);

  const sortedTags = useMemo(() => {
    return tagStats
      .sort((a, b) => {
        if (a.count !== b.count) {
          return b.count - a.count;
        }

        if (a.lastUsed && b.lastUsed) {
          return b.lastUsed.getTime() - a.lastUsed.getTime();
        }

        if (a.lastUsed && !b.lastUsed) return -1;
        if (!a.lastUsed && b.lastUsed) return 1;

        return a.tag.localeCompare(b.tag);
      })
      .map(stat => stat.tag);
  }, [tagStats]);

  const filterTags = (query: string, excludeTags: string[] = []) => {
    if (!query.trim()) {
      return sortedTags.filter(tag => !excludeTags.includes(tag)).slice(0, 8);
    }

    const lowerQuery = query.toLowerCase();
    return sortedTags
      .filter(tag =>
        !excludeTags.includes(tag) &&
        tag.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 8);
  };

  return {
    allTags: sortedTags,
    filterTags
  };
}
