import { useContext } from 'react';
import { userApiContext } from './Provider';
import { DevicesDeviceInfo, JobsGetJobsResponse, JobsSubmitJobRequest } from '@/api/generated';
import { Job, JobSearchParams } from '@/domain/types/Job';
import { Device } from '@/domain/types/Device';
import type { RawAxiosRequestConfig } from 'axios';

interface AnnouncementsApi {
  offset?: string;
  limit?: string;
  options?: RawAxiosRequestConfig;
}

export const useJobAPI = () => {
  const api = useContext(userApiContext);

  /**
   * @returns Promise job id
   */
  const submitJob = async (
    // TODO: fix invalid oas schema (invalid fields: status, created_at, updated_at)
    job: JobsSubmitJobRequest
  ): Promise<string /* job id */> => {
    return api.job.submitJob(job).then((res) => res.data.job_id);
  };

  const getLatestJobs = async (
    page: number,
    pageSize: number,
    params: JobSearchParams = {}
  ): Promise<Job[]> => {
    return api.job
      .listJobs(
        'job_id,name,description,device_id,job_info,transpiler_info,simulator_info,mitigation_info,job_type,shots,status,submitted_at',
        undefined,
        undefined,
        params.query ?? '',
        page,
        pageSize,
        'DESC'
      )
      .then((res) => res.data.map(convertJobResult));
  };

  const getJob = async (id: string): Promise<Job | null> => {
    return api.job.getJob(id).then((res) => {
      if (res.status === 200) {
        return convertJobResult(res.data);
      }
      return null;
    });
  };

  const cancelJob = async (job: Job): Promise<string /* message */> => {
    return api.job.cancelJob(job.id).then((res) => res.data.message);
  };

  const deleteJob = async (job: Job): Promise<string /* message */> => {
    return api.job.deleteJob(job.id).then((res) => res.data.message);
  };

  const getSselog = async (
    job_id: string
  ): Promise<{ file: string | null; file_name: string | null; status: number }> => {
    return api.job
      .getSselog(job_id)
      .then((res) => {
        return {
          file: res.data.file ?? null,
          file_name: res.data.file_name ?? null,
          status: res.status,
        };
      })
      .catch((error) => {
        console.log(error);
        return {
          file: null,
          file_name: null,
          status: error.response.status,
        };
      });
  };

  return { submitJob, getLatestJobs, getJob, cancelJob, deleteJob, getSselog };
};

const convertJobResult = (job: JobsGetJobsResponse): Job => ({
  id: job.job_id ?? '', // TODO: fix invalid oas schema (nullable: should be false)
  name: job.name ?? '', // TODO: fix invalid oas schema (nullable: should be false)
  description: job.description,
  jobType: job.job_type!,
  status: job.status ?? 'unknown',
  deviceId: job.device_id ?? '', // TODO: fix invalid oas schema (nullable: should be false)
  shots: job.shots ?? 0, // TODO: fix invalid oas schema (nullable: should be false)
  jobInfo: job.job_info!,
  transpilerInfo: job.transpiler_info,
  simulatorInfo: job.simulator_info,
  mitigationInfo: job.mitigation_info,

  submittedAt: job.submitted_at ?? '', // TODO: fix invalid oas schema (nullable: should be false)
  readyAt: job.ready_at ?? '', // TODO: fix invalid oas schema (nullable: should be false)
  runningAt: job.running_at ?? '', // TODO: fix invalid oas schema (nullable: should be false)
  endedAt: job.ended_at ?? '', // TODO: fix invalid oas schema (nullable: should be false)

  executionTime: job.execution_time ?? 0, // TODO: fix invalid oas schema (nullable: should be false)
});

export const useDeviceAPI = () => {
  const api = useContext(userApiContext);

  const getDevices = async (): Promise<Device[]> => {
    return api.device.listDevices().then((res) => res.data.map(convertDeviceResult));
  };

  const getDevice = async (id: string): Promise<Device | null> => {
    return api.device.getDevice(id).then((res) => {
      if (res.status === 200) {
        return convertDeviceResult(res.data);
      }
      return null;
    });
  };

  return { getDevices, getDevice };
};

const convertDeviceResult = (device: DevicesDeviceInfo): Device => ({
  id: device.device_id,
  deviceType: device.device_type,
  status: device.status,
  availableAt: device.available_at,
  nPendingJobs: device.n_pending_jobs,
  nQubits: device.n_qubits ?? 0, // TODO: fix invalid oas schema (nullable: should be false)
  basisGates: device.basis_gates,
  supportedInstructions: device.supported_instructions,
  deviceInfo: device.device_info ?? '', // TODO: fix invalid oas schema (nullable: should be false)
  calibratedAt: device.calibrated_at ?? '', // TODO: fix invalid oas schema (nullable: should be false)
  description: device.description,
});

export const useAnnouncementsAPI = () => {
  const api = useContext(userApiContext);

  const getAnnouncements = async ({ limit, offset, options }: AnnouncementsApi) => {
    return api.announcements.getAnnouncementsList(offset, limit, options).then((res) => {
      if (res.status === 200) {
        return res.data.announcements;
      }
      return null;
    });
  };

  return { getAnnouncements };
};
