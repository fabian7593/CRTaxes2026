import type { CcssResult } from '@/types/fiscal.types'
import { formatColones as fC } from '@/utils/formatters'
import styles from './CcssCard.module.css'

interface CcssCardProps {
  ccssResult: CcssResult
  onOpenTablesModal: () => void
  onOpenRiskModal: () => void
}

/**
 * CCSS Card component - displays the user's CCSS category, rates, and contribution amounts.
 * Shows a compact view with the category name, income range, SEM/IVM rate tags,
 * and monthly/annual contribution amounts.
 * 
 * Provides buttons to open:
 * - CCSS tables modal (shows all 5 categories with detailed breakdown)
 * - Risk simulator modal (calculates penalties for underdeclaring income)
 */
export function CcssCard({ ccssResult, onOpenTablesModal, onOpenRiskModal }: CcssCardProps) {
  const { category, effectiveIncome, semAmount, ivmAmount, totalAmount } = ccssResult

  // Format the category range label
  const rangeLabel = getCategoryRangeLabel(category.cat, category.max)

  // Calculate annual amounts
  const annualSemAmount = semAmount * 12
  const annualIvmAmount = ivmAmount * 12
  const annualTotalAmount = totalAmount * 12

  return (
    <div className={styles.ccssCompact}>
      {/* Category name and rate tags */}
      <div className={styles.ccssCatPill}>
        <div className={styles.ccssCatName}>
          Categoría {category.cat} — {rangeLabel}
        </div>
        <div className={styles.ccssCatRates}>
          <span className={styles.ccssRateTag}>
            SEM {formatPercentage(category.sem)}
          </span>
          <span className={`${styles.ccssRateTag} ${styles.ccssRateTagR}`}>
            IVM {formatPercentage(category.ivm26)}
          </span>
        </div>
      </div>

      {/* Contribution amounts */}
      <div className={styles.ccssFooterCompact}>
        <span>
          <strong>{fC(totalAmount)}</strong> mensual
        </span>
        <span className={styles.w}>
          (SEM {fC(semAmount)} + IVM {fC(ivmAmount)})
        </span>
        <span>
          <strong>{fC(annualTotalAmount)}</strong> anual
        </span>
      </div>

      {/* Action buttons */}
      <div className={styles.infoBtnRow}>
        <button
          type="button"
          className={styles.infoBtn}
          onClick={onOpenTablesModal}
        >
          <span className={styles.ibDot} />
          Ver tablas CCSS
        </button>
        <button
          type="button"
          className={`${styles.infoBtn} ${styles.infoBtnDanger}`}
          onClick={onOpenRiskModal}
        >
          <span className={`${styles.ibDot} ${styles.ibDotDanger}`} />
          Simulador de riesgo
        </button>
      </div>
    </div>
  )
}

/**
 * Gets the display label for a CCSS category's income range.
 * 
 * @param categoryNumber - Category number (1-5)
 * @param maxIncome - Maximum income for this category (null for category 5)
 * @returns Formatted range label
 */
function getCategoryRangeLabel(categoryNumber: number, maxIncome: number | null): string {
  if (categoryNumber === 1) {
    return `hasta ${fC(maxIncome ?? 0)}`
  }
  
  if (categoryNumber === 5 || maxIncome === null) {
    return 'más de ₡2.202.651'
  }
  
  // For categories 2-4, we would need the previous category's max
  // For now, just show the max
  return `hasta ${fC(maxIncome)}`
}

/**
 * Formats a decimal rate as a percentage string.
 * 
 * @param rate - Rate as decimal (e.g., 0.0416)
 * @returns Formatted percentage (e.g., "4.16%")
 */
function formatPercentage(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`
}
