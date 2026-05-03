/**
 * TypeScript type definitions for the Costa Rican Tax Calculator.
 * All types are derived from src/config/fiscal.config.json structure.
 * 
 * These types ensure type safety across the application and make the
 * fiscal configuration structure explicit and maintainable.
 */

// ============================================================================
// Regime Types
// ============================================================================

/**
 * Available fiscal regimes in Costa Rica.
 * Each regime has different rules for CCSS, ISR, and tax credits.
 */
export type RegimeType = 
  | 'personaFisicaIndependiente'  // Independent worker (freelancer, contractor)
  | 'personaFisicaMixta'           // Mixed regime (salary + independent income)
  | 'sociedadAnonima'              // Corporation (S.A.)
  | 'sociedadResponsabilidadLimitada'; // Limited Liability Company (S.R.L.)

/**
 * Configuration for a fiscal regime.
 * Defines which taxes and credits apply to this regime type.
 */
export interface RegimeConfig {
  nombre: string;
  descripcion: string;
  aplicaCCSS: boolean;
  aplicaCreditos: boolean;
  tramosISR: 'tramosPersonaFisica' | 'tramosPersonaJuridica';
  impuestoAnualFijo?: number;
  nota?: string;
}

// ============================================================================
// CCSS (Social Security) Types
// ============================================================================

/**
 * CCSS contributive category (1-5).
 * Each category has different rates for IVM (pension) and SEM (health insurance).
 */
export interface CcssCategory {
  cat: number;                    // Category number (1-5)
  max: number | null;             // Maximum income for this category (null = no limit)
  ivm26: number;                  // IVM rate for 2026 (worker contribution)
  ivm_est: number;                // IVM state contribution rate
  ivm_lpt: number;                // IVM LPT rate
  sem: number;                    // SEM rate (health insurance)
  sem_est: number;                // SEM state contribution rate
}

/**
 * Result of CCSS calculation for a given income.
 * Includes the category, effective income, rates, and monthly amounts.
 */
export interface CcssResult {
  category: CcssCategory;         // The category this income falls into
  effectiveIncome: number;        // Income used for calculation (at least BMC)
  totalRate: number;              // Combined IVM + SEM rate
  semAmount: number;              // Monthly SEM contribution
  ivmAmount: number;              // Monthly IVM contribution
  totalAmount: number;            // Total monthly CCSS contribution
}

/**
 * CCSS configuration from fiscal.config.json
 */
export interface CcssConfig {
  baseMinimaContribucion: number;
  salarioBase2026: number;
  tasaInteresesMoratorios: number;
  multaFijaMultiplicador: number;
  categorias: CcssCategory[];
}

// ============================================================================
// ISR (Income Tax) Types
// ============================================================================

/**
 * ISR tax bracket.
 * Costa Rica uses progressive tax brackets where each bracket is taxed at its own rate.
 */
export interface ISRTramo {
  desde: number;                  // Starting amount for this bracket
  hasta: number | null;           // Ending amount (null = no limit)
  tasa: number;                   // Tax rate for this bracket (0.00 to 1.00)
  label: string;                  // Display label (e.g., "Exento", "10%")
}

/**
 * Detailed breakdown of tax calculation for a single bracket.
 */
export interface ISRTramoDetalle {
  tramo: ISRTramo;                // The bracket definition
  base: number;                   // Amount of income taxed in this bracket
  impuesto: number;               // Tax amount for this bracket
}

/**
 * Result of ISR calculation.
 * Includes total tax and detailed breakdown by bracket.
 */
export interface ISRResult {
  total: number;                  // Total ISR amount
  detalles: ISRTramoDetalle[];    // Breakdown by bracket
}

/**
 * ISR configuration from fiscal.config.json
 */
export interface ISRConfig {
  tramosPersonaFisica: ISRTramo[];
  tramosPersonaJuridica: ISRTramo[];
}

// ============================================================================
// Tax Credits and Deductions Types
// ============================================================================

/**
 * Tax credits configuration (only for persona física)
 */
export interface CreditosConfig {
  porHijo: number;                // Credit per child
  porConyuge: number;             // Credit for spouse
}

/**
 * Deductions configuration
 */
export interface DeduccionesConfig {
  pctFicto: number;               // Fictitious deduction percentage (25%)
  pctPensionVoluntariaMaximo: number; // Max voluntary pension deduction (10%)
  ccssObreroEstimado: number;     // Estimated worker CCSS rate for salary
}

// ============================================================================
// Exchange Rate Types
// ============================================================================

/**
 * Exchange rate configuration
 */
export interface TipoCambioConfig {
  ventaDefault: number;           // Default sell rate (USD to CRC)
  compraDefault: number;          // Default buy rate (CRC to USD)
  apiUrl: string;                 // API endpoint for live rates
  timeoutMs: number;              // API timeout in milliseconds
}

/**
 * Exchange rate API response
 */
export interface TipoCambioResponse {
  venta: number;
  compra: number;
  fecha: string;
}

// ============================================================================
// Slider Configuration Types
// ============================================================================

/**
 * Configuration for a single slider
 */
export interface SliderConfig {
  min: number;
  max: number;
  step: number;
  default?: number;
}

/**
 * Currency-specific slider configuration
 */
export interface CurrencySliderConfig {
  usd: SliderConfig;
  crc: SliderConfig;
}

/**
 * All slider configurations
 */
export interface SlidersConfig {
  tarifa: CurrencySliderConfig;
  tipoCambio: SliderConfig;
  meses: SliderConfig;
  salario: SliderConfig;
  gastos: SliderConfig;
  hijos: SliderConfig;
}

// ============================================================================
// UI Configuration Types
// ============================================================================

/**
 * UI labels and display strings
 */
export interface UIConfig {
  catRangeLabels: string[];       // CCSS category range labels for display
}

// ============================================================================
// Complete Fiscal Configuration Type
// ============================================================================

/**
 * Complete fiscal configuration structure.
 * This matches the structure of src/config/fiscal.config.json
 */
export interface FiscalConfig {
  _comment: string;
  _version: string;
  _fuentes: {
    ccss: string;
    isr: string;
    creditos: string;
    sanciones: string;
    sociedades: string;
  };
  regimenes: Record<RegimeType, RegimeConfig>;
  ccss: CcssConfig;
  isr: ISRConfig;
  creditos: CreditosConfig;
  deducciones: DeduccionesConfig;
  tipoCambio: TipoCambioConfig;
  sliders: SlidersConfig;
  ui: UIConfig;
}

// ============================================================================
// Calculator State Types
// ============================================================================

/**
 * Currency type for the calculator
 */
export type CurrencyType = 'usd' | 'crc';

/**
 * Regime type for the calculator (simplified for UI)
 */
export type CalculatorRegimeType = 'solo' | 'mixto';

/**
 * Client type (affects IVA calculation)
 */
export type ClientType = 'ext' | 'loc';

/**
 * Deduction type
 */
export type DeductionType = 'ficto' | 'real';

/**
 * Complete calculator state.
 * This represents all user inputs and configuration for the calculator.
 */
export interface CalculatorState {
  // Currency and rate
  currency: CurrencyType;
  monthlyRate: number;            // Monthly rate in selected currency
  exchangeRate: number;           // Exchange rate (CRC per USD)
  isManualExchangeRate: boolean;  // Whether user manually changed exchange rate
  
  // Time period
  billedMonths: number;           // Number of months billed per year (1-12)
  
  // Regime
  regime: CalculatorRegimeType;   // 'solo' or 'mixto'
  annualSalary: number;           // Annual salary (only for mixto regime)
  
  // Deductions
  deductionType: DeductionType;   // 'ficto' (25%) or 'real' (documented expenses)
  documentedExpenses: number;     // Documented expenses (only for 'real' deduction)
  hasVoluntaryPension: boolean;   // Whether voluntary pension is enabled (RVP)
  
  // Tax credits (only for persona física)
  numberOfChildren: number;       // Number of children (0-8)
  hasSpouse: boolean;             // Whether user has a spouse
  
  // Client type (affects IVA)
  clientType: ClientType;         // 'ext' (export) or 'loc' (local)
}

// ============================================================================
// Result Display Types
// ============================================================================

/**
 * Row in the breakdown table.
 * Each row shows a line item in the detailed breakdown.
 */
export interface BreakdownRow {
  label: string;                  // Display label
  valueCRC: number;               // Value in colones
  valueUSD: number;               // Value in dollars
  type: 'section' | 'item' | 'subtotal' | 'total'; // Row type
  colorClass?: 'pos' | 'neg' | 'neu'; // Color class (positive/negative/neutral)
  tooltip?: string;               // Optional tooltip text
  icon?: string;                  // Optional icon (emoji)
}

/**
 * Segment in the distribution bar.
 * Shows visual breakdown of income distribution.
 */
export interface DistributionSegment {
  label: string;                  // Segment label
  percentage: number;             // Percentage of total (0-100)
  color: string;                  // CSS color value
  amount: number;                 // Amount in CRC
}

/**
 * Row in the annual summary table
 */
export interface AnnualSummaryRow {
  label: string;                  // Display label
  valueCRC: number;               // Value in colones
  valueUSD: number;               // Value in dollars
  isTotal?: boolean;              // Whether this is the total row
}

// ============================================================================
// Complete Calculation Result Type
// ============================================================================

/**
 * Complete result of all fiscal calculations.
 * This is what useFiscalCalculator returns.
 */
export interface FiscalCalculationResult {
  // CCSS calculation
  ccssResult: CcssResult;
  
  // ISR calculation
  isrResult: ISRResult;
  taxCredits: number;             // Total tax credits applied
  finalIncomeTax: number;         // Final ISR after credits
  
  // Income breakdown
  annualGrossIncome: number;      // Total annual gross income
  annualNetIncome: number;        // Annual net after all taxes
  monthlyNetIncome: number;       // Monthly net (annual / billed months)
  
  // Display data
  distributionSegments: DistributionSegment[];
  breakdownRows: BreakdownRow[];
  annualSummaryRows: AnnualSummaryRow[];
}

// ============================================================================
// Modal State Types
// ============================================================================

/**
 * Which modal is currently open (if any)
 */
export type OpenModalType = null | 'ccss-tables' | 'ccss-riesgo' | 'isr-tramos' | 'pension-funds';

/**
 * Page type for simple routing
 */
export type PageType = 'calculator' | 'docs';

// ============================================================================
// CCSS Tables Data Types (for modal display)
// ============================================================================

/**
 * Row in a CCSS table (SEM or IVM)
 */
export interface CcssTableRow {
  category: string;               // Category label (e.g., "Cat 1")
  range: string;                  // Income range label
  rate: number;                   // Affiliate rate for this category
  stateRate?: number;             // State contribution rate (for SEM/IVM tables)
  jointRate?: number;             // Joint rate (for SEM/IVM tables)
  amount: number;                 // Calculated amount
  isCurrentUser: boolean;         // Whether this is the user's category
}

/**
 * Data for CCSS tables modal
 */
export interface CcssTablesData {
  semRows: CcssTableRow[];        // SEM table rows
  ivmRows: CcssTableRow[];        // IVM table rows
  summaryRows: CcssTableRow[];    // Summary table rows
  userCategory: number;           // User's current category
  currentUserTotal: number;       // Current user's total monthly CCSS
  currentUserSem: number;         // Current user's monthly SEM
  currentUserIvm: number;         // Current user's monthly IVM
}

// ============================================================================
// CCSS Risk Calculation Types
// ============================================================================

/**
 * Result of CCSS risk calculation (subdeclaration penalty)
 */
export interface CcssRiskResult {
  hasRisk: boolean;               // Whether there is exposure
  declaredAmount: number;         // Amount declared to CCSS
  actualAmount: number;           // Actual income amount
  difference: number;             // Underdeclared amount
  monthlyPenalty: number;         // Monthly penalty amount
  annualPenalty: number;          // Annual penalty amount
  interestRate: number;           // Interest rate applied
  fixedFineMultiplier: number;    // Fixed fine multiplier
}
