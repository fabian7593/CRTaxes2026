import { formatColones } from '@/utils/formatters'
import styles from './IvaInfo.module.css'

interface IvaInfoProps {
  clienteLocal: boolean
  rateCRC: number
}

/**
 * IVA information strip that shows different content based on client type.
 * Local clients: shows 13% IVA amount and D-104 note.
 * Export clients: shows exemption note and electronic invoice requirement.
 */
export function IvaInfo({ clienteLocal, rateCRC }: IvaInfoProps) {
  if (clienteLocal) {
    const ivaAmount = rateCRC * 0.13

    return (
      <div className={`${styles.ivaStrip} ${styles.ivaStripLocal}`}>
        <strong>IVA 13%:</strong> {formatColones(ivaAmount)} mensuales que cobrás al cliente.{' '}
        <br />
        <span className={styles.ivaNote}>
          Recordá presentar el D-104 mensualmente ante Hacienda.
        </span>
      </div>
    )
  }

  return (
    <div className={`${styles.ivaStrip} ${styles.ivaStripExport}`}>
      <strong>Exportación de servicios:</strong> Exento de IVA (0%).{' '}
      <br />
      <span className={styles.ivaNote}>
        Debés emitir Factura Electrónica de Exportación v4.4 para cada servicio.
      </span>
    </div>
  )
}
