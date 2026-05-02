import type { DistributionSegment } from '@/types/fiscal.types'
import styles from './DistributionBar.module.css'

interface DistributionBarProps {
  segments: DistributionSegment[]
}

/**
 * Visual distribution bar showing how gross income is divided.
 * Filters out segments with very small percentages (< 0.1%) for cleaner display.
 */
export function DistributionBar({ segments }: DistributionBarProps) {
  // Filter out segments with negligible percentages
  const visibleSegments = segments.filter((segment) => segment.percentage >= 0.1)

  return (
    <div className={styles.distributionContainer}>
      {/* Bar with colored segments */}
      <div className={styles.distributionBar}>
        {visibleSegments.map((segment, index) => (
          <div
            key={index}
            className={styles.distributionSegment}
            style={{
              width: `${segment.percentage}%`,
              background: segment.color,
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className={styles.distributionLegend}>
        {visibleSegments.map((segment, index) => (
          <div key={index} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: segment.color }}
            />
            <span className={styles.legendLabel}>
              {segment.label} ({segment.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
