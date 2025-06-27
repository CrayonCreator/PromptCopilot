import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Prompt, PromptInput } from '../types/prompt';

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const data = await invoke<Prompt[]>('get_all_prompts');
      setPrompts(data);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchPrompts = async (query: string) => {
    setLoading(true);
    try {
      const data = await invoke<Prompt[]>('search_prompts', { query });
      setPrompts(data);
    } catch (error) {
      console.error('Failed to search prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePrompt = async (promptData: PromptInput) => {
    try {
      await invoke('save_prompt', { prompt: promptData });
      await loadPrompts();
    } catch (error) {
      console.error('Failed to save prompt:', error);
    }
  };

  const updatePrompt = async (id: number, promptData: PromptInput) => {
    try {
      await invoke('update_prompt', { id, prompt: promptData });
      await loadPrompts();
    } catch (error) {
      console.error('Failed to update prompt:', error);
    }
  };

  const deletePrompt = async (id: number) => {
    try {
      await invoke('delete_prompt', { id });
      await loadPrompts();
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  };

  const usePrompt = async (prompt: Prompt) => {
    try {
      await invoke('paste_to_clipboard', { content: prompt.content });
      await invoke('update_last_used', { id: prompt.id });
    } catch (error) {
      console.error('Failed to use prompt:', error);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  return {
    prompts,
    loading,
    loadPrompts,
    searchPrompts,
    savePrompt,
    updatePrompt,
    deletePrompt,
    usePrompt
  };
}
