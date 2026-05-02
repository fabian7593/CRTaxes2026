/**
 * CCSS (Costa Rican Social Security) calculation utilities.
 * 
 * CCSS has two main components:
 * - SEM (Seguro de Enfermedad y Maternidad): Health insurance
 * - IVM (Invalidez, Vejez y Muerte): Pension/retirement insurance
 * 
 * Workers are classified into 5 contributive categories based on their income.
 * Each category has different rates for SEM and IVM.
 * 
 * All functions are pure (no side effects) and receive configuration as parameters
 * to make them testable and maintainable.
 */

import type { CcssConfig, CcssCategory, CcssResult, CcssTablesData, CcssTableRow } from '@/types/fiscal.types';

/**
 * Calculates the CCSS contribution category and amounts for a given monthly income.
 * 
 * The CCSS always applies a minimum contribution base (BMC). Even if the worker's
 * income is below the BMC, they must contribute as if they earned the BMC amount.
 * 
 * @param monthlyIncomeInColones - The worker's monthly income in colones
 * @param ccssConfig - CCSS configuration from fiscal.config.json
 * @returns Complete CCSS calculation result with category, rates, and amounts
 * 
 * @example
 * const result = getCat(1500000, fiscalConfig.ccss);
 * // Returns category 3 with SEM and IVM amounts calculated
 */
export function getCat(monthlyIncomeInColones: number, ccssConfig: CcssConfig): CcssResult {
  // CCSS always charges at least the minimum contribution base (BMC)
  // Even if income is lower, the worker must contribute based on BMC
  const effectiveIncome = Math.max(ccssConfig.baseMinimaContribucion, monthlyIncomeInColones);

  // Find which category (1-5) the worker falls into based on their income
  // Categories are ordered from lowest to highest income ranges
  // The last category (5) has no maximum limit (max = null)
  const matchingCategory = ccssConfig.categorias.find(
    (category) => effectiveIncome <= (category.max ?? Infinity)
  );

  // If no category matches (shouldn't happen), default to category 5 (highest)
  const contributionCategory = matchingCategory ?? ccssConfig.categorias[4];

  // Calculate the combined rate (IVM 2026 + SEM)
  const totalContributionRate = contributionCategory.ivm26 + contributionCategory.sem;

  // Calculate monthly contribution amounts for each component
  const semMonthlyAmount = contributionCategory.sem * effectiveIncome;
  const ivmMonthlyAmount = contributionCategory.ivm26 * effectiveIncome;
  const totalMonthlyAmount = totalContributionRate * effectiveIncome;

  return {
    category: contributionCategory,
    effectiveIncome,
    totalRate: totalContributionRate,
    semAmount: semMonthlyAmount,
    ivmAmount: ivmMonthlyAmount,
    totalAmount: totalMonthlyAmount,
  };
}

/**
 * Builds the data structure for the CCSS tables modal.
 * 
 * The modal shows three tables:
 * 1. SEM table: Health insurance rates and amounts for all 5 categories
 * 2. IVM table: Pension rates and amounts for all 5 categories
 * 3. Summary table: Combined rates and total amounts for all 5 categories
 * 
 * Each table highlights the user's current category with "vos" (you) indicator.
 * 
 * @param ccssBase - The effective income used for CCSS calculation (at least BMC)
 * @param currentCategoryInfo - The user's current CCSS calculation result
 * @param ccssConfig - CCSS configuration from fiscal.config.json
 * @returns Data structure ready for rendering in the CCSS tables modal
 * 
 * @example
 * const tablesData = buildCcssTablesData(1500000, ccssResult, fiscalConfig.ccss);
 * // Returns { semRows, ivmRows, summaryRows, userCategory }
 */
export function buildCcssTablesData(
  ccssBase: number,
  currentCategoryInfo: CcssResult,
  ccssConfig: CcssConfig
): CcssTablesData {
  const userCategoryNumber = currentCategoryInfo.category.cat;

  // Build SEM (health insurance) table rows
  const semRows: CcssTableRow[] = ccssConfig.categorias.map((category) => {
    // Calculate the amount for this category using the user's effective income
    // This shows "what if you were in this category" for comparison
    const amount = category.sem * ccssBase;
    
    return {
      category: category.cat,
      range: getCategoryRangeLabel(category, ccssConfig),
      rate: category.sem,
      amount,
      isCurrentUser: category.cat === userCategoryNumber,
    };
  });

  // Build IVM (pension) table rows
  const ivmRows: CcssTableRow[] = ccssConfig.categorias.map((category) => {
    const amount = category.ivm26 * ccssBase;
    
    return {
      category: category.cat,
      range: getCategoryRangeLabel(category, ccssConfig),
      rate: category.ivm26,
      amount,
      isCurrentUser: category.cat === userCategoryNumber,
    };
  });

  // Build summary table rows (combined SEM + IVM)
  const summaryRows: CcssTableRow[] = ccssConfig.categorias.map((category) => {
    const combinedRate = category.sem + category.ivm26;
    const amount = combinedRate * ccssBase;
    
    return {
      category: category.cat,
      range: getCategoryRangeLabel(category, ccssConfig),
      rate: combinedRate,
      amount,
      isCurrentUser: category.cat === userCategoryNumber,
    };
  });

  return {
    semRows,
    ivmRows,
    summaryRows,
    userCategory: userCategoryNumber,
  };
}

/**
 * Gets the display label for a CCSS category's income range.
 * 
 * @param category - The CCSS category
 * @param ccssConfig - CCSS configuration (needed for BMC and formatting)
 * @returns Formatted range label like "₡341.228 – ₡734.217" or "más de ₡2.202.651"
 */
function getCategoryRangeLabel(category: CcssCategory, ccssConfig: CcssConfig): string {
  // Category 1: "hasta ₡341.227" (up to the max)
  if (category.cat === 1) {
    return `hasta ₡${formatCurrency(category.max ?? 0)}`;
  }
  
  // Category 5: "más de ₡2.202.651" (no upper limit)
  if (category.cat === 5 || category.max === null) {
    // Get the max of category 4 to show "more than X"
    const previousCategory = ccssConfig.categorias[category.cat - 2];
    return `más de ₡${formatCurrency(previousCategory.max ?? 0)}`;
  }
  
  // Categories 2-4: "₡X – ₡Y" (range)
  const previousCategory = ccssConfig.categorias[category.cat - 2];
  const rangeStart = (previousCategory.max ?? 0) + 1;
  const rangeEnd = category.max ?? 0;
  
  return `₡${formatCurrency(rangeStart)} – ₡${formatCurrency(rangeEnd)}`;
}

/**
 * Formats a number as currency with thousands separators (Costa Rican format).
 * Uses dots as thousands separators (e.g., 1.500.000).
 * 
 * @param amount - The amount to format
 * @returns Formatted string like "1.500.000"
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
