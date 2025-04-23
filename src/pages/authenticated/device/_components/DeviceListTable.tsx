import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnDef,
  CellContext,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  createColumnHelper,
} from '@tanstack/react-table';
import { DeviceStatus } from './DeviceStatus';
import { Device, DeviceStatusType, DeviceType } from '@/domain/types/Device';
import clsx from 'clsx';
import { NavLink } from 'react-router';
import { DateTimeFormatter } from '@/pages/authenticated/_components/DateTimeFormatter';

export const DeviceListTable = ({ devices }: { devices: Device[] }): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const columnHelper = createColumnHelper<Device>();
  const columns: ColumnDef<Device, any>[] = [
    columnHelper.accessor('id', {
      header: t('device.list.table.id'),
      cell: (info: CellContext<Device, string>) => {
        try {
          const id: string = info.getValue();
          return (
            <NavLink to={`/device/${id}`} className="text-link">
              {id}
            </NavLink>
          );
        } catch (e) {
          return <p> - </p>;
        }
      },
    }),
    columnHelper.accessor('status', {
      header: t('device.list.table.status'),
      cell: (info: CellContext<Device, DeviceStatusType>) => {
        try {
          const status: DeviceStatusType = info.getValue();
          return <DeviceStatus status={status} />;
        } catch (e) {
          return <p> - </p>;
        }
      },
    }),
    columnHelper.accessor('nQubits', {
      header: t('device.list.table.qubits'),
      cell: (info: CellContext<Device, number>) => {
        try {
          const qubits: number = info.getValue();
          return <p> {qubits} </p>;
        } catch (e) {
          return <p> - </p>;
        }
      },
    }),
    columnHelper.accessor('deviceType', {
      header: t('device.list.table.type'),
      cell: (info: CellContext<Device, DeviceType>) => {
        try {
          const deviceType: DeviceType = info.getValue();
          return <p> {deviceType} </p>;
        } catch (e) {
          return <p> - </p>;
        }
      },
    }),
    columnHelper.accessor('nPendingJobs', {
      header: t('device.list.table.pending_jobs'),
      cell: (info: CellContext<Device, number>) => {
        try {
          const pendingJobs: number = info.getValue();
          return <p> {pendingJobs} </p>;
        } catch (e) {
          return <p> - </p>;
        }
      },
    }),
    columnHelper.accessor('basisGates', {
      header: t('device.list.table.basis_gates'),
      cell: (info: CellContext<Device, string[]>) => {
        try {
          const basisGates: string[] = info.getValue();
          return <p> {basisGates.join(', ')} </p>;
        } catch (e) {
          return <p> - </p>;
        }
      },
    }),
    columnHelper.accessor('supportedInstructions', {
      header: t('device.list.table.instructions'),
      cell: (info: CellContext<Device, string[]>) => {
        try {
          const instructions: string[] = info.getValue();
          return <p> {instructions.join(', ')} </p>;
        } catch (e) {
          return <p> - </p>;
        }
      },
    }),
    columnHelper.accessor('description', {
      header: t('device.list.table.description'),
      cell: (info: CellContext<Device, string>) => {
        try {
          const description: string = info.getValue();
          return <p> {description} </p>;
        } catch (e) {
          return <p> - </p>;
        }
      },
    }),
    columnHelper.accessor('availableAt', {
      header: t('device.list.table.available_at'),
      cell: (info: CellContext<Device, string>) => {
        try {
          const availableAt: string = info.getValue();
          return <p> {DateTimeFormatter(t, i18n, availableAt)} </p>;
        } catch (e) {
          return <p> - </p>;
        }
      },
    }),
  ];
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: devices,
    columns: columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <table className={clsx('table-auto')}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
                className={clsx('text-center')}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                <span>
                  {header.column.getCanSort() &&
                    (header.column.getIsSorted()
                      ? header.column.getIsSorted() === 'desc'
                        ? ' ↓'
                        : ' ↑'
                      : ' ⇅')}
                </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className={clsx('break-words', 'whitespace-normal', 'text-center')}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
