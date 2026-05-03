import { SliderField } from '@/components/ui/SliderField'
import { formatNumber } from '@/utils/formatters'

interface TipoCambioSliderProps {
  currency: 'usd' | 'crc'
  value: number
  min: number
  max: number
  step: number
  isManual: boolean
  onChange: (value: number) => void
}

/**
 * Specialized slider for exchange rate (tipo de cambio).
 * Shows different labels and tooltips based on currency mode (venta for USD, compra for CRC).
 * Displays "API en vivo" badge when rate comes from live API.
 */
export function TipoCambioSlider({
  currency,
  value,
  min,
  max,
  step,
  onChange,
}: TipoCambioSliderProps) {
  const isUSD = currency === 'usd'

  const label = isUSD ? 'Tipo de cambio (Venta)' : 'Tipo de cambio (Compra)'

  const tooltip = isUSD
    ? 'Tipo de cambio BCCR venta (USD → CRC). Se actualiza automáticamente desde la API del BCCR.'
    : 'Tipo de cambio BCCR compra (CRC → USD). Se actualiza automáticamente desde la API del BCCR.'

  const valueDisplay = `₡${formatNumber(value, 2)}`

  const hints: [string, string] = [`₡${formatNumber(min, 0)}`, `₡${formatNumber(max, 0)}`]

  return (
    <div>
      <SliderField
        id="tipo-cambio-slider"
        label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        valueDisplay={valueDisplay}
        onChange={onChange}
        hints={hints}
        tooltip={tooltip}
      />
    
    </div>
  )
}
