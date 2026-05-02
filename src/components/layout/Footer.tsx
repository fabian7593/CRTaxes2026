import { useState } from 'react'
import styles from './Footer.module.css'

/**
 * Footer component with social links, disclaimer, and institutional references.
 * Includes copy-to-clipboard functionality for email with visual feedback.
 */
export function Footer() {
  const [emailCopied, setEmailCopied] = useState(false)

  /**
   * Copies email to clipboard with visual feedback.
   * Falls back to mailto: link if clipboard API is not available.
   */
  const copyEmail = async () => {
    const email = 'fabian7593@gmail.com'

    // Try to use clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(email)
        setEmailCopied(true)
        setTimeout(() => setEmailCopied(false), 2000)
      } catch (error) {
        // Fallback to mailto if clipboard fails
        window.location.href = `mailto:${email}`
      }
    } else {
      // Fallback for browsers without clipboard API
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Social links */}
        <div className={styles.footerSocial}>
          <a
            href="https://github.com/fabian7593/CRTaxes2026"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerSocialLink}
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/fabian-rosales-esquivel/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerSocialLink}
          >
            LinkedIn
          </a>
          <a
            href="https://wa.me/50688170090"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerSocialLink}
          >
            WhatsApp
          </a>
          <button
            onClick={copyEmail}
            className={`${styles.footerSocialLink} ${emailCopied ? styles.copied : ''}`}
            type="button"
          >
            {emailCopied ? '✓ Copiado' : 'Email'}
          </button>
        </div>

        {/* Disclaimer */}
        <div className={styles.footerDisclaimer}>
          <p>
            <strong>Disclaimer:</strong> Esta calculadora es una herramienta informativa y
            educativa. No constituye asesoría legal, fiscal ni contable. Los resultados son
            estimaciones basadas en la legislación vigente. Consultá con un profesional para tu
            situación particular.
          </p>
        </div>

        {/* Institutional links */}
        <div className={styles.footerLinks}>
          <p>Fuentes oficiales:</p>
          <a
            href="https://www.ccss.sa.cr/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            CCSS
          </a>
          <span className={styles.footerSeparator}>•</span>
          <a
            href="https://www.hacienda.go.cr/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            Ministerio de Hacienda
          </a>
          <span className={styles.footerSeparator}>•</span>
          <a
            href="https://www.bccr.fi.cr/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            BCCR
          </a>
        </div>

        {/* Copyright */}
        <div className={styles.footerCopyright}>
          © 2026 Fabián Rosales. Código abierto bajo licencia MIT.
        </div>
      </div>
    </footer>
  )
}
