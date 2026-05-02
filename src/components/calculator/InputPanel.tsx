import type { CalculatorState } from '@/types/fiscal.types'
import { CardSection } from '@/components/ui/CardSection'
import { SliderField } from '@/components/ui/SliderField'
import { Chip } from '@/components/ui/Chip'
import { CurrencySelector } from './CurrencySelector'
import { RegimeSelector } from './RegimeSelector'
import { RateSlider } from './RateSlider'
import { TipoCambioSlider } from './TipoCambioSlider'
import { DeductionChips } from './DeductionChips'
import { ClientTypeChips } from './ClientTypeChips'
import { IvaInfo } from './IvaInfo'
import { formatColones } from '@/utils/formatters'

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
}

/**
 * Input panel that assembles all calculator inputs.
 * Organized in cards with conditional visibility based on regime and deduction type.
 */
export function InputPanel({ state, onStateChange, sliderConfig }: InputPanelProps) {
  // Calculate rate in CRC for IVA display
  const rateCRC =
    state.currency === 'usd' ? state.monthlyRate * state.exchangeRate : state.monthlyRate

  return (
    <div>
      {/* Currency and Rate */}
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

      {/* Regime */}
      <CardSection title="Régimen Fiscal" icon="📋" iconVariant="b">
        <RegimeSelector
          value={state.regime}
          onChange={(regime) => onStateChange({ regime })}
        />
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
      </CardSection>

      {/* Deductions */}
      <CardSection title="Deducciones" icon="📊" iconVariant="a">
        <DeductionChips
          value={state.deductionType}
          onChange={(deductionType) => onStateChange({ deductionType })}
        />
        {state.deductionType === 'real' && (
          <SliderField
            id="expenses-slider"
            label="Gastos documentados anuales (CRC)"
            value={state.documentedExpenses}
            min={sliderConfig.expenses.min}
            max={sliderConfig.expenses.max}
            step={sliderConfig.expenses.step}
            valueDisplay={formatColones(state.documentedExpenses)}
            onChange={(documentedExpenses) => onStateChange({ documentedExpenses })}
            hints={[
              formatColones(sliderConfig.expenses.min),
              formatColones(sliderConfig.expenses.max),
            ]}
            tooltip="Gastos deducibles documentados con facturas electrónicas. Incluye alquiler de oficina, servicios, equipo, etc."
          />
        )}
        <SliderField
          id="pension-slider"
          label="Pensión voluntaria anual (CRC)"
          value={state.voluntaryPensionAmount}
          min={0}
          max={5000000}
          step={50000}
          valueDisplay={formatColones(state.voluntaryPensionAmount)}
          onChange={(voluntaryPensionAmount) =>
            onStateChange({ voluntaryPensionAmount })
          }
          hints={['₡0', '₡5.000.000']}
          tooltip="Aportes a Régimen Voluntario de Pensiones (RVP). Deducible hasta el 10% del ingreso bruto anual."
        />
      </CardSection>

      {/* Tax Credits */}
      <CardSection title="Créditos Fiscales" icon="👨‍👩‍👧‍👦" iconVariant="g">
        <SliderField
          id="children-slider"
          label="Número de hijos"
          value={state.numberOfChildren}
          min={sliderConfig.children.min}
          max={sliderConfig.children.max}
          step={sliderConfig.children.step}
          valueDisplay={`${state.numberOfChildren} ${
            state.numberOfChildren === 1 ? 'hijo' : 'hijos'
          }`}
          onChange={(numberOfChildren) => onStateChange({ numberOfChildren })}
          hints={[`${sliderConfig.children.min}`, `${sliderConfig.children.max}`]}
          tooltip="Crédito fiscal por cada hijo dependiente menor de edad o estudiante hasta 25 años"
        />
        <div style={{ marginTop: '12px' }}>
          <label
            style={{
              fontSize: '13px',
              fontWeight: 400,
              color: 'var(--ink3)',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            ¿Tenés cónyuge dependiente?
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <Chip
              label="Sí"
              active={state.hasSpouse}
              variant="green"
              onClick={() => onStateChange({ hasSpouse: true })}
            />
            <Chip
              label="No"
              active={!state.hasSpouse}
              variant="amber"
              onClick={() => onStateChange({ hasSpouse: false })}
            />
          </div>
        </div>
      </CardSection>

      {/* Client Type and IVA */}
      <CardSection title="Tipo de Cliente" icon="🌎" iconVariant="b">
        <ClientTypeChips
          value={state.clientType}
          onChange={(clientType) => onStateChange({ clientType })}
        />
        <IvaInfo clienteLocal={state.clientType === 'loc'} rateCRC={rateCRC} />
      </CardSection>
    </div>
  )
}
