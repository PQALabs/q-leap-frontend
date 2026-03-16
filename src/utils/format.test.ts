import { formatApy } from './format';

describe('formatApy', () => {
  it('should format a normal positive APY', () => {
    expect(formatApy(5.25)).toBe('5.25%');
  });

  it('should format zero as 0.00%', () => {
    expect(formatApy(0)).toBe('0.00%');
  });

  it('should format a normal negative APY', () => {
    expect(formatApy(-3.5)).toBe('-3.50%');
  });

  it('should show <0.01% for very small positive values', () => {
    expect(formatApy(0.001)).toBe('<0.01%');
    expect(formatApy(0.009)).toBe('<0.01%');
  });

  it('should show >-0.01% for very small negative values', () => {
    expect(formatApy(-0.001)).toBe('>-0.01%');
    expect(formatApy(-0.009)).toBe('>-0.01%');
  });

  it('should format exactly 0.01 normally', () => {
    expect(formatApy(0.01)).toBe('0.01%');
  });

  it('should format exactly -0.01 normally', () => {
    expect(formatApy(-0.01)).toBe('-0.01%');
  });

  it('should handle large values', () => {
    expect(formatApy(100)).toBe('100.00%');
    expect(formatApy(1234.567)).toBe('1234.57%');
  });
});
