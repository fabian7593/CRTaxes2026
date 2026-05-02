import { Chip } from '@/components/ui/Chip'
import styles from './DeductionChips.module.css'

interface DeductionChipsProps {
  value: 'ficto' | 'real'
  onChange: (value: 'ficto' | 'real') => void
}

/**
 * Deduction type selector using chips.
 * Ficto (25% fictitious) uses green variant, Real (documented expenses) uses amber variant.
 */
export function DeductionChips({ value, onChange }: DeductionChipsProps) {
  return (
    <div className={styles.deductionChips}>
      <Chip
        label="Ficto 25%"
        active={value === 'ficto'}
        variant="green"
        onClick={() => onChange('ficto')}
      />
      <Chip
        label="Gastos reales"
        active={value === 'real'}
        variant="amber"
        onClick={() => onChange('real')}
      />
    </div>
  )
}
