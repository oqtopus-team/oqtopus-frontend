import { useState, useMemo } from 'react';
import { Qubit, DeviceInfo } from '@/domain/types/Device';
import { useTranslation } from 'react-i18next';

interface QubitGraphViewProps {
  deviceInfo: DeviceInfo;
}

const COLUMNS: {
  key: string;
  label: string;
  getValue: (q: Qubit) => number | undefined | null;
  format: (v: number | undefined | null) => string;
}[] = [
  { key: 'id', label: 'Qubit', getValue: (q) => q.id, format: (v) => String(v) },
  {
    key: 't1',
    label: 'T1 (us)',
    getValue: (q) => q.qubit_lifetime?.t1,
    format: (v) => (v !== undefined && v !== null ? String(v.toFixed(3)) : '-'),
  },
  {
    key: 't2',
    label: 'T2 (us)',
    getValue: (q) => q.qubit_lifetime?.t2,
    format: (v) => (v !== undefined && v !== null ? String(v.toFixed(3)) : '-'),
  },
  {
    key: 'readout_assignment_error',
    label: 'Readout assignment error',
    getValue: (q) => q.meas_error?.readout_assignment_error,
    format: (v) => (v !== undefined && v !== null ? String(v.toFixed(3)) : '-'),
  },
  {
    key: 'prob_meas0_prep1',
    label: 'Prob meas0 prep1',
    getValue: (q) => q.meas_error?.prob_meas0_prep1,
    format: (v) => (v !== undefined && v !== null ? String(v.toFixed(3)) : '-'),
  },
  {
    key: 'prob_meas1_prep0',
    label: 'Prob meas1 prep0',
    getValue: (q) => q.meas_error?.prob_meas1_prep0,
    format: (v) => (v !== undefined && v !== null ? String(v.toFixed(3)) : '-'),
  },
  {
    key: 'fidelity',
    label: 'Fidelity',
    getValue: (q) => q.fidelity,
    format: (v) => (v !== undefined && v !== null ? v.toFixed(3) : '-'),
  },
  {
    key: 'rz',
    label: 'RZ duration (ns)',
    getValue: (q) => q.gate_duration?.rz,
    format: (v) => (v !== undefined && v !== null ? String(v) : '-'),
  },
  {
    key: 'sx',
    label: 'Gate SX (ns)',
    getValue: (q) => q.gate_duration?.sx,
    format: (v) => (v !== undefined && v !== null ? String(v) : '-'),
  },
  {
    key: 'x',
    label: 'Gate X (ns)',
    getValue: (q) => q.gate_duration?.x,
    format: (v) => (v !== undefined && v !== null ? String(v) : '-'),
  },
];

type SortDir = 'asc' | 'desc';

export default function TableView({ deviceInfo }: QubitGraphViewProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const { t } = useTranslation();

  const filtered = useMemo(() => {
    let data = deviceInfo.qubits || [];

    if (search.trim()) {
      data = data.filter((q) => String(q.id).includes(search.trim()));
    }

    if (sortKey) {
      const col = COLUMNS.find((c) => c.key === sortKey);
      if (col) {
        data = [...data].sort((a, b) => {
          const valA = col.getValue(a);
          const valB = col.getValue(b);
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;
          const diff = valA - valB;
          return sortDir === 'asc' ? diff : -diff;
        });
      }
    }

    return data;
  }, [deviceInfo.qubits, search, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2.5 rounded-lg bg-base-card px-4 py-2.5">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-base-content/40 shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder={t('device.detail.qubits_info.table.search_bar')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-sm text-base-content placeholder:text-base-content/40"
        />
      </div>

      <div className="overflow-x-auto rounded-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="bg-base-card px-4 py-3.5 text-left text-xs font-semibold text-base-content/60 whitespace-nowrap cursor-pointer select-none hover:text-base-content/80 transition-colors"
                >
                  {col.label}
                  <span className="ml-1 inline-block w-3">
                    {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((qubit, i) => (
              <tr
                key={qubit.id}
                className={`
                  ${i % 2 === 0 ? 'bg-transparent' : 'bg-base-card/50'}
                  hover:bg-base-card transition-colors
                `}
              >
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className={`
                      px-4 py-3 whitespace-nowrap border-t border-base-content/10
                      ${col.key === 'id' ? 'font-semibold text-base-content' : 'text-base-content/80'}
                    `}
                  >
                    {col.format(col.getValue(qubit))}
                  </td>
                ))}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-base-content/40">
                  {t('device.detail.qubits_info.table.no_qubits_found')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
