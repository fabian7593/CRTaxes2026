/**
 * Main fiscal calculator hook.
 * 
 * This hook orchestrates all fiscal calculations for the Costa Rican tax calculator.
 * It takes the current calculator state and fiscal configuration, then computes:
 * - CCSS contributions (social security)
 * - ISR (income tax) with proper bracket handling
 * - Tax credits (children, spouse)
 * - Deductions (fictitious 25% or real expenses, voluntary pension)
 * - Net income (monthly and annual)
 * - Visual data for charts and tables
 * 
 * Uses useMemo to avoid recalculating when inputs haven't changed.
 * All calculations are delegated to pure utility functions for testability.
 */

import { useMemo } from 'react';
import type { 
  CalculatorState, 
  FiscalConfig, 
  FiscalCalculationResult,
  DistributionSegment,
  BreakdownRow,
  AnnualSummaryRow
} from '@/types/fiscal.types';
import { getCat } from '@/utils/ccss.utils';
import { calculateIncomeTax, calculateMixedRegimeIncomeTax } from '@/utils/isr.utils';
import { formatColones, formatDollars, formatPercentage } from '@/utils/formatters';

/**
 * Calculates all fiscal values based on current calculator state.
 * 
 * @param calculatorState - Current state of all user inputs
 * @param fiscalConfig - Fiscal configuration from fiscal.config.json
 * @returns Complete calculation result with all values needed for display
 */
export function useFiscalCalculator(
  calculatorState: CalculatorState,
  fiscalConfig: FiscalConfig
): FiscalCalculationResult {
  return useMemo(() => {
    // ========================================================================
    // Step 1: Convert monthly rate to CRC regardless of selected currency
    // ========================================================================
    // All calculations are done in CRC internally. If the user selected USD,
    // we convert using the current exchange rate.
    const monthlyIncomeInColones =
      calculatorState.currency === 'usd'
        ? calculatorState.monthlyRate * calculatorState.exchangeRate
        : calculatorState.monthlyRate;

    // ========================================================================
    // Step 2: Calculate CCSS (social security) contribution
    // ========================================================================
    // CCSS uses a contributive scale with 5 categories. Each category has
    // different rates for SEM (health) and IVM (pension).
    const ccssResult = getCat(monthlyIncomeInColones, fiscalConfig.ccss);

    // ========================================================================
    // Step 3: Calculate annual gross income
    // ========================================================================
    // ISR is always calculated annually in Costa Rica, not monthly.
    // The user specifies how many months they bill per year (1-12).
    const annualGrossIncome = monthlyIncomeInColones * calculatorState.billedMonths;

    // Annual CCSS contribution (12 months, not based on billed months)
    // CCSS is paid every month regardless of how many months you bill clients
    const annualCcssContribution = ccssResult.totalAmount * 12;

    // ========================================================================
    // Step 4: Calculate deductions to get taxable income
    // ========================================================================
    let totalDeductions = 0;
    let fictitiousDeduction = 0;
    let realExpensesDeduction = 0;
    let voluntaryPensionDeduction = 0;
    let ccssDeduction = 0;

    // Voluntary pension deduction (RVP - Régimen Voluntario de Pensiones)
    // Can deduct up to 10% of gross income (art. 71 Ley 7983)
    const maxVoluntaryPension = annualGrossIncome * fiscalConfig.deducciones.pctPensionVoluntariaMaximo;
    voluntaryPensionDeduction = Math.min(calculatorState.voluntaryPensionAmount, maxVoluntaryPension);

    if (calculatorState.deductionType === 'ficto') {
      // Fictitious deduction: 25% of gross income (art. 8 inc. b)
      // Plus the full annual CCSS contribution as an additional deduction
      fictitiousDeduction = annualGrossIncome * fiscalConfig.deducciones.pctFicto;
      ccssDeduction = annualCcssContribution;
      totalDeductions = fictitiousDeduction + ccssDeduction + voluntaryPensionDeduction;
    } else {
      // Real expenses: documented expenses + CCSS
      // Note: CCSS is NOT deducted additionally when using real expenses
      realExpensesDeduction = calculatorState.documentedExpenses;
      ccssDeduction = annualCcssContribution;
      totalDeductions = realExpensesDeduction + ccssDeduction + voluntaryPensionDeduction;
    }

    // Taxable income = gross - deductions (cannot be negative)
    const taxableIncome = Math.max(0, annualGrossIncome - totalDeductions);

    // ========================================================================
    // Step 5: Calculate ISR (income tax)
    // ========================================================================
    // Two different calculation methods:
    // - Solo regime: standard progressive brackets
    // - Mixed regime: salary consumes exempt bracket first, then independent
    //   income is taxed starting from where salary left off
    const isrResult =
      calculatorState.regime === 'solo'
        ? calculateIncomeTax(taxableIncome, fiscalConfig.isr.tramosPersonaFisica)
        : calculateMixedRegimeIncomeTax(
            taxableIncome,
            calculatorState.annualSalary,
            fiscalConfig.isr.tramosPersonaFisica
          );

    // ========================================================================
    // Step 6: Apply tax credits
    // ========================================================================
    // Tax credits reduce the final tax amount (not the taxable income).
    // Only available for persona física (not for sociedades).
    const childrenCredit = calculatorState.numberOfChildren * fiscalConfig.creditos.porHijo;
    const spouseCredit = calculatorState.hasSpouse ? fiscalConfig.creditos.porConyuge : 0;
    const totalTaxCredits = childrenCredit + spouseCredit;

    // Final ISR after credits (cannot be negative)
    const finalIncomeTax = Math.max(0, isrResult.total - totalTaxCredits);

    // ========================================================================
    // Step 7: Calculate net income
    // ========================================================================
    // Net = Gross - CCSS - ISR
    const annualNetIncome = annualGrossIncome - annualCcssContribution - finalIncomeTax;
    
    // Monthly net is the annual net divided by the number of months billed
    // (not 12, because you might only bill 10 months for example)
    const monthlyNetIncome = annualNetIncome / calculatorState.billedMonths;

    // Monthly values for display
    const monthlyCcss = ccssResult.totalAmount;
    const monthlyIsr = finalIncomeTax / calculatorState.billedMonths;

    // ========================================================================
    // Step 8: Build distribution segments for the visual bar
    // ========================================================================
    // Shows how the gross income is distributed: Net, ISR, CCSS, Pension
    const distributionSegments: DistributionSegment[] = [];

    // Calculate percentages
    const netPercentage = (annualNetIncome / annualGrossIncome) * 100;
    const isrPercentage = (finalIncomeTax / annualGrossIncome) * 100;
    const ccssPercentage = (annualCcssContribution / annualGrossIncome) * 100;
    const pensionPercentage = (voluntaryPensionDeduction / annualGrossIncome) * 100;

    // Only add segments with meaningful percentages (> 0.1%)
    if (netPercentage > 0.1) {
      distributionSegments.push({
        label: 'Neto',
        percentage: netPercentage,
        color: 'var(--emerald)',
        amount: annualNetIncome,
      });
    }

    if (isrPercentage > 0.1) {
      distributionSegments.push({
        label: 'ISR',
        percentage: isrPercentage,
        color: 'var(--violet)',
        amount: finalIncomeTax,
      });
    }

    if (ccssPercentage > 0.1) {
      distributionSegments.push({
        label: 'CCSS',
        percentage: ccssPercentage,
        color: 'var(--crimson)',
        amount: annualCcssContribution,
      });
    }

    if (pensionPercentage > 0.1) {
      distributionSegments.push({
        label: 'Pensión',
        percentage: pensionPercentage,
        color: 'var(--amber)',
        amount: voluntaryPensionDeduction,
      });
    }

    // ========================================================================
    // Step 9: Build breakdown rows for the detailed table
    // ========================================================================
    const breakdownRows: BreakdownRow[] = [];

    // Section: Ingreso bruto
    breakdownRows.push({
      label: 'Ingreso bruto',
      valueCRC: monthlyIncomeInColones,
      valueUSD: monthlyIncomeInColones / calculatorState.exchangeRate,
      type: 'section',
    });

    breakdownRows.push({
      label: `Tarifa mensual × ${calculatorState.billedMonths} meses`,
      valueCRC: monthlyIncomeInColones,
      valueUSD: monthlyIncomeInColones / calculatorState.exchangeRate,
      type: 'item',
      colorClass: 'pos',
    });

    // Section: Deducciones
    breakdownRows.push({
      label: 'Deducciones',
      valueCRC: 0,
      valueUSD: 0,
      type: 'section',
    });

    if (calculatorState.deductionType === 'ficto') {
      breakdownRows.push({
        label: 'Deducción ficta 25% (art. 8 inc. b)',
        valueCRC: -fictitiousDeduction / 12,
        valueUSD: -fictitiousDeduction / 12 / calculatorState.exchangeRate,
        type: 'item',
        colorClass: 'neg',
        tooltip: 'Deducción automática del 25% del ingreso bruto sin necesidad de documentar gastos',
      });
    } else {
      breakdownRows.push({
        label: 'Gastos reales documentados',
        valueCRC: -realExpensesDeduction / 12,
        valueUSD: -realExpensesDeduction / 12 / calculatorState.exchangeRate,
        type: 'item',
        colorClass: 'neg',
        tooltip: 'Gastos documentados con facturas electrónicas',
      });
    }

    breakdownRows.push({
      label: 'CCSS anual deducible',
      valueCRC: -ccssDeduction / 12,
      valueUSD: -ccssDeduction / 12 / calculatorState.exchangeRate,
      type: 'item',
      colorClass: 'neg',
      tooltip: 'Cuotas CCSS pagadas son deducibles del ISR',
    });

    if (voluntaryPensionDeduction > 0) {
      breakdownRows.push({
        label: 'Pensión voluntaria (RVP)',
        valueCRC: -voluntaryPensionDeduction / 12,
        valueUSD: -voluntaryPensionDeduction / 12 / calculatorState.exchangeRate,
        type: 'item',
        colorClass: 'neg',
        tooltip: 'Régimen Voluntario de Pensiones (art. 71 Ley 7983)',
      });
    }

    // Subtotal: Renta neta
    breakdownRows.push({
      label: 'Renta neta (base imponible)',
      valueCRC: taxableIncome / 12,
      valueUSD: taxableIncome / 12 / calculatorState.exchangeRate,
      type: 'subtotal',
      colorClass: 'neu',
    });

    // Section: Impuestos
    breakdownRows.push({
      label: 'Impuestos',
      valueCRC: 0,
      valueUSD: 0,
      type: 'section',
    });

    breakdownRows.push({
      label: `CCSS Cat. ${ccssResult.category.cat} (${formatPercentage(ccssResult.totalRate)})`,
      valueCRC: -monthlyCcss,
      valueUSD: -monthlyCcss / calculatorState.exchangeRate,
      type: 'item',
      colorClass: 'neg',
      icon: '🏥',
      tooltip: `SEM ${formatPercentage(ccssResult.category.sem)} + IVM ${formatPercentage(ccssResult.category.ivm26)}`,
    });

    breakdownRows.push({
      label: 'ISR escalonado',
      valueCRC: -monthlyIsr,
      valueUSD: -monthlyIsr / calculatorState.exchangeRate,
      type: 'item',
      colorClass: 'neg',
      icon: '📊',
      tooltip: 'Impuesto sobre la Renta calculado con tramos progresivos',
    });

    if (totalTaxCredits > 0) {
      breakdownRows.push({
        label: 'Créditos fiscales',
        valueCRC: totalTaxCredits / 12,
        valueUSD: totalTaxCredits / 12 / calculatorState.exchangeRate,
        type: 'item',
        colorClass: 'pos',
        icon: '👨‍👩‍👧‍👦',
        tooltip: `${calculatorState.numberOfChildren} hijo(s) + ${calculatorState.hasSpouse ? '1' : '0'} cónyuge`,
      });
    }

    // Total: Neto mensual
    breakdownRows.push({
      label: 'Neto mensual',
      valueCRC: monthlyNetIncome,
      valueUSD: monthlyNetIncome / calculatorState.exchangeRate,
      type: 'total',
      colorClass: 'pos',
    });

    // ========================================================================
    // Step 10: Build annual summary rows
    // ========================================================================
    const annualSummaryRows: AnnualSummaryRow[] = [
      {
        label: 'Ingreso bruto anual',
        valueCRC: annualGrossIncome,
        valueUSD: annualGrossIncome / calculatorState.exchangeRate,
      },
      {
        label: 'CCSS anual',
        valueCRC: annualCcssContribution,
        valueUSD: annualCcssContribution / calculatorState.exchangeRate,
      },
      {
        label: 'ISR anual',
        valueCRC: finalIncomeTax,
        valueUSD: finalIncomeTax / calculatorState.exchangeRate,
      },
      {
        label: 'Neto anual',
        valueCRC: annualNetIncome,
        valueUSD: annualNetIncome / calculatorState.exchangeRate,
        isTotal: true,
      },
    ];

    // ========================================================================
    // Return complete calculation result
    // ========================================================================
    return {
      ccssResult,
      isrResult,
      taxCredits: totalTaxCredits,
      finalIncomeTax,
      annualGrossIncome,
      annualNetIncome,
      monthlyNetIncome,
      distributionSegments,
      breakdownRows,
      annualSummaryRows,
    };
  }, [calculatorState, fiscalConfig]);
}
