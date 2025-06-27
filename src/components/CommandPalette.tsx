import { useState, useEffect } from 'react';
import { ViewMode, Prompt } from '../types/prompt';
import { usePrompts } from '../hooks/usePrompts';
import { useSearch } from '../hooks/useSearch';
import { useKeyboard } from '../hooks/useKeyboard';
import { useTheme } from '../hooks/useTheme';
import { SearchBox } from './SearchBox';
import { PromptList } from './PromptList';
import { PromptEditor } from './PromptEditor';
import { ConfirmDialog } from './ConfirmDialog';

export function CommandPalette() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    prompt: Prompt | null;
  }>({ isOpen: false, prompt: null });
  
  const { theme, toggleTheme } = useTheme();
  
  const { 
    prompts, 
    loading, 
    savePrompt, 
    updatePrompt, 
    deletePrompt, 
    usePrompt 
  } = usePrompts();
  
  const { searchQuery, setSearchQuery, filteredPrompts } = useSearch(prompts);



  const handleSelectPrompt = (prompt: Prompt) => {
    usePrompt(prompt);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setViewMode('edit');
  };

  const handleDeletePrompt = async (id: number) => {
    const prompt = filteredPrompts.find(p => p.id === id);
    if (prompt) {
      setDeleteConfirm({ isOpen: true, prompt });
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirm.prompt) {
      await deletePrompt(deleteConfirm.prompt.id);
      setDeleteConfirm({ isOpen: false, prompt: null });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, prompt: null });
  };

  const handleNewPrompt = () => {
    setEditingPrompt(undefined);
    setViewMode('create');
  };

  const handleSavePrompt = async (promptData: any) => {
    if (editingPrompt) {
      await updatePrompt(editingPrompt.id, promptData);
    } else {
      await savePrompt(promptData);
    }
    setViewMode('list');
    setEditingPrompt(undefined);
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingPrompt(undefined);
  };

  const { selectedIndex, setSelectedIndex } = useKeyboard(
    () => {
      if (viewMode === 'list' && filteredPrompts.length > 0) {
        handleSelectPrompt(filteredPrompts[selectedIndex]);
      }
    },
    () => {
      if (viewMode !== 'list') {
        handleCancel();
      }
    },
    () => {
      if (viewMode === 'list') {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      }
    },
    () => {
      if (viewMode === 'list') {
        setSelectedIndex(prev => Math.min(filteredPrompts.length - 1, prev + 1));
      }
    }
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredPrompts, setSelectedIndex]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="command-palette">
      {viewMode === 'list' && (
        <>
          <div className="search-header">
            <SearchBox 
              value={searchQuery} 
              onChange={setSearchQuery}
              placeholder="Search prompts or type 'new' to create..."
            />
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button onClick={handleNewPrompt} className="btn-new">
              New
            </button>
          </div>
          
          <PromptList
            prompts={filteredPrompts}
            selectedIndex={selectedIndex}
            onSelectPrompt={handleSelectPrompt}
            onEditPrompt={handleEditPrompt}
            onDeletePrompt={handleDeletePrompt}
          />

          {/* 快捷键提示 */}
          <div className="shortcut-hint">
            Ctrl+Shift+P to toggle
          </div>
        </>
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="editor-container">
          <div className="editor-header">
            <button 
              className="theme-toggle-small" 
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
          <PromptEditor
            prompt={editingPrompt}
            onSave={handleSavePrompt}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Prompt"
        message={`Are you sure you want to delete "${deleteConfirm.prompt?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDangerous={true}
      />
    </div>
  );
}
