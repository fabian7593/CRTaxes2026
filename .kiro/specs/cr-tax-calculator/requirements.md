# Requirements — Calculadora Fiscal CR 2026 (React Migration)

## Introducción

Este documento define los requerimientos para la migración de la Calculadora Fiscal CR 2026 desde HTML/CSS/JS vanilla a React + Vite + TypeScript. El proyecto es open source, orientado a CV, y será deployado en Vercel.

---

## Requerimientos funcionales

### RF-01 Paridad de cálculos fiscales
**MUST HAVE**

La aplicación React debe producir exactamente los mismos resultados numéricos que la versión HTML original para cualquier combinación de inputs.

**Criterios de aceptación:**
- CCSS: dado el mismo ingreso bruto mensual en CRC, la categoría (1-5), cuota mensual (SEM + IVM), y cuota anual deben ser idénticos
- ISR: dado el mismo ingreso neto anual, el ISR escalonado debe ser idéntico (régimen solo y mixto)
- Régimen mixto: la lógica de consumo del tramo exento por el salario debe preservarse exactamente como en `calcISRMixto`
- Neto mensual/anual debe coincidir con el original
- Créditos fiscales por hijo y cónyuge deben aplicarse correctamente

### RF-02 Configuración fiscal externalizada
**MUST HAVE**

Todos los valores numéricos fiscales deben vivir en `src/config/fiscal.config.json`.

**Criterios de aceptación:**
- El archivo contiene: categorías CCSS (tasas IVM/SEM por categoría), tramos ISR (desde/hasta/tasa), créditos fiscales (hijo/cónyuge), deducciones (% ficto, % pensión máximo), valores por defecto del tipo de cambio, rangos y pasos de cada slider
- Cambiar un valor en el JSON y hacer hot-reload actualiza todos los cálculos automáticamente
- El archivo tiene comentarios `_comment`, `_version` y `_fuentes` para trazabilidad legal
- No existe ningún valor fiscal hardcodeado en ningún archivo `.tsx` o `.ts`

### RF-03 Cambio de moneda (USD/CRC)
**MUST HAVE**

El usuario puede cambiar entre ingresar su tarifa en USD o en CRC.

**Criterios de aceptación:**
- Al cambiar de USD a CRC: el slider se convierte usando `tcVenta` (USD→CRC), el rango cambia a ₡200k-₡6M, step ₡50k
- Al cambiar de CRC a USD: el slider se convierte usando `tcCompra`, el rango cambia a $500-$12k, step $100
- El tipo de cambio mostrado cambia a VENTA (modo USD) o COMPRA (modo CRC)
- Los labels y tooltips del slider de tarifa y de TC se actualizan según la moneda

### RF-04 API tipo de cambio
**MUST HAVE**

La app carga el tipo de cambio BCCR desde la API pública al iniciar.

**Criterios de aceptación:**
- Al montar la app, hace fetch a `tipodecambio.paginasweb.cr/api` con timeout de 5 segundos
- Si el fetch es exitoso, actualiza `tcVenta` y `tcCompra` y recalcula
- Si el fetch falla, usa los valores por defecto del `fiscal.config.json` (₡460/₡450) sin mostrar error visible al usuario (solo `console.warn`)
- Si el usuario mueve el slider de TC manualmente, el flag `tcManual = true` y la API no sobrescribe ese valor

### RF-05 Régimen solo e independiente+salario
**MUST HAVE**

El usuario puede alternar entre dos regímenes de tributación.

**Criterios de aceptación:**
- **Régimen solo**: solo se calculan servicios profesionales independientes. El slider de salario está oculto.
- **Régimen mixto**: aparece el slider de salario mensual CRC. El ISR se calcula con `calcISRMixto` donde el salario consume el tramo exento. Aparece la sección "Empleo formal" en el desglose.
- El strip `wstrip` de advertencia aparece solo en régimen mixto

### RF-06 Deducción ficta vs gastos reales
**MUST HAVE**

El usuario puede elegir entre deducción ficta del 25% o gastos reales documentados.

**Criterios de aceptación:**
- **Ficto**: se deduce el 25% del bruto anual + CCSS anual adicional (art. 8 inc. b). El slider de gastos está oculto.
- **Real**: se deduce el monto de gastos ingresado + CCSS anual. Aparece el slider de gastos. No se aplica la deducción adicional de CCSS.
- El desglose muestra la etiqueta correcta según el modo elegido

### RF-07 Créditos fiscales y pensión voluntaria
**MUST HAVE**

El usuario puede indicar hijos, cónyuge dependiente, y si aporta a pensión voluntaria.

**Criterios de aceptación:**
- Crédito por hijo: ₡20.520/año por cada hijo (configurable en JSON)
- Crédito por cónyuge dependiente: ₡31.080/año (configurable en JSON)
- Pensión voluntaria: deduce hasta el 10% del bruto anual (configurable en JSON)
- Todos se muestran en el desglose fiscal con la referencia legal correcta

### RF-08 IVA (cliente local vs exterior)
**MUST HAVE**

El usuario indica si su cliente es local o del exterior.

**Criterios de aceptación:**
- **Cliente local**: strip verde/amarillo mostrando el 13% mensual que cobra al cliente + nota sobre D-104
- **Cliente exterior**: strip mostrando exención + nota sobre Factura Electrónica de Exportación v4.4
- El IVA no afecta el neto del usuario en ninguno de los dos casos

### RF-09 Simulador de riesgo CCSS
**MUST HAVE**

Modal que simula las consecuencias de subdeclarar ingresos a la CCSS.

**Criterios de aceptación:**
- El slider del modal se inicializa con el bruto actual del calculador
- Si el monto declarado >= monto real, muestra mensaje "Sin exposición"
- Si es menor, calcula: multa fija (3 × salario base), cuotas omitidas retroactivas (1 año), intereses moratorios (8.52%), total sanción
- Muestra el ratio "por cada ₡1 ahorrado arriesgás X colones"
- Valores de salario base y tasa de intereses vienen del `fiscal.config.json`

### RF-10 Modales informativos
**MUST HAVE**

Tres modales con información detallada.

**Criterios de aceptación:**
- **Modal tramos ISR**: muestra los 5 tramos con barra visual proporcional, monto en cada tramo, total ISR bruto
- **Modal tablas CCSS**: Tabla SEM (5 categorías), Tabla IVM (5 categorías), Resumen (% total afiliado + cuota estimada). La fila de la categoría del usuario se resalta con "vos"
- **Modal riesgo CCSS**: ver RF-09
- Todos los modales cierran con Escape o click en el overlay

### RF-11 Componentes UI reutilizables
**MUST HAVE**

Los componentes base deben ser genéricos y desacoplados.

**Criterios de aceptación:**
- `SliderField`: recibe `min`, `max`, `step`, `value`, `onChange`, `label`, `valueDisplay`, `hints`. No conoce lógica fiscal.
- `Chip`: recibe `label`, `active`, `variant` ('green' | 'amber'), `onClick`. No conoce lógica de estado global.
- `Tooltip`: recibe `content` como string o ReactNode. Se posiciona relativo a su contenedor.
- `Modal`: recibe `isOpen`, `onClose`, `children`, `title`. Maneja el scroll del body y el cierre con Escape.
- `CardSection`: recibe `title`, `icon`, `children`. Renderiza el header con línea decorativa.

### RF-12 Página de documentación
**SHOULD HAVE**

Una ruta o página separada que carga el README desde la GitHub API.

**Criterios de aceptación:**
- Se accede desde un link en la app principal
- Hace fetch al endpoint GitHub API con `Accept: application/vnd.github.v3.html`
- Muestra spinner mientras carga
- Si falla, muestra botón de fallback que abre el README en GitHub directamente
- El CSS aplica los estilos de markdown (headings, tables, code blocks, blockquotes)

### RF-13 Barra de distribución y resumen anual
**MUST HAVE**

Visualización del breakdown del ingreso bruto.

**Criterios de aceptación:**
- Barra de colores proporcionales: Neto (emerald), ISR (violet), CCSS (crimson), Pensión (amber)
- Los segmentos con 0% no aparecen en la barra ni en la leyenda
- Resumen de 4 filas: Ingreso bruto anual, CCSS anual, ISR anual, Neto anual — con valores en CRC y USD

### RF-14 Copy email en footer
**SHOULD HAVE**

Click en el email del autor lo copia al portapapeles con feedback visual.

**Criterios de aceptación:**
- Usa `navigator.clipboard.writeText` cuando está disponible
- Fallback: abre `mailto:` en navegadores que no soportan clipboard
- La clase CSS `footer-social-link-copied` se agrega por 2 segundos para mostrar feedback

---

## Requerimientos no funcionales

### RNF-01 TypeScript strict
**MUST HAVE**

Todo el código en TypeScript con `strict: true` en `tsconfig.json`. Sin `any` implícito.

### RNF-02 Sin valores fiscales en código
**MUST HAVE**

Cero valores numéricos fiscales hardcodeados en `.tsx` o `.ts`. Todo viene del `fiscal.config.json`.

### RNF-03 Componentes reutilizables y sin acoplamiento
**MUST HAVE**

Los componentes de `ui/` no importan nada de `calculator/` ni del estado global. Reciben todo por props.

### RNF-04 CSS Modules
**MUST HAVE**

Cada componente tiene su módulo CSS (`.module.css`). Las variables globales se definen en `globals.css`. No se usa CSS-in-JS ni Tailwind (para facilitar contribuciones sin dependencias extra).

### RNF-05 Performance
**SHOULD HAVE**

- `useMemo` para recálculos costosos (ISR, CCSS) cuando los inputs no cambian
- El re-render del panel de resultados no dispara re-renders de los sliders

### RNF-06 Accesibilidad básica
**SHOULD HAVE**

- Todos los sliders tienen `aria-label`
- Los modales tienen `role="dialog"` y `aria-modal="true"`
- Los chips (botones) tienen texto visible o `aria-label`

### RNF-07 Deploy en Vercel
**MUST HAVE**

- `vite build` exitoso sin errores ni warnings de TypeScript
- El `dist/` resultante funciona como SPA en Vercel sin configuración adicional
- Tiempo de build < 60 segundos

### RNF-08 Estructura amigable para contribuidores
**MUST HAVE**

- `README.md` actualizado con instrucciones de instalación y cómo actualizar el `fiscal.config.json`
- Comentarios en el JSON explicando cada campo
- Nombres de variables y componentes en inglés (código) con comentarios en español donde la terminología fiscal lo requiere

### RNF-09 Preparada para extensión
**SHOULD HAVE**

La arquitectura de cálculos permite agregar nuevos regímenes (S.A., S.R.L.) sin modificar los componentes UI existentes. Las funciones de cálculo están en `utils/` y son importables independientemente de los componentes.

---

## Fuera de scope (v1)

- Autenticación o cuentas de usuario
- Persistencia de datos (localStorage o backend)
- Exportar a PDF o Excel
- Múltiples escenarios comparados
- Modo oscuro
- Internacionalización (i18n) — solo español por ahora
- Otros regímenes fiscales (S.A., S.R.L.) — la arquitectura los soporta pero no se implementan en v1
- Tests automatizados (NICE TO HAVE para v2)
