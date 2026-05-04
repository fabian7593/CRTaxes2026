import { useState } from 'react'
import styles from './DisclaimerBanner.module.css'

/**
 * Disclaimer banner that informs users about the calculator's limitations
 * and provides contact information for professional services.
 * 
 * Displays important legal notice about the calculator being an approximation
 * and not a replacement for professional accounting services.
 */
export function DisclaimerBanner() {
  const [contactEmailCopied, setContactEmailCopied] = useState(false)

  const copyContactEmail = async () => {
    const email = 'despachocontablecs@outlook.com'
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(email)
        setContactEmailCopied(true)
        setTimeout(() => setContactEmailCopied(false), 2000)
      } catch (error) {
        window.location.href = `mailto:${email}`
      }
    } else {
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <div className={styles.banner}>
      <div className={styles.bannerInner}>
        <div className={styles.bannerIcon}>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
          </svg>
        </div>
        
        <div className={styles.bannerContent}>
          <div className={styles.bannerTitle}>Herramienta Informativa</div>
          <div className={styles.bannerText}>
            Esta calculadora proporciona un <strong>aproximado</strong> basado en los datos fiscales oficiales de Costa Rica 2026. 
            Los cálculos reales pueden variar según tu situación particular, tipo de cambio vigente, y otras variables. 
            <strong> No reemplaza la asesoría de un contador profesional.</strong>
          </div>
          
          <div className={styles.bannerLinks}>
            <span className={styles.bannerLabel}>Servicios Recomendados:</span>
            <button
              onClick={copyContactEmail}
              className={`${styles.bannerLink} ${contactEmailCopied ? styles.bannerLinkCopied : ''}`}
              type="button"
              title="despachocontablecs@outlook.com"
              aria-label={contactEmailCopied ? 'Email copiado' : 'Copiar email del despacho contable'}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M.05 3.555A2 2 0 012 2h12a2 2 0 011.95 1.555L8 8.414.05 3.555zM0 4.697v7.104l5.803-3.558L0 4.697zM6.761 8.83l-6.57 4.027A2 2 0 002 14h12a2 2 0 001.808-1.144l-6.57-4.027L8 9.586l-1.239-.757zm3.436-.586L16 11.801V4.697l-5.803 3.546z"/>
              </svg>
              {contactEmailCopied ? '✓ Copiado' : 'Despacho Contable'}
            </button>
            <span className={styles.bannerSeparator}>•</span>
            <a
              href="https://orioltech.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.bannerLink}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 0a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V2a2 2 0 00-2-2H4zm0 1h8a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z"/>
                <path d="M2 5a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5zm0 4a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V9z"/>
              </svg>
              Facturación Electrónica
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
