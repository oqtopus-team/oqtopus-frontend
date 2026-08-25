import { DevicesDeviceInfoDeviceTypeEnum, DevicesDeviceInfoStatusEnum } from '@/api/generated';

export type DeviceType = DevicesDeviceInfoDeviceTypeEnum;
export type DeviceStatusType = DevicesDeviceInfoStatusEnum;

export interface Device {
  id: string;
  deviceType: DeviceType;
  status: DeviceStatusType;
  availableAt?: string;
  nPendingJobs: number;
  nQubits: number;
  basisGates: Array<string>;
  supportedInstructions: Array<string>;
  deviceInfo?: string;
  calibratedAt?: string;
  description: string;
}

export interface DeviceInfoHistoryEntry {
  historyId: string;
  deviceId: string;
  calibratedAt: string;
  nQubits: number;
  nCouplings: number;
}

export interface DeviceInfoHistoryList {
  items: DeviceInfoHistoryEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface DeviceInfoHistoryDetail extends DeviceInfoHistoryEntry {
  deviceInfo: string;
}
