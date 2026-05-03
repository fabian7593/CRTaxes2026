import type { ReactNode } from 'react'
import { Hero } from './Hero'
import { Footer } from './Footer'
import styles from './PageLayout.module.css'

interface PageLayoutProps {
  left: ReactNode
  right: ReactNode
}

/**
 * Main page layout for the calculator.
 * Renders Hero at top, two-column grid for content, and Footer at bottom.
 * The right panel is sticky on desktop for better UX.
 */
export function PageLayout({ left, right }: PageLayoutProps) {
  return (
    <div className={styles.pageWrapper}>
      <Hero />

      <main className={styles.mainContent}>
        <div className={styles.twoCol}>
          <div className={styles.leftPanel}>{left}</div>
          <div className={styles.rightPanel}>{right}</div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
