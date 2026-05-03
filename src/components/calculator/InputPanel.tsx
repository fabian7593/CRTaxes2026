import type { CalculatorState, CcssResult } from '@/types/fiscal.types'
import { CardSection } from '@/components/ui/CardSection'
import { SliderField } from '@/components/ui/SliderField'
import { CurrencySelector } from './CurrencySelector'
import { RegimeSelector } from './RegimeSelector'
import { RateSlider } from './RateSlider'
import { TipoCambioSlider } from './TipoCambioSlider'
import { FiscalConfigCard } from './FiscalConfigCard'
import { IvaInfo } from './IvaInfo'
import { BreakdownTable } from './BreakdownTable'
import { CcssCard } from '@/components/ccss/CcssCard'
import { formatColones } from '@/utils/formatters'
import type { BreakdownRow } from '@/types/fiscal.types'
import fiscalConfig from '@/config/fiscal.config.json'

interface InputPanelProps {
  state: CalculatorState
  onStateChange: (updates: Partial<CalculatorState>) => void
  sliderConfig: {
    rate: { min: number; max: number; step: number }
    exchangeRate: { min: number; max: number; step: number }
    months: { min: number; max: number; step: number }
    salary: { min: number; max: number; step: number }
    expenses: { min: number; max: number; step: number }
    children: { min: number; max: number; step: number }
  }
  ccssResult: CcssResult
  breakdownRows: BreakdownRow[]
  onOpenModal: (modalType: 'ccss-tables' | 'ccss-riesgo' | 'isr-tramos' | 'pension-funds') => void
}

/**
 * Input panel that assembles all calculator inputs.
 * Organized in cards with conditional visibility based on regime and deduction type.
 * 
 * STRUCTURAL ORDER:
 * 1. RegimeSelector (OUTSIDE any card)
 * 2. Card: Moneda e Ingreso
 * 3. IvaInfo strip (OUTSIDE card, before Configuración fiscal)
 * 4. Card: Configuración fiscal (CONSOLIDATED: cliente, deducciones, hijos, cónyuge, pensión)
 * 5. Card: CCSS (complete card)
 * 6. Card: Desglose Anual Detallado
 */
export function InputPanel({ 
  state, 
  onStateChange, 
  sliderConfig,
  ccssResult,
  breakdownRows,
  onOpenModal
}: InputPanelProps) {
  // Calculate rate in CRC for IVA display
  const rateCRC =
    state.currency === 'usd' ? state.monthlyRate * state.exchangeRate : state.monthlyRate

  return (
    <div>
      {/* RegimeSelector - OUTSIDE any card (Task 12.1.1) */}
      <RegimeSelector
        value={state.regime}
        onChange={(regime) => onStateChange({ regime })}
      />

      {/* Card 1: Moneda e Ingreso (Task 12.1.2) */}
      <CardSection title="Moneda e Ingreso" icon="💰" iconVariant="g">
        <CurrencySelector
          value={state.currency}
          onChange={(currency) => onStateChange({ currency })}
        />
        <RateSlider
          currency={state.currency}
          value={state.monthlyRate}
          min={sliderConfig.rate.min}
          max={sliderConfig.rate.max}
          step={sliderConfig.rate.step}
          onChange={(monthlyRate) => onStateChange({ monthlyRate })}
        />
        <TipoCambioSlider
          currency={state.currency}
          value={state.exchangeRate}
          min={sliderConfig.exchangeRate.min}
          max={sliderConfig.exchangeRate.max}
          step={sliderConfig.exchangeRate.step}
          isManual={state.isManualExchangeRate}
          onChange={(exchangeRate) =>
            onStateChange({ exchangeRate, isManualExchangeRate: true })
          }
        />
        <SliderField
          id="months-slider"
          label="Meses facturados al año"
          value={state.billedMonths}
          min={sliderConfig.months.min}
          max={sliderConfig.months.max}
          step={sliderConfig.months.step}
          valueDisplay={`${state.billedMonths} meses`}
          onChange={(billedMonths) => onStateChange({ billedMonths })}
          hints={[`${sliderConfig.months.min}`, `${sliderConfig.months.max}`]}
          tooltip="Cantidad de meses al año en los que facturás servicios profesionales"
        />
      </CardSection>

      {/* IvaInfo strip - OUTSIDE card, before Configuración fiscal */}
      <IvaInfo clienteLocal={state.clientType === 'loc'} rateCRC={rateCRC} />

      {/* Card 2: Configuración fiscal - CONSOLIDATED CARD (Task 12.2.2) */}
      <CardSection title="Configuración fiscal" icon="📋" iconVariant="b">
        {/* Salary slider - only visible in mixto regime */}
        {state.regime === 'mixto' && (
          <SliderField
            id="salary-slider"
            label="Salario mensual (CRC)"
            value={state.annualSalary / 12}
            min={sliderConfig.salary.min}
            max={sliderConfig.salary.max}
            step={sliderConfig.salary.step}
            valueDisplay={formatColones(state.annualSalary / 12)}
            onChange={(monthlySalary) =>
              onStateChange({ annualSalary: monthlySalary * 12 })
            }
            hints={[
              formatColones(sliderConfig.salary.min),
              formatColones(sliderConfig.salary.max),
            ]}
            tooltip="Salario mensual bruto de tu empleo formal. Se usa para calcular el consumo del tramo exento del ISR."
          />
        )}
        <FiscalConfigCard
          clientType={state.clientType}
          onClientTypeChange={(clientType) => onStateChange({ clientType })}
          deductionType={state.deductionType}
          onDeductionTypeChange={(deductionType) => onStateChange({ deductionType })}
          documentedExpenses={state.documentedExpenses}
          onDocumentedExpensesChange={(documentedExpenses) =>
            onStateChange({ documentedExpenses })
          }
          expensesConfig={sliderConfig.expenses}
          numberOfChildren={state.numberOfChildren}
          onNumberOfChildrenChange={(numberOfChildren) =>
            onStateChange({ numberOfChildren })
          }
          childrenConfig={sliderConfig.children}
          hasSpouse={state.hasSpouse}
          onHasSpouseChange={(hasSpouse) => onStateChange({ hasSpouse })}
          hasVoluntaryPension={state.hasVoluntaryPension}
          onHasVoluntaryPensionChange={(value) =>
            onStateChange({ hasVoluntaryPension: value })
          }
        />
      </CardSection>

      {/* Card 3: CCSS (Task 12.1.7) - Complete card with all CCSS info */}
      <CardSection title="CCSS — Trabajador Independiente 2026" icon="🏥" iconVariant="r">
        <CcssCard
          ccssResult={ccssResult}
          monthlyRateDisplay={
            state.currency === 'usd'
              ? `$${state.monthlyRate.toLocaleString('en-US')}`
              : formatColones(state.monthlyRate)
          }
          exchangeRate={state.exchangeRate}
          ccssCategories={fiscalConfig.ccss.categorias.map(c => ({ cat: c.cat, max: c.max }))}
          onOpenTablesModal={() => onOpenModal('ccss-tables')}
          onOpenRiskModal={() => onOpenModal('ccss-riesgo')}
          onOpenPensionModal={() => onOpenModal('pension-funds')}
        />
      </CardSection>

      {/* Card 4: Desglose Anual Detallado (Task 12.1.8) */}
      <CardSection title="Desglose Anual Detallado" icon="📋" iconVariant="b">
        <BreakdownTable 
          rows={breakdownRows} 
          onOpenIsrModal={() => onOpenModal('isr-tramos')}
        />
      </CardSection>
    </div>
  )
}
