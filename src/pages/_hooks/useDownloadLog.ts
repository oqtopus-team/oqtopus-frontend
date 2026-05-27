import { useJobAPI } from '@/backend/hook';
import { toast } from 'react-toastify';
import { errorToastConfig } from '@/config/toast';

export const useDownloadLog = () => {
  const api = useJobAPI();

  const handleDownloadLog = async (job_id: string, sseLogFileURL: string | undefined) => {
    if (!sseLogFileURL) {
      alert('Log file does not exist');
      return;
    }

    try {
      const res = await api.getSselog(sseLogFileURL);
      if (res.status !== 200 || res.file === null) {
        if (res.status === 404) {
          toast('Log file does not exist', errorToastConfig);
          return;
        } else {
          toast('Failed to download log', errorToastConfig);
          return;
        }
      }

      const url = window.URL.createObjectURL(res.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sselog_${job_id}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
      toast('Failed to download log', errorToastConfig);
    }
  };

  return { handleDownloadLog };
};
