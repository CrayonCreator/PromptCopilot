import { useState, useEffect } from 'react';
import { PromptInput, Prompt } from '../types/prompt';
import { useLanguage } from '../hooks/useLanguage';
import { MarkdownRenderer } from './MarkdownRenderer';

interface PromptEditorProps {
  prompt?: Prompt;
  onSave: (promptData: PromptInput) => Promise<void>;
  onCancel: () => void;
}

export function PromptEditor({ prompt, onSave, onCancel }: PromptEditorProps) {
  const [formData, setFormData] = useState<PromptInput>({
    title: '',
    content: '',
    tags: ''
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { t } = useLanguage();

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
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder={t('editor.tags.placeholder')}
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
