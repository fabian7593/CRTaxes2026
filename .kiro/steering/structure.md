---
inclusion: always
---

# Project Structure — Calculadora Fiscal CR 2026

## Estructura de carpetas

```
cr-tax-calculator/
├── index.html                          ← entry point Vite (incluye Google Fonts)
├── vite.config.ts
├── tsconfig.json
├── vercel.json
├── package.json
│
├── .kiro/
│   ├── steering/
│   │   ├── product.md
│   │   ├── tech.md
│   │   └── structure.md               ← este archivo
│   └── specs/
│       └── cr-tax-calculator/
│           ├── spec.md
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
│
└── src/
    ├── main.tsx                        ← monta <App />, importa globals.css
    ├── App.tsx                         ← estado global, routing simple, ensamblaje
    │
    ├── config/
    │   └── fiscal.config.json          ← ÚNICA fuente de valores fiscales
    │
    ├── types/
    │   └── fiscal.types.ts             ← interfaces TypeScript del dominio fiscal
    │
    ├── hooks/
    │   ├── useFiscalCalculator.ts      ← orquesta todos los cálculos fiscales
    │   ├── useTipoCambio.ts            ← fetch API + fallback + tcManual flag
    │   └── useCurrencyConverter.ts     ← conversión USD/CRC del slider
    │
    ├── utils/
    │   ├── formatters.ts               ← fC, fU, fP, fm (sin dependencias)
    │   ├── ccss.utils.ts               ← getCat, buildCcssTablesData
    │   └── isr.utils.ts                ← calcISR, calcISRMixto
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Hero.tsx + Hero.module.css
    │   │   ├── PageLayout.tsx + PageLayout.module.css
    │   │   ├── Footer.tsx + Footer.module.css
    │   │   └── DocsPage.tsx + DocsPage.module.css
    │   │
    │   ├── ui/                         ← componentes genéricos SIN lógica fiscal
    │   │   ├── Chip.tsx + Chip.module.css
    │   │   ├── SliderField.tsx + SliderField.module.css
    │   │   ├── Tooltip.tsx + Tooltip.module.css
    │   │   ├── Modal.tsx + Modal.module.css
    │   │   ├── CardSection.tsx + CardSection.module.css
    │   │   └── Badge.tsx + Badge.module.css
    │   │
    │   ├── calculator/                 ← componentes específicos del calculador
    │   │   ├── InputPanel.tsx
    │   │   ├── RegimeSelector.tsx + RegimeSelector.module.css
    │   │   ├── CurrencySelector.tsx
    │   │   ├── RateSlider.tsx
    │   │   ├── TipoCambioSlider.tsx
    │   │   ├── ClientTypeChips.tsx
    │   │   ├── DeductionChips.tsx
    │   │   ├── ResultPanel.tsx + ResultPanel.module.css
    │   │   ├── DistributionBar.tsx + DistributionBar.module.css
    │   │   ├── AnnualSummary.tsx
    │   │   ├── BreakdownTable.tsx + BreakdownTable.module.css
    │   │   ├── IvaInfo.tsx + IvaInfo.module.css
    │   │   └── TramoModal.tsx
    │   │
    │   └── ccss/
    │       ├── CcssCard.tsx + CcssCard.module.css
    │       ├── CcssTablesModal.tsx
    │       └── RiesgoCcssModal.tsx
    │
    └── styles/
        └── globals.css                 ← :root variables + reset + body
```

## Reglas de organización

### Separación UI / lógica de dominio

Los componentes en `components/ui/` son completamente genéricos y reutilizables. **No pueden importar nada de `@/config/`, `@/hooks/` ni `@/utils/`**. Reciben todo por props.

Los componentes en `components/calculator/` y `components/ccss/` conocen el dominio fiscal pero no hacen cálculos — usan los datos que les pasan por props desde `App.tsx` vía `useFiscalCalculator`.

Los cálculos fiscales viven en `utils/` y `hooks/` — nunca en los componentes.

### Un archivo de módulo CSS por componente

Cada componente `.tsx` tiene su `.module.css` homónimo en la misma carpeta. Si un componente es simple (< 5 reglas CSS), puede no tener módulo propio y usar las clases del padre.

### Naming conventions

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes | PascalCase | `SliderField.tsx` |
| Hooks | camelCase con `use` | `useTipoCambio.ts` |
| Utils | camelCase con sufijo | `ccss.utils.ts` |
| CSS Modules | camelCase en el objeto | `styles.srTrack` |
| Types/Interfaces | PascalCase con `I` opcional | `CalculatorState`, `CcssCategory` |
| Constantes | UPPER_SNAKE | no aplica en este proyecto — los valores vienen del JSON |

### Imports — orden y alias

Siempre usar el alias `@/` para imports dentro de `src/`:

```typescript
// 1. React y librerías externas
import { useState, useMemo } from 'react'
import clsx from 'clsx'

// 2. Tipos
import type { CalculatorState } from '@/types/fiscal.types'

// 3. Config
import fiscalConfig from '@/config/fiscal.config.json'

// 4. Hooks
import { useFiscalCalculator } from '@/hooks/useFiscalCalculator'

// 5. Utils
import { fC, fU } from '@/utils/formatters'

// 6. Componentes (de más genérico a más específico)
import { Modal } from '@/components/ui/Modal'
import { CcssCard } from '@/components/ccss/CcssCard'

// 7. Estilos del componente actual
import styles from './MiComponente.module.css'
```

### Colocation

Si un hook o util solo lo usa un componente, puede vivir en la misma carpeta que el componente. No todo tiene que ser global. Mover a `hooks/` o `utils/` cuando lo usen 2+ componentes.

## App.tsx — responsabilidades

`App.tsx` es el único lugar con estado global. Sus responsabilidades son:

1. Inicializar `CalculatorState` con defaults del `fiscal.config.json`
2. Integrar `useTipoCambio` y actualizar el estado cuando retorna
3. Ejecutar `useFiscalCalculator(state, config)` y obtener resultados
4. Manejar cuál modal está abierto: `openModal: null | 'ccss-tables' | 'ccss-riesgo' | 'isr-tramos'`
5. Manejar routing simple: `page: 'calculator' | 'docs'`
6. Pasar todo por props a `PageLayout` → `InputPanel` y `ResultPanel`

App.tsx NO hace cálculos fiscales — los delega a `useFiscalCalculator`.

## fiscal.config.json — regla de oro

Este archivo es la única fuente de verdad para todos los valores numéricos fiscales.

Estructura de top-level:
- `ccss` — categorías, base mínima, salario base, tasas moratorias
- `isr` — tramos con desde/hasta/tasa/label
- `creditos` — hijo, cónyuge
- `deducciones` — pctFicto, pctPensionMax, ccssObreroEstimado
- `tipoCambio` — ventaDefault, compraDefault, apiUrl, timeoutMs
- `sliders` — min/max/step/default por cada slider en cada moneda
- `ui` — labels de display (catRangeLabels, etc.)

Cuando Kiro necesite un valor numérico fiscal: **buscarlo en el JSON, no hardcodearlo**.

## Patrones de componentes

### Componente UI genérico (ejemplo: Chip)

```typescript
// Chip.tsx — NO importa nada de dominio fiscal
interface ChipProps {
  label: string
  active: boolean
  variant: 'green' | 'amber'
  onClick: () => void
}

export function Chip({ label, active, variant, onClick }: ChipProps) {
  return (
    <button
      className={clsx(styles.chip, active && styles[`on${variant === 'green' ? 'G' : 'A'}`])}
      onClick={onClick}
      role="radio"
      aria-checked={active}
    >
      {label}
    </button>
  )
}
```

### Hook de cálculo (recibe config como param)

```typescript
// useFiscalCalculator.ts
export function useFiscalCalculator(state: CalculatorState, config: typeof fiscalConfig) {
  return useMemo(() => {
    const ccssResult = getCat(ccssBase, config.ccss)
    const isrResult = state.regime === 'solo'
      ? calcISR(rentaNeta, config.isr.tramosPersonaFisica)
      : calcISRMixto(rentaNeta, salarioAnual, config.isr.tramosPersonaFisica)
    // ...
    return { ccssResult, isrResult, netoMes, netoAno, ... }
  }, [state, config])
}
```

### Util pura (sin efectos secundarios)

```typescript
// ccss.utils.ts — función pura, testeable
export function getCat(ingreso: number, config: CcssConfig): CcssResult {
  const b = Math.max(config.baseMinimaContribucion, ingreso)
  const c = config.categorias.find(cat => b <= (cat.max ?? Infinity)) ?? config.categorias[4]
  return {
    ...c,
    b,
    ta: c.ivm26 + c.sem,
    cs: c.sem * b,
    ci: c.ivm26 * b,
    ca: (c.ivm26 + c.sem) * b
  }
}
```


## Patrones de código — amigables para juniors

### Patrón de componente

```typescript
// Each component gets its own interface with explicit prop names
interface SliderFieldProps {
  sliderId: string
  labelText: string
  currentValue: number
  minimumValue: number
  maximumValue: number
  stepSize: number
  displayValue: string       // pre-formatted string like "₡450,000" or "$3,000"
  hintLeft: string           // hint shown below slider on the left
  hintRight: string          // hint shown below slider on the right
  tooltipContent?: string    // optional tooltip text, omit if not needed
  onValueChange: (newValue: number) => void
}

export function SliderField({
  sliderId,
  labelText,
  currentValue,
  minimumValue,
  maximumValue,
  stepSize,
  displayValue,
  hintLeft,
  hintRight,
  tooltipContent,
  onValueChange,
}: SliderFieldProps) {
  // Calculate how far the slider fill bar should extend (0% to 100%)
  const fillPercentage = ((currentValue - minimumValue) / (maximumValue - minimumValue)) * 100

  return (
    <div className={styles.sliderRow}>
      {/* Label + current value display */}
      <div className={styles.sliderTop}>
        <label className={styles.sliderLabel} htmlFor={sliderId}>
          {labelText}
          {tooltipContent && <Tooltip content={tooltipContent} />}
        </label>
        <span className={styles.sliderValue}>{displayValue}</span>
      </div>

      {/* Custom track with fill bar underneath the real input */}
      <div className={styles.sliderTrack}>
        <div className={styles.sliderFill} style={{ width: `${fillPercentage}%` }} />
        <input
          id={sliderId}
          type="range"
          min={minimumValue}
          max={maximumValue}
          step={stepSize}
          value={currentValue}
          onChange={(event) => onValueChange(Number(event.target.value))}
          aria-label={labelText}
        />
      </div>

      {/* Min / Max hints */}
      <div className={styles.sliderHints}>
        <span>{hintLeft}</span>
        <span>{hintRight}</span>
      </div>
    </div>
  )
}
```

### Patrón de hook

```typescript
/**
 * Runs all fiscal calculations based on the current calculator state.
 * Returns pre-computed values ready to display — no math happens in components.
 * Uses useMemo so calculations only re-run when inputs actually change.
 */
export function useFiscalCalculator(
  calculatorState: CalculatorState,
  fiscalConfig: FiscalConfig
): FiscalCalculationResult {
  return useMemo(() => {
    // Step 1: convert rate to CRC regardless of selected currency
    const monthlyIncomeInColones =
      calculatorState.currency === 'usd'
        ? calculatorState.monthlyRate * calculatorState.exchangeRate
        : calculatorState.monthlyRate

    // Step 2: calculate CCSS using the contributive scale
    const ccssResult = calculateMonthlyCcss(monthlyIncomeInColones, fiscalConfig.ccss)

    // Step 3: calculate annual gross (ISR is always annual in Costa Rica)
    const annualGrossIncome = monthlyIncomeInColones * calculatorState.billedMonths

    // Step 4: apply deductions to get the taxable income base
    const deductions = calculateDeductions(calculatorState, ccssResult, fiscalConfig)
    const taxableIncome = Math.max(0, annualGrossIncome - deductions.total)

    // Step 5: calculate ISR — different formula for solo vs mixed regime
    const isrResult =
      calculatorState.regime === 'solo'
        ? calculateIncomeTax(taxableIncome, fiscalConfig.isr.brackets)
        : calculateMixedRegimeIncomeTax(taxableIncome, calculatorState.annualSalary, fiscalConfig.isr.brackets)

    // Step 6: apply tax credits (children + spouse)
    const taxCredits = calculateTaxCredits(calculatorState, fiscalConfig.credits)
    const finalIncomeTax = Math.max(0, isrResult.total - taxCredits)

    // Step 7: compute net income
    const annualNetIncome = annualGrossIncome - ccssResult.totalAmount * 12 - finalIncomeTax
    const monthlyNetIncome = annualNetIncome / calculatorState.billedMonths

    return {
      ccssResult,
      isrResult,
      taxCredits,
      finalIncomeTax,
      annualGrossIncome,
      annualNetIncome,
      monthlyNetIncome,
    }
  }, [calculatorState, fiscalConfig])
}
```

### Patrón de función utilitaria

```typescript
/**
 * Formats a number as Costa Rican colones.
 * Always shows the ₡ symbol and uses CR locale formatting (dots as thousands separator).
 * Negative numbers show the absolute value — the caller decides how to display the sign.
 *
 * @param amount - The number to format (can be negative)
 * @returns Formatted string like "₡450.000" or "₡1.234.567"
 */
export function formatColones(amount: number): string {
  const absoluteAmount = Math.abs(amount)
  const formattedNumber = costaRicanNumberFormat.format(absoluteAmount)
  return `₡${formattedNumber}`
}
```