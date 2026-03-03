import clsx from "clsx";
import React, { useEffect, useMemo } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Label,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface ParametricExpectationValuePoint {
  param: number;
  expectationValue: number;
}

export interface Props {
  data: ParametricExpectationValuePoint[];
};

export const ParametricExpectationValueChart: React.FC<Props> = (props) => {
  const yAxisDomain = useMemo<string[] | number[]>(
    () => (props.data.length > 0 ? ['auto', 'auto'] : [0, 1]),
    [props.data.length]
  );

  return (
    <>
      <ResponsiveContainer width="100%" height="100%" className={clsx(["p-3"])}>
        <ComposedChart data={props.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="param"
            domain={[0, 2]}
            unit="π"
            type="number"
          >
            <Label
              value="Angle"
              offset={0}
              position="insideBottom"
              className={clsx(['tex-sm'])}
            />
          </XAxis>
          <YAxis domain={yAxisDomain}>
            <Label
              value="Expectation Value"
              offset={12}
              angle={-90}

              position="insideBottomLeft"
            />
          </YAxis>
          <Tooltip
            labelFormatter={() => ""}
          />
          <Scatter dataKey="currentExpectationValue" fill="#ff7300" />
          <Line
            dataKey="expectationValue"
            type="monotone"
            dot={false}
          // activeDot={{ onClick: handleDotClick, r: ACTIVE_DOT_R }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  )
}