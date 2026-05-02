import { useState, useEffect } from 'react'

/**
 * Response structure from the BCCR exchange rate API.
 * The API returns current buy/sell rates for USD to CRC conversion.
 */
interface ExchangeRateApiResponse {
  venta: number   // sell rate (USD → CRC)
  compra: number  // buy rate (CRC → USD)
  fecha: string   // date of the rate
}

/**
 * Configuration for the exchange rate hook.
 * Contains API endpoint, timeout, and fallback values.
 */
interface ExchangeRateConfig {
  apiUrl: string
  timeoutMs: number
  ventaDefault: number
  compraDefault: number
}

/**
 * Return value from the useTipoCambio hook.
 * Provides current exchange rates and loading/error states.
 */
interface ExchangeRateResult {
  exchangeRateSell: number    // venta rate (USD → CRC)
  exchangeRateBuy: number     // compra rate (CRC → USD)
  isLoaded: boolean           // true when fetch completes (success or failure)
  hasError: boolean           // true if fetch failed
}

/**
 * Fetches the current USD/CRC exchange rate from the BCCR public API.
 * 
 * This hook runs once on mount and attempts to load live exchange rates.
 * If the fetch fails or times out, it falls back to default values from config.
 * 
 * The hook respects the tcManual flag — if the user has manually adjusted
 * the exchange rate slider, this hook will not overwrite their value.
 * 
 * @param config - Exchange rate configuration (API URL, timeout, defaults)
 * @param isManualExchangeRate - If true, the hook will not update rates (user has manually set them)
 * @returns Exchange rates and loading state
 */
export function useTipoCambio(
  config: ExchangeRateConfig,
  isManualExchangeRate: boolean
): ExchangeRateResult {
  const [exchangeRateSell, setExchangeRateSell] = useState<number>(config.ventaDefault)
  const [exchangeRateBuy, setExchangeRateBuy] = useState<number>(config.compraDefault)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)

  useEffect(() => {
    // If the user has manually adjusted the exchange rate, don't fetch from API
    if (isManualExchangeRate) {
      setIsLoaded(true)
      return
    }

    // Create an AbortController to handle timeout
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => {
      abortController.abort()
    }, config.timeoutMs)

    /**
     * Fetches exchange rates from the BCCR API.
     * On success, updates state with live rates.
     * On failure, falls back to default values and logs a warning.
     */
    async function fetchExchangeRate() {
      try {
        const response = await fetch(config.apiUrl, {
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`)
        }

        const data: ExchangeRateApiResponse = await response.json()

        // Validate that the API returned valid numbers
        if (typeof data.venta !== 'number' || typeof data.compra !== 'number') {
          throw new Error('API response missing valid exchange rates')
        }

        // Update state with live rates from API
        setExchangeRateSell(data.venta)
        setExchangeRateBuy(data.compra)
        setHasError(false)
      } catch (error) {
        // Fetch failed — use default values from config
        setExchangeRateSell(config.ventaDefault)
        setExchangeRateBuy(config.compraDefault)
        setHasError(true)

        // Log warning for debugging but don't show error to user
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.warn('Exchange rate API request timed out, using default values')
          } else {
            console.warn('Failed to fetch exchange rate from API, using default values:', error.message)
          }
        }
      } finally {
        clearTimeout(timeoutId)
        setIsLoaded(true)
      }
    }

    fetchExchangeRate()

    // Cleanup: abort the fetch if component unmounts before completion
    return () => {
      clearTimeout(timeoutId)
      abortController.abort()
    }
    // We use individual config properties instead of the whole config object
    // to avoid re-running when a new config object is passed with the same values
  }, [config.apiUrl, config.timeoutMs, config.ventaDefault, config.compraDefault, isManualExchangeRate])

  return {
    exchangeRateSell,
    exchangeRateBuy,
    isLoaded,
    hasError,
  }
}
