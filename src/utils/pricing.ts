
/**
 * Banking-grade pricing calculator.
 * Centralizes all financial logic to ensure consistency between Frontend, Checkout, and Receipt generation.
 */

export const TAX_RATE = 0.12;
export const SERVICE_FEE = 2500;
export const PROTECTION_FEE = 1500;

interface PricingBreakdown {
  base: number;
  addons: number;
  tax: number;
  service: number;
  protection: number;
  total: number;
}

export const calculateBookingTotal = (
  basePrice: number,
  selectedAddonIds: string[],
  allAddons: { id: string; price: number }[],
  hasProtection: boolean
): PricingBreakdown => {
  // 1. Calculate Add-ons
  const addonsCost = selectedAddonIds.reduce((acc, id) => {
    const addon = allAddons.find((a) => a.id === id);
    return acc + (addon ? addon.price : 0);
  }, 0);

  // 2. Base Subtotal
  const subtotal = basePrice + addonsCost;

  // 3. Tax Calculation
  const tax = Math.round(subtotal * TAX_RATE);

  // 4. Protection
  const protectionCost = hasProtection ? PROTECTION_FEE : 0;

  // 5. Final Total
  const total = subtotal + tax + SERVICE_FEE + protectionCost;

  return {
    base: basePrice,
    addons: addonsCost,
    tax,
    service: SERVICE_FEE,
    protection: protectionCost,
    total
  };
};
