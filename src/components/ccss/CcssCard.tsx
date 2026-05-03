import type { CcssResult } from '@/types/fiscal.types'
import { formatColones as fC } from '@/utils/formatters'
import { Tooltip } from '@/components/ui/Tooltip'
import styles from './CcssCard.module.css'

interface CcssCardProps {
  ccssResult: CcssResult
  monthlyRateDisplay: string
  exchangeRate: number
  ccssCategories: Array<{ cat: number; max: number | null }>
  onOpenTablesModal: () => void
  onOpenRiskModal: () => void
  onOpenPensionModal: () => void
}

/**
 * CCSS Card component - comprehensive display of CCSS information for independent workers.
 * 
 * Includes:
 * - Informational alert about mandatory regime
 * - Official document links (Reglamento TI, Escala Contributiva)
 * - Contribution base calculation
 * - Category information with SEM/IVM rates
 * - Monthly and annual contribution amounts
 * - Action buttons for tables, pension funds, and risk simulator
 */
export function CcssCard({ 
  ccssResult, 
  monthlyRateDisplay,
  exchangeRate,
  ccssCategories,
  onOpenTablesModal, 
  onOpenRiskModal,
  onOpenPensionModal
}: CcssCardProps) {
  const { category, effectiveIncome, semAmount, ivmAmount, totalAmount } = ccssResult

  // Format the category range label with full from-to range
  const rangeLabel = getCategoryRangeLabel(category.cat, category.max, ccssCategories)

  // Calculate annual amounts - format without decimals
  const annualTotalAmount = Math.round(totalAmount * 12)

  return (
    <div>
      {/* Informational alert */}
      <div className={styles.altInfo}>
        <strong>Régimen obligatorio, no voluntario.</strong> Inscribirse en Hacienda como TI = 
        inscribirse como trabajador independiente en la CCSS dentro de 8 días hábiles. El seguro 
        voluntario aplica únicamente a quienes <em>no</em> tienen actividad lucrativa declarada.
      </div>

      {/* Official document links */}
      <div className={styles.docLinksHorizontal}>
        <a
          href="https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?param1=NRTC&nValor1=1&nValor2=97007&nValor3=130371&strTipM=TC"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.docLinkCompact}
        >
          <span className={styles.docIconCompact}>📄</span>
          <div className={styles.docInfoCompact}>
            <div className={styles.docTitleCompact}>Reglamento TI CCSS</div>
            <div className={styles.docDescCompact}>Reglamento oficial</div>
          </div>
          <span className={styles.docArrowCompact}>↗</span>
        </a>
        <a
          href="https://d1qqtien6gys07.cloudfront.net/wp-content/uploads/2025/02/Escala-Contributiva-TI-AV-y-Mig-ENERO-2025.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.docLinkCompact}
        >
          <span className={styles.docIconCompact}>📊</span>
          <div className={styles.docInfoCompact}>
            <div className={styles.docTitleCompact}>Escala Contributiva 2025</div>
            <div className={styles.docDescCompact}>Tabla oficial AV-TI</div>
          </div>
          <span className={styles.docArrowCompact}>↗</span>
        </a>
      </div>

      {/* Contribution base */}
      <div className={styles.ccssBaseSimple}>
        <div className={styles.ccssBaseSimpleHeader}>
          <span className={styles.ccssBaseSimpleLabel}>Base de cotización mensual</span>
          <Tooltip content={
            <div>
              <strong style={{ color: 'var(--emerald)' }}>¿Por qué se toma el bruto?</strong>
              <br /><br />
              Técnicamente el RACTI habla de "ingreso neto" (bruto menos gastos). En la práctica, 
              cuando el contrato está en USD la CCSS solicita ese contrato y calcula sobre el{' '}
              <strong>monto bruto</strong>.
              <br /><br />
              Si tu ingreso real de CCSS difiere (ej: ingresos variables o múltiples fuentes), 
              ajustá la tarifa USD arriba para reflejar el monto real que reportarás.
              <br /><br />
              <strong style={{ color: 'var(--crimson)' }}>BMC 2026:</strong> Si el bruto mensual 
              es menor a ₡341.228, la CCSS cotiza sobre esa base mínima de todas formas.
            </div>
          } />
        </div>
        <div className={styles.ccssBaseSimpleAmount}>{fC(effectiveIncome)}</div>
        <div className={styles.ccssBaseSimpleFormula}>
          = {monthlyRateDisplay} × {fC(exchangeRate)}
        </div>
      </div>

      {/* Category and contribution info */}
      <div className={styles.ccssInfoClean}>
        {/* Category */}
        <div className={styles.ccssCategoryClean}>
          <div className={styles.ccssCategoryCleanLabel}>Tu categoría</div>
          <div className={styles.ccssCategoryCleanValue}>
            Cat. {category.cat} · {rangeLabel}
          </div>
          <div className={styles.ccssCategoryCleanRates}>
            <span className={`${styles.ccssRateBadge} ${styles.ccssRateBadgeSem}`}>
              <span className={styles.ccssRateBadgeLabel}>SEM</span>
              <span className={styles.ccssRateBadgeValue}>{formatPercentage(category.sem)}</span>
            </span>
            <span className={styles.ccssRateBadgePlus}>+</span>
            <span className={`${styles.ccssRateBadge} ${styles.ccssRateBadgeIvm}`}>
              <span className={styles.ccssRateBadgeLabel}>IVM</span>
              <span className={styles.ccssRateBadgeValue}>{formatPercentage(category.ivm26)}</span>
            </span>
          </div>
        </div>

        {/* Monthly payment */}
        <div className={styles.ccssPaymentClean}>
          <div className={styles.ccssPaymentCleanLabel}>Cuota mensual</div>
          <div className={styles.ccssPaymentCleanAmount}>{fC(Math.round(totalAmount))}</div>
          <div className={styles.ccssPaymentCleanBreakdown}>
            <span>SEM <strong>{fC(Math.round(semAmount))}</strong></span>
            <span className={styles.ccssPaymentCleanSep}>·</span>
            <span>IVM <strong>{fC(Math.round(ivmAmount))}</strong></span>
            <span className={styles.ccssPaymentCleanSep}>·</span>
            <span>Anual <strong>{fC(annualTotalAmount)}</strong></span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className={styles.infoBtnRow}>
        <button
          type="button"
          className={styles.infoBtn}
          onClick={onOpenTablesModal}
        >
          <span className={styles.ibDot} />
          Ver escala completa SEM + IVM
        </button>
        <button
          type="button"
          className={styles.infoBtn}
          onClick={onOpenPensionModal}
        >
          <span className={styles.ibDot} />
          Fondos de pensión
        </button>
        <button
          type="button"
          className={`${styles.infoBtn} ${styles.infoBtnDanger}`}
          onClick={onOpenRiskModal}
        >
          <span className={`${styles.ibDot} ${styles.ibDotDanger}`} />
          Riesgo de reportar monto menor
        </button>
      </div>
    </div>
  )
}

/**
 * Gets the display label for a CCSS category's income range with full from-to format.
 * 
 * @param categoryNumber - Category number (1-5)
 * @param maxIncome - Maximum income for this category (null for category 5)
 * @param categories - All CCSS categories to get previous max
 * @returns Formatted range label like "₡341.228 – ₡734.217"
 */
function getCategoryRangeLabel(
  categoryNumber: number, 
  maxIncome: number | null,
  categories: Array<{ cat: number; max: number | null }>
): string {
  if (categoryNumber === 1) {
    return `hasta ${fC(maxIncome ?? 0)}`
  }
  
  if (categoryNumber === 5 || maxIncome === null) {
    return 'más de ₡2.202.651'
  }
  
  // For categories 2-4, show the full range (from previous max + 1 to current max)
  const previousCategory = categories.find(c => c.cat === categoryNumber - 1)
  const fromAmount = previousCategory && previousCategory.max ? previousCategory.max + 1 : 0
  
  return `${fC(fromAmount)} – ${fC(maxIncome)}`
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
