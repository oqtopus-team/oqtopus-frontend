import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import {
  createDeviceInfoHistoryZip,
  createDeviceInfoHistoryZipFileName,
  formatDeviceInfoJson,
} from './downloadDeviceInfoJson';

describe('device info downloads', () => {
  it('formats valid JSON and preserves invalid JSON', () => {
    expect(formatDeviceInfoJson('{"qubits":[1,2]}')).toBe(
      '{\n  "qubits": [\n    1,\n    2\n  ]\n}'
    );
    expect(formatDeviceInfoJson('not-json')).toBe('not-json');
  });

  it('creates a timestamped ZIP file name', () => {
    expect(createDeviceInfoHistoryZipFileName(new Date('2026-08-25T12:34:56.789Z'))).toBe(
      'device_info_history_20260825T123456Z.zip'
    );
  });

  it('creates a ZIP containing each formatted history JSON file', async () => {
    const blob = await createDeviceInfoHistoryZip([
      { deviceInfo: '{"device":"qpu-1"}', fileName: 'first.json' },
      { deviceInfo: 'legacy-content', fileName: 'second.json' },
    ]);
    const zip = await JSZip.loadAsync(blob);

    await expect(zip.file('first.json')?.async('string')).resolves.toBe(
      '{\n  "device": "qpu-1"\n}'
    );
    await expect(zip.file('second.json')?.async('string')).resolves.toBe('legacy-content');
  });
});
