import styles from './RegimeSelector.module.css'

interface RegimeSelectorProps {
  value: 'solo' | 'mixto'
  onChange: (value: 'solo' | 'mixto') => void
}

/**
 * Regime selector component with two tabs: Solo (independent only) and Mixto (salary + independent).
 * Shows a warning strip when mixto regime is selected.
 */
export function RegimeSelector({ value, onChange }: RegimeSelectorProps) {
  return (
    <div>
      {/* Tabs */}
      <div className={styles.regimeTabs}>
        <button
          className={`${styles.regimeTab} ${value === 'solo' ? styles.regimeTabSolo : ''}`}
          onClick={() => onChange('solo')}
          type="button"
        >
          <span className={styles.regimeIcon}>💼</span>
          <span className={styles.regimeLabel}>Solo independiente</span>
          <span className={styles.regimeSubtitle}>Servicios profesionales únicamente</span>
        </button>

        <button
          className={`${styles.regimeTab} ${value === 'mixto' ? styles.regimeTabMixto : ''}`}
          onClick={() => onChange('mixto')}
          type="button"
        >
          <span className={styles.regimeIcon}>🔀</span>
          <span className={styles.regimeLabel}>Independiente + Salario</span>
          <span className={styles.regimeSubtitle}>Empleo formal + servicios</span>
        </button>
      </div>

      {/* Warning strip - only visible in mixto mode */}
      {value === 'mixto' && (
        <div className={styles.warningStrip}>
          <strong>⚠️ Régimen mixto:</strong> El salario consume el tramo exento del ISR. Los
          honorarios tributan desde el primer colón al 10%.
        </div>
      )}
    </div>
  )
}
