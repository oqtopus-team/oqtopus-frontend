export const createDeviceInfoJsonFileName = (deviceId: string, calibratedAt: string): string => {
  const timestamp = calibratedAt.replace(/[:.]/g, '').replace(/\s+/g, '_');
  return `device_info_${deviceId}_${timestamp}.json`;
};

export const downloadDeviceInfoJson = (deviceInfo: string, fileName: string): void => {
  let downloadContent = deviceInfo;
  try {
    downloadContent = JSON.stringify(JSON.parse(deviceInfo), null, 2);
  } catch {
    // Preserve the original payload if it is not valid JSON.
  }

  const blob = new Blob([downloadContent], { type: 'application/json' });
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobUrl);
};
