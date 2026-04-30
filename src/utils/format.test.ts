import { describe, expect, it } from 'vitest';
import { formatTokenAmount } from './format';

// ─────────────────────────────────────────────────────────────────────────────
// formatTokenAmount — Test Suite
//
// 4 branches (theo thứ tự ưu tiên trong code):
//
//  Branch 0 — ZERO/INVALID  : value = 0 | NaN | invalid string  → "0"
//  Branch 1 — NEAR-ZERO     : 0 < abs < 0.00001                 → "< 0.00001"
//  Branch 2 — DUST          : 0.00001 ≤ abs < 0.01              → adaptive decimals
//  Branch 3 — STANDARD      : abs ≥ 0.01                        → max 5 decimals
//
// Quy tắc bất biến: LUÔN TRUNCATE (floor), KHÔNG bao giờ round up.
// ─────────────────────────────────────────────────────────────────────────────

describe('formatTokenAmount', () => {
  // ── Branch 0: ZERO / INVALID ──────────────────────────────────────────────
  // Mọi giá trị "không hợp lệ" hoặc bằng 0 đều trả về "0"

  describe('Branch 0 — Zero / Invalid', () => {
    it('số 0', () => {
      expect(formatTokenAmount(0)).toBe('0');
    });

    it('string "0"', () => {
      expect(formatTokenAmount('0')).toBe('0');
    });

    it('NaN', () => {
      expect(formatTokenAmount(NaN)).toBe('0');
    });

    it('string không phải số', () => {
      expect(formatTokenAmount('abc')).toBe('0');
    });

    it('string rỗng', () => {
      expect(formatTokenAmount('')).toBe('0');
    });
  });

  // ── Branch 1: NEAR-ZERO ───────────────────────────────────────────────────
  // Điều kiện: 0 < abs < 0.00001 (= 10^-5 với maxDigits=5)
  // Output: "< 0.00001"
  // Lý do: quá nhỏ để hiển thị chính xác → dùng prefix "<" cảnh báo user

  describe('Branch 1 — Near-zero (abs < 0.00001)', () => {
    it('số rất nhỏ như 1e-7', () => {
      expect(formatTokenAmount(0.0000001)).toBe('< 0.00001');
    });

    it('0.000001', () => {
      expect(formatTokenAmount(0.000001)).toBe('< 0.00001');
    });

    it('0.000009 (ngay sát ngưỡng)', () => {
      expect(formatTokenAmount(0.000009)).toBe('< 0.00001');
    });

    it('0.000009999 (vẫn còn trong branch 1)', () => {
      expect(formatTokenAmount(0.000009999)).toBe('< 0.00001');
    });

    it('giá trị âm rất nhỏ cũng dùng abs', () => {
      // abs(-0.000001) = 0.000001 → branch 1
      expect(formatTokenAmount(-0.000001)).toBe('< 0.00001');
    });
  });

  // ── Branch 2: DUST ────────────────────────────────────────────────────────
  // Điều kiện: 0.00001 ≤ abs < 0.01
  // Output: adaptive decimals để hiển thị ít nhất 2 chữ số có nghĩa
  //
  // Công thức: dustDecimals = min(max(-floor(log10(abs)) + 2, 3), 10)
  //
  //   abs = 0.000012 → log10 ≈ -4.92 → floor = -5 → negate = 5 → +2 = 7 → dustDecimals = 7
  //   abs = 0.00015  → log10 ≈ -3.82 → floor = -4 → negate = 4 → +2 = 6 → dustDecimals = 6
  //   abs = 0.0012   → log10 ≈ -2.92 → floor = -3 → negate = 3 → +2 = 5 → dustDecimals = 5
  //   abs = 0.0099   → log10 ≈ -2.00 → floor = -3 → negate = 3 → +2 = 5 → dustDecimals = 5

  describe('Branch 2 — Dust (0.00001 ≤ abs < 0.01)', () => {
    it('0.00001 — đúng ở ngưỡng dưới của dust', () => {
      // dustDecimals = -floor(log10(0.00001)) + 2 = 5+2 = 7
      expect(formatTokenAmount(0.00001)).toBe('0.00001');
    });

    it('0.000012 — dustDecimals = 7', () => {
      expect(formatTokenAmount(0.000012)).toBe('0.000012');
    });

    it('0.000019 — truncate, không round lên 0.00002', () => {
      expect(formatTokenAmount(0.000019)).toBe('0.000019');
    });

    it('0.00015 — dustDecimals = 6', () => {
      expect(formatTokenAmount(0.00015)).toBe('0.00015');
    });

    it('0.0012 — dustDecimals = 5', () => {
      expect(formatTokenAmount(0.0012)).toBe('0.0012');
    });

    it('0.00123456 — truncate tại dustDecimals', () => {
      // dustDecimals = 5 → truncate → 0.00123 (bỏ "456")
      expect(formatTokenAmount(0.00123456)).toBe('0.00123');
    });

    it('0.0099 — ngay sát ngưỡng trên của dust', () => {
      // dustDecimals = 5 → "0.0099"
      expect(formatTokenAmount(0.0099)).toBe('0.0099');
    });

    it('0.009999 — truncate, không lên 0.01', () => {
      // dustDecimals = 5 → truncate(0.009999, 5) = "0.00999"
      expect(formatTokenAmount(0.009999)).toBe('0.00999');
    });
  });

  // ── Branch 3: STANDARD ────────────────────────────────────────────────────
  // Điều kiện: abs ≥ 0.01
  // Output: tối đa maxDigits (default=5) decimals, trailing zeros bị bỏ
  // Luôn TRUNCATE, không round

  describe('Branch 3 — Standard (abs ≥ 0.01)', () => {
    describe('Biên dưới (0.01 – 1)', () => {
      it('0.01 — đúng ở ngưỡng vào standard', () => {
        expect(formatTokenAmount(0.01)).toBe('0.01');
      });

      it('0.123456789 — truncate tại 5 decimals', () => {
        // 0.12345 | bỏ "6789"
        expect(formatTokenAmount(0.123456789)).toBe('0.12345');
      });

      it('0.1 — trailing zero không hiện', () => {
        expect(formatTokenAmount(0.1)).toBe('0.1');
      });
    });

    describe('Số nguyên và gần nguyên', () => {
      it('1.0 — trailing zeros bị bỏ', () => {
        expect(formatTokenAmount(1.0)).toBe('1');
      });

      it('1.5 — trailing zeros bị bỏ (không phải "1.50000")', () => {
        expect(formatTokenAmount(1.5)).toBe('1.5');
      });

      it('1.99999 — truncate, KHÔNG làm "2"', () => {
        expect(formatTokenAmount(1.99999)).toBe('1.99999');
      });

      it('1.9999999 — cắt tại 5 decimals', () => {
        // 1.99999 | bỏ "99"
        expect(formatTokenAmount(1.9999999)).toBe('1.99999');
      });

      it('2.601398473629 — truncate tại 5', () => {
        expect(formatTokenAmount(2.601398473629)).toBe('2.60139');
      });
    });

    describe('Số lớn — thousand separator', () => {
      it('1000 — có dấu phẩy ngăn cách nghìn', () => {
        expect(formatTokenAmount(1000)).toBe('1,000');
      });

      it('1000.5 — có dấu phẩy + decimals', () => {
        expect(formatTokenAmount(1000.5)).toBe('1,000.5');
      });

      it('1000000', () => {
        expect(formatTokenAmount(1000000)).toBe('1,000,000');
      });

      it('1000000.123456 — truncate tại 5 decimals', () => {
        expect(formatTokenAmount(1000000.123456)).toBe('1,000,000.12345');
      });
    });

    describe('Số nguyên chính xác — không có phần thập phân', () => {
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
  // Khi truyền maxDigits khác 5, toàn bộ ngưỡng thay đổi theo

  describe('Custom maxDigits', () => {
    describe('maxDigits = 2', () => {
      it('near-zero ngưỡng dịch lên 0.01', () => {
        // NEAR_ZERO_THRESHOLD = 10^-2 = 0.01
        expect(formatTokenAmount(0.001, 2)).toBe('< 0.01');
      });

      it('0.01 — vào standard', () => {
        expect(formatTokenAmount(0.01, 2)).toBe('0.01');
      });

      it('1.999 — truncate tại 2 decimals', () => {
        expect(formatTokenAmount(1.999, 2)).toBe('1.99');
      });
    });

    describe('maxDigits = 8 (dust supply balance)', () => {
      it('near-zero ngưỡng dịch xuống 0.00000001', () => {
        expect(formatTokenAmount(0.000000001, 8)).toBe('< 0.00000001');
      });

      it('0.000000123 — hiển thị được', () => {
        // dustDecimals = -floor(log10(1.23e-7)) + 2 = 7+2 = 9 → min(9,10) = 9
        expect(formatTokenAmount(0.000000123, 8)).toBe('0.000000123');
      });

      it('0.00001 — vào dust range', () => {
        expect(formatTokenAmount(0.00001, 8)).toBe('0.00001');
      });

      it('1.123456789 — truncate tại 8 decimals', () => {
        expect(formatTokenAmount(1.123456789, 8)).toBe('1.12345678');
      });
    });
  });

  // ── Bất biến: luôn TRUNCATE, không ROUND UP ───────────────────────────────

  describe('Invariant — Truncate, không bao giờ Round Up', () => {
    const cases: [number, string][] = [
      [1.9999999, '1.99999'], // không làm "2"
      [0.999999, '0.99999'], // không làm "1"
      [0.000019999, '0.0000199'], // không làm "0.00002" — dustDecimals=7, truncate tại 7
      [0.009999, '0.00999'], // không làm "0.01" — dustDecimals=5, truncate tại 5
      [99.999999, '99.99999'], // không làm "100"
      [999.9999999, '999.99999'], // không làm "1000"
    ];

    it.each(cases)('formatTokenAmount(%f) → "%s"', (input, expected) => {
      expect(formatTokenAmount(input)).toBe(expected);
    });
  });
});
