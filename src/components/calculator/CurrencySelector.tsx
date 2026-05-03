import { Chip } from '@/components/ui/Chip'
import styles from './CurrencySelector.module.css'

interface CurrencySelectorProps {
  value: 'usd' | 'crc'
  onChange: (value: 'usd' | 'crc') => void
}

/**
 * Currency selector component using chips.
 * Allows user to switch between USD and CRC for rate input.
 */
export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  return (
    <div className={styles.currencySelector}>
      <Chip label="$ Dólares (USD)" active={value === 'usd'} variant="green" onClick={() => onChange('usd')} />
      <Chip label="₡ Colones (CRC)" active={value === 'crc'} variant="green" onClick={() => onChange('crc')} />
    </div>
  )
}
