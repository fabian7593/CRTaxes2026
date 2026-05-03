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
import { formatPercentage, formatColones, formatDollars } from '@/utils/formatters';

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
    // Automatically calculates 10% of gross income when enabled (art. 71 Ley 7983)
    voluntaryPensionDeduction = calculatorState.hasVoluntaryPension
      ? annualGrossIncome * fiscalConfig.deducciones.pctPensionVoluntariaMaximo
      : 0;

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
    const annualNetIncome = Math.round(annualGrossIncome - annualCcssContribution - finalIncomeTax);
    
    // Monthly net is the annual net divided by the number of months billed
    // (not 12, because you might only bill 10 months for example)
    const monthlyNetIncome = Math.round(annualNetIncome / calculatorState.billedMonths);

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
    // Step 9: Build breakdown rows for the detailed annual table
    // ========================================================================
    const breakdownRows: BreakdownRow[] = [];

    // Row 1: SP bruto (annual gross income)
    breakdownRows.push({
      label: `SP bruto (${calculatorState.billedMonths} meses × ${calculatorState.currency === 'usd' ? formatDollars(calculatorState.monthlyRate) : formatColones(calculatorState.monthlyRate)})`,
      valueCRC: annualGrossIncome,
      valueUSD: annualGrossIncome / calculatorState.exchangeRate,
      type: 'item',
      colorClass: 'pos',
      tooltip: 'Ingreso total del año por servicios profesionales antes de cualquier deducción o impuesto.',
    });

    // Row 2: Deduction (fictitious or real expenses)
    if (calculatorState.deductionType === 'ficto') {
      breakdownRows.push({
        label: 'Deducible ficto 25% (art. 8 Ley 7092)',
        valueCRC: -fictitiousDeduction,
        valueUSD: -fictitiousDeduction / calculatorState.exchangeRate,
        type: 'item',
        colorClass: 'neg',
        tooltip: 'La ley permite deducir automáticamente el 25% del ingreso bruto sin necesidad de presentar facturas ni comprobantes. Es la opción más simple para servicios digitales.',
      });
    } else {
      breakdownRows.push({
        label: 'Gastos reales documentados',
        valueCRC: -realExpensesDeduction,
        valueUSD: -realExpensesDeduction / calculatorState.exchangeRate,
        type: 'item',
        colorClass: 'neg',
        tooltip: 'Gastos documentados con facturas electrónicas válidas.',
      });
    }

    // Row 3: Voluntary pension (if enabled)
    if (voluntaryPensionDeduction > 0) {
      breakdownRows.push({
        label: 'Pensión voluntaria deducible 10% (art. 71 Ley 7983)',
        valueCRC: -voluntaryPensionDeduction,
        valueUSD: -voluntaryPensionDeduction / calculatorState.exchangeRate,
        type: 'item',
        colorClass: 'neg',
        tooltip: 'Aporte voluntario a una OPC (BAC Pensiones, BCR, BN Vital, Popular). Deducible hasta el 10% del ingreso bruto anual según art. 71 Ley 7983. Reduce la base imponible del ISR.',
      });
    }

    // Row 4: CCSS deductible (only if using fictitious deduction)
    if (calculatorState.deductionType === 'ficto') {
      breakdownRows.push({
        label: 'CCSS TI deducible adicional (art. 8 inc. b)',
        valueCRC: -ccssDeduction,
        valueUSD: -ccssDeduction / calculatorState.exchangeRate,
        type: 'item',
        colorClass: 'neg',
        tooltip: 'Si usás deducción ficta del 25%, podés deducir adicionalmente la CCSS anual completa según art. 8 inc. b) Ley 7092. No aplica si usás gastos reales.',
      });
    }

    // Subtotal: Renta neta imponible
    breakdownRows.push({
      label: '= Renta neta imponible',
      valueCRC: taxableIncome,
      valueUSD: taxableIncome / calculatorState.exchangeRate,
      type: 'subtotal',
      icon: '📊',
      tooltip: 'Base sobre la cual se calculan los tramos del ISR. Es el ingreso bruto menos todas las deducciones permitidas.',
    });

    // Row: ISR escalonado
    breakdownRows.push({
      label: 'ISR escalonado (tramos 2026)',
      valueCRC: -isrResult.total,
      valueUSD: -isrResult.total / calculatorState.exchangeRate,
      type: 'item',
      colorClass: 'neg',
      tooltip: 'Impuesto calculado aplicando los tramos escalonados 2026 (0%, 10%, 15%, 20%, 25%) sobre la renta neta.',
    });

    // Row: Tax credits (if any)
    if (totalTaxCredits > 0) {
      breakdownRows.push({
        label: `Créditos fiscales (${calculatorState.numberOfChildren} hijo(s)${calculatorState.hasSpouse ? ' + cónyuge' : ''})`,
        valueCRC: totalTaxCredits,
        valueUSD: totalTaxCredits / calculatorState.exchangeRate,
        type: 'item',
        colorClass: 'pos',
        tooltip: 'Créditos fiscales por hijos y cónyuge que reducen el ISR a pagar.',
      });
    }

    // Subtotal: ISR definitivo
    breakdownRows.push({
      label: '= ISR definitivo',
      valueCRC: -finalIncomeTax,
      valueUSD: -finalIncomeTax / calculatorState.exchangeRate,
      type: 'subtotal',
      icon: '💰',
      colorClass: 'neg',
      tooltip: 'ISR bruto menos créditos fiscales. Este es el monto que pagás a Hacienda mediante el D-101.',
    });

    // Row: CCSS annual
    breakdownRows.push({
      label: `CCSS TI (cat. ${ccssResult.category.cat} · ${formatPercentage(ccssResult.totalRate)} · ${formatColones(ccssResult.effectiveIncome)}/mes × 12)`,
      valueCRC: -annualCcssContribution,
      valueUSD: -annualCcssContribution / calculatorState.exchangeRate,
      type: 'item',
      colorClass: 'neg',
      tooltip: 'Cuota anual obligatoria a la CCSS como trabajador independiente. Se calcula según tu categoría (1-5) basada en el ingreso bruto mensual.',
    });

    // Subtotal: Neto anual en bolsillo
    breakdownRows.push({
      label: '= Neto anual en bolsillo',
      valueCRC: annualNetIncome,
      valueUSD: annualNetIncome / calculatorState.exchangeRate,
      type: 'total',
      icon: '✓',
      colorClass: 'pos',
      tooltip: 'Dinero real que te queda en el bolsillo después de pagar CCSS e ISR.',
    });

    // ========================================================================
    // Step 10: Build annual summary rows
    // ========================================================================
    const annualSummaryRows: AnnualSummaryRow[] = [
      {
        label: 'Ingreso bruto anual',
        valueCRC: Math.round(annualGrossIncome),
        valueUSD: Math.round(annualGrossIncome / calculatorState.exchangeRate),
      },
      {
        label: 'CCSS anual',
        valueCRC: -Math.round(annualCcssContribution),
        valueUSD: -Math.round(annualCcssContribution / calculatorState.exchangeRate),
      },
      {
        label: 'ISR anual',
        valueCRC: -Math.round(finalIncomeTax),
        valueUSD: -Math.round(finalIncomeTax / calculatorState.exchangeRate),
      },
      {
        label: 'Ingreso neto anual',
        valueCRC: annualNetIncome,
        valueUSD: Math.round(annualNetIncome / calculatorState.exchangeRate),
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
