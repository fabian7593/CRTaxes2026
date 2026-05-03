import { Chip } from '@/components/ui/Chip'
import { SliderField } from '@/components/ui/SliderField'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatColones } from '@/utils/formatters'
import styles from './FiscalConfigCard.module.css'

interface FiscalConfigCardProps {
  // Client type
  clientType: 'ext' | 'loc'
  onClientTypeChange: (value: 'ext' | 'loc') => void
  
  // Deduction type
  deductionType: 'ficto' | 'real'
  onDeductionTypeChange: (value: 'ficto' | 'real') => void
  
  // Documented expenses (only shown when deductionType === 'real')
  documentedExpenses: number
  onDocumentedExpensesChange: (value: number) => void
  expensesConfig: { min: number; max: number; step: number }
  
  // Children
  numberOfChildren: number
  onNumberOfChildrenChange: (value: number) => void
  childrenConfig: { min: number; max: number; step: number }
  
  // Spouse
  hasSpouse: boolean
  onHasSpouseChange: (value: boolean) => void
  
  // Voluntary pension
  hasVoluntaryPension: boolean
  onHasVoluntaryPensionChange: (value: boolean) => void
}

/**
 * Consolidated fiscal configuration card that contains ALL configuration sections:
 * - Client type (Exterior/Local)
 * - Deduction type (Ficto/Real) + expenses slider
 * - Children slider
 * - Spouse chips
 * - Voluntary pension chips
 * 
 * This matches the original HTML structure where all these sections were in ONE card.
 */
export function FiscalConfigCard({
  clientType,
  onClientTypeChange,
  deductionType,
  onDeductionTypeChange,
  documentedExpenses,
  onDocumentedExpensesChange,
  expensesConfig,
  numberOfChildren,
  onNumberOfChildrenChange,
  childrenConfig,
  hasSpouse,
  onHasSpouseChange,
  hasVoluntaryPension,
  onHasVoluntaryPensionChange,
}: FiscalConfigCardProps) {
  return (
    <div>
      {/* Section 1: Client Type */}
      <div className={styles.configSection}>
        <div className={styles.configLabel}>
          Tipo de cliente
          <Tooltip content="Exterior: exportación de servicios (0% IVA). Local: cliente costarricense (13% IVA que cobrás al cliente)." />
        </div>
        <div className={styles.chips}>
          <Chip
            label="Empresa exterior / USA - Sin IVA"
            active={clientType === 'ext'}
            variant="green"
            onClick={() => onClientTypeChange('ext')}
          />
          <Chip
            label="Cliente local CR - IVA 13%"
            active={clientType === 'loc'}
            variant="amber"
            onClick={() => onClientTypeChange('loc')}
          />
        </div>
      </div>

      <hr className={styles.sep} />

      {/* Section 2: Deduction Type */}
      <div className={styles.configSection}>
        <div className={styles.configLabel}>
          Deducción para renta (art. 8 Ley 7092)
          <Tooltip content="Ficto: deducís el 25% del bruto sin necesidad de facturas. Real: deducís gastos documentados con facturas electrónicas." />
        </div>
        <div className={styles.chips}>
          <Chip
            label="Ficto 25% (Sin facturas)"
            active={deductionType === 'ficto'}
            variant="green"
            onClick={() => onDeductionTypeChange('ficto')}
          />
          <Chip
            label="Gastos reales documentados"
            active={deductionType === 'real'}
            variant="amber"
            onClick={() => onDeductionTypeChange('real')}
          />
        </div>
      </div>

      {/* Conditional: Expenses slider (only when deductionType === 'real') */}
      {deductionType === 'real' && (
        <div className={styles.expensesWrapper}>
          <SliderField
            id="expenses-slider"
            label="Gastos documentados anuales (CRC)"
            value={documentedExpenses}
            min={expensesConfig.min}
            max={expensesConfig.max}
            step={expensesConfig.step}
            valueDisplay={formatColones(documentedExpenses)}
            onChange={onDocumentedExpensesChange}
            hints={[
              formatColones(expensesConfig.min),
              formatColones(expensesConfig.max),
            ]}
            tooltip="Gastos deducibles documentados con facturas electrónicas. Incluye alquiler de oficina, servicios, equipo, etc."
          />
        </div>
      )}

      <hr className={styles.sep} />

      {/* Section 3: Children */}
      <div className={styles.configSectionSm}>
        <SliderField
          id="children-slider"
          label="Número de hijos"
          value={numberOfChildren}
          min={childrenConfig.min}
          max={childrenConfig.max}
          step={childrenConfig.step}
          valueDisplay={`${numberOfChildren} ${
            numberOfChildren === 1 ? 'hijo' : 'hijos'
          }`}
          onChange={onNumberOfChildrenChange}
          hints={[`${childrenConfig.min}`, `${childrenConfig.max}`]}
          tooltip="Crédito fiscal por cada hijo dependiente menor de edad o estudiante hasta 25 años"
        />
      </div>

      {/* Section 4: Spouse */}
      <div className={styles.configSectionSm}>
        <div className={styles.configLabel}>
          ¿Tenés cónyuge dependiente?
          <Tooltip content="Crédito fiscal si tu cónyuge no tiene ingresos propios o son menores al salario mínimo." />
        </div>
        <div className={styles.chips}>
          <Chip
            label="Sí"
            active={hasSpouse}
            variant="green"
            onClick={() => onHasSpouseChange(true)}
          />
          <Chip
            label="No"
            active={!hasSpouse}
            variant="amber"
            onClick={() => onHasSpouseChange(false)}
          />
        </div>
      </div>

      {/* Section 5: Voluntary Pension */}
      <div className={styles.configSectionSm}>
        <div className={styles.configLabel}>
          Pensión voluntaria (art. 71 Ley 7983)
          <Tooltip content="Si aportás a una OPC (BAC Pensiones, BCR Pensiones, BN Vital, Popular Pensiones), podés deducir hasta el 10% del ingreso bruto anual de la renta imponible. Esto reduce directamente la base sobre la que se calculan los tramos ISR. Es una de las mejores estrategias de optimización fiscal legal para TI." />
        </div>
        <div className={styles.chips}>
          <Chip
            label="Sin pensión voluntaria"
            active={!hasVoluntaryPension}
            variant="green"
            onClick={() => onHasVoluntaryPensionChange(false)}
          />
          <Chip
            label="Con pensión voluntaria (10% bruto)"
            active={hasVoluntaryPension}
            variant="green"
            onClick={() => onHasVoluntaryPensionChange(true)}
          />
        </div>
      </div>
    </div>
  )
}
