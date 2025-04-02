import { useAuth } from '@/auth/hook';
import { useJobAPI } from '@/backend/hook';

export const useDownloadLog = () => {
  const api = useJobAPI();

  const handleDownloadLog = async (job_id: string) => {
    try {
      const res = await api.getSselog(job_id);
      if (res.status !== 200) {
        if (res.status === 404) {
          alert('Log file does not exist');
          return;
        } else {
          alert('Failed to download log');
          return;
        }
      }

      const binaryStr = atob(res.file ?? '');
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.file_name ?? 'sselog.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
      alert('Failed to download log');
    }
  };

  return { handleDownloadLog };
};
