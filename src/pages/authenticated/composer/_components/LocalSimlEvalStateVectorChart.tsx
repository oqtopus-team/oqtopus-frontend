import React, { useTransition } from "react";
import {
  Bar,
  BarChart,
  BarShapeProps,
  CartesianGrid,
  Cell,
  Label,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
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

const AmplitudeBarRectangle = (props: BarShapeProps) => {
  return (
    <Rectangle
      {...props}
      fill="#FF6666"
      stroke={"#FF6666"}
      strokeWidth={2}
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
            {/* <Tooltip
            wrapperStyle={{ outline: 'none' }}
            content={<CustomTooltip />}
          /> */}
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