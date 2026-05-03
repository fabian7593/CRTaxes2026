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
 * 1. SEM (Health Insurance) - joint rates split between affiliate and state
 * 2. IVM (Pension) - 2026 rates with IVM adjustment notice
 * 3. Summary (Combined) - total affiliate rates and monthly amounts
 * 
 * The user's current category is highlighted with a "vos" (you) indicator.
 */
export function CcssTablesModal({ isOpen, onClose, tablesData }: CcssTablesModalProps) {
  const { semRows, ivmRows, summaryRows } = tablesData

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Escala Contributiva CCSS — 2026"
      subtitle="SEM (Salud) + IVM (Pensión) · Gaceta N°232 dic-2024 + ajuste IVM ene-2026"
      maxWidth="680px"
    >
      {/* IVM 2026 Adjustment Notice */}
      <div className={styles.ivmNotice}>
        <strong>⚙️ Ajuste IVM enero 2026 (+0,16 pp):</strong> La JD CCSS (Sesión N°9038, 2019) 
        estableció incrementos trianales. El quinto incremento entró en vigor el 1° ene 2026: 
        cat. 1 de 4.00%→4.16% · cat. 4 de 7.82%→7.98% · cat. 5 de 8.26%→8.42%. 
        Fuente: CCSS/Teletica dic-2025, BLP Legal oct-2025. La Tabla 2 muestra tasas 2026 vigentes. 
        Base rangos: Decreto N°44756-MTSS, Gaceta N°232, 10 dic 2024.
      </div>

      <p className={styles.modalCcssNote}>
        Columna <span className={styles.modalCcssHighlight}>Afiliado</span> = lo que pagás vos · Estado complementa el total
      </p>

      {/* TABLA 1 — SEM (Health Insurance) with affiliate/state split */}
      <div className={styles.ctblScroll}>
        <table className={styles.ctbl}>
          <thead>
            <tr className={styles.thB}>
              <th colSpan={5}>TABLA 1 — SEGURO SALUD (SEM) · Tasa conjunta 12% · Gaceta N°232 dic 2024</th>
            </tr>
            <tr className={styles.thSub}>
              <th>Cat.</th>
              <th>Rango (CRC)</th>
              <th>Afiliado</th>
              <th>Estado</th>
              <th>Conjunto</th>
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
                <td className={styles.ca}>{formatPercentage(row.rate)}</td>
                <td>{row.stateRate !== undefined ? formatPercentage(row.stateRate) : '-'}</td>
                <td>{row.jointRate !== undefined ? formatPercentage(row.jointRate) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.ctblGap} />

      {/* TABLA 2 — IVM (Pension) with 2026 rates */}
      <div className={styles.ctblScroll}>
        <table className={styles.ctbl}>
          <thead>
            <tr className={styles.thP}>
              <th colSpan={5}>TABLA 2 — SEGURO PENSIÓN (IVM) · Gaceta N°232 + ajuste +0.16pp ene-2026</th>
            </tr>
            <tr className={styles.thSub}>
              <th>Cat.</th>
              <th>Rango (CRC)</th>
              <th>Afiliado 2026</th>
              <th>Estado+LPT</th>
              <th>Conjunto</th>
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
                <td className={styles.ca}>{formatPercentage(row.rate)}</td>
                <td>{row.stateRate !== undefined ? formatPercentage(row.stateRate) : '-'}</td>
                <td>{row.jointRate !== undefined ? formatPercentage(row.jointRate) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.ctblGap} />

      {/* TABLA 3 — Summary (Combined affiliate rates) */}
      <div className={styles.ctblScroll}>
        <table className={styles.ctbl}>
          <thead>
            <tr className={styles.thG}>
              <th colSpan={4}>RESUMEN — LO QUE PAGÁS VOS (SEM + IVM afiliado 2026)</th>
            </tr>
            <tr className={styles.thSub}>
              <th>Cat.</th>
              <th>Rango</th>
              <th>Total afiliado</th>
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
                <td className={row.isCurrentUser ? styles.ca : ''}>{fC(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with current user's breakdown */}
      <div className={styles.ccssFooterModal}>
        <span>Cuota mensual: <strong>{fC(tablesData.currentUserTotal)}</strong></span>
        <span>SEM: <strong>{fC(tablesData.currentUserSem)}</strong></span>
        <span>IVM: <strong>{fC(tablesData.currentUserIvm)}</strong></span>
        <span>Anual: <strong>{fC(tablesData.currentUserTotal * 12)}</strong></span>
        <span className={styles.w}>BMC: ₡341.228 (SEM)</span>
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
