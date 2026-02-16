import { Complex } from "qulacs-wasm-simulator-client/lib/main/type/common";

/**
 * Type representing the result of sampling execution
 */
export interface ShotResult {
  /**
   * Sampling execution result
   *
   * The length is equal to UIInformation#shot received at task execution time.
   * Each value is an integer representing which basis state the sampling result collapsed to.
   * The ordering of basis states follows the same order as the elements of the complex probability distribution vector.
   *
   */
  samplingMap: number[];

  /**
   * The values obtained by counting samplingMap per basis state and dividing by the number of shots,
   * representing the convergence ratio to each basis state over the entire sampling.
   *
   * The array length is the square of the number of qubits in the system.
   */
  samplingProbabilityMap: number[];
}

/**
 * Represents the position of a quantum gate in a quantum circuit.
 *
 * [STEP][QUBIT]
 */
export interface GatePosition {
  /**
   * The step at which the quantum gate is placed.
   *
   * Range: 0 ~ (QuantumCircuitData#length - 1)
   */
  step: number;

  /**
   * The index of the qubit to which the quantum gate is applied.
   *
   * Range: 0 ~ (CircuitInformation#size - 1)
   */
  index: number;
}

/**
 * パラメータを変化させたときの期待値分布の要素型
 */
export interface ExpectationValueElement {
    /**
     * 期待値の導出パラメータ
     */
    param: number;
    /**
     * そのパラメータにおける期待値
     */
    expectationValue: number;
}

/**
 * Type representing the expectation value distribution
 * for a specified parametric quantum gate
 */
export interface ParametricExpectedValueResult {
  /**
   * The number of discretization steps for the expectation value distribution.
   *
   * For example, if this value is 100, the range 0 to 2π is divided
   * into 100 patterns to obtain the distribution.
   * This is the same value as ParametricExpectedValueRequest#steps
   * specified in the request.
   */
  steps: number;

  /**
   * The distribution of expectation values.
   *
   * The length of this array is equal to `steps`.
   */
  expectationValueMap: ExpectationValueElement[];
}

/**
 * Type representing the result of a simulation
 */
export interface StateVectorWithExpectationValue {
  /**
   * The state vector after all circuit steps have been completed.
   *
   * This represents the distribution of complex probability amplitudes,
   * expressed as an array.
   * The length of the array is the square of the number of qubits in the system.
   *
   * NOTE: This specification does not assume quantum circuits that include
   * feedback based on measurement results.
   * Such circuit structures are not considered, and their representation
   * or implementation is not guaranteed.
   */
  stateVector: Complex[];

  /**
   * An array of the absolute values of the complex elements
   * in the state vector after evaluating the quantum circuit.
   *
   * The length of the array is the square of the number of qubits in the system.
   *
   * NOTE: To avoid exposing the underlying qubit implementation outside the UIClient,
   * this specification does not assume quantum circuits that include
   * feedback based on measurement results.
   * Such circuit structures are not considered, and their representation
   * or implementation is not guaranteed.
   */
  stateVectorAbsoluted: number[];

  /**
   * An array of the arguments (phases) of the complex elements
   * in the state vector after evaluating the quantum circuit.
   *
   * The argument is returned as a coefficient of π.
   * Each element in the array is a real number in the closed interval [0, 2].
   */
  stateVectorArgument: number[];

  /**
   * An array of the squared magnitudes of the complex elements
   * in the state vector after evaluating the quantum circuit.
   */
  probabilityVector: number[];

  /**
   * The expectation value obtained by evaluating
   * the observable for the given quantum circuit.
   */
  expectationValue: number;
}