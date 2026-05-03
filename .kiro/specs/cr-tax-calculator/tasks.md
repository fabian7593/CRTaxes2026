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
- [x] Importar `fiscal.config.json`
- [x] Inicializar el estado completo del calculador con los defaults del config
- [x] Integrar `useTipoCambio` y actualizar el estado cuando carga
- [x] Integrar `useFiscalCalculator` con el estado actual
- [x] Manejar los setters de estado y pasarlos como props a los componentes
- [x] Estado de los modales (cuál está abierto): `openModal: null | 'ccss-tables' | 'ccss-riesgo' | 'isr-tramos'`
- [x] Renderizar `PageLayout` con `InputPanel` y `ResultPanel`
- [x] Renderizar los 3 modales (condicionales según `openModal`)
- [x] Manejar el routing simple (calculadora vs docs)

### Task 9.2 — Verificación de paridad de cálculos
- [x] Con los mismos inputs del ejemplo del README (₡15.000.000 renta neta), verificar que el ISR escalonado da los mismos resultados
- [x] Con tarifa $3.000/mes, TC ₡460, 12 meses, régimen solo, ficto, cliente exterior, verificar CCSS, ISR y neto
- [x] Con el mismo escenario en régimen mixto con salario ₡800.000, verificar que el ISR mixto es correcto

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

---

## Fase 11 — Paridad Visual con Diseño Original (CRÍTICO)

### Task 11.1 — Auditoría visual completa y corrección de estilos
- [x] Comparar pixel por pixel la versión React actual con el HTML original (`index.html` + `assets/css/main.css`)
- [x] Identificar todas las diferencias visuales: colores, espaciados, tamaños de fuente, bordes, sombras, animaciones
- [x] Actualizar `src/styles/globals.css` para que coincida exactamente con las variables CSS del original
- [x] Verificar que todos los componentes usen las mismas clases CSS y estilos que el original

### Task 11.2 — Corrección del Hero
- [x] El Hero debe verse exactamente igual al original: gradientes radiales con `::before` y `::after`
- [x] Verificar colores de fondo, tamaños de texto, espaciados
- [x] Los badges deben tener el mismo estilo (bordes, colores, tamaños)
- [x] El botón "Documentación" debe tener el mismo estilo

### Task 11.3 — Corrección de RegimeSelector
- [x] Los tabs deben verse exactamente como en el original
- [x] Verificar colores de fondo cuando están activos (solo/mixto)
- [x] El warning strip amarillo debe aparecer solo en modo mixto con el mismo estilo
- [x] Iconos, labels y subtítulos deben tener los mismos tamaños y colores

### Task 11.4 — Corrección de Sliders
- [x] Todos los sliders deben verse exactamente como en el original
- [x] Track, fill, hints deben tener los mismos colores y tamaños
- [x] Los labels y tooltips deben tener el mismo estilo
- [x] Los valores mostrados deben usar la misma tipografía (JetBrains Mono)

### Task 11.5 — Corrección de Chips
- [x] Los chips deben verse exactamente como en el original
- [x] Verificar colores cuando están activos (on-g, on-a)
- [x] Bordes, padding, border-radius deben coincidir
- [x] Hover states deben funcionar igual

### Task 11.6 — Corrección de Cards y CardSections
- [x] Las cards deben tener el mismo estilo: bordes, sombras, padding
- [x] Los títulos de las cards deben verse igual (uppercase, color, tamaño)
- [x] Los iconos circulares (ci-g, ci-a, ci-b, ci-r) deben verse iguales
- [x] La línea decorativa después del título debe estar presente

### Task 11.7 — Corrección del ResultPanel
- [x] El panel de resultados debe verse exactamente como en el original
- [x] El neto mensual grande debe tener el mismo tamaño, color y tipografía
- [x] Los mini-metrics deben verse iguales (grid 2x2, colores, tamaños)
- [x] La barra de distribución debe verse igual
- [x] El resumen anual debe verse igual
- [x] La tabla de desglose debe verse exactamente como en el original

### Task 11.8 — Corrección de CCSS display
- [x] El display de CCSS debe verse exactamente como en el original
- [x] La base de cotización debe mostrarse con el mismo estilo
- [x] La categoría y las tasas (SEM/IVM) deben verse iguales
- [x] La cuota mensual destacada debe tener el mismo estilo
- [x] Los botones de info deben verse iguales

### Task 11.9 — Corrección de IVA strip
- [x] El strip de IVA debe verse exactamente como en el original
- [x] Colores diferentes para cliente local (amber) vs exterior (emerald)
- [x] Mismo padding, border-radius, tamaño de fuente

### Task 11.10 — Corrección de Modals
- [x] Los modales deben verse exactamente como en el original
- [x] Header, body, close button deben tener el mismo estilo
- [x] Las tablas CCSS deben verse iguales (colores de headers, filas, "vos" badge)
- [x] El modal de riesgo debe verse igual
- [x] El modal de tramos ISR debe verse igual
- [x] Backdrop blur debe funcionar

### Task 11.11 — Corrección del Footer
- [x] El footer debe verse exactamente como en el original
- [x] Gradientes radiales con `::before` y `::after`
- [x] Author card con avatar, nombre, rol, social links
- [x] Links de documentación, GitHub, facturador
- [x] Animación del corazón (heartbeat)
- [x] Tooltips en los social links
- [x] Copy email functionality con feedback visual

### Task 11.12 — Verificación responsive
- [x] En desktop (> 840px): two-column layout, sticky result panel
- [x] En mobile (< 840px): single column, result panel no sticky
- [x] Todos los componentes deben verse bien en ambos tamaños
- [x] Los sliders deben funcionar bien en mobile

### Task 11.13 — Verificación final pixel-perfect
- [x] Abrir ambas versiones lado a lado (HTML original vs React)
- [x] Comparar cada sección visualmente
- [x] Tomar screenshots y compararlos
- [x] Ajustar cualquier diferencia restante hasta lograr paridad visual 100%

---

## Fase 12 — Corrección Estructural del Layout (CRÍTICO)

**NOTA**: Esta fase corrige diferencias ESTRUCTURALES (orden de elementos, agrupación en cards) que no fueron resueltas en Fase 11.

### Task 12.1 — Reestructurar InputPanel y ResultPanel
- [x] 12.1.1 Mover `RegimeSelector` FUERA de cualquier card en InputPanel
- [x] 12.1.2 Crear card "Moneda e Ingreso" con CurrencySelector, RateSlider, TipoCambioSlider, meses
- [x] 12.1.3 Crear card "Régimen Fiscal" con indicador de régimen y slider de salario (condicional)
- [x] 12.1.4 Crear card "Deducciones" con DeductionChips, slider gastos, slider pensión
- [x] 12.1.5 Crear card "Créditos Fiscales" con slider hijos y chips cónyuge
- [x] 12.1.6 Crear card "Tipo de Cliente" con ClientTypeChips e IvaInfo
- [x] 12.1.7 Actualizar CcssCard para que sea completa con alert, doc links, base, categoría, tasas, cuota, breakdown, botones info
- [x] 12.1.8 Crear card "Desglose Anual Detallado" con BreakdownTable
- [x] 12.1.9 Reestructurar ResultPanel: hero oscuro para neto mensual (background: var(--ink))
- [x] 12.1.10 Crear card "Métricas Rápidas" con grid 2x2 en ResultPanel
- [x] 12.1.11 Crear card "Distribución" con DistributionBar en ResultPanel
- [x] 12.1.12 Crear card "Resumen Anual" con AnnualSummary en ResultPanel
- [x] 12.1.13 Verificar separación visual: todas las cards con margin-bottom: 14px, borde, sombra
- [x] 12.1.14 Actualizar Hero para que sea más compacto
- [x] 12.1.15 Verificación estructural final: comparar HTML generado con original

### Task 12.2 — CORRECCIÓN CRÍTICA: Consolidar en UNA SOLA card "Configuración fiscal"
- [x] 12.2.1 ELIMINAR las cards separadas: "Deducciones", "Créditos Fiscales", "Tipo de Cliente"
- [x] 12.2.2 Crear UNA SOLA card "Configuración fiscal" (icono 📋, ci-b) que contenga TODO:
  - Sección "Tipo de cliente" con chips (Exterior/Local) + tooltip
  - Separador `<hr class="sep">`
  - Sección "Deducción para renta" con chips (Ficto/Real) + tooltip + slider gastos (condicional)
  - Separador `<hr class="sep">`
  - Sección "Hijos" con slider + tooltip
  - Sección "Cónyuge" con chips + tooltip
  - Sección "Pensión voluntaria" con chips + tooltip
- [x] 12.2.3 Mover IvaInfo FUERA de la card, debe aparecer DESPUÉS de la card como strip independiente
- [x] 12.2.4 Actualizar el orden de cards en InputPanel:
  1. RegimeSelector (fuera de cards)
  2. Card "Moneda e Ingreso"
  3. Card "Régimen Fiscal" (solo si mixto muestra salary slider)
  4. Card "Configuración fiscal" (ÚNICA card con todo: cliente, deducciones, hijos, cónyuge, pensión)
  5. IvaInfo strip (fuera de card, después de Configuración fiscal)
  6. Card "CCSS"
  7. Card "Desglose Anual Detallado"
- [x] 12.2.5 Usar clases CSS del original: `.config-section`, `.config-section-sm`, `.config-label`, `hr.sep`
- [x] 12.2.6 Verificar que los tooltips tengan la clase `.tip-left` donde corresponda
- [x] 12.2.7 Build y verificación final
