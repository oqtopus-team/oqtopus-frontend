interface CountsProps {
  countsJson?: string;
  height: number;
}

export interface HistogramStatistics {
  totalCount: number;
  observedStates: number;
  displayedStates: number;
  displayedCount: number;
  coverage: number;
}

export interface HistogramDisplayOptions {
  fullDisplayThreshold?: number;
  topStatesLimit?: number;
}

export const DEFAULT_FULL_DISPLAY_THRESHOLD = 20;
export const DEFAULT_TOP_STATES_LIMIT = 10;
export const DEFAULT_TOOLTIP_LINE_LENGTH = 64;

const normalizeInteger = (value: number | undefined, fallback: number, minimum: number): number => {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(minimum, Math.floor(value));
};

const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character] ?? character
  );

export const formatHistogramCategory = (category: string, maxLength: number = 24): string => {
  if (category.length <= maxLength) {
    return category;
  }
  const segmentLength = Math.max(1, Math.floor((maxLength - 3) / 2));
  return `${category.slice(0, segmentLength)}...${category.slice(-segmentLength)}`;
};

export const formatHistogramTooltipCategory = (
  category: string,
  lineLength: number = DEFAULT_TOOLTIP_LINE_LENGTH
): string => {
  const safeLineLength = Math.max(1, Math.floor(lineLength));
  const lines = [];
  for (let index = 0; index < category.length; index += safeLineLength) {
    lines.push(escapeHtml(category.slice(index, index + safeLineLength)));
  }
  return lines.join('<br>');
};

export function reshapeToHistogramInfo(counts: CountsProps, options: HistogramDisplayOptions = {}) {
  const countsObject = (() => {
    if (!counts.countsJson) {
      return {};
    }
    try {
      const parsedCounts = JSON.parse(counts.countsJson);
      if (
        parsedCounts === null ||
        Array.isArray(parsedCounts) ||
        typeof parsedCounts !== 'object'
      ) {
        throw new Error('Invalid counts format');
      }
      return parsedCounts as Record<string, unknown>;
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  })();

  const entries = Object.entries(countsObject)
    .filter((entry): entry is [string, number] => {
      const value = entry[1];
      return typeof value === 'number' && Number.isFinite(value) && value > 0;
    })
    .sort(([leftState, leftCount], [rightState, rightCount]) => {
      return rightCount - leftCount || leftState.localeCompare(rightState);
    });
  const fullDisplayThreshold = normalizeInteger(
    options.fullDisplayThreshold,
    DEFAULT_FULL_DISPLAY_THRESHOLD,
    0
  );
  const topStatesLimit = normalizeInteger(options.topStatesLimit, DEFAULT_TOP_STATES_LIMIT, 1);
  const displayLimit = entries.length <= fullDisplayThreshold ? entries.length : topStatesLimit;
  const displayedEntries = entries.slice(0, displayLimit);
  const totalCount = entries.reduce((total, [, count]) => total + count, 0);
  const displayedCount = displayedEntries.reduce((total, [, count]) => total + count, 0);
  const statistics: HistogramStatistics = {
    totalCount,
    observedStates: entries.length,
    displayedStates: displayedEntries.length,
    displayedCount,
    coverage: totalCount > 0 ? displayedCount / totalCount : 0,
  };

  return {
    categories: displayedEntries.map(([state]) => state),
    data: displayedEntries.map(([, count]) => count),
    height: counts.height,
    statistics,
  };
}
