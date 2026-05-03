import { useState, useEffect } from 'react'
import type { CalculatorState, OpenModalType, PageType, CcssTablesData } from '@/types/fiscal.types'
import fiscalConfig from '@/config/fiscal.config.json'
import { useTipoCambio } from '@/hooks/useTipoCambio'
import { useFiscalCalculator } from '@/hooks/useFiscalCalculator'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import { PageLayout } from '@/components/layout/PageLayout'
import { DocsPage } from '@/components/layout/DocsPage'
import { InputPanel } from '@/components/calculator/InputPanel'
import { ResultPanel } from '@/components/calculator/ResultPanel'
import { CcssTablesModal } from '@/components/ccss/CcssTablesModal'
import { RiesgoCcssModal } from '@/components/ccss/RiesgoCcssModal'
import { PensionFundsModal } from '@/components/ccss/PensionFundsModal'
import { TramoModal } from '@/components/calculator/TramoModal'

/**
 * Main App component - orchestrates the entire calculator application.
 * 
 * Responsibilities:
 * - Manages global calculator state (all user inputs)
 * - Integrates useTipoCambio hook to fetch live exchange rates
 * - Integrates useFiscalCalculator hook to compute all fiscal values
 * - Handles modal state (which modal is open)
 * - Handles simple routing (calculator vs docs page)
 * - Passes state and handlers down to child components
 */
function App() {
  // ========================================================================
  // Routing State
  // ========================================================================
  const [currentPage, setCurrentPage] = useState<PageType>('calculator')

  // Check URL on mount to see if we should show docs
  useEffect(() => {
    const checkRoute = () => {
      const params = new URLSearchParams(window.location.search)
      if (params.get('docs') === 'true') {
        setCurrentPage('docs')
      } else {
        setCurrentPage('calculator')
      }
    }
    
    checkRoute()
  }, [])

  // Handle browser back/forward buttons and manual navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      setCurrentPage(params.get('docs') === 'true' ? 'docs' : 'calculator')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // ========================================================================
  // Calculator State - initialized with defaults from fiscal.config.json
  // ========================================================================
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    // Currency and rate
    currency: 'usd',
    monthlyRate: fiscalConfig.sliders.tarifa.usd.default,
    exchangeRate: fiscalConfig.tipoCambio.ventaDefault,
    isManualExchangeRate: false,

    // Time period
    billedMonths: fiscalConfig.sliders.meses.default,

    // Regime
    regime: 'solo',
    annualSalary: fiscalConfig.sliders.salario.default * 12,

    // Deductions
    deductionType: 'ficto',
    documentedExpenses: fiscalConfig.sliders.gastos.default,
    hasVoluntaryPension: false,

    // Tax credits
    numberOfChildren: fiscalConfig.sliders.hijos.default,
    hasSpouse: false,

    // Client type
    clientType: 'ext',
  })

  // ========================================================================
  // Exchange Rate Hook - fetches live rates from BCCR API
  // ========================================================================
  const { exchangeRateSell, exchangeRateBuy, isLoaded: exchangeRateLoaded } = useTipoCambio(
    {
      apiUrl: fiscalConfig.tipoCambio.apiUrl,
      timeoutMs: fiscalConfig.tipoCambio.timeoutMs,
      ventaDefault: fiscalConfig.tipoCambio.ventaDefault,
      compraDefault: fiscalConfig.tipoCambio.compraDefault,
    },
    calculatorState.isManualExchangeRate
  )

  // Update exchange rate when API returns (only if user hasn't manually changed it)
  // This effect should only run when the API loads or when the rates change from the API
  // We intentionally do NOT include calculatorState in dependencies to avoid infinite loops
  useEffect(() => {
    if (exchangeRateLoaded && !calculatorState.isManualExchangeRate) {
      setCalculatorState((prevState) => {
        // Only update if the rate actually changed to avoid unnecessary re-renders
        const newRate = prevState.currency === 'usd' ? exchangeRateSell : exchangeRateBuy
        if (prevState.exchangeRate !== newRate) {
          return {
            ...prevState,
            exchangeRate: newRate,
          }
        }
        return prevState
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeRateLoaded, exchangeRateSell, exchangeRateBuy])

  // ========================================================================
  // Currency Converter Hook - handles USD/CRC conversion
  // ========================================================================
  const { convertRate, getSliderConfig } = useCurrencyConverter({
    usdSliderConfig: fiscalConfig.sliders.tarifa.usd,
    crcSliderConfig: fiscalConfig.sliders.tarifa.crc,
  })

  // ========================================================================
  // Fiscal Calculator Hook - computes all fiscal values
  // ========================================================================
  const fiscalResult = useFiscalCalculator(calculatorState, fiscalConfig as any)

  // ========================================================================
  // Modal State - tracks which modal is currently open
  // ========================================================================
  const [openModal, setOpenModal] = useState<OpenModalType>(null)

  // ========================================================================
  // State Update Handler - merges partial updates into calculator state
  // ========================================================================
  const handleStateChange = (updates: Partial<CalculatorState>) => {
    setCalculatorState((prevState) => {
      const newState = { ...prevState, ...updates }

      // Special handling: when currency changes, convert the rate
      if (updates.currency && updates.currency !== prevState.currency) {
        const convertedRate = convertRate(
          prevState.monthlyRate,
          prevState.currency,
          updates.currency,
          exchangeRateSell,
          exchangeRateBuy
        )
        newState.monthlyRate = convertedRate
        newState.exchangeRate = updates.currency === 'usd' ? exchangeRateSell : exchangeRateBuy
      }

      return newState
    })
  }

  // ========================================================================
  // Slider Configuration - provides min/max/step for all sliders
  // ========================================================================
  const rateSliderConfig = getSliderConfig(calculatorState.currency)
  const sliderConfig = {
    rate: {
      min: rateSliderConfig.minimumValue,
      max: rateSliderConfig.maximumValue,
      step: rateSliderConfig.stepSize,
    },
    exchangeRate: fiscalConfig.sliders.tipoCambio,
    months: fiscalConfig.sliders.meses,
    salary: fiscalConfig.sliders.salario,
    expenses: fiscalConfig.sliders.gastos,
    children: fiscalConfig.sliders.hijos,
  }

  // ========================================================================
  // CCSS Tables Data - build data for CCSS tables modal
  // ========================================================================
  const ccssTablesData: CcssTablesData = buildCcssTablesData(
    fiscalResult.ccssResult,
    fiscalConfig
  )

  // ========================================================================
  // Navigation Handlers
  // ========================================================================
  const navigateToCalculator = () => {
    setCurrentPage('calculator')
    window.history.pushState({}, '', '/')
  }

  // ========================================================================
  // Render
  // ========================================================================

  // Docs page
  if (currentPage === 'docs') {
    return <DocsPage onBackToCalculator={navigateToCalculator} />
  }

  // Calculator page
  return (
    <>
      <PageLayout
        left={
          <InputPanel
            state={calculatorState}
            onStateChange={handleStateChange}
            sliderConfig={sliderConfig}
            ccssResult={fiscalResult.ccssResult}
            breakdownRows={fiscalResult.breakdownRows}
            onOpenModal={setOpenModal}
          />
        }
        right={
          <ResultPanel
            result={fiscalResult}
            billedMonths={calculatorState.billedMonths}
            exchangeRate={calculatorState.exchangeRate}
            onOpenModal={setOpenModal}
          />
        }
      />

      {/* Modals - rendered conditionally based on openModal state */}
      <CcssTablesModal
        isOpen={openModal === 'ccss-tables'}
        onClose={() => setOpenModal(null)}
        tablesData={ccssTablesData}
      />

      <RiesgoCcssModal
        isOpen={openModal === 'ccss-riesgo'}
        onClose={() => setOpenModal(null)}
        actualMonthlyIncome={
          calculatorState.currency === 'usd'
            ? calculatorState.monthlyRate * calculatorState.exchangeRate
            : calculatorState.monthlyRate
        }
        ccssConfig={fiscalConfig.ccss}
      />

      <TramoModal
        isOpen={openModal === 'isr-tramos'}
        onClose={() => setOpenModal(null)}
        isrResult={fiscalResult.isrResult}
        regime={calculatorState.regime}
      />

      <PensionFundsModal
        isOpen={openModal === 'pension-funds'}
        onClose={() => setOpenModal(null)}
      />
    </>
  )
}

/**
 * Builds the data structure for the CCSS tables modal.
 * Creates three tables: SEM, IVM, and Summary (combined).
 * Each table shows all 5 categories with the user's current category highlighted.
 */
function buildCcssTablesData(
  ccssResult: {
    category: { cat: number; sem: number; ivm26: number; sem_est: number; ivm_est: number; ivm_lpt: number };
    effectiveIncome: number;
    totalRate: number;
    semAmount: number;
    ivmAmount: number;
    totalAmount: number;
  },
  config: typeof fiscalConfig
): CcssTablesData {
  const userCategory = ccssResult.category.cat
  const userIncome = ccssResult.effectiveIncome

  // Build SEM rows with affiliate/state/joint rates
  const semRows = config.ccss.categorias.map((category, index) => ({
    category: `Cat ${category.cat}`,
    range: config.ui.catRangeLabels[index],
    rate: category.sem,
    stateRate: category.sem_est,
    jointRate: category.sem + category.sem_est,
    amount: category.sem * userIncome,
    isCurrentUser: category.cat === userCategory,
  }))

  // Build IVM rows with affiliate/state/joint rates
  const ivmRows = config.ccss.categorias.map((category, index) => {
    const stateRate = category.ivm_est + category.ivm_lpt
    return {
      category: `Cat ${category.cat}`,
      range: config.ui.catRangeLabels[index],
      rate: category.ivm26,
      stateRate,
      jointRate: category.ivm26 + stateRate,
      amount: category.ivm26 * userIncome,
      isCurrentUser: category.cat === userCategory,
    }
  })

  // Build summary rows (SEM + IVM affiliate rates only)
  const summaryRows = config.ccss.categorias.map((category, index) => ({
    category: `Cat ${category.cat}`,
    range: config.ui.catRangeLabels[index],
    rate: category.sem + category.ivm26,
    amount: (category.sem + category.ivm26) * userIncome,
    isCurrentUser: category.cat === userCategory,
  }))

  return {
    semRows,
    ivmRows,
    summaryRows,
    userCategory,
    currentUserTotal: ccssResult.totalAmount,
    currentUserSem: ccssResult.semAmount,
    currentUserIvm: ccssResult.ivmAmount,
  }
}

export default App
