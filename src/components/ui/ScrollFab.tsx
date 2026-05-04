import { useState, useEffect } from 'react'
import styles from './ScrollFab.module.css'

/**
 * Floating Action Button for mobile scroll navigation.
 * 
 * Behavior:
 * - Shows only on touch devices (mobile/tablet)
 * - When user is in top section → Shows down arrow (scroll to results)
 * - When user is in results section → Shows up arrow (scroll to top)
 * - Smooth scroll animation
 * - Fades in/out based on scroll position
 */
export function ScrollFab() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [direction, setDirection] = useState<'down' | 'up'>('down')

  useEffect(() => {
    // Check if device supports touch
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(hasTouch)

    if (!hasTouch) return

    // Handle scroll to determine button visibility and direction
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Show button after scrolling 100px
      setIsVisible(scrollY > 100)

      // Determine direction based on scroll position
      // If user is in the top half → show down arrow
      // If user is in the bottom half → show up arrow
      const midPoint = (documentHeight - windowHeight) / 2
      setDirection(scrollY < midPoint ? 'down' : 'up')
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = () => {
    if (direction === 'down') {
      // Scroll to results section (neto mensual estimado)
      // Find the dark hero section with class resultHero
      const resultsSection = document.querySelector('[class*="resultHero"]')
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      // Scroll to "Moneda e Ingreso" section
      const monedaIngresoSection = document.getElementById('moneda-ingreso')
      if (monedaIngresoSection) {
        monedaIngresoSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        // Fallback to top if section not found
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  // Don't render on desktop
  if (!isTouchDevice) return null

  return (
    <button
      className={`${styles.fab} ${isVisible ? styles.fabVisible : ''} ${styles[`fab${direction === 'up' ? 'Up' : 'Down'}`]}`}
      onClick={handleClick}
      aria-label={direction === 'down' ? 'Ir a resultados' : 'Ir a Moneda e Ingreso'}
      type="button"
    >
      {direction === 'down' ? (
        // Down arrow icon
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      ) : (
        // Up arrow icon
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      )}
    </button>
  )
}
