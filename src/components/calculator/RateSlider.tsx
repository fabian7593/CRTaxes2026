import { SliderField } from '@/components/ui/SliderField'
import { formatColones, formatDollars } from '@/utils/formatters'

interface RateSliderProps {
  currency: 'usd' | 'crc'
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

/**
 * Specialized slider for monthly rate input.
 * Changes label, tooltip, hints, and formatting based on active currency.
 */
export function RateSlider({ currency, value, min, max, step, onChange }: RateSliderProps) {
  const isUSD = currency === 'usd'

  const label = isUSD ? 'Tarifa mensual (USD)' : 'Tarifa mensual (CRC)'
  
  const tooltip = isUSD
    ? 'Ingreso mensual promedio en dólares por servicios profesionales independientes'
    : 'Ingreso mensual promedio en colones por servicios profesionales independientes'

  const valueDisplay = isUSD ? formatDollars(value) : formatColones(value)

  const hints: [string, string] = isUSD
    ? [formatDollars(min), formatDollars(max)]
    : [formatColones(min), formatColones(max)]

  return (
    <SliderField
      id="rate-slider"
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
  )
}
