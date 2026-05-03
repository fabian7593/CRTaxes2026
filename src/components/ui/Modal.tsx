import type { ReactNode } from 'react'
import { useEffect } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  maxWidth?: string
}

/**
 * Modal dialog component with overlay, escape key handling, and body scroll lock.
 * Closes when clicking the overlay or pressing Escape.
 */
export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = '560px' }: ModalProps) {
  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={styles.modalBox}
        style={{ maxWidth }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header with title and close button */}
        <div className={styles.modalHeader}>
          <div>
            <h2 id="modal-title" className={styles.modalTitle}>
              {title}
            </h2>
            {subtitle && <p className={styles.modalSubtitle}>{subtitle}</p>}
          </div>
          <button
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Cerrar"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className={styles.modalContent}>{children}</div>
      </div>
    </div>
  )
}
