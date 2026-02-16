import clsx from "clsx";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Label,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
  type YAxisProps,
} from 'recharts';

export interface SamplingChartPoint {
  name: string;
  count: number;
}

export interface Props {
  shot: number;
  data: SamplingChartPoint[];
}

export const SimulatorResultSamplingChart: React.FC<Props> = ({ data, shot }) => {
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
        {t('composer.control_panel.siml.sampling_result')}
      </div>
      <div
        className={clsx(["m-2"])}
        style={{ width: "400px", height: "320px" }}
      >

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name">
              <Label
                value="Computational basis states"
                offset={0}
                position="insideBottom"
              />
            </XAxis>
            <YAxis
              yAxisId="1"
              domain={[0, shot]}
              scale='auto'
            >
              <Label
                value="counts"
                angle={-90}
                position="insideBottomLeft"
              />
            </YAxis>
            {/* <Tooltip
          wrapperStyle={{ outline: 'none' }}
          content={<CustomTooltip />}
        /> */}
            <Bar
              dataKey="count"
              yAxisId="1"
              fill="#82ca9d"
              fillOpacity="0.4"
            />
            <Line
              type="linear"
              dataKey="probabilityVector"
              yAxisId="1"
              stroke="red"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>

  );
};
