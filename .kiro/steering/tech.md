---
inclusion: always
---

# Technology Stack — Calculadora Fiscal CR 2026

## Stack principal

- **Framework**: React 18 con hooks funcionales — sin class components
- **Build tool**: Vite (no Create React App, no Next.js)
- **Lenguaje**: TypeScript con `strict: true` — sin `any` implícito
- **Estilos**: CSS Modules (`.module.css`) — sin Tailwind, sin CSS-in-JS, sin Styled Components
- **Utilidades**: `clsx` para composición condicional de clases — única dependencia de helpers

## Por qué este stack (no cambiar sin consenso)

- **Sin Next.js**: la app es una SPA sin SEO crítico ni SSR necesario. Next.js añade complejidad innecesaria para una landing/tool page.
- **Sin Tailwind**: el diseño ya está definido con CSS custom properties. CSS Modules mantiene la fidelidad visual y facilita contribuciones sin conocer Tailwind.
- **Sin Redux**: el estado es local a la app, sin backend. Zustand o Context si escala, pero en v1 estado en App.tsx.
- **Sin React Router**: routing mínimo con `useState` + `history.pushState`. Si el proyecto crece, agregar `react-router-dom` en v2.

## Variables CSS globales

Todos los colores, tipografías y espaciados están definidos como CSS custom properties en `src/styles/globals.css`. NUNCA usar colores hardcodeados en los módulos CSS — siempre `var(--emerald)`, `var(--ink)`, etc.

## Fuentes

- **Sans**: `'Inter', system-ui, -apple-system, sans-serif` — para UI general
- **Mono**: `'JetBrains Mono', monospace` — para valores numéricos y monetarios
- Cargadas desde Google Fonts CDN en `index.html`

## Configuración fiscal externalizada

**REGLA CRÍTICA**: Todos los valores numéricos fiscales (tasas CCSS, tramos ISR, créditos, porcentajes de deducción, rangos de sliders) deben estar en `src/config/fiscal.config.json`.

- Ningún archivo `.tsx` o `.ts` puede contener valores como `0.0416`, `6244000`, `341228`, `20520`, etc.
- Los hooks y utils reciben los datos del config como parámetro — no lo importan internamente (facilita testing)
- El config tiene campos `_comment`, `_version` y `_fuentes` para trazabilidad legal

## Comandos esenciales

```bash
npm run dev        # servidor de desarrollo (Vite, puerto 5173)
npm run build      # build de producción en /dist
npm run preview    # preview del build
npm run type-check # tsc --noEmit (sin compilar, solo verificar tipos)
```

## Deploy

- **Plataforma**: Vercel
- **Modo**: SPA pura (CSR), sin SSR, sin Edge Functions
- **Variables de entorno**: ninguna secreta en v1 (la API de tipo de cambio es pública)
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **`vercel.json`**: rewrites para que `/docs` y cualquier ruta sirva `index.html`

## API externa

- **Tipo de cambio**: `https://tipodecambio.paginasweb.cr/api` (GET, sin auth)
  - Retorna `{ venta: number, compra: number, fecha: string }`
  - Timeout: 5 segundos con `AbortController`
  - Fallback a valores default del config si falla
- **GitHub API**: `https://api.github.com/repos/fabian7593/CRTaxes2026/readme` con header `Accept: application/vnd.github.v3.html` (para la página de documentación)

## Alias de importación

- `@/` → `src/` (configurado en `vite.config.ts` y `tsconfig.json`)
- Usar siempre imports absolutos desde `@/`: `import { fC } from '@/utils/formatters'`
- Nunca imports relativos que suban más de un nivel: no `../../utils/formatters`

## TypeScript

- `strict: true` en tsconfig
- Sin `any` — usar `unknown` y narrowing si el tipo no está claro
- Todos los props de componentes con interfaces nombradas (no tipos inline anónimos)
- No usar `as` para castear a menos que sea absolutamente necesario

## CSS Modules — convenciones

```typescript
import styles from './MiComponente.module.css'

// Clase simple
className={styles.card}

// Clase condicional
className={clsx(styles.chip, active && styles.chipActive)}

// Múltiples clases
className={clsx(styles.sr, styles.srLast)}
```

Las variables globales CSS se usan directamente en los módulos:
```css
.card { background: var(--surface); border: 1px solid var(--line); }
```

## Estilo de código — amigable para juniors, mantenible por humanos

### Nombres de variables y funciones
- Todos los nombres de variables y funciones deben ser explícitos y descriptivos. Sin letras sueltas, sin abreviaciones.
- MAL: `const r = calcISR(rn)` — BIEN: `const isrResult = calculateIncomeTax(netIncome)`
- MAL: `const tc = 460` — BIEN: `const exchangeRate = 460`
- MAL: `const fC = (n) => ...` — BIEN: `const formatColones = (amount) => ...`
- MAL: `const NF = new Intl.NumberFormat(...)` — BIEN: `const costaRicanNumberFormat = new Intl.NumberFormat(...)`
- Los nombres de funciones deben decir exactamente qué hacen: `calculateMonthlyCcss`, `getContributionCategory`, `formatAsCurrency`.
- Las variables booleanas deben leerse como una pregunta: `isClientLocal`, `hasPension`, `isManualExchangeRate`.

### Comentarios en el código
- Todos los comentarios dentro del código en inglés.
- Los comentarios deben explicar el POR QUÉ, no lo que el código literalmente hace.
- MAL: `// multiply rate by months` — BIEN: `// annual gross is needed because ISR is calculated yearly, not monthly`
- Cada función debe tener un comentario JSDoc breve en inglés explicando qué hace, qué recibe y qué retorna.

### Evitar código "listo" pero difícil de mantener
- Sin ternarios encadenados. Usar if/else o early returns.
- Sin funciones flecha de una sola línea que hacen más de una cosa.
- Sin coerciones booleanas implícitas como `if (value)` cuando `value` puede ser 0 — usar comparaciones explícitas: `if (value > 0)`.
- Sin destructuring de arrays con posiciones sin nombre como `const [a, b, c] = result` — usar variables con nombre u objetos.
- Preferir `for...of` sobre `.reduce()` cuando la lógica es compleja. La legibilidad vale más que la brevedad.
- Si una función supera las 30 líneas, debe dividirse en funciones más pequeñas con nombres descriptivos.

### Ejemplo de estilo de código aceptable

```typescript
/**
 * Calculates the monthly CCSS contribution for an independent worker.
 * Uses the contributive scale categories defined in fiscal.config.json.
 * The minimum contribution base (BMC) is always applied even if income is lower.
 */
function calculateMonthlyCcss(monthlyIncomeInColones: number, ccssConfig: CcssConfig): CcssResult {
  // CCSS always charges at least the minimum contribution base (BMC)
  const effectiveIncome = Math.max(ccssConfig.minimumContributionBase, monthlyIncomeInColones)

  // Find which category (1-5) the worker falls into based on their income
  const matchingCategory = ccssConfig.categories.find(
    (category) => effectiveIncome <= (category.maxIncome ?? Infinity)
  )
  const contributionCategory = matchingCategory ?? ccssConfig.categories[4]

  const totalContributionRate = contributionCategory.ivm2026Rate + contributionCategory.semRate
  const semMonthlyAmount = contributionCategory.semRate * effectiveIncome
  const ivmMonthlyAmount = contributionCategory.ivm2026Rate * effectiveIncome
  const totalMonthlyAmount = totalContributionRate * effectiveIncome

  return {
    category: contributionCategory,
    effectiveIncome,
    totalRate: totalContributionRate,
    semAmount: semMonthlyAmount,
    ivmAmount: ivmMonthlyAmount,
    totalAmount: totalMonthlyAmount,
  }
}
```