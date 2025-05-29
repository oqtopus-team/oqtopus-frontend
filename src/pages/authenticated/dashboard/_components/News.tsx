import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Button } from '@/pages/_components/Button';
import { Spacer } from '@/pages/_components/Spacer';
import { NewsPost } from '@/pages/authenticated/dashboard/_components/NewsPost';
import { useAnnouncementsAPI } from '@/backend/hook';
import { useEffect, useState } from 'react';
import { AnnouncementsGetAnnouncementResponse } from '@/api/generated';

export const News = (): React.ReactElement => {
  const { t } = useTranslation();
  const { getAnnouncements } = useAnnouncementsAPI();
  const [newsList, setNewsList] = useState<AnnouncementsGetAnnouncementResponse[]>([]);

  useEffect(() => {
    async function getAnnouncementsList() {
      try {
        const response = await getAnnouncements();

        if (!response) return;

        setNewsList(response);
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
          {t('dashboard.news.title')}
        </div>
        <Button kind="link" color="secondary" href="/news">
          {t('dashboard.news.button')}
        </Button>
      </div>
      <Spacer className="h-4" />
      <div className={clsx('grid', 'gap-[23px]')}>
        {newsList.map((announcement) => (
          <NewsPost announcement={announcement} />
        ))}
      </div>
    </>
  );
};

export default News;
