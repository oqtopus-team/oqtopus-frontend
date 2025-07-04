import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Spacer } from '@/pages/_components/Spacer';
import { AnnouncementPost } from '@/pages/authenticated/dashboard/_components/AnnouncementPost';
import { useAnnouncementsAPI } from '@/backend/hook';
import { CSSProperties, useEffect, useState } from 'react';
import {
  AnnouncementsGetAnnouncementResponse,
  GetAnnouncementsListOrderEnum,
} from '@/api/generated';
import styles from './announcement.module.css';

interface AnnouncementProps {
  style?: {
    post?: CSSProperties | Record<string, string | number>;
  };
}

export const Announcements = (props: AnnouncementProps): React.ReactElement => {
  const { t } = useTranslation();
  const { getAnnouncements } = useAnnouncementsAPI();
  const [allAnnouncementsList, setAllAnnouncementsList] = useState<
    AnnouncementsGetAnnouncementResponse[]
  >([]);
  const [filteredAnnouncementsList, setFilteredAnnouncementsList] = useState<
    AnnouncementsGetAnnouncementResponse[]
  >([]);

  useEffect(() => {
    async function getAnnouncementsList() {
      try {
        const response = await getAnnouncements({
          order: GetAnnouncementsListOrderEnum.Desc,
          currentTime: new Date().toISOString(),
        });

        if (!response) return;

        setAllAnnouncementsList(response);

        const filteredList = response.filter((announcement) => announcement.publishable);
        setFilteredAnnouncementsList(filteredList);
      } catch (e) {
        console.log(e);
      }
    }

    getAnnouncementsList();
  }, []);

  return (
    <>
      <div className={clsx('flex', 'justify-between', 'items-center')}>
        <div className={clsx('text-base', 'font-bold', 'text-primary')}>
          {t('dashboard.announcements.title')}
        </div>
      </div>
      <Spacer className="h-4" />
      <div className={clsx('grid', 'gap-[23px]')}>
        {filteredAnnouncementsList.length === 0 && (
          <p className={clsx(styles.no_announcements)}>{t('announcements.no_announcements')}</p>
        )}

        {filteredAnnouncementsList.map((announcement) => (
          <AnnouncementPost
            key={announcement.id}
            announcement={announcement}
            style={{ announcement: props.style?.post }}
          />
        ))}
      </div>
    </>
  );
};

export default Announcements;
