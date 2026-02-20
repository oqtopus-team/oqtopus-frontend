import { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { ForceGraph2D } from 'react-force-graph';
import { useTranslation } from 'react-i18next';
import SimpleBar from 'simplebar-react';
import { JSONCodeBlock } from '@/pages/_components/JSONCodeBlock';
import { Card } from '@/pages/_components/Card';
import useWindowSize from '@/pages/_hooks/UseWindowSize';
import 'simplebar-react/dist/simplebar.min.css';
import { Button } from '@/pages/_components/Button';
import { Select } from '@/pages/_components/Select';

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

const getColorForMetric = (
  value: number | null,
  min: number,
  max: number,
  metric: string
): string => {
  if (value === null || isNaN(value)) {
    return '#808080'; // Gray for missing data
  }

  if (min === max) {
    return 'rgb(0, 255, 0)';
  }

  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const adjustedValue = isHigherBetter(metric) ? 1 - normalized : normalized;

  let r, g;
  if (adjustedValue < 0.5) {
    r = Math.round(255 * (adjustedValue * 2));
    g = 255;
  } else {
    r = 255;
    g = Math.round(255 * (2 - adjustedValue * 2));
  }

  return `rgb(${r}, ${g}, 0)`;
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
        {metricOption?.label || metric} Color Scale
      </h4>

      <div className="relative">
        {/* Median label + arrow */}
        {median !== null && medianPosition !== null && (
          <div
            className="absolute -top-5 flex flex-col items-center"
            style={{
              left: `${medianPosition}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <span className="text-xs font-medium text-gray-300 whitespace-nowrap">
              Median: {formatValue(median)} {displayUnit}
            </span>
            <span className="text-xs leading-none text-gray-300">▼</span>
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

      <div className="text-xs text-gray-500 mt-1">
        <span className="text-gray-400">■</span> Gray: Missing data
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

const createCouplingMapKey = (control: number, target: number): string => {
  const [first, second] = [control, target].sort((a, b) => a - b);
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
    const nodeData = qubits.map((qubit: any) => {
      tempNodeMap.set(qubit.id.toString(), qubit);
      const metricValue = getMetricValue(qubit, selectedMetric);
      const color = getColorForMetric(
        metricValue,
        metricRange.min,
        metricRange.max,
        selectedMetric
      );

      return {
        id: qubit.id.toString(),
        label: `${qubit.id}`,
        fx: scalePosition(qubit.position.x),
        fy: scalePosition(qubit.position.y * -1), // multiply by -1 to flip the y-axis
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
    const edgeData: LinkObject[] = couplings.map((coupling: any) => {
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

export const TopologyInfo: React.FC<{ deviceInfo: string | undefined }> = ({ deviceInfo }) => {
  const { t } = useTranslation();

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
          if (!deviceInfo) {
            setIsValidDeviceInfo(false);
            return {};
          }
          return JSON.parse(deviceInfo);
        } catch (err) {
          setIsValidDeviceInfo(false);
          console.error('Failed to parse device info:', err);
          return {};
        }
      })();

      if (!parsedDeviceInfo.qubits || !parsedDeviceInfo.couplings) return;

      // Store data for median calculation
      setQubitsData(parsedDeviceInfo.qubits);
      setCouplingsData(parsedDeviceInfo.couplings);

      // Calculate metric ranges
      const qubitRange = calculateMetricRange(parsedDeviceInfo.qubits, selectedQubitMetric);
      const couplingRange = calculateMetricRange(
        parsedDeviceInfo.couplings,
        selectedCouplingMetric
      );

      setQubitMetricRange(qubitRange);
      setCouplingMetricRange(couplingRange);

      const { nodeData, tempNodeMap } = createNodeData(
        parsedDeviceInfo.qubits,
        selectedQubitMetric,
        qubitRange
      );
      const { edgeData, tempCouplingMap } = createEdgeData(
        parsedDeviceInfo.couplings,
        selectedCouplingMetric,
        couplingRange
      );

      if (nodeData.length === 0) {
        setIsValidDeviceInfo(false);
      }

      setTopologyData({ nodes: normalizePositions(nodeData), links: edgeData });
      setNodeMap(tempNodeMap);
      setCouplingMap(tempCouplingMap);
    } catch (err) {
      setIsValidDeviceInfo(false);
      console.error('Failed to update topology data:', err);
    }
  }, [deviceInfo, selectedQubitMetric, selectedCouplingMetric]);

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
    <div className={clsx('flex', 'grid', 'grid-cols-[1.3fr_2fr]', 'gap-5')}>
      <Card className={clsx(['col-start-1', 'col-end-2'])}>
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
      <Card className={clsx(['col-start-2', 'col-end-3', 'relative'])}>
        <div style={{ zIndex: 1000, position: 'absolute', bottom: '25px', right: '25px' }}>
          Zoom: {zoomLevel}x
        </div>
        <div
          style={{
            marginBottom: '15px',
            width: '100%',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          {/* Metric Selection Controls */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Qubit Metric:</label>
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
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Coupling Metric:</label>
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

          {/* Zoom Controls */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button size="small" onClick={handleFitToView}>
              {t('device.detail.topology_info.fit_to_view')}
            </Button>
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
                width: '200px',
                height: '4px',
                borderRadius: '2px',
                outline: 'none',
                cursor: 'pointer',
                flex: 1,
                marginLeft: '10px',
              }}
            />
          </div>
        </div>
        <div ref={divRef}>
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
              ctx.beginPath();
              if (node.x !== undefined && node.y !== undefined) {
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
              }
              // Use dynamic color from node data, fallback to default blue
              ctx.fillStyle = (node as any).color || '#4887fa';
              ctx.fill();
              ctx.strokeStyle = node.id === hoveredNodeId ? '#fc6464' : 'white';
              ctx.lineWidth = 3 / globalScale;
              ctx.stroke();

              const label = node.label || '';
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Arial Bold`;
              ctx.fillStyle = 'black';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              if (node.x !== undefined && node.y !== undefined) {
                ctx.fillText(label, node.x, node.y);
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
                // Drawing the outer line
                const outerStrokeColor = clsx({
                  '#fc6464': couplingKey === hoveredLinkId,
                  transparent: couplingKey !== hoveredLinkId,
                });

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = outerStrokeColor;
                ctx.lineWidth = 16 / globalScale;
                ctx.stroke();

                // Drawing the inner line
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
      </Card>
    </div>
  );
};
