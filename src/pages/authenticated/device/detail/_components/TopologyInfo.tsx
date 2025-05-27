import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { ForceGraph2D } from 'react-force-graph';
import { useTranslation } from 'react-i18next';
import SimpleBar from 'simplebar-react';
import { JSONCodeBlock } from '@/pages/_components/JSONCodeBlock';
import { Card } from '@/pages/_components/Card';
import useWindowSize from '@/pages/_hooks/UseWindowSize';
import 'simplebar-react/dist/simplebar.min.css';

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

const createNodeData = (qubits: any[]): { nodeData: any[]; tempNodeMap: Map<string, object> } => {
  try {
    const tempNodeMap = new Map<string, object>();
    const nodeData = qubits.map((qubit: any) => {
      tempNodeMap.set(qubit.id.toString(), qubit);
      return {
        id: qubit.id.toString(),
        label: `${qubit.id}`,
        fx: scalePosition(qubit.position.x),
        fy: scalePosition(qubit.position.y * -1), // multiply by -1 to flip the y-axis
      };
    });
    return { nodeData, tempNodeMap };
  } catch (err) {
    console.error('Failed to create node data:', err);
    return { nodeData: [], tempNodeMap: new Map<string, object>() };
  }
};

const createEdgeData = (
  couplings: any[]
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
      return {
        id: id,
        source: coupling.control.toString(),
        target: coupling.target.toString(),
      };
    });
    return { edgeData, tempCouplingMap };
  } catch (err) {
    console.error('Failed to create edge data:', err);
    return { edgeData: [], tempCouplingMap: new Map<string, object>() };
  }
};

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

      const { nodeData, tempNodeMap } = createNodeData(parsedDeviceInfo.qubits);
      const { edgeData, tempCouplingMap } = createEdgeData(parsedDeviceInfo.couplings);

      if (nodeData.length === 0 || edgeData.length === 0) {
        setIsValidDeviceInfo(false);
      }

      setTopologyData({ nodes: normalizePositions(nodeData), links: edgeData });
      setNodeMap(tempNodeMap);
      setCouplingMap(tempCouplingMap);
    } catch (err) {
      setIsValidDeviceInfo(false);
      console.error('Failed to update topology data:', err);
    }
  }, [deviceInfo]);

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

  const strHoveredInfo = JSON.stringify(hoveredInfo);

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
      </Card>
      <Card className={clsx(['col-start-2', 'col-end-3'])}>
        <div ref={divRef}>
          <ForceGraph2D
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
              ctx.fillStyle = '#4887fa';
              ctx.fill();
              ctx.strokeStyle = node.id === hoveredNodeId ? '#fc6464' : 'white';
              ctx.lineWidth = 3 / globalScale;
              ctx.stroke();

              const label = node.label || '';
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Arial Bold`;
              ctx.fillStyle = 'white';
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
                const innerStrokeColor = '#4887fa';

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = innerStrokeColor;
                ctx.lineWidth = 10 / globalScale;
                ctx.stroke();
              }
            }}
            enableNodeDrag={false}
            onNodeHover={handleHoverNode}
            onLinkHover={handleHoverLink}
            height={divSize.height}
            width={divSize.width}
            backgroundColor={'white'}
          />
        </div>
      </Card>
    </div>
  );
};
