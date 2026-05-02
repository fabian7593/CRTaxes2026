/**
 * ISR (Income Tax) calculation utilities for Costa Rica.
 * 
 * Costa Rica uses a progressive tax system where income is taxed in brackets.
 * Each bracket has a rate, and only the income within that bracket is taxed at that rate.
 * 
 * Two calculation modes:
 * 1. Standard (solo regime): All income goes through the brackets normally
 * 2. Mixed regime: Salary income consumes the exempt bracket first, then
 *    independent income is taxed starting from the first taxable bracket
 */

import type { ISRTramo, ISRResult, ISRTramoDetalle } from '@/types/fiscal.types';

/**
 * Calculates ISR (Income Tax) using progressive tax brackets.
 * This is the standard calculation for independent workers (persona física independiente).
 * 
 * The algorithm:
 * 1. Start with the first bracket (usually exempt)
 * 2. For each bracket, calculate how much income falls within it
 * 3. Apply the bracket's rate to that portion
 * 4. Continue until all income is allocated or we reach the last bracket
 * 
 * @param netIncome - Annual net income after deductions (in CRC)
 * @param brackets - ISR tax brackets from fiscal config
 * @returns ISR result with total tax and detailed breakdown by bracket
 */
export function calculateIncomeTax(
  netIncome: number,
  brackets: ISRTramo[]
): ISRResult {
  // If income is zero or negative, no tax is owed
  if (netIncome <= 0) {
    return {
      total: 0,
      detalles: brackets.map((bracket) => ({
        tramo: bracket,
        base: 0,
        impuesto: 0,
      })),
    };
  }

  let remainingIncome = netIncome;
  const details: ISRTramoDetalle[] = [];
  let totalTax = 0;

  // Process each bracket in order
  for (const bracket of brackets) {
    // Calculate the size of this bracket
    const bracketStart = bracket.desde;
    const bracketEnd = bracket.hasta ?? Infinity;
    const bracketSize = bracketEnd - bracketStart;

    // How much income falls into this bracket?
    // It's the minimum of: remaining income, or the bracket size
    const incomeInThisBracket = Math.min(remainingIncome, bracketSize);

    // Calculate tax for this bracket
    const taxForThisBracket = incomeInThisBracket * bracket.tasa;

    // Record the details for this bracket
    details.push({
      tramo: bracket,
      base: incomeInThisBracket,
      impuesto: taxForThisBracket,
    });

    // Accumulate total tax
    totalTax += taxForThisBracket;

    // Reduce remaining income
    remainingIncome -= incomeInThisBracket;

    // If no income remains, we're done (but still need to add empty brackets)
    if (remainingIncome <= 0) {
      // Add remaining brackets with zero values
      const currentIndex = brackets.indexOf(bracket);
      for (let i = currentIndex + 1; i < brackets.length; i++) {
        details.push({
          tramo: brackets[i],
          base: 0,
          impuesto: 0,
        });
      }
      break;
    }
  }

  return {
    total: totalTax,
    detalles: details,
  };
}

/**
 * Calculates ISR for mixed regime (persona física mixta).
 * 
 * In Costa Rica, when you have both salary and independent income:
 * - The salary income "consumes" the exempt bracket first
 * - Any independent income is then taxed starting from where the salary left off
 * - This means independent income often starts being taxed at 10% immediately
 * 
 * Example:
 * - Exempt bracket: ₡0 - ₡6,244,000
 * - Salary: ₡9,600,000/year (consumes all exempt bracket + ₡3,356,000 of 10% bracket)
 * - Independent income: ₡5,000,000
 * - Result: The ₡5,000,000 starts being taxed in the 10% bracket where salary left off
 * 
 * @param netIncome - Annual net income from independent work after deductions (in CRC)
 * @param annualSalary - Annual salary from employment (in CRC)
 * @param brackets - ISR tax brackets from fiscal config
 * @returns ISR result with total tax and detailed breakdown by bracket
 */
export function calculateMixedRegimeIncomeTax(
  netIncome: number,
  annualSalary: number,
  brackets: ISRTramo[]
): ISRResult {
  // If independent income is zero or negative, no tax is owed
  if (netIncome <= 0) {
    return {
      total: 0,
      detalles: brackets.map((bracket) => ({
        tramo: bracket,
        base: 0,
        impuesto: 0,
      })),
    };
  }

  // Step 1: Determine which bracket the salary reaches
  // The salary "consumes" brackets starting from the first one
  let salaryRemaining = annualSalary;
  let startingBracketIndex = 0;
  let offsetWithinStartingBracket = 0;

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const bracketStart = bracket.desde;
    const bracketEnd = bracket.hasta ?? Infinity;
    const bracketSize = bracketEnd - bracketStart;

    if (salaryRemaining <= bracketSize) {
      // The salary ends within this bracket
      startingBracketIndex = i;
      offsetWithinStartingBracket = salaryRemaining;
      break;
    }

    // Salary consumes this entire bracket, move to next
    salaryRemaining -= bracketSize;
  }

  // Step 2: Now calculate tax on independent income starting from where salary left off
  let remainingIncome = netIncome;
  const details: ISRTramoDetalle[] = [];
  let totalTax = 0;

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const bracketStart = bracket.desde;
    const bracketEnd = bracket.hasta ?? Infinity;
    const bracketSize = bracketEnd - bracketStart;

    let availableSpaceInBracket = bracketSize;
    
    // If this is the bracket where salary ended, reduce available space
    if (i === startingBracketIndex) {
      availableSpaceInBracket = bracketSize - offsetWithinStartingBracket;
    }
    
    // If we haven't reached the starting bracket yet, skip it (salary consumed it)
    if (i < startingBracketIndex) {
      details.push({
        tramo: bracket,
        base: 0,
        impuesto: 0,
      });
      continue;
    }

    // How much income falls into this bracket?
    const incomeInThisBracket = Math.min(remainingIncome, availableSpaceInBracket);

    // Calculate tax for this bracket
    const taxForThisBracket = incomeInThisBracket * bracket.tasa;

    // Record the details for this bracket
    details.push({
      tramo: bracket,
      base: incomeInThisBracket,
      impuesto: taxForThisBracket,
    });

    // Accumulate total tax
    totalTax += taxForThisBracket;

    // Reduce remaining income
    remainingIncome -= incomeInThisBracket;

    // If no income remains, we're done (but still need to add empty brackets)
    if (remainingIncome <= 0) {
      // Add remaining brackets with zero values
      for (let j = i + 1; j < brackets.length; j++) {
        details.push({
          tramo: brackets[j],
          base: 0,
          impuesto: 0,
        });
      }
      break;
    }
  }

  return {
    total: totalTax,
    detalles: details,
  };
}
