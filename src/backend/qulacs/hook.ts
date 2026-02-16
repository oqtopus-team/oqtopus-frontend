import { useContext } from "react"
import { QulacsSimulatorContext } from "./Provider"
import { CircuitInfo, ObservableInfo } from "qulacs-wasm-simulator-client";
import { samplingProbabilityMapFromSamplingMap } from "./utils";
import { GatePosition, ParametricExpectedValueResult, ShotResult, StateVectorWithExpectationValue } from "./types";
import { Complex } from "qulacs-wasm-simulator-client/lib/main/type/common";

export type UseQulacsSimulatorHook = () => {
  startShots: (
    circuitInfo: CircuitInfo, 
    shot: number,
  ) => ShotResult;

  getStateVectorWithExpectationValue: (
    circuitInfo: CircuitInfo,
    observableInfo: ObservableInfo,
  ) => StateVectorWithExpectationValue;

  /**
   * Takes the position of a single parametric quantum gate,
   * Varies its parameter within an arbitrary range (`parametricRange`),
   * Returns the distribution of expectation values of 
   * the observable corresponding to that variation.
   */
  requestParametricExpectedValue: (
    circuitInfo: CircuitInfo,
    observableInfo: ObservableInfo,
    steps: number, 
    position: GatePosition,
    parametricRange?: number
  ) => ParametricExpectedValueResult;
}

export const useQulacsSimulator: UseQulacsSimulatorHook = () => {
  const client = useContext(QulacsSimulatorContext);
  if (!client) {
    throw new Error("The qulacs simulator is not initialized.");
  }

  const startShots = (circuitInfo: CircuitInfo, shot: number): ShotResult => {
    const samplingMap = client.runShotTask({ circuitInfo, shot });
    const samplingProbabilityMap = samplingProbabilityMapFromSamplingMap(
      samplingMap,
      circuitInfo.size,
      shot,
    );
    return {
      samplingMap,
      samplingProbabilityMap,
    };
  };

  const getStateVectorWithExpectationValue = (
    circuitInfo: CircuitInfo,
    objectiveInfo: ObservableInfo,
  ): StateVectorWithExpectationValue => {
    const result = client.getStateVectorWithExpectationValue({
      circuitInfo: circuitInfo,
      observableInfo: objectiveInfo,
    });
    const stateVectorAbsoluted = result.stateVector.map((c: Complex) => {
      return Math.sqrt(c.re ** 2 + c.im ** 2);
    });

    const stateVectorArgument = result.stateVector.map((c: Complex) => {
      const arg = Math.atan2(c.im, c.re) / Math.PI;
      return arg < 0 ? arg + 2 : arg;
    });

    const probabilityVector = stateVectorAbsoluted.map((c) => c ** 2);

    return {
      ...result,
      stateVectorAbsoluted,
      stateVectorArgument,
      probabilityVector,
    };
  };

  const requestParametricExpectedValue = (
    circuitInfo: CircuitInfo,
    observableInfo: ObservableInfo,
    steps: number, 
    position: GatePosition,
    parametricRange: number = 2
  ): ParametricExpectedValueResult => {
    const result = client.getExpectationValueMap({ 
      circuitInfo,
      observableInfo,
      parametricPositionQubitIndex: position.index,
      parametricPositionStep: position.step,
      stepSize: steps,
    });
    
    const expectationValueMap = result.map((expectationValue, index) => {
      const param = (index / (steps - 1)) * parametricRange;
      return { param, expectationValue };
    });

    return { steps, expectationValueMap };
  };

  return {
    startShots,
    getStateVectorWithExpectationValue,
    requestParametricExpectedValue,
  };
}