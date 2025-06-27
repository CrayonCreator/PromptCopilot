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
  if (prompts.length === 0) {
    return <div className="empty-state">No prompts found</div>;
  }

  return (
    <div className="prompt-list">
      {prompts.map((prompt, index) => (
        <PromptItem
          key={prompt.id}
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
