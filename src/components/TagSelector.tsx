import { useState, useEffect, useRef, useCallback } from 'react';

interface TagSelectorProps {
  selectedTags: string[];
  availableTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagSelector({ 
  selectedTags, 
  availableTags, 
  onChange, 
  placeholder = "添加标签...",
  maxTags = 10 
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateFilteredTags = useCallback(() => {
    const query = inputValue.toLowerCase().trim();

    if (!query) {
      const unselectedTags = availableTags.filter(tag => !selectedTags.includes(tag));
      setFilteredTags(unselectedTags.slice(0, 8));
      return;
    }

    const filtered = availableTags.filter(tag =>
      !selectedTags.includes(tag) &&
      tag.toLowerCase().includes(query)
    );

    const exactMatch = availableTags.find(tag => tag.toLowerCase() === query);
    if (!exactMatch && query.length > 0) {
      filtered.unshift(`创建 "${inputValue}"`);
    }

    setFilteredTags(filtered.slice(0, 8));
  }, [inputValue, availableTags, selectedTags]);

  useEffect(() => {
    updateFilteredTags();
  }, [updateFilteredTags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsDropdownOpen(true);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
    updateFilteredTags();
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    }, 150);
  };

  const addTag = (tag: string) => {
    if (selectedTags.length >= maxTags) return;
    
    let tagToAdd = tag;
    
    if (tag.startsWith('创建 "') && tag.endsWith('"')) {
      tagToAdd = inputValue.trim();
    }
    
    if (tagToAdd && !selectedTags.includes(tagToAdd)) {
      onChange([...selectedTags, tagToAdd]);
      setInputValue('');
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isDropdownOpen) {
          setIsDropdownOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < filteredTags.length - 1 ? prev + 1 : 0
          );
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (isDropdownOpen) {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredTags.length - 1
          );
        }
        break;
        
      case 'Enter':
        e.preventDefault();
        if (isDropdownOpen && highlightedIndex >= 0 && filteredTags[highlightedIndex]) {
          addTag(filteredTags[highlightedIndex]);
        } else if (inputValue.trim()) {
          addTag(inputValue.trim());
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        setInputValue('');
        break;
        
      case 'Backspace':
        if (!inputValue && selectedTags.length > 0) {
          removeTag(selectedTags[selectedTags.length - 1]);
        }
        break;
        
      case 'Tab':
        if (isDropdownOpen && highlightedIndex >= 0) {
          e.preventDefault();
          addTag(filteredTags[highlightedIndex]);
        }
        break;
    }
  };

  const handleOptionClick = (tag: string) => {
    addTag(tag);
  };

  return (
    <div className="tag-selector" ref={containerRef}>
      <div className="tag-selector-container">
        {/* 已选标签显示 */}
        <div className="selected-tags">
          {selectedTags.map(tag => (
            <span key={tag} className="selected-tag">
              {tag}
              <button
                type="button"
                className="remove-tag-btn"
                onClick={() => removeTag(tag)}
                aria-label={`移除标签 ${tag}`}
              >
                <svg viewBox="0 0 12 12">
                  <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </span>
          ))}
        </div>

        {/* 输入框 */}
        <div className="tag-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? placeholder : ""}
            className="tag-input"
            disabled={selectedTags.length >= maxTags}
          />
        </div>
      </div>

      {/* 下拉选项 */}
      {isDropdownOpen && (
        <div className="tag-dropdown" ref={dropdownRef}>
          {filteredTags.length > 0 ? (
            <div className="tag-options">
              {filteredTags.map((tag, index) => (
                <div
                  key={tag}
                  className={`tag-option ${index === highlightedIndex ? 'highlighted' : ''}`}
                  onClick={() => handleOptionClick(tag)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {tag.startsWith('创建 "') ? (
                    <span className="create-tag-option">
                      <span className="create-icon">
                        <svg viewBox="0 0 12 12">
                          <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </span>
                      {tag}
                    </span>
                  ) : (
                    <span className="existing-tag-option">
                      <span className="tag-icon">#</span>
                      {tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-options">
              {inputValue ? '没有匹配的标签' : '暂无可用标签'}
            </div>
          )}
          
          {/* 提示信息 */}
          <div className="tag-dropdown-hint">
            <span>↑↓ 选择 • Enter 确认 • Esc 取消</span>
          </div>
        </div>
      )}

      {/* 标签计数 */}
      {maxTags && (
        <div className="tag-count">
          {selectedTags.length}/{maxTags}
        </div>
      )}
    </div>
  );
}
