import { Badge } from '@/components/ui/Badge'
import styles from './Hero.module.css'

interface HeroProps {
  onDocsClick: () => void
}

/**
 * Hero section at the top of the calculator page.
 * Features gradient backgrounds, title, subtitle, badges, and documentation link.
 */
export function Hero({ onDocsClick }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        {/* Eyebrow text */}
        <div className={styles.heroEyebrow}>CALCULADORA FISCAL CR 2026</div>

        {/* Main title with emphasis */}
        <h1 className={styles.heroTitle}>
          Calculá tu <em>ingreso neto real</em> como trabajador independiente
        </h1>

        {/* Subtitle */}
        <p className={styles.heroSubtitle}>
          Herramienta open source para calcular CCSS, ISR y neto mensual según la legislación
          costarricense vigente. Actualizada con tramos 2026 (Decreto 45333-H).
        </p>

        {/* Badges */}
        <div className={styles.heroBadges}>
          <Badge label="CCSS 2026" variant="green" />
          <Badge label="ISR Decreto 45333-H" variant="amber" />
          <Badge label="Tipo de cambio en vivo" variant="green" />
          <Badge label="Open Source" variant="default" />
        </div>

        {/* Documentation button */}
        <button className={styles.heroButton} onClick={onDocsClick} type="button">
          📖 Documentación
        </button>
      </div>
    </section>
  )
}
