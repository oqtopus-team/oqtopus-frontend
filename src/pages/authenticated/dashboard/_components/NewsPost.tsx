import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import clsx from 'clsx';
import styles from './news.module.css';
import { AnnouncementsGetAnnouncementResponse } from '@/api/generated';
import { DateTimeFormatter } from '@/pages/authenticated/_components/DateTimeFormatter';
import { useTranslation } from 'react-i18next';

interface PostProps {
  announcement: AnnouncementsGetAnnouncementResponse;
}

export const NewsPost = ({ announcement }: PostProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

  // Преобразование markdown в html
  const htmlContent = marked.parse(announcement.content);

  useEffect(() => {
    if (contentRef.current) {
      const shouldCollapse = contentRef.current.scrollHeight > 400;
      setShouldShowButton(shouldCollapse);
      setIsCollapsed(shouldCollapse);
    }
  }, [announcement]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={styles.news_container}>
      <div className={styles.post_header}>
        <span className={styles.post_title}>{announcement.title}</span>
        <span className={styles.post_time}>{DateTimeFormatter(t, i18n, announcement.start_time)}</span>
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
        {t(isCollapsed ? 'common.expand' : 'common.collapse')}
      </button>
    </div>
  );
};
