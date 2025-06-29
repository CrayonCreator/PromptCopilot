export interface Prompt {
  id: number;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  last_used?: string;
  sort_order?: number;
}

export interface PromptInput {
  title: string;
  content: string;
  tags: string;
}

export type ViewMode = 'list' | 'create' | 'edit';
