/**
 * Server-safe time formatting that returns a placeholder during SSR
 */
export function formatTimeForSSR(date: Date | string | number, placeholder: string = '--:--'): string {
  if (typeof window === 'undefined') {
    return placeholder
  }
  return new Date(date).toLocaleTimeString()
}

/**
 * Server-safe date formatting that returns a placeholder during SSR
 */
export function formatDateForSSR(date: Date | string | number, placeholder: string = '--/--/----'): string {
  if (typeof window === 'undefined') {
    return placeholder
  }
  return new Date(date).toLocaleDateString()
}

/**
 * Server-safe datetime formatting that returns a placeholder during SSR
 */
export function formatDateTimeForSSR(date: Date | string | number, placeholder: string = '--/--/---- --:--'): string {
  if (typeof window === 'undefined') {
    return placeholder
  }
  return new Date(date).toLocaleString()
}