import { useState, useEffect, useRef } from 'react';
import { ViewMode, Prompt } from '../types/prompt';
import { usePrompts } from '../hooks/usePrompts';
import { useKeyboard } from '../hooks/useKeyboard';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { SearchBox } from './SearchBox';
import { PromptList, PromptListRef } from './PromptList';
import { PromptEditor } from './PromptEditor';
import { PromptPreview } from './PromptPreview';
import { ConfirmDialog } from './ConfirmDialog';
import { SettingsDialog } from './SettingsDialog';
import { Toast } from './Toast';

export function CommandPalette() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>();
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    prompt: Prompt | null;
  }>({ isOpen: false, prompt: null });
  const [previewPrompt, setPreviewPrompt] = useState<Prompt | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const promptListRef = useRef<PromptListRef>(null);
  
  const { t } = useLanguage();
  const { toasts, showSuccess, hideToast } = useToast();
  
  const { 
    prompts, 
    loading, 
    savePrompt, 
    updatePrompt, 
    deletePrompt, 
    usePrompt,
    reorderPrompts
  } = usePrompts(showSuccess);



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

  const { selectedIndex, setSelectedIndex } = useKeyboard({
    onEnter: () => {
      if (viewMode === 'list' && filteredPrompts.length > 0 && !previewPrompt) {
        handleSelectPrompt(filteredPrompts[selectedIndex]);
      }
    },
    onEscape: () => {
      if (previewPrompt) {
        setPreviewPrompt(null);
      } else if (viewMode !== 'list') {
        handleCancel();
      }
    },
    onSpace: () => {
      if (previewPrompt) {
        setPreviewPrompt(null);
      } else if (viewMode === 'list' && filteredPrompts.length > 0) {
        setPreviewPrompt(filteredPrompts[selectedIndex]);
      }
    },
    onArrowUp: () => {
      if (viewMode === 'list' && !previewPrompt) {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      }
    },
    onArrowDown: () => {
      if (viewMode === 'list' && !previewPrompt) {
        setSelectedIndex(prev => Math.min(filteredPrompts.length - 1, prev + 1));
      }
    },
    onArrowLeft: () => {
      if (viewMode === 'list' && !previewPrompt && promptListRef.current) {
        promptListRef.current.navigateTagLeft();
      }
    },
    onArrowRight: () => {
      if (viewMode === 'list' && !previewPrompt && promptListRef.current) {
        promptListRef.current.navigateTagRight();
      }
    }
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredPrompts, setSelectedIndex]);

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="command-palette">
      {viewMode === 'list' && (
        <>
          <div className="search-header">
            <SearchBox 
              value={searchQuery} 
              onChange={setSearchQuery}
              placeholder={t('search.placeholder')}
            />
            <button 
              className="theme-toggle" 
              onClick={() => setSettingsOpen(true)}
              title={t('button.settings')}
            >
              ⚙️
            </button>
            <button onClick={handleNewPrompt} className="btn-new">
              {t('button.new')}
            </button>
          </div>
          
          <PromptList
            ref={promptListRef}
            prompts={prompts}
            searchQuery={searchQuery}
            selectedIndex={selectedIndex}
            onSelectPrompt={handleSelectPrompt}
            onEditPrompt={handleEditPrompt}
            onDeletePrompt={handleDeletePrompt}
            onFilteredPromptsChange={setFilteredPrompts}
            onReorderPrompts={reorderPrompts}
          />

          {/* 快捷键提示 */}
          <div className="shortcut-hint">
            {t('shortcut.hint')}
          </div>
        </>
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="editor-container">
          <div className="editor-header">
            <button 
              className="theme-toggle-small" 
              onClick={() => setSettingsOpen(true)}
              title={t('button.settings')}
            >
              ⚙️
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
        title={t('confirm.delete.title')}
        message={t('confirm.delete.message', { title: deleteConfirm.prompt?.title || '' })}
        confirmText={t('confirm.delete.confirm')}
        cancelText={t('confirm.delete.cancel')}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDangerous={true}
      />

      {/* 设置对话框 */}
      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Toast 通知 */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      {/* 全屏预览 */}
      {previewPrompt && (
        <PromptPreview
          prompt={previewPrompt}
          isOpen={true}
          onClose={() => setPreviewPrompt(null)}
        />
      )}
    </div>
  );
}
