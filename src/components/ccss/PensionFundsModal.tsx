import { Modal } from '@/components/ui/Modal'
import styles from './PensionFundsModal.module.css'

interface PensionFundsModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Pension Funds Modal - explains which pension funds apply to independent workers.
 * Shows IVM, SEM (mandatory), ROP, FCL (not applicable), and RVP (voluntary recommended).
 */
export function PensionFundsModal({ isOpen, onClose }: PensionFundsModalProps) {
  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fondos de Pensión"
      subtitle="Fuente: SUPEN · OPC CCSS · BAC Pensiones · Ley 7983"
      maxWidth="680px"
    >
      <div className={styles.content}>
        {/* Pension funds grid */}
        <div className={styles.grid}>
          {/* Alert - full width */}
          <div className={styles.alert}>
            <strong>Como trabajador independiente no tenés patrono</strong>, por lo tanto no 
            cotizás al ROP ni al FCL. Esos fondos requieren aporte patronal. Podés ahorrar 
            voluntariamente para pensión, que sí es deducible del ISR.
          </div>
          {/* IVM - Mandatory */}
          <div className={`${styles.fund} ${styles.fundMandatory}`}>
            <div className={styles.fundTag}>✅ Obligatorio</div>
            <div className={styles.fundName}>IVM — Invalidez Vejez Muerte</div>
            <div className={styles.fundDesc}>
              Tu pensión básica CCSS. Requiere 300 cuotas (25 años) y 65 años de edad. 
              Cuanto más cotizás y más alto el ingreso reportado, mayor tu pensión futura.
            </div>
            <div className={styles.fundPct}>Afiliado 2026: 7.98% · Estado: 1.77%</div>
          </div>

          {/* SEM - Mandatory */}
          <div className={`${styles.fund} ${styles.fundMandatory}`}>
            <div className={styles.fundTag}>✅ Obligatorio</div>
            <div className={styles.fundName}>SEM — Seguro de Salud</div>
            <div className={styles.fundDesc}>
              Tu seguro de salud completo: médico, especialistas, hospitales, medicamentos, 
              emergencias y maternidad en instalaciones CCSS.
            </div>
            <div className={styles.fundPct}>Afiliado: 8.02% · Estado: 3.98%</div>
          </div>

          {/* ROP - Not applicable */}
          <div className={`${styles.fund} ${styles.fundNotApplicable}`}>
            <div className={styles.fundTag}>❌ No aplica</div>
            <div className={styles.fundName}>ROP — Pensión Complementaria</div>
            <div className={styles.fundDesc}>
              4.25% del salario (1% obrero + resto patrono). <strong>Sin patrono, no existe 
              para un trabajador independiente.</strong>
            </div>
            <div className={styles.fundPct}>Requiere relación laboral</div>
          </div>

          {/* FCL - Not applicable */}
          <div className={`${styles.fund} ${styles.fundNotApplicable}`}>
            <div className={styles.fundTag}>❌ No aplica</div>
            <div className={styles.fundName}>FCL — Capitalización Laboral</div>
            <div className={styles.fundDesc}>
              Cesantía modernizada, retirable c/5 años. 100% aporte patronal. <strong>Sin 
              patrono, no existe para un trabajador independiente.</strong>
            </div>
            <div className={styles.fundPct}>Requiere relación laboral</div>
          </div>

          {/* RVP - Voluntary */}
          <div className={`${styles.fund} ${styles.fundVoluntary}`}>
            <div className={styles.fundTag}>⭐ Voluntario · Recomendado</div>
            <div className={styles.fundName}>RVP — Pensión Voluntaria</div>
            <div className={styles.fundDesc}>
              Ahorro en una OPC (BAC, BCR, BN Vital, Popular). <strong>Deducible del ISR 
              hasta 10% del ingreso bruto anual</strong> (art. 71 Ley 7983). Complementa tu 
              IVM futuro.
            </div>
            <div className={styles.fundPct}>Deducible ISR · Lo ponés vos</div>
          </div>

          {/* Note */}
          <div className={`${styles.fund} ${styles.fundNote}`}>
            <div className={styles.fundTag}>📋 Nota importante</div>
            <div className={styles.fundName}>Tu pensión futura como trabajador independiente</div>
            <div className={styles.fundDesc}>
              Sin ROP, tu pensión vendrá únicamente del IVM. Es menor que la de un asalariado 
              equivalente. El RVP es la herramienta clave para cerrar esa brecha.
            </div>
            <div className={styles.fundPct}>Planificá a largo plazo</div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
