/**
 * Number formatting utilities for Costa Rican fiscal calculator.
 * All formatters use Costa Rican locale (es-CR) conventions.
 */

/**
 * Costa Rican number formatter instance.
 * Uses dots as thousands separator and comma as decimal separator.
 */
const costaRicanNumberFormat = new Intl.NumberFormat('es-CR')

/**
 * Formats a number with optional decimal places, without currency symbol.
 * Uses Costa Rican locale formatting (dots as thousands separator).
 *
 * @param amount - The number to format
 * @param decimalPlaces - Number of decimal places to show (default: 0)
 * @returns Formatted string like "450.000" or "1.234.567,50"
 */
export function formatNumber(amount: number, decimalPlaces: number = 0): string {
  const formatter = new Intl.NumberFormat('es-CR', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })
  return formatter.format(amount)
}

/**
 * Formats a number as Costa Rican colones.
 * Always shows the ₡ symbol and uses CR locale formatting (dots as thousands separator).
 * Negative numbers show the absolute value — the caller decides how to display the sign.
 *
 * @param amount - The number to format (can be negative)
 * @returns Formatted string like "₡450.000" or "₡1.234.567"
 */
export function formatColones(amount: number): string {
  const absoluteAmount = Math.abs(amount)
  const formattedNumber = costaRicanNumberFormat.format(absoluteAmount)
  return `₡${formattedNumber}`
}

/**
 * Formats a number as US dollars.
 * Shows the $ symbol with proper negative sign placement.
 * Negative amounts show as "-$1,234" not "$-1,234".
 *
 * @param amount - The number to format (can be negative)
 * @returns Formatted string like "$3,000" or "-$1,500"
 */
export function formatDollars(amount: number): string {
  const isNegative = amount < 0
  const absoluteAmount = Math.abs(amount)
  
  // Use US locale for dollar formatting (comma as thousands separator, period as decimal)
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  
  const formattedNumber = formatter.format(absoluteAmount)
  return isNegative ? `-$${formattedNumber}` : `$${formattedNumber}`
}

/**
 * Formats a decimal number as a percentage.
 * Multiplies by 100 and shows 1 decimal place with % symbol.
 * Example: 0.1052 becomes "10,5%"
 *
 * @param decimalValue - The decimal to format (e.g., 0.15 for 15%)
 * @returns Formatted string like "10,5%" or "25,0%"
 */
export function formatPercentage(decimalValue: number): string {
  const percentageValue = decimalValue * 100
  const formatter = new Intl.NumberFormat('es-CR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  return `${formatter.format(percentageValue)}%`
}
