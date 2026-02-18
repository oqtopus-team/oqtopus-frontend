import React, { useTransition } from "react";
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

const CustomTooltip = (props: TooltipContentProps<number, string>) => {
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
        style={{ width: "400px", height: "320px" }}
      >
        <ResponsiveContainer width="100%" height="100%">
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
        </ResponsiveContainer>
      </div>
    </div>
  );
}