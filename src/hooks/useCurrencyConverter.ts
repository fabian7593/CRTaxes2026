import { useCallback } from 'react'
import type { Currency } from '@/types/fiscal.types'

interface SliderConfig {
  minimumValue: number
  maximumValue: number
  stepSize: number
}

interface CurrencyConverterConfig {
  usdSliderConfig: {
    min: number
    max: number
    step: number
  }
  crcSliderConfig: {
    min: number
    max: number
    step: number
  }
}

interface UseCurrencyConverterReturn {
  convertRate: (
    currentRate: number,
    fromCurrency: Currency,
    toCurrency: Currency,
    exchangeRateVenta: number,
    exchangeRateCompra: number
  ) => number
  getSliderConfig: (activeCurrency: Currency) => SliderConfig
}

/**
 * Hook that provides currency conversion logic and slider configuration.
 * Handles conversion between USD and CRC using the appropriate exchange rates.
 * Also provides the correct slider min/max/step values based on active currency.
 */
export function useCurrencyConverter(config: CurrencyConverterConfig): UseCurrencyConverterReturn {
  /**
   * Converts a rate from one currency to another using the appropriate exchange rate.
   * USD → CRC uses venta (sell) rate, CRC → USD uses compra (buy) rate.
   *
   * @param currentRate - The current rate value to convert
   * @param fromCurrency - The currency we're converting from
   * @param toCurrency - The currency we're converting to
   * @param exchangeRateVenta - The sell exchange rate (USD → CRC)
   * @param exchangeRateCompra - The buy exchange rate (CRC → USD)
   * @returns The converted rate value
   */
  const convertRate = useCallback(
    (
      currentRate: number,
      fromCurrency: Currency,
      toCurrency: Currency,
      exchangeRateVenta: number,
      exchangeRateCompra: number
    ): number => {
      // If currencies are the same, no conversion needed
      if (fromCurrency === toCurrency) {
        return currentRate
      }

      // USD → CRC: multiply by venta (sell) rate
      if (fromCurrency === 'usd' && toCurrency === 'crc') {
        return currentRate * exchangeRateVenta
      }

      // CRC → USD: divide by compra (buy) rate
      if (fromCurrency === 'crc' && toCurrency === 'usd') {
        return currentRate / exchangeRateCompra
      }

      // Fallback: return current rate unchanged
      return currentRate
    },
    []
  )

  /**
   * Returns the slider configuration (min/max/step) for the given currency.
   * USD has a range of $500-$12,000 with $100 steps.
   * CRC has a range of ₡200,000-₡6,000,000 with ₡50,000 steps.
   *
   * @param activeCurrency - The currently active currency ('usd' or 'crc')
   * @returns Slider configuration object with min, max, and step values
   */
  const getSliderConfig = useCallback(
    (activeCurrency: Currency): SliderConfig => {
      if (activeCurrency === 'usd') {
        return {
          minimumValue: config.usdSliderConfig.min,
          maximumValue: config.usdSliderConfig.max,
          stepSize: config.usdSliderConfig.step,
        }
      }

      // CRC configuration
      return {
        minimumValue: config.crcSliderConfig.min,
        maximumValue: config.crcSliderConfig.max,
        stepSize: config.crcSliderConfig.step,
      }
    },
    [config]
  )

  return {
    convertRate,
    getSliderConfig,
  }
}
