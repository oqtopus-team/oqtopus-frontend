import { useContext } from 'react';
import { userApiContext } from './Provider';
import {
  DevicesDeviceInfo,
  GetAnnouncementsListOrderEnum,
  JobsJobBase,
  JobsJobInfo,
  JobsJobInfoUploadPresignedURL,
  JobsRegisterJobResponse,
  JobsSubmitJobRequest,
} from '@/api/generated';
import { Job, JobS3Data, JobSearchParams } from '@/domain/types/Job';
import { Device } from '@/domain/types/Device';
import type { RawAxiosRequestConfig } from 'axios';
import axios from 'axios';
import JSZip from 'jszip';

interface AnnouncementsApi {
  offset?: string;
  limit?: string;
  options?: RawAxiosRequestConfig;
  currentTime?: string;
  order?: GetAnnouncementsListOrderEnum;
}

async function convertZipBlobToObject(zipBlob: Blob) {
  const zip = await JSZip.loadAsync(zipBlob);
  const [_, file] = Object.entries(zip.files)[0] ?? []; // we assume we have exactly 1 file inside ZIP

  if (!file) return;

  const fileContent = await file.async('string');
  return JSON.parse(fileContent);
}

export const useJobAPI = () => {
  const api = useContext(userApiContext);

  const registerJob = (): Promise<JobsRegisterJobResponse> => {
    return api.job.registerJobId().then((res) => res.data);
  };

  const uploadJobToS3 = async (
    presigned_url: JobsJobInfoUploadPresignedURL,
    jobFile: File,
    setUploadProgressPercent?: (progress: number) => void
  ): Promise<void> => {
    const { url, fields } = presigned_url;
    if (!url || !fields) throw new Error('missing presigned URL data');

    const formData = new FormData();
    for (const [k, v] of Object.entries(fields)) {
      if (!v) continue;
      formData.append(k, v);
    }

    formData.append('file', jobFile);
    const response = await axios.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress(progressEvent) {
        if (!progressEvent.total) return;
        const progressPercent = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgressPercent?.(progressPercent);
      },
    });
  };

  const retrieveJobFiles = async (jobInfo: JobsJobInfo): Promise<JobS3Data> => {
    const { input, transpile_result, result, combined_program } = jobInfo;
    const jobS3Data: JobS3Data = {
      input: await axios
        .get(input, { responseType: 'blob' })
        .then((r) => convertZipBlobToObject(r.data)),
    };

    if (transpile_result) {
      jobS3Data.transpileResult = await axios
        .get(transpile_result, { responseType: 'blob' })
        .then((r) => convertZipBlobToObject(r.data))
        .then((o) => o.transpile_result);
    }
    if (result) {
      jobS3Data.result = await axios
        .get(result, { responseType: 'blob' })
        .then((r) => convertZipBlobToObject(r.data))
        .then((o) => o.result);
    }
    if (combined_program) {
      jobS3Data.combinedProgram = await axios
        .get(combined_program, { responseType: 'blob' })
        .then((r) => convertZipBlobToObject(r.data))
        .then((o) => o.combined_program);
    }

    return jobS3Data;
  };

  /**
   * @returns Promise job id
   */
  const submitJob = async (
    // TODO: fix invalid oas schema (invalid fields: status, created_at, updated_at)
    job_id: string,
    job: JobsSubmitJobRequest
  ): Promise<string /* job id */> => {
    return api.job.submitJob(job_id, job).then((res) => res.data.message);
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
    sselogFileURL: string
  ): Promise<{ file: string | null; file_name: string | null; status: number }> => {
    try {
      const res = await axios.get(sselogFileURL, { responseType: 'blob' });
      const object = await convertZipBlobToObject(res.data);

      return {
        file: object.sselog.file,
        file_name: object.sselog.file_name,
        status: res.status,
      };
    } catch (error: any) {
      return {
        file: null,
        file_name: null,
        status: error.response.status,
      };
    }
  };

  return {
    registerJob,
    uploadJobToS3,
    retrieveJobFiles,
    submitJob,
    getLatestJobs,
    getJob,
    cancelJob,
    deleteJob,
    getSselog,
  };
};

const convertJobResult = (job: JobsJobBase): Job => ({
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

  const getAnnouncements = async ({
    limit,
    offset,
    options,
    order,
    currentTime,
  }: AnnouncementsApi) => {
    return api.announcements
      .getAnnouncementsList(offset, limit, order, currentTime, options)
      .then((res: any) => {
        if (res.status === 200) {
          return res.data.announcements;
        }
        return null;
      });
  };

  return { getAnnouncements };
};
