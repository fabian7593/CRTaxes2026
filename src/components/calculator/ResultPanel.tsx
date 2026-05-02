import type { FiscalCalculationResult } from '@/types/fiscal.types'
import { formatColones, formatDollars, formatPercentage } from '@/utils/formatters'
import { DistributionBar } from './DistributionBar'
import { AnnualSummary } from './AnnualSummary'
import { BreakdownTable } from './BreakdownTable'
import styles from './ResultPanel.module.css'

interface ResultPanelProps {
  result: FiscalCalculationResult
  billedMonths: number
  exchangeRate: number
  onOpenModal: (modalType: 'ccss-tables' | 'ccss-riesgo' | 'isr-tramos') => void
}

/**
 * Result panel showing all calculated fiscal values.
 * Displays net income, quick breakdown, distribution bar, annual summary, and detailed breakdown.
 */
export function ResultPanel({
  result,
  billedMonths,
  exchangeRate,
  onOpenModal,
}: ResultPanelProps) {
  const monthlyNetCRC = result.monthlyNetIncome
  const monthlyNetUSD = monthlyNetCRC / exchangeRate

  const monthlyGrossCRC = result.annualGrossIncome / billedMonths

  const monthlyCcssCRC = result.ccssResult.totalAmount

  const monthlyIsrCRC = result.finalIncomeTax / billedMonths

  const effectiveRate = result.annualGrossIncome > 0
    ? (result.ccssResult.totalAmount * 12 + result.finalIncomeTax) / result.annualGrossIncome
    : 0

  return (
    <div className={styles.resultPanel}>
      {/* Net income - large display */}
      <div className={styles.netIncome}>
        <div className={styles.netLabel}>Neto mensual</div>
        <div className={styles.netValue}>{formatColones(monthlyNetCRC)}</div>
        <div className={styles.netValueUsd}>{formatDollars(monthlyNetUSD)}</div>
      </div>

      {/* Billed months pill */}
      <div className={styles.monthsPill}>
        {billedMonths} {billedMonths === 1 ? 'mes' : 'meses'} facturados al año
      </div>

      {/* Quick breakdown */}
      <div className={styles.quickBreakdown}>
        <div className={styles.quickRow}>
          <span className={styles.quickLabel}>Bruto mensual</span>
          <span className={styles.quickValue}>{formatColones(monthlyGrossCRC)}</span>
        </div>
        <div className={styles.quickRow}>
          <span className={styles.quickLabel}>
            CCSS mensual
            <button
              className={styles.infoButton}
              onClick={() => onOpenModal('ccss-tables')}
              type="button"
              title="Ver tablas CCSS"
            >
              ℹ️
            </button>
          </span>
          <span className={`${styles.quickValue} ${styles.quickValueNeg}`}>
            -{formatColones(monthlyCcssCRC)}
          </span>
        </div>
        <div className={styles.quickRow}>
          <span className={styles.quickLabel}>
            ISR mensual
            <button
              className={styles.infoButton}
              onClick={() => onOpenModal('isr-tramos')}
              type="button"
              title="Ver tramos ISR"
            >
              ℹ️
            </button>
          </span>
          <span className={`${styles.quickValue} ${styles.quickValueNeg}`}>
            -{formatColones(monthlyIsrCRC)}
          </span>
        </div>
        <div className={styles.quickRow}>
          <span className={styles.quickLabel}>Tasa efectiva</span>
          <span className={styles.quickValue}>{formatPercentage(effectiveRate)}</span>
        </div>
      </div>

      {/* Separator */}
      <div className={styles.separator} />

      {/* Distribution bar */}
      <DistributionBar segments={result.distributionSegments} />

      {/* Separator */}
      <div className={styles.separator} />

      {/* Annual summary */}
      <AnnualSummary rows={result.annualSummaryRows} />

      {/* Separator */}
      <div className={styles.separator} />

      {/* Detailed breakdown */}
      <BreakdownTable rows={result.breakdownRows} />
    </div>
  )
}
