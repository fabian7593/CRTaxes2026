import type { AnnualSummaryRow } from '@/types/fiscal.types'
import { formatColones, formatDollars } from '@/utils/formatters'
import styles from './AnnualSummary.module.css'

interface AnnualSummaryProps {
  rows: AnnualSummaryRow[]
}

/**
 * Annual summary table showing 4 key rows:
 * - Annual gross income
 * - Annual CCSS (negative, red)
 * - Annual ISR (negative, red)
 * - Annual net income (highlighted as total in green)
 */
export function AnnualSummary({ rows }: AnnualSummaryProps) {
  return (
    <div className={styles.annualSummary}>
      {rows.map((row, index) => {
        const isNegative = row.valueCRC < 0
        
        return (
          <div
            key={index}
            className={`${styles.summaryRow} ${row.isTotal ? styles.summaryRowTotal : ''} ${isNegative ? styles.summaryRowNegative : ''}`}
          >
            <span className={styles.summaryLabel}>{row.label}</span>
            <div className={styles.summaryValues}>
              <span className={styles.summaryValueCRC}>{formatColones(row.valueCRC)}</span>
              <span className={styles.summaryValueUSD}>{formatDollars(row.valueUSD)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
