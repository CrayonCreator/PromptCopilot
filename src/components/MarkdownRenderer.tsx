import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

marked.setOptions({
  breaks: true,
  gfm: true,
});

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const htmlContent = useMemo(() => {
    if (!content) return '';
    
    try {
      const rawHtml = marked(content) as string;
      return DOMPurify.sanitize(rawHtml);
    } catch (error) {
      console.error('Markdown rendering error:', error);
      return content;
    }
  }, [content]);

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
