import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Prompt, PromptInput } from '../types/prompt';

export function usePrompts(showToast?: (message: string, type?: 'success' | 'error' | 'info') => void) {
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
      const message = await invoke<string>('paste_to_clipboard', { content: prompt.content });
      await invoke('update_last_used', { id: prompt.id });
      
      if (showToast) {
        showToast(message, 'success');
      }
    } catch (error) {
      console.error('Failed to use prompt:', error);
      
      if (showToast) {
        showToast('Failed to copy prompt to clipboard', 'error');
      }
    }
  };

  const reorderPrompts = async (sourceIndex: number, destinationIndex: number) => {
    try {
      const reorderedPrompts = [...prompts];
      const [removed] = reorderedPrompts.splice(sourceIndex, 1);
      reorderedPrompts.splice(destinationIndex, 0, removed);
      
      setPrompts(reorderedPrompts);
      
      const promptIds = reorderedPrompts.map(p => p.id);
      await invoke('reorder_prompts', { promptIds });
    } catch (error) {
      console.error('Failed to reorder prompts:', error);
      await loadPrompts();
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
    usePrompt,
    reorderPrompts
  };
}
