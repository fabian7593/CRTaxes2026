import type { BreakdownRow } from '@/types/fiscal.types'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatColones, formatDollars } from '@/utils/formatters'
import styles from './BreakdownTable.module.css'

interface BreakdownTableProps {
  rows: BreakdownRow[]
}

/**
 * Detailed breakdown table showing all income, deductions, taxes, and net.
 * Supports section headers, items, subtotals, and total rows with color coding.
 */
export function BreakdownTable({ rows }: BreakdownTableProps) {
  return (
    <table className={styles.breakdownTable}>
      <tbody>
        {rows.map((row, index) => {
          if (row.type === 'section') {
            return (
              <tr key={index} className={styles.sectionHeader}>
                <td colSpan={3}>{row.label}</td>
              </tr>
            )
          }

          const colorClass = row.colorClass ? styles[`color${row.colorClass.charAt(0).toUpperCase()}${row.colorClass.slice(1)}`] : ''

          return (
            <tr
              key={index}
              className={`${styles.breakdownRow} ${
                row.type === 'subtotal' ? styles.subtotalRow : ''
              } ${row.type === 'total' ? styles.totalRow : ''} ${colorClass}`}
            >
              <td className={styles.labelCell}>
                {row.icon && <span className={styles.icon}>{row.icon}</span>}
                {row.label}
                {row.tooltip && <Tooltip content={row.tooltip} />}
              </td>
              <td className={styles.valueCell}>{formatColones(row.valueCRC)}</td>
              <td className={styles.usdCell}>{formatDollars(row.valueUSD)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
