import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import clsx from 'clsx';
import styles from './news.module.css';

interface PostProps {
  post: {
    title: string;
    content: string;
    timestamp: string;
  };
}

export const NewsPost = ({ post }: PostProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Преобразование markdown в html
  const htmlContent = marked.parse(post.content);

  useEffect(() => {
    if (contentRef.current) {
      const shouldCollapse = contentRef.current.scrollHeight > 400;
      setShouldShowButton(shouldCollapse);
      setIsCollapsed(shouldCollapse);
    }
  }, [post]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={styles.news_container}>
      <div className={styles.post_header}>
        <span className={styles.post_title}>New title</span>
        <span className={styles.post_time}>2023/01/25 15:00</span>
      </div>
      <div
        ref={contentRef}
        className={clsx(styles.post_content, {
          [styles.collapsed]: isCollapsed,
        })}
        dangerouslySetInnerHTML={{ __html: marked.parse(htmlContent) }}
      ></div>
      <button
        type="button"
        className={clsx([
          styles.showMoreButton,
          {
            [styles.hidden]: !shouldShowButton,
          },
        ])}
        onClick={toggleCollapse}
      >
        {isCollapsed ? 'Expand' : 'Collapse'}
      </button>
    </div>
  );
};
