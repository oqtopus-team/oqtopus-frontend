import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TopologyInfo } from './TopologyInfo';

const windowSize = vi.hoisted(() => ({ width: 1024, height: 768 }));

vi.mock('react-force-graph-2d', () => ({
  default: () => <div data-testid="force-graph" />,
}));
vi.mock('simplebar-react', () => ({
  default: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));
vi.mock('@/pages/_hooks/UseWindowSize', () => ({
  default: () => windowSize,
}));
vi.mock('@/pages/_components/JSONCodeBlock', () => ({
  JSONCodeBlock: () => <div />,
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

describe('TopologyInfo', () => {
  it('gives metric and zoom controls accessible names', () => {
    render(<TopologyInfo deviceInfo='{"qubits":[{"id":0}],"couplings":[]}' />);

    expect(
      screen.getByRole('combobox', { name: 'device.detail.topology_info.qubit_metric:' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'device.detail.topology_info.coupling_metric:' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('slider', { name: /device.detail.topology_info.zoom/ })
    ).toBeInTheDocument();
  });
});
