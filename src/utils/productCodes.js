// Server-assigned product numbers are immutable. Never derive these from list
// position, creation date, product name, or random client-side values.
export function productCode(productNo) {
  if (!Number.isSafeInteger(productNo) || productNo < 1) return null
  return `LUS-${String(productNo).padStart(5, '0')}`
}

export function parseProductCode(value) {
  if (typeof value !== 'string' || !/^LUS-\d{5,}$/.test(value)) return null
  const productNo = Number(value.slice(4))
  // Legacy 6-digit codes are also valid deep links; canonical display uses
  // a minimum width of five digits. Old IDs below 50 resolve via aliases.
  const legacySixDigits = /^LUS-\d{6,}$/.test(value)
  return productCode(productNo) === value || legacySixDigits ? productNo : null
}

export function productUrl(product) {
  const code = productCode(product?.productNo)
  // Legacy items need a one-time admin backfill before they have a code.
  // Their old links continue to resolve during the transition.
  return code
    ? `/product/${code}`
    : `/product/${encodeURIComponent(product?._id || product?.id || '')}`
}
