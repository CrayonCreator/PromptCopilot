import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'zh' | 'en';

interface Translations {
  zh: Record<string, string>;
  en: Record<string, string>;
}

const translations: Translations = {
  zh: {
    // 搜索和主界面
    'search.placeholder': '搜索提示词或输入 "new" 创建新的prompt...',
    'button.new': '新建',
    'button.settings': '设置',
    'button.save': '保存',
    'button.cancel': '取消',
    'button.delete': '删除',
    'button.edit': '编辑',
    'button.use': '使用',
    'button.preview': '预览',
    
    // 设置对话框
    'settings.title': '设置',
    'settings.theme': '主题',
    'settings.theme.dark': '深色',
    'settings.theme.light': '浅色',
    'settings.language': '语言',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.close': '关闭',
    
    // 编辑器
    'editor.title': '标题',
    'editor.title.placeholder': '输入提示词标题...',
    'editor.content': '内容',
    'editor.content.placeholder': '输入提示词内容...（支持 Markdown）',
    'editor.tags': '标签',
    'editor.tags.placeholder': '添加标签（用空格分隔）...',
    'editor.preview': '预览',
    
    // 确认对话框
    'confirm.delete.title': '删除提示词',
    'confirm.delete.message': '确定要删除"{title}"吗？此操作无法撤销。',
    'confirm.delete.confirm': '删除',
    'confirm.delete.cancel': '取消',
    
    // 状态和消息
    'loading': '加载中...',
    'toast.saved': '提示词已保存',
    'toast.deleted': '提示词已删除',
    'toast.copied': '已复制到剪贴板',
    'toast.error': '操作失败',
    
    // 快捷键提示
    'shortcut.hint': 'Ctrl+Shift+P 打开/关闭',
    'shortcut.enter': '回车使用',
    'shortcut.space': '空格预览',
    'shortcut.escape': 'ESC 返回',
    
    // 其他
    'empty.prompts': '暂无提示词',
    'empty.search': '未找到匹配的提示词'
  },
  en: {
    // Search and main interface
    'search.placeholder': 'Search prompts or type "new" to create...',
    'button.new': 'New',
    'button.settings': 'Settings',
    'button.save': 'Save',
    'button.cancel': 'Cancel',
    'button.delete': 'Delete',
    'button.edit': 'Edit',
    'button.use': 'Use',
    'button.preview': 'Preview',
    
    // Settings dialog
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.theme.dark': 'Dark',
    'settings.theme.light': 'Light',
    'settings.language': 'Language',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.close': 'Close',
    
    // Editor
    'editor.title': 'Title',
    'editor.title.placeholder': 'Enter prompt title...',
    'editor.content': 'Content',
    'editor.content.placeholder': 'Enter prompt content... (Supports Markdown)',
    'editor.tags': 'Tags',
    'editor.tags.placeholder': 'Add tags (separated by spaces)...',
    'editor.preview': 'Preview',
    
    // Confirm dialog
    'confirm.delete.title': 'Delete Prompt',
    'confirm.delete.message': 'Are you sure you want to delete "{title}"? This action cannot be undone.',
    'confirm.delete.confirm': 'Delete',
    'confirm.delete.cancel': 'Cancel',
    
    // Status and messages
    'loading': 'Loading...',
    'toast.saved': 'Prompt saved',
    'toast.deleted': 'Prompt deleted',
    'toast.copied': 'Copied to clipboard',
    'toast.error': 'Operation failed',
    
    // Shortcut hints
    'shortcut.hint': 'Ctrl+Shift+P to toggle',
    'shortcut.enter': 'Enter to use',
    'shortcut.space': 'Space to preview',
    'shortcut.escape': 'ESC to go back',
    
    // Others
    'empty.prompts': 'No prompts available',
    'empty.search': 'No matching prompts found'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'zh';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string, params?: Record<string, string>): string => {
    let text = translations[language][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{${paramKey}}`, paramValue);
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
