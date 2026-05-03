import type { FiscalCalculationResult } from '@/types/fiscal.types'
import { formatColones, formatDollars, formatPercentage } from '@/utils/formatters'
import { CardSection } from '@/components/ui/CardSection'
import { DistributionBar } from './DistributionBar'
import { AnnualSummary } from './AnnualSummary'
import styles from './ResultPanel.module.css'

interface ResultPanelProps {
  result: FiscalCalculationResult
  billedMonths: number
  exchangeRate: number
  onOpenModal: (modalType: 'ccss-tables' | 'ccss-riesgo' | 'isr-tramos') => void
}

/**
 * Result panel showing all calculated fiscal values.
 * 
 * STRUCTURAL ORDER (matches original HTML):
 * 1. Dark hero section with net income (background: var(--ink))
 * 2. Card: Métricas Rápidas (2x2 grid)
 * 3. Card: Distribución (distribution bar)
 * 4. Card: Resumen Anual (annual summary)
 */
export function ResultPanel({
  result,
  billedMonths,
  exchangeRate,
  onOpenModal,
}: ResultPanelProps) {
  // Round all monetary values to avoid decimals
  const monthlyNetCRC = Math.round(result.monthlyNetIncome)
  const monthlyNetUSD = Math.round(monthlyNetCRC / exchangeRate)

  const monthlyGrossCRC = Math.round(result.annualGrossIncome / billedMonths)
  const monthlyCcssCRC = Math.round(result.ccssResult.totalAmount)
  const monthlyIsrCRC = Math.round(result.finalIncomeTax / billedMonths)

  const effectiveRate = result.annualGrossIncome > 0
    ? (result.ccssResult.totalAmount * 12 + result.finalIncomeTax) / result.annualGrossIncome
    : 0

  return (
    <div>
      {/* Dark hero section for net income (Task 12.1.9) */}
      <div className={styles.resultHero}>
        <div className={styles.resultLabel}>Neto mensual estimado</div>
        <div className={styles.resultMain}>{formatColones(monthlyNetCRC)}</div>
        <div className={styles.resultUsd}>{formatDollars(monthlyNetUSD)}</div>
        <div className={styles.resultPill}>
          <span>{billedMonths}</span> {billedMonths === 1 ? 'mes' : 'meses'} facturados al año
        </div>
      </div>

      {/* Card: Métricas Rápidas (Task 12.1.10) */}
      <CardSection title="Métricas Rápidas" icon="📊" iconVariant="g">
        <div className={styles.miniGrid}>
          <div className={styles.miniM}>
            <div className={styles.mmLbl}>Bruto mensual</div>
            <div className={styles.mmV}>{formatColones(monthlyGrossCRC)}</div>
            <div className={styles.mmS}>{formatDollars(Math.round(monthlyGrossCRC / exchangeRate))}</div>
          </div>
          <div className={styles.miniM}>
            <div className={styles.mmLbl}>CCSS mensual</div>
            <div className={`${styles.mmV} ${styles.mmVR}`}>
              -{formatColones(monthlyCcssCRC)}
            </div>
            <div className={styles.mmS}>
              {formatDollars(Math.round(monthlyCcssCRC / exchangeRate))}
              {' · '}
              <button
                className={styles.infoButton}
                onClick={() => onOpenModal('ccss-tables')}
                type="button"
                title="Ver escala CCSS"
              >
                Ver escala CCSS
              </button>
            </div>
          </div>
          <div className={styles.miniM}>
            <div className={styles.mmLbl}>ISR mensual</div>
            <div className={`${styles.mmV} ${styles.mmVR}`}>
              -{formatColones(monthlyIsrCRC)}
            </div>
            <div className={styles.mmS}>
              {formatDollars(Math.round(monthlyIsrCRC / exchangeRate))}
              {' · '}
              <button
                className={styles.infoButton}
                onClick={() => onOpenModal('isr-tramos')}
                type="button"
                title="Ver tramos ISR"
              >
                Ver tramos ISR
              </button>
            </div>
          </div>
          <div className={styles.miniM}>
            <div className={styles.mmLbl}>Tasa efectiva</div>
            <div className={`${styles.mmV} ${styles.mmVA}`}>{formatPercentage(effectiveRate)}</div>
            <div className={styles.mmS}>Total impuestos (CCSS + ISR / bruto)</div>
          </div>
        </div>
      </CardSection>

      {/* Card: Distribución (Task 12.1.11) */}
      <CardSection title="Distribución" icon="📈" iconVariant="b">
        <DistributionBar segments={result.distributionSegments} />
      </CardSection>

      {/* Card: Resumen Anual (Task 12.1.12) */}
      <CardSection title="Resumen Anual" icon="📅" iconVariant="a">
        <AnnualSummary rows={result.annualSummaryRows} />
      </CardSection>
    </div>
  )
}
