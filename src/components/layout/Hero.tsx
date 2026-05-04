import { Badge } from '@/components/ui/Badge'
import styles from './Hero.module.css'

/**
 * Hero section at the top of the calculator page.
 * Features gradient backgrounds, title, subtitle, and badges.
 */
export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        {/* Main title with brand name */}
        <h1 className={styles.heroTitle}>
          <span className={styles.heroBrand}>CR Taxes</span>
          <span className={styles.heroSubtitle}>Calculadora Impuestos Trabajador Independiente</span>
          <span className={styles.heroCountry}>Costa Rica</span>
        </h1>

        {/* Legal references */}
        <p className={styles.heroLegalRef}>
          Decreto 45333-H · Ley 7092 art. 8 inc. s) reformado dic-2025 · Escala CCSS TI Gaceta N°232 + ajuste IVM 2026
        </p>

        {/* Badges */}
        <div className={styles.heroBadges}>
          <Badge label="CCSS 2026" variant="green" />
          <Badge label="ISR Decreto 45333-H" variant="amber" />
          <Badge label="Tipo de cambio en vivo" variant="green" />
          <Badge label="Open Source" variant="default" />
        </div>
      </div>
    </section>
  )
}
