import {
  Bar,
  BarChart,
  BarShapeProps,
  CartesianGrid,
  Label,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';

import { Complex } from "../misc";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

export interface AmplitudeChartPoint {
  name: string;
  stateVector: Complex;
  stateVectorAbsoluted: number;
  stateVectorArgument: number;
}

export interface Props {
  data: AmplitudeChartPoint[];
};

const createHSL = (value: number) => `hsl(${value * 180}, 100%, 70%)`;

const renderImaginaryPart = (value: number) => (value >= 0 ? `+i${value}` : `-i${(-1) * value}`);

const CustomTooltip = (props: TooltipContentProps<ValueType, NameType>) => {
  if (props.active && props.payload && props.payload.length > 0) {
    const data = props.payload[0].payload as AmplitudeChartPoint;

    return (
      <div className="m-0 p-2.5 bg-primary-content border border-neutral-content whitespace-nowrap shadow-sm rounded">
        <p className="m-0 font-medium text-base-content">{data.name}</p>

        <div className="text-base-content text-xs mt-1 space-y-0.5">
          <p className="m-0">
            stateVectorAbsoluted: {data.stateVectorAbsoluted}
          </p>
          <p className="m-0">
            stateVectorArgument: {data.stateVectorArgument}
          </p>
          <p className="m-0">
            stateVector: {data.stateVector.re}
            {renderImaginaryPart(data.stateVector.im)}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const AmplitudeBarRectangle = (props: BarShapeProps) => {
  return (
    <Rectangle
      {...props}
      fill={createHSL(props.payload["stateVectorArgument"])}
    />
  );
}

const colormapCls = `bg-[linear-gradient(90deg,hsl(0,100%,70%),hsl(60,100%,70%),hsl(120,100%,70%),hsl(180,100%,70%),hsl(240,100%,70%),hsl(300,100%,70%),hsl(360,100%,70%))]`;

export const EvaluationStateVectorChart: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <div
      className={clsx([
        ['border', 'border-chart-border', 'rounded-lg'],
        ['p-3']
      ])}
    >
      <div
        className={clsx([
          ['text-sm', 'text-chart-title'],
          ['pt-1', 'pb-3'],
        ])}
      >
        {t('composer.control_panel.siml.state_vector')}
      </div>
      <div
        className={clsx(["m-2", "outline-none"])}
        style={{ width: "400px", height: "280px" }}
      >
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={props.data} tabIndex={-1}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name">
              <Label
                value="Computational basis states"
                offset={0}
                position="insideBottom"
              />
            </XAxis>
            <YAxis domain={[0, 1.0]}>
              <Label
                value="Amplitude Value"
                angle={-90}
                position="insideBottomLeft"
              />
            </YAxis>
            <Tooltip
              wrapperStyle={{ outline: 'none' }}
              wrapperClassName="bg-white"
              content={CustomTooltip}
            />
            <Bar
              dataKey="stateVectorAbsoluted"
              isAnimationActive={true}
              shape={AmplitudeBarRectangle}
            />
          </BarChart>
          <div className={clsx(['w-[400px]', 'mt-2', 'pr-7', 'flex', 'items-end'])}>
            <span className={clsx(['text-xs', 'text-base-content'])}>
              argument colormap
            </span>
            <div className={clsx([['w-full', 'flex', 'flex-col']])}>
              <div className={clsx([['h-[12px]'], colormapCls])} />
              <div className={clsx(['grid', 'grid-cols-5', 'text-xs', 'text-neutral-content'])}>
                <div className={clsx(['text-left'])}>0</div>
                <div className={clsx(['text-center'])}>π/2</div>
                <div className={clsx(['text-center'])}>π</div>
                <div className={clsx(['text-center'])}>3π/2</div>
                <div className={clsx(['text-right'])}>2π</div>
              </div>
            </div>
          </div>
        </ResponsiveContainer>

      </div>
    </div>
  );
}