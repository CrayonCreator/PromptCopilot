import { useState, useEffect } from 'react';
import { PromptInput, Prompt } from '../types/prompt';
import { useLanguage } from '../contexts/LanguageContext';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TagSelector } from './TagSelector';
import { useTags } from '../hooks/useTags';

interface PromptEditorProps {
  prompt?: Prompt;
  allPrompts: Prompt[];
  onSave: (promptData: PromptInput) => Promise<void>;
  onCancel: () => void;
}

export function PromptEditor({ prompt, allPrompts, onSave, onCancel }: PromptEditorProps) {
  const [formData, setFormData] = useState<PromptInput>({
    title: '',
    content: '',
    tags: ''
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { t } = useLanguage();
  const { allTags } = useTags(allPrompts);

  useEffect(() => {
    if (prompt) {
      setFormData({
        title: prompt.title,
        content: prompt.content,
        tags: prompt.tags.join(' ')
      });
    }
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    
    await onSave(formData);
    onCancel();
  };

  return (
    <div className="prompt-editor">
      <h2>{prompt ? t('button.edit') + ' Prompt' : t('button.new') + ' Prompt'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-content">
          <div className="form-group">
            <label htmlFor="title">{t('editor.title')} *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('editor.title.placeholder')}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <div className="content-header">
              <label htmlFor="content">{t('editor.content')} *</label>
              <div className="content-tabs">
                <button
                  type="button"
                  className={`tab-button ${!isPreviewMode ? 'active' : ''}`}
                  onClick={() => setIsPreviewMode(false)}
                >
                  {t('button.edit')}
                </button>
                <button
                  type="button"
                  className={`tab-button ${isPreviewMode ? 'active' : ''}`}
                  onClick={() => setIsPreviewMode(true)}
                >
                  {t('editor.preview')}
                </button>
              </div>
            </div>
            {!isPreviewMode ? (
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={t('editor.content.placeholder')}
                rows={8}
                required
              />
            ) : (
              <div className="content-preview">
                <MarkdownRenderer content={formData.content} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tags">{t('editor.tags')}</label>
            <TagSelector
              selectedTags={formData.tags.split(' ').filter(tag => tag.trim())}
              availableTags={allTags}
              onChange={(tags) => setFormData({ ...formData, tags: tags.join(' ') })}
              placeholder={t('editor.tags.placeholder')}
              maxTags={10}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {prompt ? t('button.save') : t('button.save')}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            {t('button.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
