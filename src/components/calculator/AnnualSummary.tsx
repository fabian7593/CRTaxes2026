import type { AnnualSummaryRow } from '@/types/fiscal.types'
import { formatColones, formatDollars } from '@/utils/formatters'
import styles from './AnnualSummary.module.css'

interface AnnualSummaryProps {
  rows: AnnualSummaryRow[]
}

/**
 * Annual summary table showing 4 key rows:
 * - Annual gross income
 * - Annual CCSS
 * - Annual ISR
 * - Annual net income (highlighted as total)
 */
export function AnnualSummary({ rows }: AnnualSummaryProps) {
  return (
    <div className={styles.annualSummary}>
      {rows.map((row, index) => (
        <div
          key={index}
          className={`${styles.summaryRow} ${row.isTotal ? styles.summaryRowTotal : ''}`}
        >
          <span className={styles.summaryLabel}>{row.label}</span>
          <div className={styles.summaryValues}>
            <span className={styles.summaryValueCRC}>{formatColones(row.valueCRC)}</span>
            <span className={styles.summaryValueUSD}>{formatDollars(row.valueUSD)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
