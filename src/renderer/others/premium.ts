import type { PremiumTab } from '@fe/types'

/** Compatibility API for extensions: this fork has no paid feature tier. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getPurchased (_force = false) {
  return true
}

/** Legacy extension calls must not open an activation or purchase dialog. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function showPremium (_tab?: PremiumTab) {}
