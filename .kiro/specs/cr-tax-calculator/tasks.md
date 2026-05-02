# Tasks — Plan de Implementación

## Orden de ejecución

Las tareas están ordenadas para que cada una construya sobre la anterior. Kiro debe completarlas en este orden.

---

## Fase 1 — Scaffolding del proyecto

### Task 1.1 — Inicializar proyecto Vite + React + TypeScript
- [x] Ejecutar `npm create vite@latest cr-tax-calculator -- --template react-ts`
- [x] Instalar dependencias: `clsx` (único helper de terceros para composición de clases)
- [x] Configurar `tsconfig.json` con `strict: true`, `baseUrl: "src"`, paths aliases (`@/` → `src/`)
- [x] Configurar `vite.config.ts` con el alias `@`
- [x] Crear `.gitignore` apropiado
- [x] Limpiar los archivos de ejemplo de Vite (`App.css`, `index.css` defaults, `assets/react.svg`)

### Task 1.2 — Estructura de carpetas
- [x] Crear la estructura completa de carpetas según el spec:
  ```
  src/
  ├── config/
  ├── types/
  ├── hooks/
  ├── utils/
  ├── components/
  │   ├── layout/
  │   ├── ui/
  │   ├── calculator/
  │   └── ccss/
  └── styles/
  ```

### Task 1.3 — Design tokens globales
- [x] Crear `src/styles/globals.css` con todas las variables CSS del `:root` (tokens de color, tipografía, bordes, sombras)
- [x] Agregar reset CSS mínimo (`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`)
- [x] Agregar `font-face` o link de Google Fonts para Inter + JetBrains Mono en `index.html`
- [x] Importar `globals.css` en `main.tsx`

### Task 1.4 — Configuración fiscal JSON
- [x] Crear `src/config/fiscal.config.json` con toda la configuración externalizada:
  - Categorías CCSS (5 categorías con tasas IVM/SEM/estado)
  - Tramos ISR 2026 (5 tramos persona física + 4 tramos persona jurídica)
  - Créditos fiscales (hijo/cónyuge)
  - Porcentajes de deducciones (ficto, pensión máximo, CCSS obrero estimado)
  - Valores default y rangos de cada slider
  - Valores default de tipo de cambio (venta/compra) y URL de la API
  - Labels de rangos de categorías CCSS para display
  - Configuración de 4 regímenes fiscales (personaFisicaIndependiente, personaFisicaMixta, sociedadAnonima, sociedadResponsabilidadLimitada)
- [x] Agregar campos `_comment`, `_version`, `_fuentes` para trazabilidad

---

## Fase 2 — Tipos y utilidades

### Task 2.1 — Tipos TypeScript
- [x] Crear `src/types/fiscal.types.ts`:
  - `CalculatorState` (todo el estado de la app)
  - `CcssCategory` (estructura de una categoría CCSS)
  - `CcssResult` (resultado de getCat)
  - `ISRTramo` (estructura de un tramo ISR)
  - `ISRResult` (resultado de calcISR con tot + det)
  - `BreakdownRow` (filas del desglose)
  - `DistributionSegment` (segmentos de la barra)
  - `ContributorType` — preparado para extensión: `'trabajador-independiente' | 'mixto'`

### Task 2.2 — Formatters
- [x] Crear `src/utils/formatters.ts`:
  - `NF = new Intl.NumberFormat('es-CR')`
  - `fm(n, d?)` — formato numérico sin símbolo
  - `fC(n)` — formato colones (₡)
  - `fU(n)` — formato dólares ($) con signo negativo correcto
  - `fP(n)` — formato porcentaje (n*100 con 1 decimal + %)
- [x] Exportar todas las funciones como named exports
- [x] Todos los tipos de parámetros y retornos tipados

### Task 2.3 — Utilidades CCSS
- [x] Crear `src/utils/ccss.utils.ts`:
  - `getCat(ingreso: number, config: CcssConfig): CcssResult`
    - Recibe el config (no lo importa internamente) para que sea puro y testeable
    - Aplica base mínima de cotización
    - Retorna categoría, tasas, cuotas SEM/IVM/total
  - `buildCcssTablesData(ccssBase: number, catInfo: CcssResult, config: CcssConfig)` → datos para los 3 sub-tablas del modal (SEM, IVM, Resumen)

### Task 2.4 — Utilidades ISR
- [x] Crear `src/utils/isr.utils.ts`:
  - `calcISR(rentaNeta: number, tramos: ISRTramo[]): ISRResult`
  - `calcISRMixto(rentaNeta: number, salarioAnual: number, tramos: ISRTramo[]): ISRResult`
    - Implementar exactamente la misma lógica que en el original (consumo del tramo exento por el salario)
  - Ambas funciones reciben los tramos como parámetro (vienen del config)

---

## Fase 3 — Hooks

### Task 3.1 — useTipoCambio
- [x] Crear `src/hooks/useTipoCambio.ts`:
  - Hace fetch a la URL de la API (del config) al montar
  - AbortController con timeout del config
  - Retorna `{ tcVenta, tcCompra, loaded, error }`
  - Fallback a valores default del config si falla
  - No actualiza si el usuario ya tocó el TC (`tcManual`)

### Task 3.2 — useFiscalCalculator
- [x] Crear `src/hooks/useFiscalCalculator.ts`:
  - Recibe el `CalculatorState` como parámetro
  - Ejecuta todos los cálculos: CCSS, ISR (solo o mixto), deducciones, créditos, neto
  - Retorna el resultado completo: `{ ccssResult, isrResult, netoMes, netoAno, spBruto, tramoDet, distributionSegments, breakdownRows, annualSummaryRows }`
  - Usa `useMemo` para no recalcular cuando los inputs no cambiaron
  - Importa funciones de `ccss.utils`, `isr.utils`, lee el config

### Task 3.3 — useCurrencyConverter
- [x] Crear `src/hooks/useCurrencyConverter.ts`:
  - Lógica de conversión al cambiar de moneda (USD→CRC, CRC→USD)
  - Retorna `{ convertRate, getSliderConfig }` — configura min/max/step según moneda activa

---

## Fase 4 — Componentes UI base

### Task 4.1 — Tooltip
- [x] Crear `src/components/ui/Tooltip.tsx` y `Tooltip.module.css`
- [x] Props: `content: string | React.ReactNode`
- [x] Renderiza el círculo `?` con el bubble on-hover
- [x] CSS exacto del `.tipw`, `.tpic`, `.tipb` del original

### Task 4.2 — Chip
- [x] Crear `src/components/ui/Chip.tsx` y `Chip.module.css`
- [x] Props: `label: string`, `active: boolean`, `variant: 'green' | 'amber'`, `onClick: () => void`
- [x] `role="radio"`, `aria-checked={active}` para accesibilidad
- [x] Aplica `.on-g` o `.on-a` según variant y active

### Task 4.3 — SliderField
- [x] Crear `src/components/ui/SliderField.tsx` y `SliderField.module.css`
- [x] Props: `id`, `label`, `value`, `min`, `max`, `step`, `valueDisplay` (string formateado), `onChange`, `hints: [string, string]`, `tooltip?`
- [x] Renderiza track custom con fill animado
- [x] Calcula el ancho del fill como `(value - min) / (max - min) * 100`
- [x] El input range real está sobre el track con opacity:0

### Task 4.4 — Modal
- [x] Crear `src/components/ui/Modal.tsx` y `Modal.module.css`
- [x] Props: `isOpen`, `onClose`, `title`, `children`, `maxWidth?`
- [x] `useEffect` para cerrar con Escape
- [x] Click en overlay cierra el modal
- [x] `document.body.style.overflow = 'hidden'` cuando está abierto
- [x] `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

### Task 4.5 — CardSection
- [x] Crear `src/components/ui/CardSection.tsx` y `CardSection.module.css`
- [x] Props: `title`, `icon?` (emoji string), `iconVariant?: 'g' | 'a' | 'b' | 'r'`, `children`
- [x] Renderiza el header uppercase + línea decorativa + card wrapper

### Task 4.6 — Badge (para Hero)
- [x] Crear `src/components/ui/Badge.tsx`
- [x] Props: `label`, `variant?: 'default' | 'green' | 'amber'`

---

## Fase 5 — Componentes de layout

### Task 5.1 — Hero
- [x] Crear `src/components/layout/Hero.tsx` y `Hero.module.css`
- [x] Texto hardcodeado del hero (eyebrow, título con `<em>`, subtítulo, badges)
- [x] Botón "Documentación" que abre la página de docs
- [x] CSS con los pseudo-elementos `::before` y `::after` para los gradientes radiales
- [x] Las badges usan el componente `Badge`

### Task 5.2 — PageLayout
- [x] Crear `src/components/layout/PageLayout.tsx` y `PageLayout.module.css`
- [x] Renderiza: Hero + two-col grid + Footer
- [x] El two-col recibe `left` y `right` como children o props
- [x] El panel derecho tiene `position: sticky; top: 20px` en desktop

### Task 5.3 — Footer
- [x] Crear `src/components/layout/Footer.tsx` y `Footer.module.css`
- [x] Links: GitHub, LinkedIn, WhatsApp, Email (con copy-to-clipboard)
- [x] Función `copyEmail` con feedback visual (clase `copied` por 2s)
- [x] Texto de disclaimer y links a instituciones

---

## Fase 6 — Componentes del calculador

### Task 6.1 — RegimeSelector
- [x] Crear `src/components/calculator/RegimeSelector.tsx`
- [x] Props: `value: 'solo' | 'mixto'`, `onChange`
- [x] Renderiza los dos tabs con sus iconos, labels y subtítulos (`.rs`)
- [x] Strip de advertencia amarilla que aparece solo en modo mixto

### Task 6.2 — CurrencySelector
- [x] Crear `src/components/calculator/CurrencySelector.tsx`
- [x] Props: `value: 'usd' | 'crc'`, `onChange`
- [x] Dos chips: USD / CRC (variant 'green' para el activo)

### Task 6.3 — ClientTypeChips
- [x] Props: `value: 'ext' | 'loc'`, `onChange`
- [x] Chips: "Exterior" (on-g) / "Local" (on-a)

### Task 6.4 — DeductionChips
- [x] Props: `value: 'ficto' | 'real'`, `onChange`
- [x] Chips: "Ficto 25%" (on-g) / "Gastos reales" (on-a)

### Task 6.5 — InputPanel
- [x] Crear `src/components/calculator/InputPanel.tsx`
- [x] Ensambla todos los sliders y chips del panel izquierdo
- [x] Recibe todo el estado y los setters como props
- [x] Incluye: CurrencySelector, slider Tarifa, slider TC, slider Meses, RegimeSelector, slider Salario (condicional), DeductionChips, slider Gastos (condicional), slider Hijos, chips Cónyuge, chips Pensión, ClientTypeChips

### Task 6.6 — RateSlider
- [x] Slider especializado para la tarifa mensual
- [x] Cambia label, tooltip, hints y rangos según la moneda activa
- [x] Usa SliderField internamente

### Task 6.7 — TipoCambioSlider
- [x] Slider para el tipo de cambio con badge "API en vivo"
- [x] Cambia label y tooltip según si está en modo USD (venta) o CRC (compra)
- [x] Al cambiar, activa `tcManual = true`

### Task 6.8 — IvaInfo
- [x] Crear `src/components/calculator/IvaInfo.tsx`
- [x] Recibe: `clienteLocal: boolean`, `rateCRC: number`
- [x] Renderiza el strip con el estilo `.iva-strip.loc` o `.iva-strip.ext`

### Task 6.9 — DistributionBar
- [x] Props: `segments: DistributionSegment[]`
- [x] Cada segmento: `{ color: string, pct: number, label: string }`
- [x] Filtra segmentos con pct < 0.001
- [x] Barra + leyenda

### Task 6.10 — AnnualSummary
- [x] Props: `rows: AnnualSummaryRow[]`
- [x] 4 filas: bruto anual, CCSS anual, ISR anual, neto anual (con estilo `tot`)
- [x] Cada fila: label, valor CRC, valor USD

### Task 6.11 — BreakdownTable
- [x] Props: `rows: BreakdownRow[]`
- [x] Renderiza la tabla con secciones, subtotales y total
- [x] Cada fila: label + tooltip opcional + icon opcional + valor CRC + valor USD
- [x] Clases de color: pos (emerald), neg (crimson), neu (amber)

### Task 6.12 — ResultPanel
- [x] Crea `src/components/calculator/ResultPanel.tsx`
- [x] Recibe todos los resultados del hook `useFiscalCalculator`
- [x] Ensambla: neto grande, desglose rápido (bruto/CCSS/ISR/tasa), DistributionBar, AnnualSummary, BreakdownTable
- [x] Botones para abrir los modales (tramos ISR, tablas CCSS)

---

## Fase 7 — Componentes CCSS

### Task 7.1 — CcssCard
- [x] Crear `src/components/ccss/CcssCard.tsx`
- [x] Muestra: nombre de la categoría, rango, tags SEM/IVM, cuotas (mensual/SEM/IVM/anual)
- [x] Botón para abrir el modal de tablas CCSS
- [x] Botón para abrir el modal de riesgo

### Task 7.2 — CcssTablesModal
- [x] Crea `src/components/ccss/CcssTablesModal.tsx`
- [x] Recibe los datos de las tablas precalculados
- [x] Usa el componente `Modal`
- [x] Renderiza las 3 sub-tablas (SEM, IVM, Resumen) con la fila "vos" resaltada

### Task 7.3 — RiesgoCcssModal
- [x] Crea `src/components/ccss/RiesgoCcssModal.tsx`
- [ ] Usa el componente `Modal`
- [x] Slider para el monto declarado (inicializa al bruto actual)
- [x] Recalculo en tiempo real del riesgo
- [x] Muestra resultado "sin exposición" o tarjeta roja con el desglose de sanciones

### Task 7.4 — TramoModal
- [x] Crea `src/components/calculator/TramoModal.tsx`
- [x] Muestra los 5 tramos ISR con barras proporcionales
- [x] Resalta los tramos activos (base > 0)
- [x] Muestra el total ISR bruto

---

## Fase 8 — Página de documentación

### Task 8.1 — DocsPage
- [x] Crear `src/components/layout/DocsPage.tsx`
- [x] Hace fetch a la GitHub API con `Accept: application/vnd.github.v3.html`
- [x] Estados: loading (spinner), loaded (HTML renderizado), error (botón a GitHub)
- [x] Renderiza el HTML recibido con `dangerouslySetInnerHTML` (es contenido de GitHub, confiable)
- [x] Aplica estilos de markdown (headings, tables, code blocks, blockquotes, links)
- [x] Botón "Volver a la calculadora"

### Task 8.2 — Routing mínimo
- [x] Implementar routing simple sin React Router:
  - `useState` en `App.tsx` con `page: 'calculator' | 'docs'`
  - Leer `window.location.search` al montar para detectar `?docs=true`
  - El botón de docs cambia el estado y hace `pushState`
- [x] Alternativa: si el proyecto crece, agregar `react-router-dom` en v2

---

## Fase 9 — Ensamblaje y App.tsx

### Task 9.1 — App.tsx
- [ ] Importar `fiscal.config.json`
- [ ] Inicializar el estado completo del calculador con los defaults del config
- [ ] Integrar `useTipoCambio` y actualizar el estado cuando carga
- [ ] Integrar `useFiscalCalculator` con el estado actual
- [ ] Manejar los setters de estado y pasarlos como props a los componentes
- [ ] Estado de los modales (cuál está abierto): `openModal: null | 'ccss-tables' | 'ccss-riesgo' | 'isr-tramos'`
- [ ] Renderizar `PageLayout` con `InputPanel` y `ResultPanel`
- [ ] Renderizar los 3 modales (condicionales según `openModal`)
- [ ] Manejar el routing simple (calculadora vs docs)

### Task 9.2 — Verificación de paridad de cálculos
- [ ] Con los mismos inputs del ejemplo del README (₡15.000.000 renta neta), verificar que el ISR escalonado da los mismos resultados
- [ ] Con tarifa $3.000/mes, TC ₡460, 12 meses, régimen solo, ficto, cliente exterior, verificar CCSS, ISR y neto
- [ ] Con el mismo escenario en régimen mixto con salario ₡800.000, verificar que el ISR mixto es correcto

---

## Fase 10 — Configuración de deploy

### Task 10.1 — Vercel
- [ ] Crear `vercel.json` con configuración básica:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- [ ] Verificar que `vite build` termina sin errores de TypeScript
- [ ] Agregar script en `package.json`: `"type-check": "tsc --noEmit"`

### Task 10.2 — GitHub Actions (opcional pero recomendado)
- [ ] Crear `.github/workflows/ci.yml` que corre en cada PR:
  - `npm ci`
  - `npm run type-check`
  - `npm run build`

### Task 10.3 — README actualizado
- [ ] Actualizar el `README.md` del repo con:
  - Sección "Desarrollo local" (`npm install`, `npm run dev`)
  - Sección "Actualizar datos fiscales" — explicar `fiscal.config.json` y qué cambiar cada año
  - Sección "Arquitectura" — estructura de carpetas con descripción de cada módulo
  - Sección "Contribuir" — cómo agregar un nuevo régimen fiscal en el futuro

---

## Checklist final antes de PR

- [ ] `npm run type-check` pasa sin errores
- [ ] `npm run build` termina exitoso
- [ ] La app en producción carga el tipo de cambio correctamente
- [ ] El fallback del tipo de cambio funciona (desconectar internet y recargar)
- [ ] Los 3 modales abren y cierran correctamente (botón, Escape, overlay)
- [ ] El cambio de moneda USD↔CRC convierte el slider correctamente
- [ ] El régimen mixto muestra el slider de salario y calcula ISR correctamente
- [ ] El simulador de riesgo CCSS muestra el cálculo correcto de sanciones
- [ ] En móvil (< 840px), el layout es de columna única y funciona
- [ ] No hay valores numéricos fiscales hardcodeados en archivos `.tsx` o `.ts`
- [ ] El `fiscal.config.json` es el único lugar donde existen las tasas CCSS y tramos ISR
