import { describe, expect, it } from 'vitest';
import { formatTokenAmount } from './format';

// ─────────────────────────────────────────────────────────────────────────────
// formatTokenAmount — Test Suite
//
// 4 branches (in priority order):
//
//  Branch 0 — ZERO/INVALID  : value = 0 | NaN | invalid string  → "0"
//  Branch 1 — NEAR-ZERO     : 0 < abs < 0.00001                 → "< 0.00001"
//  Branch 2 — DUST          : 0.00001 ≤ abs < 0.01              → adaptive decimals
//  Branch 3 — STANDARD      : abs ≥ 0.01                        → max 5 decimals
//
// Invariant: ALWAYS TRUNCATE (floor), NEVER round up.
// ─────────────────────────────────────────────────────────────────────────────

describe('formatTokenAmount', () => {
  // ── Branch 0: ZERO / INVALID ──────────────────────────────────────────────
  // All "invalid" or zero values return "0"

  describe('Branch 0 — Zero / Invalid', () => {
    it('zero', () => {
      expect(formatTokenAmount(0)).toBe('0');
    });

    it('string "0"', () => {
      expect(formatTokenAmount('0')).toBe('0');
    });

    it('NaN', () => {
      expect(formatTokenAmount(NaN)).toBe('0');
    });

    it('non-numeric string', () => {
      expect(formatTokenAmount('abc')).toBe('0');
    });

    it('empty string', () => {
      expect(formatTokenAmount('')).toBe('0');
    });
  });

  // ── Branch 1: NEAR-ZERO ───────────────────────────────────────────────────
  // Condition: 0 < abs < 0.00001 (= 10^-5 with maxDigits=5)
  // Output: "< 0.00001"
  // Reason: too small to display accurately → use "<" prefix to warn user

  describe('Branch 1 — Near-zero (abs < 0.00001)', () => {
    it('very small number like 1e-7', () => {
      expect(formatTokenAmount(0.0000001)).toBe('< 0.00001');
    });

    it('0.000001', () => {
      expect(formatTokenAmount(0.000001)).toBe('< 0.00001');
    });

    it('0.000009 (just below threshold)', () => {
      expect(formatTokenAmount(0.000009)).toBe('< 0.00001');
    });

    it('0.000009999 (still in branch 1)', () => {
      expect(formatTokenAmount(0.000009999)).toBe('< 0.00001');
    });

    it('very small negative value also uses abs', () => {
      // abs(-0.000001) = 0.000001 → branch 1
      expect(formatTokenAmount(-0.000001)).toBe('< 0.00001');
    });
  });

  // ── Branch 2: DUST ────────────────────────────────────────────────────────
  // Condition: 0.00001 ≤ abs < 0.01
  // Output: adaptive decimals to display at least 2 significant digits
  //
  // Formula: dustDecimals = min(max(-floor(log10(abs)) + 2, 3), 10)
  //
  //   abs = 0.000012 → log10 ≈ -4.92 → floor = -5 → negate = 5 → +2 = 7 → dustDecimals = 7
  //   abs = 0.00015  → log10 ≈ -3.82 → floor = -4 → negate = 4 → +2 = 6 → dustDecimals = 6
  //   abs = 0.0012   → log10 ≈ -2.92 → floor = -3 → negate = 3 → +2 = 5 → dustDecimals = 5
  //   abs = 0.0099   → log10 ≈ -2.00 → floor = -3 → negate = 3 → +2 = 5 → dustDecimals = 5

  describe('Branch 2 — Dust (0.00001 ≤ abs < 0.01)', () => {
    it('0.00001 — exactly at the lower dust threshold', () => {
      // dustDecimals = -floor(log10(0.00001)) + 2 = 5+2 = 7
      expect(formatTokenAmount(0.00001)).toBe('0.00001');
    });

    it('0.000012 — dustDecimals = 7', () => {
      expect(formatTokenAmount(0.000012)).toBe('0.000012');
    });

    it('0.000019 — truncate, does not round up to 0.00002', () => {
      expect(formatTokenAmount(0.000019)).toBe('0.000019');
    });

    it('0.00015 — dustDecimals = 6', () => {
      expect(formatTokenAmount(0.00015)).toBe('0.00015');
    });

    it('0.0012 — dustDecimals = 5', () => {
      expect(formatTokenAmount(0.0012)).toBe('0.0012');
    });

    it('0.00123456 — truncate at dustDecimals', () => {
      // dustDecimals = 5 → truncate → 0.00123 (drop "456")
      expect(formatTokenAmount(0.00123456)).toBe('0.00123');
    });

    it('0.0099 — just below the upper dust threshold', () => {
      // dustDecimals = 5 → "0.0099"
      expect(formatTokenAmount(0.0099)).toBe('0.0099');
    });

    it('0.009999 — truncate, does not go to 0.01', () => {
      expect(formatTokenAmount(0.009999)).toBe('0.0099');
    });
  });

  // ── Branch 3: STANDARD ────────────────────────────────────────────────────
  // Condition: abs ≥ 0.01
  // Output: max maxDigits (default=5) decimals, trailing zeros stripped
  // Always TRUNCATE, never round

  describe('Branch 3 — Standard (abs ≥ 0.01)', () => {
    describe('Lower bound (0.01 – 1)', () => {
      it('0.01 — exactly at the standard threshold', () => {
        expect(formatTokenAmount(0.01)).toBe('0.01');
      });

      it('0.123456789 — truncate at 5 decimals', () => {
        // 0.12345 | drop "6789"
        expect(formatTokenAmount(0.123456789)).toBe('0.12345');
      });

      it('0.1 — trailing zero not shown', () => {
        expect(formatTokenAmount(0.1)).toBe('0.1');
      });
    });

    describe('Integers and near-integers', () => {
      it('1.0 — trailing zeros stripped', () => {
        expect(formatTokenAmount(1.0)).toBe('1');
      });

      it('1.5 — trailing zeros stripped (not "1.50000")', () => {
        expect(formatTokenAmount(1.5)).toBe('1.5');
      });

      it('1.99999 — truncate, does NOT become "2"', () => {
        expect(formatTokenAmount(1.99999)).toBe('1.99999');
      });

      it('1.9999999 — cut at 5 decimals', () => {
        // 1.99999 | drop "99"
        expect(formatTokenAmount(1.9999999)).toBe('1.99999');
      });

      it('2.601398473629 — truncate at 5', () => {
        expect(formatTokenAmount(2.601398473629)).toBe('2.60139');
      });
    });

    describe('Large numbers — thousand separator', () => {
      it('1000 — has comma as thousand separator', () => {
        expect(formatTokenAmount(1000)).toBe('1,000');
      });

      it('1000.5 — has comma + decimals', () => {
        expect(formatTokenAmount(1000.5)).toBe('1,000.5');
      });

      it('1000000', () => {
        expect(formatTokenAmount(1000000)).toBe('1,000,000');
      });

      it('1000000.123456 — truncate at 5 decimals', () => {
        expect(formatTokenAmount(1000000.123456)).toBe('1,000,000.12345');
      });
    });

    describe('Exact integers — no decimal part', () => {
      it('100', () => {
        expect(formatTokenAmount(100)).toBe('100');
      });

      it('string "100"', () => {
        expect(formatTokenAmount('100')).toBe('100');
      });

      it('string "2.601398"', () => {
        expect(formatTokenAmount('2.601398')).toBe('2.60139');
      });
    });
  });

  // ── Custom maxDigits ──────────────────────────────────────────────────────
  // When passing a different maxDigits, all thresholds shift accordingly

  describe('Custom maxDigits', () => {
    describe('maxDigits = 2', () => {
      it('near-zero threshold shifts up to 0.01', () => {
        // NEAR_ZERO_THRESHOLD = 10^-2 = 0.01
        expect(formatTokenAmount(0.001, 2)).toBe('< 0.01');
      });

      it('0.01 — enters standard', () => {
        expect(formatTokenAmount(0.01, 2)).toBe('0.01');
      });

      it('1.999 — truncate at 2 decimals', () => {
        expect(formatTokenAmount(1.999, 2)).toBe('1.99');
      });
    });

    describe('maxDigits = 8 (dust supply balance)', () => {
      it('near-zero threshold shifts down to 0.00000001', () => {
        expect(formatTokenAmount(0.000000001, 8)).toBe('< 0.00000001');
      });

      it('0.000000123 — is displayable', () => {
        // dustDecimals = -floor(log10(1.23e-7)) + 2 = 7+2 = 9 → min(9,10) = 9
        expect(formatTokenAmount(0.000000123, 8)).toBe('0.000000123');
      });

      it('0.00001 — enters dust range', () => {
        expect(formatTokenAmount(0.00001, 8)).toBe('0.00001');
      });

      it('1.123456789 — truncate at 8 decimals', () => {
        expect(formatTokenAmount(1.123456789, 8)).toBe('1.12345678');
      });
    });
  });

  // ── Invariant: always TRUNCATE, never ROUND UP ───────────────────────────

  describe('Invariant — Truncate, never Round Up', () => {
    const cases: [number, string][] = [
      [1.9999999, '1.99999'], // does not become "2"
      [0.999999, '0.99999'], // does not become "1"
      [0.000019999, '0.000019'], // does not become "0.00002"
      [0.009999, '0.0099'], // does not become "0.01" (branch change!)
      [99.999999, '99.999'], // does not become "100"
      [999.9999999, '999.99999'], // does not become "1000"
    ];

    it.each(cases)('formatTokenAmount(%f) → "%s"', (input, expected) => {
      expect(formatTokenAmount(input)).toBe(expected);
    });
  });
});
