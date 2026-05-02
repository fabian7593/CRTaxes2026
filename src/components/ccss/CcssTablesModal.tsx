import type { CcssTablesData } from '@/types/fiscal.types'
import { Modal } from '@/components/ui/Modal'
import { formatColones as fC } from '@/utils/formatters'
import styles from './CcssTablesModal.module.css'

interface CcssTablesModalProps {
  isOpen: boolean
  onClose: () => void
  tablesData: CcssTablesData
}

/**
 * CCSS Tables Modal - displays detailed breakdown of all 5 CCSS categories.
 * Shows three tables:
 * 1. SEM (Health Insurance) - rates and amounts for all categories
 * 2. IVM (Pension) - rates and amounts for all categories
 * 3. Summary (Combined) - total rates and amounts for all categories
 * 
 * The user's current category is highlighted with a "vos" (you) indicator.
 */
export function CcssTablesModal({ isOpen, onClose, tablesData }: CcssTablesModalProps) {
  const { semRows, ivmRows, summaryRows } = tablesData

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tablas CCSS 2026" maxWidth="680px">
      <div className={styles.modalCcssNote}>
        Las siguientes tablas muestran las tasas y cuotas mensuales para las 5 categorías
        contributivas de la CCSS. Tu categoría actual está resaltada.
      </div>

      {/* SEM Table (Health Insurance) */}
      <div className={styles.ctblScroll}>
        <table className={styles.ctbl}>
          <thead>
            <tr className={styles.thB}>
              <th colSpan={4}>SEM — Seguro de Enfermedad y Maternidad</th>
            </tr>
            <tr className={styles.thSub}>
              <th>Cat.</th>
              <th>Rango de ingreso</th>
              <th>Tasa</th>
              <th>Cuota mensual</th>
            </tr>
          </thead>
          <tbody>
            {semRows.map((row) => (
              <tr key={row.category} className={row.isCurrentUser ? styles.cur : ''}>
                <td>
                  {row.category}
                  {row.isCurrentUser && <span className={styles.youB}>vos</span>}
                </td>
                <td>{row.range}</td>
                <td>{formatPercentage(row.rate)}</td>
                <td>{fC(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.ctblGap} />

      {/* IVM Table (Pension) */}
      <div className={styles.ctblScroll}>
        <table className={styles.ctbl}>
          <thead>
            <tr className={styles.thP}>
              <th colSpan={4}>IVM — Invalidez, Vejez y Muerte (Pensión)</th>
            </tr>
            <tr className={styles.thSub}>
              <th>Cat.</th>
              <th>Rango de ingreso</th>
              <th>Tasa</th>
              <th>Cuota mensual</th>
            </tr>
          </thead>
          <tbody>
            {ivmRows.map((row) => (
              <tr key={row.category} className={row.isCurrentUser ? styles.cur : ''}>
                <td>
                  {row.category}
                  {row.isCurrentUser && <span className={styles.youB}>vos</span>}
                </td>
                <td>{row.range}</td>
                <td>{formatPercentage(row.rate)}</td>
                <td>{fC(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.ctblGap} />

      {/* Summary Table (Combined) */}
      <div className={styles.ctblScroll}>
        <table className={styles.ctbl}>
          <thead>
            <tr className={styles.thG}>
              <th colSpan={4}>Resumen — Total Afiliado (SEM + IVM)</th>
            </tr>
            <tr className={styles.thSub}>
              <th>Cat.</th>
              <th>Rango de ingreso</th>
              <th>Tasa total</th>
              <th>Cuota mensual</th>
            </tr>
          </thead>
          <tbody>
            {summaryRows.map((row) => (
              <tr key={row.category} className={row.isCurrentUser ? styles.cur : ''}>
                <td>
                  {row.category}
                  {row.isCurrentUser && <span className={styles.youB}>vos</span>}
                </td>
                <td>{row.range}</td>
                <td className={styles.ca}>{formatPercentage(row.rate)}</td>
                <td className={styles.ca}>{fC(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.modalCcssFooter}>
        <p>
          <strong>Nota:</strong> Las cuotas mostradas son estimadas basadas en tu ingreso actual.
          La CCSS puede aplicar ajustes según tu historial contributivo.
        </p>
      </div>
    </Modal>
  )
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
