import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import ApiTokenComponent from './_components/api-token/ApiTokenComponent';
import { Specifications } from './_components/specification/Specifications';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';

export default function Page() {
  const { t } = useTranslation();
  useDocumentTitle(t('howto.title'));

  return (
    <>
      <h2 className={clsx('text-primary', 'text-2xl', 'font-bold')}>{t('howto.title')}</h2>
      <Spacer className="h-8" />
      <div className={clsx('max-w-[1200px]')}>
        {/* APIトークン */}
        <ApiTokenComponent />
        <Spacer className="h-5" />
        {/* API仕様説明表 */}
        <Specifications />
      </div>
    </>
  );
}
