import { JobsOperatorItem } from "@/api/generated";
import { MathJax, MathJax3Config, MathJaxContext } from "better-react-mathjax";
import clsx from "clsx";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { renderObservableExpr } from "../observable";
import { GatePosition, ParametricExpectedValueResult } from "@/backend/qulacs/types";
import { ParametricExpectationValueChart, ParametricExpectationValuePoint } from "./LocalSimlParametricExpectationValueChart";
import { roundNumber } from "../misc";

export interface Props {
  observable: JobsOperatorItem[];
  expectationValue?: number;
  qubitNumber: number;
  selectedParametricGatePosition?: GatePosition
  parametricExpectationValue: ParametricExpectedValueResult;
}

export const ExpectationValueEstimation: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const observableText = useMemo(() => {
    const operatorText = renderObservableExpr(props.observable, props.qubitNumber);
    return `\\(\\hat{H} = ${operatorText}\\)`
  }, [props.observable]);

  const expectationValueText = useMemo(() => {
    return `\\(\\langle\\hat{H}\\rangle = ${roundNumber(props.expectationValue ?? 0, 5)}\\)`
  }, [props.expectationValue]);

  const mathjaxConfig: MathJax3Config = {
    loader: { load: ['input/asciimath'] },
  }

  const parametricExpectationValueData = useMemo(() => {
    return props
      .parametricExpectationValue
      .expectationValueMap
      .map((point): ParametricExpectationValuePoint => {
        return {
          param: point.param,
          expectationValue: roundNumber(point.expectationValue, 5),
        };
      })
  }, [props.parametricExpectationValue]);

  return (
    <div className={clsx(['flex', 'items-center', 'gap-5'])}>
      <div
        className={clsx([
          ['border', 'border-chart-border', 'rounded-lg', 'p-3'],
        ])}
      >
        <div
          className={clsx([
            ['text-sm', 'text-chart-title'],
            ['pt-1', 'pb-3'],
            ['w-full']
          ])}
        >
          {t('composer.control_panel.siml.expectation_value_estimation')}
        </div>
        <div
          className={clsx([
            ["flex", "flex-col", "items-start", "gap-3"],
            ['w-[440px]', 'h-[320px]']
          ])}
        >
          <div
            className={clsx([
              ["flex", "flex-col", "items-start", "gap-3"],
              ["w-full", "p-5"]
            ])}
          >
            <div
              className={clsx([
                ['font-bold'],
                ["text-sm", "text-neutral-content"]
              ])}
            >
              {t('composer.control_panel.siml.observable')}
            </div>
            <div
              className={clsx([
                ["bg-gray-bg"],
                ["p-5", "w-full", "overflow-x-auto"]
              ])}
            >
              <MathJaxContext config={mathjaxConfig}>
                <MathJax>{observableText}</MathJax>
              </MathJaxContext>
            </div>
          </div>

          <div
            className={clsx([
              ["flex", "flex-col", "items-start", "gap-3"],
              ["w-full", "p-5"]
            ])}
          >
            <div
              className={clsx([
                ['font-bold'],
                ["text-sm", "text-neutral-content"]
              ])}
            >
              {t('composer.control_panel.siml.expectation_value')}
            </div>
            <div
              className={clsx([
                ["bg-gray-bg"],
                ["p-5", "w-full", "overflow-x-auto"]
              ])}
            >
              <MathJaxContext config={mathjaxConfig}>
                <MathJax>{expectationValueText}</MathJax>
              </MathJaxContext>
            </div>
          </div>
        </div>

      </div>

      <div
        className={clsx([
          ['border', 'border-chart-border', 'rounded-lg', 'p-3'],
        ])}
      >
        <div
          className={clsx([
            ['text-sm', 'text-chart-title'],
            ['pt-1', 'pb-3'],
          ])}
        >
          {t('composer.control_panel.siml.parameter_sweep')}
        </div>
        <div
          className={clsx([
            ["flex", "flex-col", "items-start", "gap-3"],
            ['w-[440px]', 'h-[320px]']
          ])}
        >
          <ParametricExpectationValueChart
            data={parametricExpectationValueData}
          />
        </div>

      </div>

    </div>
  );
};