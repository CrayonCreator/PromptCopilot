import { useState, useEffect } from 'react';
import { PromptInput, Prompt } from '../types/prompt';

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
      <h2>{prompt ? 'Edit Prompt' : 'New Prompt'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-content">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter prompt title..."
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter prompt content..."
              rows={6}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Enter tags separated by spaces..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {prompt ? 'Update' : 'Save'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
