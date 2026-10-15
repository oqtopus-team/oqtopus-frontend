import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { convertZipBlobToObject } from './hook';

const createZipBlob = async (files: Record<string, string>): Promise<Blob> => {
  const zip = new JSZip();
  Object.entries(files).forEach(([name, content]) => zip.file(name, content));
  return zip.generateAsync({ type: 'blob' });
};

describe('convertZipBlobToObject', () => {
  it('reads the only file when its ZIP contains directory entries', async () => {
    const blob = await createZipBlob({
      'nested/device_info.json': JSON.stringify({ qubits: [{ id: 0 }] }),
    });

    await expect(convertZipBlobToObject(blob)).resolves.toEqual({ qubits: [{ id: 0 }] });
  });

  it('rejects ZIP archives containing multiple files', async () => {
    const blob = await createZipBlob({
      'device_info.json': '{}',
      'unexpected.json': '{}',
    });

    await expect(convertZipBlobToObject(blob)).rejects.toThrow(
      'ZIP archive must contain exactly one file'
    );
  });
});
