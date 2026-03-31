import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DeviceInfo, Qubit, Coupling } from '@/domain/types/Device';
import { Select } from '@/pages/_components/Select';
import { useTranslation } from 'react-i18next';

type QubitMetricKey =
  | 'readout_assignment_error'
  | 'prob_meas0_prep1'
  | 'prob_meas1_prep0'
  | 't1'
  | 't2'
  | 'fidelity'
  | 'sx_duration'
  | 'x_duration'
  | 'rz_duration';

type CouplingMetricKey = 'coupling_error' | 'rzx90_duration';

type MetricKey = QubitMetricKey | CouplingMetricKey;

interface MetricConfig {
  key: MetricKey;
  label: string;
  unit?: string;
  group: 'qubit' | 'coupling';
}

interface ChartPoint {
  id: string;
  label: string;
  value: number | null;
}

type SortMode = 'valueDesc' | 'valueAsc' | 'idAsc' | 'idDesc';

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'valueDesc', label: 'device.detail.topology_info.sort_options.valueDesc' },
  { value: 'valueAsc', label: 'device.detail.topology_info.sort_options.valueAsc' },
  { value: 'idAsc', label: 'device.detail.topology_info.sort_options.idAsc' },
  { value: 'idDesc', label: 'device.detail.topology_info.sort_options.idDesc' },
];

// If new data becomes available to display, add it to this list
const METRICS: MetricConfig[] = [
  { key: 't1', label: 'T1', unit: 'μs', group: 'qubit' },
  { key: 't2', label: 'T2', unit: 'μs', group: 'qubit' },
  { key: 'readout_assignment_error', label: 'Readout assignment error', group: 'qubit' },
  { key: 'prob_meas0_prep1', label: 'Prob meas0 prep1', group: 'qubit' },
  { key: 'prob_meas1_prep0', label: 'Prob meas1 prep0', group: 'qubit' },
  { key: 'fidelity', label: 'Fidelity', group: 'qubit' },
  { key: 'sx_duration', label: '√x (sx) gate length', unit: 'ns', group: 'qubit' },
  { key: 'x_duration', label: 'Pauli-X gate length', unit: 'ns', group: 'qubit' },
  { key: 'coupling_error', label: 'CZ error (1 − fidelity)', group: 'coupling' },
  { key: 'rzx90_duration', label: 'Gate length (rzx90)', unit: 'ns', group: 'coupling' },
];

const QUBIT_EXTRACTORS: Record<QubitMetricKey, (q: Qubit) => number | undefined | null> = {
  readout_assignment_error: (q) => q.meas_error?.readout_assignment_error,
  prob_meas0_prep1: (q) => q.meas_error?.prob_meas0_prep1,
  prob_meas1_prep0: (q) => q.meas_error?.prob_meas1_prep0,
  t1: (q) => q.qubit_lifetime?.t1,
  t2: (q) => q.qubit_lifetime?.t2,
  fidelity: (q) => q.fidelity,
  sx_duration: (q) => q.gate_duration?.sx,
  x_duration: (q) => q.gate_duration?.x,
  rz_duration: (q) => q.gate_duration?.rz,
};

const COUPLING_EXTRACTORS: Record<CouplingMetricKey, (c: Coupling) => number | undefined | null> = {
  coupling_error: (c) => (c.fidelity !== undefined && c.fidelity !== null ? 1 - c.fidelity : undefined),
  rzx90_duration: (c) => c.gate_duration?.rzx90,
};

function getBarColor(value: number | null, min: number, max: number): string {
  if (value === null) return '#555a72';
  const t = max === min ? 0 : (value - min) / (max - min);
  const r = Math.round(80 + t * 175);
  const g = Math.round(80 + t * 100);
  const b = Math.round(255 - t * 40);
  return `rgb(${r}, ${g}, ${b})`;
}

function formatSci(num: number): string {
  if (num === 0) return '0';
  const abs = Math.abs(num);
  if (abs >= 1 && abs < 1000) return num.toFixed(2);
  const exp = Math.floor(Math.log10(abs));
  const mantissa = num / Math.pow(10, exp);
  return `${mantissa.toFixed(3)}E${exp}`;
}

function computeStats(values: number[]) {
  if (values.length === 0) {
    return { min: 0, max: 0, median: null };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  return { min, max, median };
}

function sortData(data: ChartPoint[], mode: SortMode): ChartPoint[] {
  const copy = [...data];
  switch (mode) {
    case 'valueDesc':
      return copy.sort((a, b) => {
        if (a.value === null) return 1;
        if (b.value === null) return -1;
        return b.value - a.value;
      });
    case 'valueAsc':
      return copy.sort((a, b) => {
        if (a.value === null) return 1;
        if (b.value === null) return -1;
        return a.value - b.value;
      });
    case 'idAsc':
      return copy.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    case 'idDesc':
      return copy.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));
  }
}

function GradientLegend({
  median,
  min,
  max,
  unit,
}: {
  median: number | null;
  min: number;
  max: number;
  unit?: string;
}) {
  const { t } = useTranslation();

  const medianPosition =
    median !== null ? (max === min ? 50 : ((median - min) / (max - min)) * 100) : null;

  const displayUnit = unit ? ` ${unit}` : '';

  return (
    <div className="flex flex-col gap-1" style={{ minWidth: 220 }}>
      <div className="relative h-5">
        {median !== null && medianPosition !== null && (
          <div
            className="absolute -top-5 flex flex-col"
            style={{
              left: `${medianPosition}%`,
              ...(medianPosition < 20
                ? { transform: 'translateX(0%)', alignItems: 'flex-start' }
                : medianPosition > 80
                  ? { transform: 'translateX(-100%)', alignItems: 'flex-end' }
                  : { transform: 'translateX(-50%)', alignItems: 'center' }),
            }}
          >
            <span className="text-xs font-medium whitespace-nowrap">
              {t('device.detail.topology_info.median')}: {formatSci(median)}
              {displayUnit}
            </span>
            <span className="text-xs leading-none" style={{ color: '#e2e6f0' }}>
              ▼
            </span>
          </div>
        )}
      </div>

      <div
        className="rounded-full h-2.5"
        style={{
          background: 'linear-gradient(90deg, #4d5bff 0%, #8b6fff 40%, #c9a8ff 70%, #eee 100%)',
        }}
      />

      <div className="flex justify-between">
        <span className="text-xs text-gray-400">
          min {formatSci(min)}
          {displayUnit}
        </span>
        <span className="text-xs text-gray-400">
          max {formatSci(max)}
          {displayUnit}
        </span>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload }: any) {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ChartPoint;
  return (
    <div
      className="card text-light border-secondary shadow-lg"
      style={{ minWidth: 140, background: 'rgb(var(--base-card))' }}
    >
      <div className="card-body py-2 px-3">
        <div className="fw-semibold mb-1">{d.label}</div>
        <small>{d.value !== null ? formatSci(d.value) : t('device.detail.topology_info.missing')}</small>
      </div>
    </div>
  );
}

interface QubitGraphViewProps {
  deviceInfo: DeviceInfo;
}

export default function ChartView({ deviceInfo }: QubitGraphViewProps) {
  const [sortMode, setSortMode] = useState<SortMode>('valueDesc');
  const [metricKey, setMetricKey] = useState<MetricKey>('readout_assignment_error');

  const { t } = useTranslation();

  const currentMetric = useMemo(() => METRICS.find((m) => m.key === metricKey)!, [metricKey]);

  const rawPoints: ChartPoint[] = useMemo(() => {
    if (currentMetric.group === 'coupling') {
      const extract = COUPLING_EXTRACTORS[metricKey as CouplingMetricKey];
      return (deviceInfo.couplings || []).map((c) => ({
        id: `${c.control}-${c.target}`,
        label: `${c.control}–Q${c.target}`,
        value: extract(c) ?? null,
      }));
    }

    const extract = QUBIT_EXTRACTORS[metricKey as QubitMetricKey];
    return (deviceInfo.qubits || []).map((q) => ({
      id: String(q.id),
      label: `${q.id}`,
      value: extract(q) ?? null,
    }));
  }, [deviceInfo, metricKey, currentMetric.group]);

  const stats = useMemo(
    () => computeStats(rawPoints.map((p) => p.value).filter((v): v is number => v !== null)),
    [rawPoints]
  );

  const chartData = useMemo(() => {
    const sorted = sortData(rawPoints, sortMode);
    // Provide a small visual height for null values so they can be hovered to show the tooltip
    return sorted.map((p) => ({
      ...p,
      displayValue: p.value !== null ? p.value : stats.max * 0.01,
    }));
  }, [rawPoints, sortMode, stats.max]);

  const yAxisLabel = currentMetric.unit
    ? `${currentMetric.label} (${currentMetric.unit})`
    : currentMetric.label;

  const xAxisLabel = t('device.detail.topology_info.qubit_number');

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div className="col-auto">
          <label className="form-label text-secondary small mb-1">
            {t('device.detail.topology_info.sort')}
          </label>
          <Select
            className="form-select form-select-sm bg-dark text-light border-secondary bg-base-card"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            style={{ minWidth: 160 }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.label)}
              </option>
            ))}
          </Select>
        </div>

        <div className="col-auto">
          <label className="form-label text-secondary small mb-1">
            {t('device.detail.topology_info.graph_output')}
          </label>
          <Select
            className="form-select form-select-sm bg-dark text-light border-secondary bg-base-card"
            value={metricKey}
            onChange={(e) => setMetricKey(e.target.value as MetricKey)}
            style={{ minWidth: 260 }}
          >
            <optgroup label="Qubit metrics">
              {METRICS.filter((m) => m.group === 'qubit').map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                  {m.unit ? ` (${m.unit})` : ''}
                </option>
              ))}
            </optgroup>
          </Select>
        </div>

        <div className="col d-flex justify-content-end">
          <GradientLegend median={stats.median} min={stats.min} max={stats.max} />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 16, left: 10, bottom: 50 }}

          barCategoryGap={1}
        >
          <CartesianGrid strokeDasharray="none" stroke="#252a3a" horizontal vertical={false} />
          <XAxis
            dataKey="label"
            interval={chartData.length > 60 ? Math.floor(chartData.length / 30) : 0}
            axisLine={{ stroke: '#252a3a' }}
            tickLine={false}
            height={60}
            tick={({ x, y, payload }) => (
              <text
                x={x}
                y={Number(y) + 8}
                textAnchor="end"
                fill="#555a72"
                fontSize={9}
                transform={`rotate(-45, ${x}, ${Number(y) + 8})`}
              >
                {payload.value}
              </text>
            )}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7194' }}
            axisLine={{ stroke: '#252a3a' }}
            tickLine={false}
            tickFormatter={formatSci}
            label={{
              value: yAxisLabel,
              angle: -90,
              position: 'insideLeft',
              offset: 0,
              fill: '#6b7194',
              fontSize: 13,
              dy: 60,
              dx: -5,
            }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(109, 123, 255, 0.08)' }} />
          <Bar
            dataKey="displayValue"
            radius={[2, 2, 0, 0]}
            maxBarSize={12}
            shape={(props: any) => {
              const { x, y, width, height, payload } = props;
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  rx={2}
                  ry={2}
                  fill={getBarColor(payload.value, stats.min, stats.max)}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}
