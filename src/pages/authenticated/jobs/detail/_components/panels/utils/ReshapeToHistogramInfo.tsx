interface countsProps {
  countsJson?: string;
  height: number;
}

export function reshapeToHistogramInfo(counts: countsProps) {
  const countsObject = (() => {
    if (!counts.countsJson) {
      return {};
    }
    try {
      return JSON.parse(counts.countsJson);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  })();
  const keysList = Object.keys(countsObject).sort();
  const filteredKeys = keysList.filter((key) => countsObject[key] !== 0);
  const valuesList = filteredKeys.map((key) => countsObject[key]);
  return { categories: filteredKeys, data: valuesList, height: counts.height };
}
