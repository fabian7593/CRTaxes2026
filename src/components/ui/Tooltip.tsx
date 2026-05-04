import { type ReactNode, useState, useRef, useEffect } from 'react'
import styles from './Tooltip.module.css'

interface TooltipProps {
  content: string | ReactNode
}

/**
 * Tooltip component that displays a help icon (?) with a bubble on hover.
 * On mobile, uses JavaScript to calculate position and prevent clipping.
 */
export function Tooltip({ content }: TooltipProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [bubbleStyle, setBubbleStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (!isHovered || !wrapperRef.current || !bubbleRef.current) {
      setBubbleStyle({})
      return
    }

    // Only calculate position on mobile
    if (window.innerWidth > 840) {
      setBubbleStyle({})
      return
    }

    const updatePosition = () => {
      if (!wrapperRef.current || !bubbleRef.current) return

      const iconRect = wrapperRef.current.getBoundingClientRect()
      
      // Get bubble dimensions after it's rendered
      const bubbleHeight = bubbleRef.current.offsetHeight || 80
      
      // Position above the icon with some spacing
      const top = iconRect.top - bubbleHeight - 10

      // If tooltip would go above viewport, position it below instead
      const finalTop = top < 10 ? iconRect.bottom + 10 : top

      setBubbleStyle({
        top: `${finalTop}px`,
      })
    }

    // Update position after a small delay to ensure bubble is rendered
    const timer = setTimeout(updatePosition, 10)

    return () => clearTimeout(timer)
  }, [isHovered])

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setBubbleStyle({})
  }

  // On mobile, also handle touch events
  const handleTouch = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsHovered(!isHovered)
  }

  return (
    <span 
      ref={wrapperRef}
      className={styles.tooltipWrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouch}
      data-hovered={isHovered ? 'true' : undefined}
    >
      <span className={styles.tooltipIcon}>?</span>
      <div 
        ref={bubbleRef}
        className={styles.tooltipBubble}
        style={window.innerWidth <= 840 && isHovered ? bubbleStyle : undefined}
      >
        {content}
      </div>
    </span>
  )
}

