# Spec: Calculadora Fiscal CR 2026 — Migración a React + Vite

## Resumen del proyecto

Migración completa de la Calculadora Fiscal CR 2026 desde HTML/CSS/JS vanilla a una aplicación React + Vite con TypeScript. La app calcula impuestos y cargas sociales para trabajadores independientes en Costa Rica, con soporte para régimen individual y régimen mixto (empleo + servicios independientes).

El objetivo es mantener **100% de paridad funcional y visual** con la versión original, mientras se refactoriza a una arquitectura de componentes reutilizables, se externaliza la configuración fiscal a un archivo JSON editable, y se prepara la base para crecimiento futuro (S.A., S.R.L., etc.).

**Stack**: React 18 + Vite + TypeScript + CSS Modules  
**Deploy target**: Vercel (sin SSR, CSR puro — es una landing/tool page sin SEO crítico)  
**Repo**: GitHub open source — debe ser fácil de contribuir y mantener

---

## Design System — respetar 100%

El diseño visual actual es el contrato. No se cambia nada de apariencia.

### Tokens de color (de main.css)

```css
--ink: #1a1a2e
--ink2: #2d2d4e
--ink3: #4a4a6a
--muted: #8888aa
--soft: #c4c4d8
--line: #e8e8f0
--bg: #f5f4f0
--bg2: #eeecf0
--surface: #fff
--surface2: #f9f8ff
--emerald: #00c896
--emerald-bg: #e6fff9
--emerald-mid: #00a07a
--crimson: #e84545
--crimson-bg: #fff0f0
--amber: #f5a400
--amber-bg: #fff8e6
--amber-mid: #c07800
--cobalt: #3b5bdb
--cobalt-bg: #eef2ff
--violet: #7c3aed
--violet-bg: #f5f0ff
--teal: #0891b2
--teal-bg: #e0f7fa
```

### Tipografía

- Sans: `'Inter', system-ui, -apple-system, sans-serif`
- Mono: `'JetBrains Mono', monospace` — usada para valores numéricos/monetarios
- Fuentes via Google Fonts CDN

### Espaciado y bordes

- `--r: 14px` — border-radius cards
- `--rs: 8px` — border-radius pequeño
- `--shadow: 0 1px 3px rgba(26,26,46,.06), 0 4px 16px rgba(26,26,46,.06)`
- `--shadow-lg: 0 8px 40px rgba(26,26,46,.15)`

### Layout

- Max width: 1100px centrado
- Two-column grid: `1fr 360px` (panel izquierdo inputs + panel derecho resultados sticky)
- Breakpoint mobile: 840px → columna única

---

## Arquitectura de componentes

```
src/
├── main.tsx
├── App.tsx
├── assets/
│   └── fonts/ (si se sirven local)
├── config/
│   └── fiscal.config.json         ← CONFIGURACIÓN FISCAL EXTERNALIZADA
├── types/
│   └── fiscal.types.ts
├── hooks/
│   ├── useFiscalCalculator.ts      ← lógica de cálculo principal
│   ├── useTipoCambio.ts            ← fetch a la API de tipo de cambio
│   └── useCurrencyConverter.ts     ← conversión USD/CRC
├── utils/
│   ├── formatters.ts               ← fC, fU, fP, fm (formateo de números)
│   ├── ccss.utils.ts               ← getCat, renderCCSSTables
│   └── isr.utils.ts                ← calcISR, calcISRMixto
├── components/
│   ├── layout/
│   │   ├── Hero.tsx
│   │   ├── PageLayout.tsx
│   │   └── Footer.tsx
│   ├── ui/
│   │   ├── Chip.tsx                ← botón chip reutilizable (on-g, on-a)
│   │   ├── SliderField.tsx         ← slider con label, valor, fill, hints
│   │   ├── Tooltip.tsx             ← tooltip inline (el ? que aparece en labels)
│   │   ├── Modal.tsx               ← overlay modal reutilizable
│   │   ├── CardSection.tsx         ← card con título uppercase + línea
│   │   └── Badge.tsx               ← hbadge del hero
│   ├── calculator/
│   │   ├── RegimeSelector.tsx      ← tabs Solo / Mixto
│   │   ├── CurrencySelector.tsx    ← chips USD / CRC
│   │   ├── InputPanel.tsx          ← panel izquierdo completo (todos los sliders)
│   │   ├── RateSlider.tsx          ← slider tarifa (con lógica de moneda)
│   │   ├── TipoCambioSlider.tsx    ← slider TC con badge "API en vivo"
│   │   ├── ClientTypeChips.tsx     ← chips Cliente exterior / local
│   │   ├── DeductionChips.tsx      ← chips Ficto / Gastos reales
│   │   ├── ResultPanel.tsx         ← panel derecho sticky completo
│   │   ├── DistributionBar.tsx     ← barra de distribución (Neto/ISR/CCSS/Pensión)
│   │   ├── AnnualSummary.tsx       ← resumen anual (4 filas)
│   │   ├── BreakdownTable.tsx      ← tabla desglose fiscal detallado
│   │   ├── IvaInfo.tsx             ← strip IVA (local vs exterior)
│   │   └── TramoModal.tsx          ← modal tramos ISR
│   └── ccss/
│       ├── CcssCard.tsx            ← card CCSS con categoría, SEM, IVM
│       ├── CcssTablesModal.tsx     ← modal tablas CCSS completas
│       └── RiesgoCcssModal.tsx     ← modal simulador de riesgo subdeclaración
└── styles/
    ├── globals.css                 ← variables CSS + reset + body
    └── modules/                   ← CSS Modules por componente
```

---

## fiscal.config.json — configuración externalizada

Este archivo es el corazón del requisito de "valores editables sin tocar código". Contiene todos los valores numéricos fiscales que pueden cambiar anualmente.

```json
{
  "_comment": "Calculadora Fiscal CR — Configuración Fiscal 2026. Actualizar este archivo cada año fiscal.",
  "_version": "2026.1",
  "_fuentes": {
    "ccss": "Decreto N°44756-MTSS, Gaceta N°232, 10 dic 2024 + Acuerdo JD N°9038/2019",
    "isr": "Decreto 45333-H (Tramos ISR 2026)",
    "creditos": "Ley 7092 art. 16",
    "sanciones": "Ley Constitutiva CCSS art. 44"
  },

  "ccss": {
    "baseMinimaContribucion": 341228,
    "salarioBase2026": 462200,
    "tasaInteresesMoratorios": 0.0852,
    "multaFijaMultiplicador": 3,
    "categorias": [
      { "cat": 1, "max": 341227,   "ivm26": 0.0416, "ivm_est": 0.0529, "ivm_lpt": 0.0030, "sem": 0.0289, "sem_est": 0.0911 },
      { "cat": 2, "max": 734217,   "ivm26": 0.0565, "ivm_est": 0.0410, "ivm_lpt": 0.0000, "sem": 0.0433, "sem_est": 0.0767 },
      { "cat": 3, "max": 1468434,  "ivm26": 0.0753, "ivm_est": 0.0222, "ivm_lpt": 0.0000, "sem": 0.0624, "sem_est": 0.0576 },
      { "cat": 4, "max": 2202651,  "ivm26": 0.0798, "ivm_est": 0.0177, "ivm_lpt": 0.0000, "sem": 0.0802, "sem_est": 0.0398 },
      { "cat": 5, "max": null,     "ivm26": 0.0842, "ivm_est": 0.0133, "ivm_lpt": 0.0000, "sem": 0.1069, "sem_est": 0.0131 }
    ]
  },

  "isr": {
    "tramosPersonaFisica": [
      { "desde": 0,        "hasta": 6244000,  "tasa": 0.00, "label": "Exento" },
      { "desde": 6244000,  "hasta": 8329000,  "tasa": 0.10, "label": "10%" },
      { "desde": 8329000,  "hasta": 10414000, "tasa": 0.15, "label": "15%" },
      { "desde": 10414000, "hasta": 20872000, "tasa": 0.20, "label": "20%" },
      { "desde": 20872000, "hasta": null,     "tasa": 0.25, "label": "25%" }
    ]
  },

  "creditos": {
    "porHijo": 20520,
    "porConyuge": 31080
  },

  "deducciones": {
    "pctFicto": 0.25,
    "pctPensionVoluntariaMaximo": 0.10,
    "ccssObreroEstimado": 0.0983
  },

  "tipoCambio": {
    "ventaDefault": 460,
    "compraDefault": 450,
    "apiUrl": "https://tipodecambio.paginasweb.cr/api",
    "timeoutMs": 5000
  },

  "sliders": {
    "tarifa": {
      "usd": { "min": 500,    "max": 12000,   "step": 100,   "default": 3000 },
      "crc": { "min": 200000, "max": 6000000, "step": 50000, "default": 1500000 }
    },
    "tipoCambio": { "min": 400, "max": 600, "step": 1 },
    "meses":      { "min": 1,   "max": 12,  "step": 1, "default": 12 },
    "salario":    { "min": 0,   "max": 3000000, "step": 50000, "default": 800000 },
    "gastos":     { "min": 0,   "max": 3000000, "step": 50000, "default": 0 },
    "hijos":      { "min": 0,   "max": 8,   "step": 1, "default": 0 }
  },

  "ui": {
    "catRangeLabels": [
      "hasta ₡341.227",
      "₡341.228 – ₡734.217",
      "₡734.218 – ₡1.468.434",
      "₡1.468.435 – ₡2.202.651",
      "más de ₡2.202.651"
    ]
  }
}
```

---

## Estado global de la app

La app es completamente client-side. No hay router (single page). El estado se maneja en `App.tsx` o con un custom hook `useFiscalCalculator` y se pasa como props.

```typescript
interface CalculatorState {
  // Régimen
  regime: 'solo' | 'mixto'
  
  // Moneda
  currency: 'usd' | 'crc'
  
  // Sliders
  rate: number          // tarifa mensual (en la moneda seleccionada)
  tipoCambio: number    // tipo de cambio actual
  meses: number         // meses facturados
  salarioCRC: number    // salario mensual (solo régimen mixto)
  gastos: number        // gastos reales anuales (solo si ded='real')
  hijos: number         // cantidad de hijos
  
  // Chips
  clienteLocal: boolean // true=local, false=exterior
  deduccion: 'ficto' | 'real'
  conyuge: boolean
  pension: boolean
  
  // Tipo de cambio (de la API)
  tcVenta: number
  tcCompra: number
  tcManual: boolean     // true si el usuario lo modificó
}
```

---

## Funcionalidades a preservar (100% paridad)

### Cálculos fiscales
- [x] CCSS: determinación de categoría (1-5) según ingreso bruto mensual CRC
- [x] CCSS: cálculo de cuota mensual SEM + IVM por categoría
- [x] CCSS: base mínima de cotización (₡341.228)
- [x] ISR: cálculo escalonado sobre renta neta (5 tramos)
- [x] ISR: régimen mixto — salario consume tramo exento (función `calcISRMixto`)
- [x] Deducción ficta 25% (art. 8 Ley 7092)
- [x] Deducciones reales: gastos documentados + CCSS anual
- [x] Deducción CCSS adicional (solo en régimen ficto, art. 8 inc. b)
- [x] Créditos fiscales: hijos (₡20.520/año c/u) + cónyuge (₡31.080/año)
- [x] Pensión voluntaria deducible 10% (art. 71 Ley 7983)
- [x] Neto anual y mensual real
- [x] Tasa efectiva total (CCSS + ISR / bruto)

### Conversión de moneda
- [x] Input en USD → cálculos en CRC usando TC venta
- [x] Input en CRC → cálculos en CRC, equivalente USD con TC compra
- [x] Cambio de moneda convierte el valor actual del slider automáticamente
- [x] TC venta se usa para USD→CRC, TC compra para CRC→USD

### API tipo de cambio
- [x] Fetch a `https://tipodecambio.paginasweb.cr/api` al cargar la app
- [x] Timeout 5 segundos con AbortController
- [x] Fallback a valores por defecto si falla
- [x] No sobrescribir si el usuario ya modificó el slider manualmente (`tcManual`)

### IVA
- [x] Cliente local: strip mostrando el 13% que paga el cliente, con monto en CRC
- [x] Cliente exterior: strip exento con texto de exportación

### Simulador de riesgo CCSS
- [x] Modal con slider de monto declarado
- [x] Cálculo de multa fija (3 salarios base), cuotas omitidas, intereses moratorios
- [x] Ratio "por cada ₡1 ahorrado, arriesgás X colones"

### Modales
- [x] Modal tramos ISR: barra visual por tramo, total
- [x] Modal tablas CCSS: Tabla SEM, Tabla IVM, Resumen — con fila "vos" resaltada
- [x] Modal riesgo CCSS: simulador interactivo
- [x] Cierre con Escape o click en overlay

### UI/UX
- [x] Sliders con fill animado (gradiente emerald → cobalt)
- [x] Todos los tooltips inline (el ? en los labels)
- [x] Barra de distribución (Neto/ISR/CCSS/Pensión en %)
- [x] Resumen anual (4 filas: bruto, CCSS, ISR, neto)
- [x] Tabla desglose completa con secciones y subtotales
- [x] Panel de resultados sticky en desktop
- [x] Copy email en el footer con feedback visual
- [x] Página docs: carga el README desde la GitHub API y lo renderiza
- [x] Diseño responsive (breakpoint 840px)

---

## Página de documentación

La página `docs.html` actual carga el README desde la GitHub API y lo renderiza como HTML. En React, esto será una ruta separada o una segunda página si se usa React Router (opcional — puede ser un componente montado en `/docs` o un archivo HTML separado).

**Decisión**: Mantener como componente `DocsPage.tsx` para no necesitar React Router en v1. Se monta condicionalmente si `?docs=true` en la URL o si el usuario navega a `/docs` (Vite puede manejarlo con un segundo entry point).

---

## Preparación para crecimiento futuro

La arquitectura debe soportar agregar nuevos tipos de contribuyentes sin refactorizar. La clave es el patrón **strategy** en los cálculos:

```typescript
// types/fiscal.types.ts
type ContributorType = 'trabajador-independiente' | 'mixto' | 'sociedad-anonima' | 'srl'

interface FiscalStrategy {
  calculateISR(rentaNeta: number, context: CalculationContext): ISRResult
  calculateCCSS(ingresoMensual: number): CcssResult
  getDeductions(state: CalculatorState): DeductionResult
}
```

En `fiscal.config.json`, las categorías futuras tendrían su propia sección:

```json
{
  "regimenes": {
    "trabajador-independiente": { ... },
    "sociedad-anonima": { ... }  // se agrega cuando se implemente
  }
}
```

---

## Ideas para SaaS futuro (fuera del scope v1, solo para referencia)

1. **Comparador anual**: mostrar cómo cambian los tramos año a año (2024 vs 2025 vs 2026)
2. **Simulador de planificación fiscal**: "¿cuánto necesito facturar para llevarme $X al mes?"
3. **Multi-régimen**: S.A., S.R.L., persona física con actividad lucrativa
4. **Exportar PDF/Excel**: resumen de cálculos para el contador
5. **Historial**: guardar escenarios en localStorage y compararlos
6. **Modo contador**: ingresar datos de múltiples clientes
7. **Actualización anual automática**: el `fiscal.config.json` se sirve desde un API propio y se actualiza cada inicio de año fiscal

---

## Deploy

- **Plataforma**: Vercel
- **Build**: `vite build` → salida en `/dist`
- **Sin SSR**: `output: 'spa'` (todo CSR)
- **Variables de entorno**: ninguna secreta necesaria en v1 (la API de tipo de cambio es pública)
- **GitHub Actions**: CI que corre lint + type-check en cada PR

---

## Criterios de aceptación

1. Todos los cálculos producen el mismo resultado que la versión HTML original con los mismos inputs
2. El diseño visual es indistinguible del original en desktop y mobile
3. `fiscal.config.json` controla todos los valores numéricos fiscales — cambiar el archivo actualiza todos los cálculos sin tocar código React
4. Los componentes `SliderField`, `Chip`, `Modal`, `Tooltip` son genéricos y reutilizables
5. TypeScript sin errores de compilación (`strict: true`)
6. Deploy en Vercel exitoso en menos de 2 minutos
7. La app funciona sin conexión (graceful fallback si falla la API de tipo de cambio)
