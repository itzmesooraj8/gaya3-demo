
import { describe, it, expect } from 'vitest';
import { calculateBookingTotal, SERVICE_FEE, PROTECTION_FEE } from './pricing';

const MOCK_ADDONS = [
  { id: 'bonfire', price: 500 },
  { id: 'trek', price: 300 }
];

describe('Financial Engine (Pricing)', () => {
  it('should calculate base total correctly without addons', () => {
    const result = calculateBookingTotal(10000, [], MOCK_ADDONS, false);
    
    // 10000 + 12% tax (1200) + Service (2500) = 13700
    expect(result.total).toBe(13700);
    expect(result.tax).toBe(1200);
  });

  it('should include addons in tax calculation', () => {
    // Base 10000 + Addon 500 = 10500
    // Tax 12% of 10500 = 1260
    // Total = 10500 + 1260 + 2500 = 14260
    const result = calculateBookingTotal(10000, ['bonfire'], MOCK_ADDONS, false);
    
    expect(result.addons).toBe(500);
    expect(result.tax).toBe(1260);
    expect(result.total).toBe(14260);
  });

  it('should add protection fee when enabled', () => {
    const result = calculateBookingTotal(10000, [], MOCK_ADDONS, true);
    // Previous base (13700) + Protection (1500)
    expect(result.protection).toBe(PROTECTION_FEE);
    expect(result.total).toBe(13700 + PROTECTION_FEE);
  });
});
