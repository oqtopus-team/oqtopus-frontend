import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Button } from '@/pages/_components/Button';
import { Spacer } from '@/pages/_components/Spacer';
import { AnnouncementPost } from '@/pages/authenticated/dashboard/_components/AnnouncementPost';
import { useAnnouncementsAPI } from '@/backend/hook';
import { useEffect, useState } from 'react';
import { AnnouncementsGetAnnouncementResponse } from '@/api/generated';

export const Announcements = (): React.ReactElement => {
  const { t } = useTranslation();
  const { getAnnouncements } = useAnnouncementsAPI();
  const [announcementsList, setAnnouncementsList] = useState<
    AnnouncementsGetAnnouncementResponse[]
  >([]);

  useEffect(() => {
    async function getAnnouncementsList() {
      try {
        const response = await getAnnouncements({
          options: {
            params: {
              order: 'DESC',
            },
          },
        });

        if (!response) return;

        setAnnouncementsList(response);
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
        <Button kind="link" color="secondary" href="/announcements">
          {t('dashboard.announcements.button')}
        </Button>
      </div>
      <Spacer className="h-4" />
      <div className={clsx('grid', 'gap-[23px]')}>
        {announcementsList.map((announcement) => (
          (announcement.publishable && (
            new Date(announcement.start_time).getTime() < Date.now()
            && new Date(announcement.end_time).getTime() > Date.now()
          ) &&<AnnouncementPost key={announcement.id} announcement={announcement} />)
        ))}
      </div>
    </>
  );
};

export default Announcements;
