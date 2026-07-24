import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { JobDetailBasicInfo } from './JobDetailBasicInfo';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'job.detail.info.item': 'Item',
        'job.detail.info.id': 'Job ID',
        'job.detail.info.name': 'Job name',
        'job.detail.info.description': 'Description',
        'job.detail.info.job_type': 'Job type',
        'job.detail.info.device_id': 'Device ID',
        'job.detail.info.shots': 'Shots',
        'job.detail.info.status': 'Status',
        'job.detail.info.submitted_at': 'Submitted at',
        'job.detail.info.ready_at': 'Ready at',
        'job.detail.info.running_at': 'Running at',
        'job.detail.info.ended_at': 'Ended at',
        'job.detail.info.execution_time': 'Execution time',
        'job.detail.info.message': 'Message',
        'job.detail.info.runtime_device_info': 'Open device information at job runtime',
        'job.detail.text.copy_tooltip': 'Copy to clipboard',
      })[key] ?? key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('@/pages/authenticated/_components/DateTimeFormatter', () => ({
  DateTimeFormatter: (_t: unknown, _i18n: unknown, value: string) => value,
}));

const baseJob = {
  id: 'job-1',
  name: 'Runtime history job',
  description: 'Demo job',
  jobType: 'sampling',
  deviceId: 'qulacs',
  shots: '1000',
  status: 'succeeded',
  submittedAt: '2024-03-01T11:55:00Z',
  readyAt: '2024-03-01T11:59:30Z',
  runningAt: '2024-03-01T12:00:00Z',
  endedAt: '2024-03-01T12:00:12Z',
  executionTime: 12.345,
  message: 'done',
};

describe('JobDetailBasicInfo', () => {
  it('links to the device information snapshot at job runtime', () => {
    render(
      <MemoryRouter>
        <JobDetailBasicInfo {...baseJob} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Open device information at job runtime' })).toHaveAttribute(
      'href',
      '/device/qulacs?deviceInfoAt=2024-03-01T12%3A00%3A00Z'
    );
  });

  it('does not show a runtime device information link before the job starts running', () => {
    render(
      <MemoryRouter>
        <JobDetailBasicInfo {...baseJob} runningAt="" />
      </MemoryRouter>
    );

    expect(screen.queryByRole('link', { name: 'Open device information at job runtime' })).toBeNull();
  });
});