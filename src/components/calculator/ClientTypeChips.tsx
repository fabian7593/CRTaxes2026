import { Chip } from '@/components/ui/Chip'
import styles from './ClientTypeChips.module.css'

interface ClientTypeChipsProps {
  value: 'ext' | 'loc'
  onChange: (value: 'ext' | 'loc') => void
}

/**
 * Client type selector using chips.
 * Exterior (export) uses green variant, Local uses amber variant.
 */
export function ClientTypeChips({ value, onChange }: ClientTypeChipsProps) {
  return (
    <div className={styles.clientTypeChips}>
      <Chip
        label="Empresa exterior / USA - Sin IVA"
        active={value === 'ext'}
        variant="green"
        onClick={() => onChange('ext')}
      />
      <Chip
        label="Cliente Local - IVA 13%"
        active={value === 'loc'}
        variant="amber"
        onClick={() => onChange('loc')}
      />
    </div>
  )
}
