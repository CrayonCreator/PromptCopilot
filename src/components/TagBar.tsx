import { useEffect, useRef } from 'react';

interface TagBarProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export function TagBar({ tags, selectedTag, onSelectTag }: TagBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scrollAmount = e.deltaY * 0.5;
      container.scrollLeft += scrollAmount;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const sortedTags = [...tags].sort();

  return (
    <div className="tag-bar" ref={containerRef}>
      <button
        className={`tag-item ${selectedTag === null ? 'selected' : ''}`}
        onClick={() => onSelectTag(null)}
      >
        All
      </button>
      {sortedTags.map((tag) => (
        <button
          key={tag}
          className={`tag-item ${selectedTag === tag ? 'selected' : ''}`}
          onClick={() => onSelectTag(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
