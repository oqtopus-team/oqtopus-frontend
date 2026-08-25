import JSZip from 'jszip';

export type DeviceInfoJsonArchiveEntry = {
  deviceInfo: string;
  fileName: string;
};

export const createDeviceInfoJsonFileName = (deviceId: string, calibratedAt: string): string => {
  const timestamp = calibratedAt.replace(/[:.]/g, '').replace(/\s+/g, '_');
  return `device_info_${deviceId}_${timestamp}.json`;
};

export const createDeviceInfoHistoryZipFileName = (createdAt = new Date()): string => {
  const timestamp = createdAt
    .toISOString()
    .replace(/-/g, '')
    .replace(/:/g, '')
    .replace(/\./g, '')
    .replace(/\d{3}Z$/, 'Z');
  return `device_info_history_${timestamp}.zip`;
};

export const formatDeviceInfoJson = (deviceInfo: string): string => {
  try {
    return JSON.stringify(JSON.parse(deviceInfo), null, 2);
  } catch {
    return deviceInfo;
  }
};

export const createDeviceInfoHistoryZip = async (
  entries: DeviceInfoJsonArchiveEntry[]
): Promise<Blob> => {
  const zip = new JSZip();
  entries.forEach(({ deviceInfo, fileName }) => {
    zip.file(fileName, formatDeviceInfoJson(deviceInfo));
  });
  return zip.generateAsync({ type: 'blob' });
};

const downloadBlob = (blob: Blob, fileName: string): void => {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobUrl);
};

export const downloadDeviceInfoHistoryZip = async (
  entries: DeviceInfoJsonArchiveEntry[]
): Promise<void> => {
  const blob = await createDeviceInfoHistoryZip(entries);
  downloadBlob(blob, createDeviceInfoHistoryZipFileName());
};

export const downloadDeviceInfoJson = (deviceInfo: string, fileName: string): void => {
  const blob = new Blob([formatDeviceInfoJson(deviceInfo)], { type: 'application/json' });
  downloadBlob(blob, fileName);
};
