import { describe, expect, it } from 'vitest';
import { formatHistogramCategory, reshapeToHistogramInfo } from './ReshapeToHistogramInfo';

describe('reshapeToHistogramInfo', () => {
  it('displays all observed states at or below the default threshold', () => {
    const counts = Object.fromEntries(
      Array.from({ length: 12 }, (_, index) => [`state-${index}`, index + 1])
    );

    const result = reshapeToHistogramInfo({ countsJson: JSON.stringify(counts), height: 320 });

    expect(result.categories).toHaveLength(12);
    expect(result.categories.slice(0, 3)).toEqual(['state-11', 'state-10', 'state-9']);
    expect(result.statistics).toEqual({
      totalCount: 78,
      observedStates: 12,
      displayedStates: 12,
      displayedCount: 78,
      coverage: 1,
    });
  });

  it('displays the top states when the default threshold is exceeded', () => {
    const counts = Object.fromEntries(
      Array.from({ length: 21 }, (_, index) => [`state-${index}`, index + 1])
    );

    const result = reshapeToHistogramInfo({ countsJson: JSON.stringify(counts), height: 320 });

    expect(result.categories).toHaveLength(10);
    expect(result.categories[0]).toBe('state-20');
    expect(result.categories[9]).toBe('state-11');
    expect(result.statistics.observedStates).toBe(21);
    expect(result.statistics.displayedStates).toBe(10);
  });

  it('sorts tied counts by state and filters invalid values', () => {
    const result = reshapeToHistogramInfo({
      countsJson: JSON.stringify({ b: 5, a: 5, zero: 0, negative: -1, text: '4' }),
      height: 240,
    });

    expect(result.categories).toEqual(['a', 'b']);
    expect(result.data).toEqual([5, 5]);
    expect(result.statistics.observedStates).toBe(2);
  });

  it('respects custom display options', () => {
    const result = reshapeToHistogramInfo(
      { countsJson: JSON.stringify({ a: 1, b: 3, c: 2 }), height: 240 },
      { fullDisplayThreshold: 2, topStatesLimit: 2 }
    );

    expect(result.categories).toEqual(['b', 'c']);
    expect(result.statistics.displayedStates).toBe(2);
  });
});

describe('formatHistogramCategory', () => {
  it('preserves short states and truncates long states at both ends', () => {
    expect(formatHistogramCategory('0011')).toBe('0011');
    expect(formatHistogramCategory(`${'0'.repeat(20)}${'1'.repeat(20)}`)).toBe(
      '0000000000...1111111111'
    );
  });
});
