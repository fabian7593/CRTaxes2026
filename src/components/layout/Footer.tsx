import { useState } from 'react'
import styles from './Footer.module.css'

/**
 * Footer component matching the original HTML design exactly.
 * Features gradient backgrounds, author card with avatar, social links with tooltips,
 * and heartbeat animation on the heart emoji.
 */
export function Footer() {
  const [emailCopied, setEmailCopied] = useState(false)

  /**
   * Copies email to clipboard with visual feedback.
   * Shows checkmark and "Copiado!" tooltip for 2 seconds.
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
      <div className={styles.footerInner}>
        {/* Main content area */}
        <div className={styles.footerMain}>
          {/* Left side - Title and description */}
          <div className={styles.footerLeft}>
            <div className={styles.footerEyebrow}>CALCULADORA FISCAL CR 2026</div>
            <h2 className={styles.footerTitle}>
              Hecho con <span className={styles.footerHeart}>❤️</span> para trabajadores independientes
              Costa Rica
            </h2>
            <p className={styles.footerSub}>
              Herramienta open source para calcular CCSS, ISR y neto mensual. Actualizada con
              tramos 2026 (Decreto 45333-H). 
            </p>
            <p className={styles.footerSub}>
                Código disponible en GitHub bajo licencia MIT.
            </p>
          </div>

          {/* Right side - Author card */}
          <div className={styles.footerRight}>
            <div className={styles.footerAuthorCard}>
              <img
                src="https://avatars.githubusercontent.com/u/13343461?v=4"
                alt="Fabián Rosales"
                className={styles.footerAvatar}
              />
              <div className={styles.footerAuthorInfo}>
                <div className={styles.footerAuthorName}>Fabián Rosales</div>
                <div className={styles.footerAuthorRole}>Senior Software Engineer</div>
                <div className={styles.footerSocial}>
                  <a
                    href="https://github.com/fabian7593"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.footerSocialLink}
                    title="GitHub"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/frosales-softdev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.footerSocialLink}
                    title="LinkedIn"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 01.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
                    </svg>
                  </a>
                  <a
                    href="https://wa.me/50683461166"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.footerSocialLink} ${styles.footerSocialLinkWhatsapp}`}
                    title="WhatsApp"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M13.601 2.326A7.854 7.854 0 007.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 003.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0013.6 2.326zM7.994 14.521a6.573 6.573 0 01-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 01-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 014.66 1.931 6.557 6.557 0 011.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 00-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                    </svg>
                  </a>
                  <button
                    onClick={copyEmail}
                    className={`${styles.footerSocialLink} ${styles.footerSocialLinkEmail} ${emailCopied ? styles.footerSocialLinkCopied : ''}`}
                    title={emailCopied ? '✓ Copiado!' : 'Email'}
                    type="button"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M.05 3.555A2 2 0 012 2h12a2 2 0 011.95 1.555L8 8.414.05 3.555zM0 4.697v7.104l5.803-3.558L0 4.697zM6.761 8.83l-6.57 4.027A2 2 0 002 14h12a2 2 0 001.808-1.144l-6.57-4.027L8 9.586l-1.239-.757zm3.436-.586L16 11.801V4.697l-5.803 3.546z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className={styles.footerBottom}>
          <div className={styles.footerLinks}>
            <a
              href="https://github.com/fabian7593/CRTaxes2026/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerDocsLink}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2a2 2 0 012-2h8a2 2 0 012 2v13.5a.5.5 0 01-.777.416L8 13.101l-5.223 2.815A.5.5 0 012 15.5V2zm2-1a1 1 0 00-1 1v12.566l4.723-2.482a.5.5 0 01.554 0L13 14.566V2a1 1 0 00-1-1H4z" />
              </svg>
              Documentación
            </a>
            <a
              href="https://github.com/fabian7593/CRTaxes2026"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerRepoLink}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub Repo
            </a>
            <a
              href="https://orioltech.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerFacturaLink}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 0a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V2a2 2 0 00-2-2H4zm0 1h8a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z" />
                <path d="M2 5a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5zm0 4a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V9z" />
              </svg>
              Herramienta Facturacion Electronica CR
            </a>
          </div>
          <div className={styles.footerLicense}>MIT LICENSE • OPEN SOURCE</div>
        </div>
      </div>
    </footer>
  )
}
