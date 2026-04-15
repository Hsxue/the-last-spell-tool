/**
 * i18n Translation Completeness Test
 * Verifies that all translation keys in en/common.json exist in zh/common.json
 * and that both JSON files are valid.
 */

import { describe, it, expect } from 'vitest';
import enCommon from '@/i18n/locales/en/common.json';
import zhCommon from '@/i18n/locales/zh/common.json';
import i18n from '@/i18n/config';

// Helper: flatten nested object keys into dot-notation paths
function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe('i18n Translation Completeness', () => {
  it('should have valid JSON files', () => {
    expect(enCommon).toBeDefined();
    expect(zhCommon).toBeDefined();
    expect(typeof enCommon).toBe('object');
    expect(typeof zhCommon).toBe('object');
  });

  it('should have matching keys between en and zh (common namespace)', () => {
    const enKeys = new Set(flattenKeys(enCommon));
    const zhKeys = new Set(flattenKeys(zhCommon));

    const missingInZh = [...enKeys].filter(k => !zhKeys.has(k));
    const missingInEn = [...zhKeys].filter(k => !enKeys.has(k));

    expect(missingInZh).toEqual([]);
    expect(missingInEn).toEqual([]);
  });

  it('should have fallbackLng set to en', () => {
    // i18n.options.fallbackLng can be string, false, readonly string[], or readonly (string|false)[]
    const fb = i18n.options.fallbackLng;
    if (typeof fb === 'string') {
      expect(fb).toBe('en');
    } else if (Array.isArray(fb)) {
      expect(fb).toContain('en');
    } else {
      // It might be an object with 'default' key
      expect(typeof fb === 'object' && fb !== null && (fb as unknown as Record<string, string>)['default']).toBe('en');
    }
  });

  it('should have both en and zh in supportedLngs', () => {
    const supported = i18n.options.supportedLngs as string[] | undefined;
    expect(supported).toContain('en');
    expect(supported).toContain('zh');
  });
});
