import { describe, expect, it } from 'vitest';
import {
  calculateAreaZoom,
  getAreaSelectionRect,
  hasAreaZoomModifier,
  shouldShowNodeLabel,
  toGraphSize,
} from './TopologyInfo';

describe('toGraphSize', () => {
  it('shrinks objects below 1x and caps their screen size above 1x', () => {
    expect(toGraphSize(18, 0.5) * 0.5).toBe(9);
    expect(toGraphSize(18, 1) * 1).toBe(18);
    expect(toGraphSize(18, 2) * 2).toBe(18);
  });
});

describe('shouldShowNodeLabel', () => {
  it('shows labels only after fixed-size nodes no longer overlap', () => {
    expect(shouldShowNodeLabel(0.79)).toBe(false);
    expect(shouldShowNodeLabel(0.8)).toBe(true);
  });
});

describe('getAreaSelectionRect', () => {
  it('normalizes a selection dragged from bottom-right to top-left', () => {
    expect(getAreaSelectionRect({ x: 200, y: 150 }, { x: 50, y: 25 })).toEqual({
      left: 50,
      top: 25,
      width: 150,
      height: 125,
    });
  });
});

describe('calculateAreaZoom', () => {
  it('fits the selected area within the padded viewport', () => {
    expect(calculateAreaZoom(0.4, 800, 600, 200, 150)).toBeCloseTo(1.44);
  });

  it('caps the selected area zoom at the graph maximum', () => {
    expect(calculateAreaZoom(2, 800, 600, 100, 100)).toBe(3);
  });
});

describe('hasAreaZoomModifier', () => {
  it('supports Control on Windows and Command on macOS', () => {
    expect(hasAreaZoomModifier({ ctrlKey: true, metaKey: false })).toBe(true);
    expect(hasAreaZoomModifier({ ctrlKey: false, metaKey: true })).toBe(true);
    expect(hasAreaZoomModifier({ ctrlKey: false, metaKey: false })).toBe(false);
  });
});
