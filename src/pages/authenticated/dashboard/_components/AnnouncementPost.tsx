import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import clsx from 'clsx';
import styles from './announcement.module.css';
import { AnnouncementsGetAnnouncementResponse } from '@/api/generated';
import { DateTimeFormatter } from '@/pages/authenticated/_components/DateTimeFormatter';
import { useTranslation } from 'react-i18next';

interface PostProps {
  announcement: AnnouncementsGetAnnouncementResponse;
}

export const AnnouncementPost = ({ announcement }: PostProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (contentRef.current) {
      const shouldCollapse = contentRef.current.scrollHeight > 400;
      setShouldShowButton(shouldCollapse);
      setIsCollapsed(shouldCollapse);
    }
  }, [announcement]);

  // Parsing html string
  useEffect(() => {
    if (!announcement.content) return;

    async function getHtmlContent() {
      try {
        const parsedHtml = await marked.parse(announcement.content);
        setHtmlContent(parsedHtml)
      } catch (e) {
        console.log('Error parsing markdown: ', e);
      }
    }
    getHtmlContent()
  }, [announcement]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={styles.announcements_container}>
      <div className={styles.post_header}>
        <span className={styles.post_title}>{announcement.title}</span>
        <span className={styles.post_time}>
          {DateTimeFormatter(t, i18n, announcement.start_time)}
        </span>
      </div>
      <div
        ref={contentRef}
        className={clsx(styles.post_content, {
          [styles.collapsed]: isCollapsed,
        })}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
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
