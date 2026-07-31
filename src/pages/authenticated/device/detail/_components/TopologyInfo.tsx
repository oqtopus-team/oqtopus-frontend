import { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import ForceGraph2D from 'react-force-graph-2d';
import { useTranslation } from 'react-i18next';
import SimpleBar from 'simplebar-react';
import { JSONCodeBlock } from '@/pages/_components/JSONCodeBlock';
import { Card } from '@/pages/_components/Card';
import useWindowSize from '@/pages/_hooks/UseWindowSize';
import 'simplebar-react/dist/simplebar.min.css';
import { Button } from '@/pages/_components/Button';
import { Select } from '@/pages/_components/Select';
import { DateTimeFormatter } from '@/pages/authenticated/_components/DateTimeFormatter';
import { BsDownload } from 'react-icons/bs';
import { downloadDeviceInfoJson } from '../../_utils/downloadDeviceInfoJson';

// Types for metric selection
type QubitMetric = 'readout_error' | 't1' | 't2' | 'single_qubit_gate_error';
type CouplingMetric = 'two_qubit_gate_error' | 'gate_duration';

interface MetricOption {
  value: string;
  label: string;
  unit?: string;
}

// Metric options for dropdowns
const QUBIT_METRICS: MetricOption[] = [
  { value: 'readout_error', label: 'Readout Error', unit: '%' },
  { value: 't1', label: 'T1 Relaxation Time', unit: 'μs' },
  { value: 't2', label: 'T2 Dephasing Time', unit: 'μs' },
  { value: 'single_qubit_gate_error', label: 'Single-Qubit Gate Error', unit: '%' },
];

const COUPLING_METRICS: MetricOption[] = [
  { value: 'two_qubit_gate_error', label: 'Two-Qubit Gate Error / CNOT Error', unit: '%' },
  { value: 'gate_duration', label: 'Gate Duration', unit: 'ns' },
];

// color mapping utilities
const getMetricValue = (data: any, metric: string): number | null => {
  switch (metric) {
    case 'readout_error':
      return data.meas_error?.readout_assignment_error ?? null;
    case 't1':
      return data.qubit_lifetime?.t1 ?? null;
    case 't2':
      return data.qubit_lifetime?.t2 ?? null;
    case 'single_qubit_gate_error':
      return data.fidelity !== null && data.fidelity !== undefined ? 1 - data.fidelity : null;
    case 'two_qubit_gate_error':
      return data.fidelity !== null && data.fidelity !== undefined ? 1 - data.fidelity : null;
    case 'gate_duration':
      return data.gate_duration?.rzx90 ?? null;
    default:
      return null;
  }
};

const isHigherBetter = (metric: string): boolean => {
  return ['t1', 't2'].includes(metric);
};

type RgbColor = { r: number; g: number; b: number };

const MISSING_METRIC_COLOR = '#94a3b8';
const VIRIDIS_COLOR_SCALE: string[] = [
  '#440154',
  '#46085c',
  '#481467',
  '#482173',
  '#472d7b',
  '#453882',
  '#424086',
  '#3f4889',
  '#3d4e8a',
  '#3a538b',
  '#37588c',
  '#345d8d',
  '#31688e',
  '#2e6e8e',
  '#2c728e',
  '#2a788e',
  '#287d8e',
  '#25828e',
  '#23878e',
  '#218c8d',
  '#21918c',
  '#22968b',
  '#239b89',
  '#25a186',
  '#29a783',
  '#2fac80',
  '#35b179',
  '#3db771',
  '#46bd6a',
  '#51c362',
  '#5ec962',
  '#6ed05b',
  '#7ed655',
  '#8fdc4f',
  '#a0e249',
  '#b1e745',
  '#c2eb42',
  '#d4ef40',
  '#e5f03f',
  '#f5ee3f',
  '#fde724',
];

const interpolateRgbColor = (from: RgbColor, to: RgbColor, ratio: number): RgbColor => {
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  return {
    r: Math.round(from.r + (to.r - from.r) * clampedRatio),
    g: Math.round(from.g + (to.g - from.g) * clampedRatio),
    b: Math.round(from.b + (to.b - from.b) * clampedRatio),
  };
};

const hexToRgb = (hex: string): RgbColor | null => {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) {
    return null;
  }
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16));
  return { r, g, b };
};

const getColorFromScale = (ratio: number): string => {
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  const maxIndex = VIRIDIS_COLOR_SCALE.length - 1;
  const position = clampedRatio * maxIndex;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.min(maxIndex, Math.ceil(position));

  const lowerColor = hexToRgb(VIRIDIS_COLOR_SCALE[lowerIndex]);
  const upperColor = hexToRgb(VIRIDIS_COLOR_SCALE[upperIndex]);
  if (!lowerColor || !upperColor) {
    return VIRIDIS_COLOR_SCALE[lowerIndex] ?? MISSING_METRIC_COLOR;
  }

  if (lowerIndex === upperIndex) {
    return VIRIDIS_COLOR_SCALE[lowerIndex];
  }

  const mixed = interpolateRgbColor(lowerColor, upperColor, position - lowerIndex);
  return `rgb(${mixed.r}, ${mixed.g}, ${mixed.b})`;
};

const getLabelTextColor = (backgroundColor: string): string => {
  const color = backgroundColor.trim().toLowerCase();

  const hexMatch = /^#([0-9a-f]{6})$/i.exec(color);
  if (hexMatch) {
    const rgb = hexToRgb(`#${hexMatch[1]}`);
    if (rgb) {
      const luminance = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
      return luminance > 145 ? '#0f172a' : '#f8fafc';
    }
  }

  const rgbMatch = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i.exec(color);
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 145 ? '#0f172a' : '#f8fafc';
  }

  return '#f8fafc';
};

const getColorForMetric = (
  value: number | null,
  min: number,
  max: number,
  metric: string
): string => {
  if (value === null || isNaN(value)) {
    return MISSING_METRIC_COLOR;
  }

  if (min === max) {
    return VIRIDIS_COLOR_SCALE[Math.floor(VIRIDIS_COLOR_SCALE.length / 2)];
  }

  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return getColorFromScale(normalized);
};

// Function to calculate median
const calculateMedian = (data: any[], metric: string): number | null => {
  const values = data
    .map((item) => getMetricValue(item, metric))
    .filter((value) => value !== null && !isNaN(value)) as number[];

  if (values.length === 0) {
    return null;
  }

  const sortedValues = values.sort((a, b) => a - b);
  const middle = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
  } else {
    return sortedValues[middle];
  }
};

// Color Legend Component
const ColorLegend: React.FC<{
  metric: string;
  range: { min: number; max: number };
  data?: any[];
  unit?: string;
}> = ({ metric, range, data, unit }) => {
  const { t } = useTranslation();

  const metricOption = [...QUBIT_METRICS, ...COUPLING_METRICS].find((m) => m.value === metric);
  const displayUnit = unit || metricOption?.unit || '';

  const formatValue = (value: number): string => {
    if (displayUnit === '%') {
      return `${(value * 100).toFixed(2)}`;
    }
    return value.toFixed(2);
  };

  // Calculate median if data is provided
  const median = data ? calculateMedian(data, metric) : null;

  const gradientStops = [];
  for (let i = 0; i <= 10; i++) {
    const value = range.min + (range.max - range.min) * (i / 10);
    const color = getColorForMetric(value, range.min, range.max, metric);
    gradientStops.push(`${color} ${i * 10}%`);
  }

  // Calculate median position for the arrow
  const medianPosition =
    median !== null && range.max !== range.min
      ? ((median - range.min) / (range.max - range.min)) * 100
      : null;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-bold mb-6">
        {metricOption?.label || metric} {t('device.detail.topology_info.color_scale')}
      </h4>

      <div className="relative">
        {/* Median label + arrow */}
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
              {t('device.detail.topology_info.median')}: {formatValue(median)} {displayUnit}
            </span>
            <span className="text-xs leading-none" style={{ color: '#000000' }}>
              ▼
            </span>
          </div>
        )}

        {/* Gradient bar */}
        <div
          className="h-5 rounded border border-gray-400"
          style={{
            background: `linear-gradient(to right, ${gradientStops.join(', ')})`,
          }}
        />
      </div>

      <div className="flex justify-between text-xs mt-1">
        <span>
          {formatValue(range.min)} {displayUnit}
        </span>
        <span>
          {formatValue(range.max)} {displayUnit}
        </span>
      </div>
    </div>
  );
};

type NodeObject<NodeType = {}> = NodeType & {
  id?: string | number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
  [others: string]: any;
};

type LinkObject<NodeType = {}, LinkType = {}> = LinkType & {
  source?: string | number | NodeObject<NodeType>;
  target?: string | number | NodeObject<NodeType>;
  [others: string]: any;
};

type DeviceTopology = {
  qubits: any[];
  couplings: any[];
};

const extractDeviceTopology = (deviceInfo: any): DeviceTopology | null => {
  const candidates = [
    deviceInfo,
    deviceInfo?.device_topology,
    deviceInfo?.deviceTopology,
    deviceInfo?.topology,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate?.qubits)) {
      return {
        qubits: candidate.qubits,
        couplings: Array.isArray(candidate.couplings) ? candidate.couplings : [],
      };
    }
  }

  return null;
};

const getFallbackPosition = (index: number, total: number): { x: number; y: number } => {
  if (total <= 1) {
    return { x: 0, y: 0 };
  }

  const angle = (2 * Math.PI * index) / total;
  return { x: Math.cos(angle), y: Math.sin(angle) };
};

const getQubitPosition = (qubit: any, index: number, total: number): { x: number; y: number } => {
  const x = Number(qubit?.position?.x);
  const y = Number(qubit?.position?.y);

  if (Number.isFinite(x) && Number.isFinite(y)) {
    return { x, y };
  }

  return getFallbackPosition(index, total);
};

const scalePosition = (position: number, scale: number = 50): number => {
  return position * scale;
};

const normalizePositions = <NodeType,>(nodes: NodeObject<NodeType>[]): NodeObject<NodeType>[] => {
  const sumFx = nodes.reduce((sum, node) => sum + (node.fx ?? 0), 0);
  const sumFy = nodes.reduce((sum, node) => sum + (node.fy ?? 0), 0);
  const count = nodes.length;

  const centerX = sumFx / count;
  const centerY = sumFy / count;

  return nodes.map((node) => ({
    ...node,
    fx: node.fx !== undefined ? node.fx - centerX : undefined,
    fy: node.fy !== undefined ? node.fy - centerY : undefined,
  }));
};

const createCouplingMapKey = (control: string | number, target: string | number): string => {
  const [first, second] = [control, target].map(String).sort();
  return `${first}-${second}`;
};

const calculateMetricRange = (data: any[], metric: string): { min: number; max: number } => {
  const values = data
    .map((item) => getMetricValue(item, metric))
    .filter((value) => value !== null && !isNaN(value)) as number[];

  if (values.length === 0) {
    return { min: 0, max: 1 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  return { min, max };
};

const createNodeData = (
  qubits: any[],
  selectedMetric: QubitMetric,
  metricRange: { min: number; max: number }
): { nodeData: any[]; tempNodeMap: Map<string, object> } => {
  try {
    const tempNodeMap = new Map<string, object>();
    const nodeData = qubits.map((qubit: any, index: number) => {
      const qubitId = qubit.id ?? index;
      const position = getQubitPosition(qubit, index, qubits.length);

      tempNodeMap.set(qubitId.toString(), qubit);
      const metricValue = getMetricValue(qubit, selectedMetric);
      const color = getColorForMetric(
        metricValue,
        metricRange.min,
        metricRange.max,
        selectedMetric
      );

      return {
        id: qubitId.toString(),
        label: `${qubitId}`,
        fx: scalePosition(position.x),
        fy: scalePosition(position.y * -1), // multiply by -1 to flip the y-axis
        color: color,
        metricValue: metricValue,
      };
    });
    return { nodeData, tempNodeMap };
  } catch (err) {
    console.error('Failed to create node data:', err);
    return { nodeData: [], tempNodeMap: new Map<string, object>() };
  }
};

const createEdgeData = (
  couplings: any[],
  selectedMetric: CouplingMetric,
  metricRange: { min: number; max: number }
): { edgeData: LinkObject[]; tempCouplingMap: Map<string, object> } => {
  try {
    const tempCouplingMap = new Map<string, object>();
    const edgeData: LinkObject[] = couplings.flatMap((coupling: any) => {
      if (coupling.control === undefined || coupling.target === undefined) {
        return [];
      }

      const key = createCouplingMapKey(coupling.control, coupling.target);
      const id = `${coupling.control}-${coupling.target}`;
      const existingValue = tempCouplingMap.get(key);
      if (existingValue) {
        tempCouplingMap.set(key, Object.assign({}, existingValue, { [id]: coupling }));
      } else {
        tempCouplingMap.set(key, { [id]: coupling });
      }

      const metricValue = getMetricValue(coupling, selectedMetric);
      const color = getColorForMetric(
        metricValue,
        metricRange.min,
        metricRange.max,
        selectedMetric
      );

      return {
        id: id,
        source: coupling.control.toString(),
        target: coupling.target.toString(),
        color: color,
        metricValue: metricValue,
      };
    });
    return { edgeData, tempCouplingMap };
  } catch (err) {
    console.error('Failed to create edge data:', err);
    return { edgeData: [], tempCouplingMap: new Map<string, object>() };
  }
};

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;

export const TopologyInfo: React.FC<{
  deviceInfo: string | undefined;
  historyCapturedAt?: string;
  downloadFileName?: string;
}> = ({ deviceInfo, historyCapturedAt, downloadFileName = 'device_info.json' }) => {
  const { t, i18n } = useTranslation();
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  });
  const nodeStrokeColor = isDarkTheme ? '#f8fafc' : '#0f172a';
  const nodeHoverStrokeColor = isDarkTheme ? '#fcd34d' : '#1d4ed8';
  const linkHoverStrokeColor = isDarkTheme ? '#fcd34d' : '#1d4ed8';

  const [topologyData, setTopologyData] = useState<{ nodes: NodeObject[]; links: LinkObject[] }>({
    nodes: [],
    links: [],
  });
  const [nodeMap, setNodeMap] = useState<Map<string, object>>(new Map<string, object>());
  const [couplingMap, setCouplingMap] = useState<Map<string, object>>(new Map<string, object>());
  const [hoveredInfo, setStrHoveredInfo] = useState<object>({});
  const [isValidDeviceInfo, setIsValidDeviceInfo] = useState<boolean>(true);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | number | null>(null);
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);

  // metric selection state
  const [selectedQubitMetric, setSelectedQubitMetric] = useState<QubitMetric>('readout_error');
  const [selectedCouplingMetric, setSelectedCouplingMetric] =
    useState<CouplingMetric>('two_qubit_gate_error');
  const [qubitMetricRange, setQubitMetricRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1,
  });
  const [couplingMetricRange, setCouplingMetricRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1,
  });

  // data for median calculation
  const [qubitsData, setQubitsData] = useState<any[]>([]);
  const [couplingsData, setCouplingsData] = useState<any[]>([]);

  // ForceGraph2D not exporting ref types
  const fgRef = useRef<any>(null);
  const [zoomLevel, setZoomLevel] = useState<string>('1.00');

  const [divSize, setDivSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [heddingSize, setHeddingSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const windowSize = useWindowSize();
  const divRef = useRef<HTMLDivElement>(null);
  const heddingRef = useRef<HTMLDivElement>(null);

  const strHoveredInfo = JSON.stringify(hoveredInfo);
  const activeDeviceInfo = deviceInfo;

  const handleDownloadDeviceInfo = () => {
    if (!activeDeviceInfo) return;
    downloadDeviceInfoJson(activeDeviceInfo, downloadFileName);
  };

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const updateTheme = () => setIsDarkTheme(root.classList.contains('dark'));

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const handleZoom = useCallback(() => {
    if (fgRef.current && typeof fgRef.current.zoom === 'function') {
      const zoom = fgRef.current.zoom();
      requestAnimationFrame(() => {
        setZoomLevel(zoom.toFixed(2));
      });
    }
  }, []);

  const handleHoverNode = (node: NodeObject | null) => {
    try {
      if (node) {
        const nodeId = node.id as string;
        const nodeInfo = nodeMap.get(nodeId);
        if (nodeId !== undefined && nodeInfo !== undefined) {
          setHoveredLinkId(null);
          setHoveredNodeId(nodeId);
          setStrHoveredInfo(nodeInfo);
        }
      }
    } catch (err) {
      console.error('Failed to handle node hover:', err);
    }
  };

  const handleHoverLink = (link: LinkObject | null) => {
    try {
      if (link) {
        const sourceId = (link.source as NodeObject).id;
        const targetId = (link.target as NodeObject).id;
        const couplingKey = createCouplingMapKey(sourceId as number, targetId as number);
        const coupling = couplingMap.get(couplingKey);

        if (couplingKey !== undefined && coupling !== undefined) {
          setHoveredNodeId(null);
          setHoveredLinkId(couplingKey);
          setStrHoveredInfo(coupling);
        }
      }
    } catch (err) {
      console.error('Failed to handle link hover:', err);
    }
  };

  const handleFitToView = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(300, 30);
    }
  };

  useEffect(() => {
    const updateDivSize = () => {
      try {
        if (divRef.current) {
          setDivSize({
            width: divRef.current.offsetWidth,
            height: windowSize.height * 0.6,
          });
        }
      } catch (err) {
        console.error('Failed to update div size:', err);
      }
    };

    const updateHeddingSize = () => {
      try {
        if (heddingRef.current) {
          setHeddingSize({
            width: heddingRef.current.offsetWidth,
            height: heddingRef.current.offsetHeight,
          });
        }
      } catch (err) {
        console.error('Failed to update hedding size:', err);
      }
    };

    updateDivSize();
    updateHeddingSize();
    window.addEventListener('resize', updateDivSize);
    window.addEventListener('resize', updateHeddingSize);
    return () => {
      window.removeEventListener('resize', updateDivSize);
      window.removeEventListener('resize', updateHeddingSize);
    };
  }, [windowSize]);

  useEffect(() => {
    try {
      const parsedDeviceInfo = (() => {
        try {
          if (!activeDeviceInfo) {
            setIsValidDeviceInfo(false);
            return {};
          }
          return JSON.parse(activeDeviceInfo);
        } catch (err) {
          setIsValidDeviceInfo(false);
          console.error('Failed to parse device info:', err);
          return {};
        }
      })();

      const deviceTopology = extractDeviceTopology(parsedDeviceInfo);
      if (!deviceTopology) {
        setIsValidDeviceInfo(false);
        return;
      }

      setIsValidDeviceInfo(true);

      // Store data for median calculation
      setQubitsData(deviceTopology.qubits);
      setCouplingsData(deviceTopology.couplings);

      // Calculate metric ranges
      const qubitRange = calculateMetricRange(deviceTopology.qubits, selectedQubitMetric);
      const couplingRange = calculateMetricRange(deviceTopology.couplings, selectedCouplingMetric);

      setQubitMetricRange(qubitRange);
      setCouplingMetricRange(couplingRange);

      const { nodeData, tempNodeMap } = createNodeData(
        deviceTopology.qubits,
        selectedQubitMetric,
        qubitRange
      );
      const { edgeData, tempCouplingMap } = createEdgeData(
        deviceTopology.couplings,
        selectedCouplingMetric,
        couplingRange
      );

      if (nodeData.length === 0) {
        setIsValidDeviceInfo(false);
      } else {
        const firstNodeId = nodeData[0]?.id as string | number | undefined;
        if (firstNodeId !== undefined) {
          const firstNodeInfo =
            tempNodeMap.get(String(firstNodeId)) ?? tempNodeMap.get(firstNodeId as string);
          if (firstNodeInfo !== undefined) {
            setHoveredNodeId(firstNodeId);
            setHoveredLinkId(null);
            setStrHoveredInfo(firstNodeInfo);
          }
        }
      }

      setTopologyData({ nodes: normalizePositions(nodeData), links: edgeData });
      setNodeMap(tempNodeMap);
      setCouplingMap(tempCouplingMap);
    } catch (err) {
      setIsValidDeviceInfo(false);
      console.error('Failed to update topology data:', err);
    }
  }, [activeDeviceInfo, selectedQubitMetric, selectedCouplingMetric]);

  useEffect(() => {
    // Delay to ensure the canvas is rendered
    const timeout = setTimeout(() => {
      if (fgRef.current && typeof fgRef.current.zoomToFit === 'function') {
        fgRef.current.zoomToFit(300, 30);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  if (!isValidDeviceInfo) {
    return (
      <p className={clsx('text-error', 'text-xl')}>
        {t('device.detail.topology_info.invalid_device_info')}
      </p>
    );
  }

  return (
    <div className={clsx('grid', 'gap-5', 'xl:grid-cols-[minmax(19rem,1.1fr)_minmax(0,2fr)]')}>
      <Card className={clsx('min-w-0')}>
        <h3 className={clsx('text-primary', 'font-bold')} ref={heddingRef}>
          {t('device.detail.topology_info.property')}
        </h3>
        {strHoveredInfo !== '{}' && (
          <SimpleBar style={{ maxHeight: divSize.height - heddingSize.height }}>
            <JSONCodeBlock json={strHoveredInfo} />
          </SimpleBar>
        )}

        {/* Color Scale Legends */}
        <div style={{ marginTop: '20px' }}>
          <ColorLegend metric={selectedQubitMetric} range={qubitMetricRange} data={qubitsData} />
          <ColorLegend
            metric={selectedCouplingMetric}
            range={couplingMetricRange}
            data={couplingsData}
          />
        </div>
      </Card>
      <Card className={clsx('min-w-0')}>
        <div className={clsx('flex', 'flex-col', 'gap-5')}>
          <div>
            <div className={clsx('flex', 'flex-wrap', 'items-start', 'justify-between', 'gap-3')}>
              <div>
                <h3 className={clsx('text-primary', 'font-bold')}>
                  {t('device.detail.topology_info.header')}
                </h3>
                {historyCapturedAt && (
                  <p className={clsx('mt-2', 'text-sm', 'text-secondary-content')}>
                    {`${t('device.detail.topology_info.device_info_at')}: ${DateTimeFormatter(
                      t,
                      i18n,
                      historyCapturedAt
                    )}`}
                  </p>
                )}
              </div>
              {historyCapturedAt && activeDeviceInfo && (
                <Button color="secondary" size="small" onClick={handleDownloadDeviceInfo}>
                  <BsDownload />
                  {t('device.detail.history.download_json')}
                </Button>
              )}
            </div>
          </div>

          <div className={clsx('min-w-0')}>
            <div
              className={clsx(
                'mb-4',
                'flex',
                'flex-wrap',
                'items-center',
                'justify-between',
                'gap-4'
              )}
            >
              <div className={clsx('flex', 'flex-wrap', 'gap-4', 'items-center')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {t('device.detail.topology_info.qubit_metric')}:
                  </label>
                  <Select
                    value={selectedQubitMetric}
                    onChange={(e) => setSelectedQubitMetric(e.target.value as QubitMetric)}
                    size="xs"
                    className={clsx('text-base-content', 'bg-base-card')}
                    style={{ minWidth: '180px' }}
                  >
                    {QUBIT_METRICS.map((metric) => (
                      <option key={metric.value} value={metric.value}>
                        {metric.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {t('device.detail.topology_info.coupling_metric')}:
                  </label>
                  <Select
                    value={selectedCouplingMetric}
                    onChange={(e) => setSelectedCouplingMetric(e.target.value as CouplingMetric)}
                    size="xs"
                    className={clsx('text-base-content', 'bg-base-card')}
                    style={{ minWidth: '180px' }}
                  >
                    {COUPLING_METRICS.map((metric) => (
                      <option key={metric.value} value={metric.value}>
                        {metric.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className={clsx('flex', 'items-center', 'gap-3', 'ml-auto')}>
                <span className={clsx('text-sm', 'text-secondary-content')}>
                  Zoom: {zoomLevel}x
                </span>
                <Button size="small" onClick={handleFitToView}>
                  {t('device.detail.topology_info.fit_to_view')}
                </Button>
              </div>
            </div>

            <div className={clsx('mb-4', 'flex', 'items-center', 'gap-3')}>
              <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.1}
                value={zoomLevel}
                onChange={(e) => {
                  if (fgRef.current && typeof fgRef.current.zoom === 'function') {
                    fgRef.current.zoom(e.target.value);
                  }
                }}
                style={{
                  width: '240px',
                  height: '4px',
                  borderRadius: '2px',
                  outline: 'none',
                  cursor: 'pointer',
                  flex: 1,
                }}
              />
            </div>

            <div ref={divRef} className={clsx('min-w-0')}>
              <ForceGraph2D
                ref={fgRef}
                backgroundColor={divRef.current?.style?.backgroundColor}
                graphData={topologyData}
                nodeCanvasObject={(
                  node: NodeObject,
                  ctx: CanvasRenderingContext2D,
                  globalScale: number
                ) => {
                  const radius = 18 / globalScale;
                  const nodeColor = (node as any).color || '#4887fa';
                  const labelTextColor = getLabelTextColor(nodeColor);

                  ctx.beginPath();
                  if (node.x !== undefined && node.y !== undefined) {
                    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                  }
                  ctx.fillStyle = nodeColor;
                  ctx.fill();
                  ctx.strokeStyle =
                    node.id === hoveredNodeId ? nodeHoverStrokeColor : nodeStrokeColor;
                  ctx.lineWidth = node.id === hoveredNodeId ? 4 / globalScale : 3.4 / globalScale;
                  ctx.stroke();

                  const label = node.label || '';
                  const fontSize = 16 / globalScale;
                  ctx.font = `${fontSize}px Arial Bold`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  if (node.x !== undefined && node.y !== undefined) {
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
                    ctx.shadowBlur = 2 / globalScale;
                    ctx.fillStyle = labelTextColor;
                    ctx.fillText(label, node.x, node.y);
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                  }
                }}
                linkCanvasObject={(
                  link: LinkObject,
                  ctx: CanvasRenderingContext2D,
                  globalScale: number
                ) => {
                  const { source, target } = link;
                  const startX = (source as NodeObject).x;
                  const startY = (source as NodeObject).y;
                  const endX = (target as NodeObject).x;
                  const endY = (target as NodeObject).y;
                  const sourceId = (link.source as NodeObject).id;
                  const targetId = (link.target as NodeObject).id;
                  const couplingKey = createCouplingMapKey(sourceId as number, targetId as number);

                  if (
                    startX !== undefined &&
                    startY !== undefined &&
                    endX !== undefined &&
                    endY !== undefined
                  ) {
                    const outerStrokeColor = clsx({
                      [linkHoverStrokeColor]: couplingKey === hoveredLinkId,
                      transparent: couplingKey !== hoveredLinkId,
                    });

                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.strokeStyle = outerStrokeColor;
                    ctx.lineWidth = 16 / globalScale;
                    ctx.stroke();

                    const innerStrokeColor = (link as any).color || '#4887fa';

                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.strokeStyle = innerStrokeColor;
                    ctx.lineWidth = 10 / globalScale;
                    ctx.stroke();
                  }
                }}
                enableNodeDrag={false}
                onNodeClick={handleHoverNode}
                onLinkClick={handleHoverLink}
                height={divSize.height}
                width={divSize.width}
                maxZoom={MAX_ZOOM}
                onZoom={handleZoom}
                onZoomEnd={handleZoom}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
