import { useState, useMemo } from 'react'
import type { CcssConfig } from '@/types/fiscal.types'
import { Modal } from '@/components/ui/Modal'
import { SliderField } from '@/components/ui/SliderField'
import { formatColones as fC } from '@/utils/formatters'
import styles from './RiesgoCcssModal.module.css'

interface RiesgoCcssModalProps {
  isOpen: boolean
  onClose: () => void
  actualMonthlyIncome: number
  ccssConfig: CcssConfig
}

/**
 * CCSS Risk Simulator Modal - calculates penalties for underdeclaring income to CCSS.
 * 
 * Allows the user to simulate what would happen if they declared less income than
 * they actually earn. Shows:
 * - Fixed fine (3x base salary)
 * - Retroactive contributions (1 year of omitted contributions)
 * - Late payment interest (8.52% annual rate)
 * - Total penalty amount
 * - Risk ratio (how much you risk per colón "saved")
 * 
 * If declared amount >= actual amount, shows "Sin exposición" (no risk).
 */
export function RiesgoCcssModal({
  isOpen,
  onClose,
  actualMonthlyIncome,
  ccssConfig,
}: RiesgoCcssModalProps) {
  // Initialize slider to actual income
  const [declaredAmount, setDeclaredAmount] = useState(actualMonthlyIncome)

  // Calculate risk when modal opens or declared amount changes
  const riskResult = useMemo(() => {
    return calculateCcssRisk(declaredAmount, actualMonthlyIncome, ccssConfig)
  }, [declaredAmount, actualMonthlyIncome, ccssConfig])

  // Reset declared amount when modal opens
  const handleModalOpen = () => {
    if (isOpen) {
      setDeclaredAmount(actualMonthlyIncome)
    }
  }

  // Call handleModalOpen when isOpen changes
  useMemo(handleModalOpen, [isOpen, actualMonthlyIncome])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Simulador de Riesgo CCSS" maxWidth="560px">
      <div className={styles.modalRiesgoAlert}>
        <strong>⚠️ Advertencia:</strong> Subdeclarar ingresos a la CCSS es ilegal y conlleva
        sanciones severas según el artículo 44 de la Ley Constitutiva de la CCSS.
      </div>

      {/* Actual income display */}
      <div className={styles.modalRiesgoBruto}>
        <div className={styles.modalRiesgoBrutoLabel}>Tu ingreso mensual real</div>
        <div className={styles.modalRiesgoBrutoValue}>{fC(actualMonthlyIncome)}</div>
      </div>

      {/* Declared amount slider */}
      <div className={styles.modalRiesgoSlider}>
        <SliderField
          sliderId="riesgo-declarado"
          labelText="Monto que declararías a la CCSS"
          currentValue={declaredAmount}
          minimumValue={ccssConfig.baseMinimaContribucion}
          maximumValue={actualMonthlyIncome * 1.2}
          stepSize={10000}
          displayValue={fC(declaredAmount)}
          hintLeft={fC(ccssConfig.baseMinimaContribucion)}
          hintRight={fC(actualMonthlyIncome * 1.2)}
          onValueChange={setDeclaredAmount}
        />
      </div>

      {/* Risk result */}
      {riskResult.hasRisk ? (
        <div className={styles.riskCard}>
          <div className={styles.riskCardHeader}>
            <span className={styles.riskCardIcon}>🚨</span>
            <div>
              <div className={styles.riskCardTitle}>Exposición detectada</div>
              <div className={styles.riskCardSubtitle}>
                Subdeclaración: {fC(riskResult.difference)}
              </div>
            </div>
          </div>

          <div className={styles.riskBreakdown}>
            <div className={styles.riskRow}>
              <span className={styles.riskLabel}>Multa fija (3× salario base)</span>
              <span className={styles.riskValue}>{fC(riskResult.fixedFine)}</span>
            </div>
            <div className={styles.riskRow}>
              <span className={styles.riskLabel}>Cuotas omitidas (1 año retroactivo)</span>
              <span className={styles.riskValue}>{fC(riskResult.omittedContributions)}</span>
            </div>
            <div className={styles.riskRow}>
              <span className={styles.riskLabel}>
                Intereses moratorios ({(riskResult.interestRate * 100).toFixed(2)}%)
              </span>
              <span className={styles.riskValue}>{fC(riskResult.lateInterest)}</span>
            </div>
            <div className={`${styles.riskRow} ${styles.riskRowTotal}`}>
              <span className={styles.riskLabel}>Total sanción</span>
              <span className={styles.riskValue}>{fC(riskResult.totalPenalty)}</span>
            </div>
          </div>

          <div className={styles.riskRatio}>
            <strong>Ratio de riesgo:</strong> Por cada ₡1 que "ahorrarías" en CCSS, arriesgás{' '}
            <span className={styles.riskRatioValue}>
              ₡{riskResult.riskRatio.toFixed(2)}
            </span>{' '}
            en sanciones.
          </div>
        </div>
      ) : (
        <div className={styles.noRiskCard}>
          <div className={styles.noRiskIcon}>✅</div>
          <div className={styles.noRiskTitle}>Sin exposición</div>
          <div className={styles.noRiskMessage}>
            El monto declarado es igual o mayor al ingreso real. No hay riesgo de sanciones.
          </div>
        </div>
      )}

      <div className={styles.modalRiesgoFooter}>
        <p>
          <strong>Nota legal:</strong> Este simulador es solo informativo. Las sanciones reales
          pueden variar según el caso específico y la decisión de la CCSS. Siempre declará tus
          ingresos reales.
        </p>
      </div>
    </Modal>
  )
}

/**
 * Calculates the risk and penalties for underdeclaring income to CCSS.
 * 
 * Formula:
 * - Fixed fine: 3 × base salary (₡462,200 in 2026)
 * - Omitted contributions: (actual - declared) × total CCSS rate × 12 months
 * - Late interest: omitted contributions × 8.52% annual rate
 * - Total penalty: fixed fine + omitted contributions + late interest
 * 
 * @param declaredAmount - Amount declared to CCSS
 * @param actualAmount - Actual monthly income
 * @param ccssConfig - CCSS configuration
 * @returns Risk calculation result
 */
function calculateCcssRisk(
  declaredAmount: number,
  actualAmount: number,
  ccssConfig: CcssConfig
): {
  hasRisk: boolean
  difference: number
  fixedFine: number
  omittedContributions: number
  lateInterest: number
  totalPenalty: number
  riskRatio: number
  interestRate: number
} {
  // No risk if declared >= actual
  if (declaredAmount >= actualAmount) {
    return {
      hasRisk: false,
      difference: 0,
      fixedFine: 0,
      omittedContributions: 0,
      lateInterest: 0,
      totalPenalty: 0,
      riskRatio: 0,
      interestRate: ccssConfig.tasaInteresesMoratorios,
    }
  }

  const difference = actualAmount - declaredAmount

  // Fixed fine: 3 × base salary
  const fixedFine = ccssConfig.salarioBase2026 * ccssConfig.multaFijaMultiplicador

  // Calculate omitted contributions (1 year retroactive)
  // Use the highest category rate as worst-case scenario
  const highestCategory = ccssConfig.categorias[ccssConfig.categorias.length - 1]
  const totalRate = highestCategory.ivm26 + highestCategory.sem
  const monthlyOmittedContribution = difference * totalRate
  const omittedContributions = monthlyOmittedContribution * 12

  // Late payment interest
  const lateInterest = omittedContributions * ccssConfig.tasaInteresesMoratorios

  // Total penalty
  const totalPenalty = fixedFine + omittedContributions + lateInterest

  // Risk ratio: how much you risk per colón "saved"
  const monthlySavings = monthlyOmittedContribution
  const riskRatio = monthlySavings > 0 ? totalPenalty / (monthlySavings * 12) : 0

  return {
    hasRisk: true,
    difference,
    fixedFine,
    omittedContributions,
    lateInterest,
    totalPenalty,
    riskRatio,
    interestRate: ccssConfig.tasaInteresesMoratorios,
  }
}
