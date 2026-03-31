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

export interface Position {
  x: number;
  y: number;
}

export interface MeasError {
  prob_meas1_prep0: number;
  prob_meas0_prep1: number;
  readout_assignment_error: number;
}

export interface QubitLifetime {
  t1: number;
  t2: number;
}

export interface QubitGateDuration {
  rz: number;
  sx: number;
  x: number;
}

export interface Qubit {
  id: number;
  physical_id: number;
  position: Position;
  fidelity: number;
  meas_error: MeasError;
  qubit_lifetime: QubitLifetime;
  gate_duration: QubitGateDuration;
}

export interface CouplingGateDuration {
  rzx90: number;
}

export interface Coupling {
  control: number;
  target: number;
  fidelity: number;
  gate_duration: CouplingGateDuration;
}

export interface DeviceInfo {
  name: string;
  device_id: string;
  qubits: Qubit[];
  couplings: Coupling[];
  calibrated_at: string;
}
