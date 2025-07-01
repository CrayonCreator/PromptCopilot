import { useTheme, Theme } from '../hooks/useTheme';
import { useLanguage, Language } from '../hooks/useLanguage';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  const handleThemeChange = (newTheme: Theme) => {
    if (newTheme !== theme) {
      toggleTheme();
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="settings-overlay">
      <div className="settings-dialog">
        <div className="settings-header">
          <h2>{t('settings.title')}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="settings-content">
          {/* 主题设置 */}
          <div className="setting-group">
            <label className="setting-label">{t('settings.theme')}</label>
            <div className="setting-options">
              <button
                className={`setting-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                🌙 {t('settings.theme.dark')}
              </button>
              <button
                className={`setting-option ${theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                ☀️ {t('settings.theme.light')}
              </button>
            </div>
          </div>

          {/* 语言设置 */}
          <div className="setting-group">
            <label className="setting-label">{t('settings.language')}</label>
            <div className="setting-options">
              <button
                className={`setting-option ${language === 'zh' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('zh')}
              >
                🇨🇳 {t('settings.language.zh')}
              </button>
              <button
                className={`setting-option ${language === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                🇺🇸 {t('settings.language.en')}
              </button>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn-primary" onClick={onClose}>
            {t('settings.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
