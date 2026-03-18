export function samplingProbabilityMapFromSamplingMap(
  samplingMap: number[], 
  size: number, 
  shot: number,
): number[] {
  let samplingProbabilityMap: number[] = new Array(
    2 ** size
  ).fill(0);
  samplingMap.forEach((sample, i) => {
    samplingProbabilityMap[i] += sample;
  });
  samplingProbabilityMap = samplingProbabilityMap.map(
    (count) => count / shot
  );
  return samplingProbabilityMap;
}