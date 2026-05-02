# Design — Calculadora Fiscal CR 2026

## Principio fundamental

**El diseño existente es el contrato.** Este documento describe el diseño actual para que Kiro lo reproduzca fielmente en React. No hay decisiones de diseño nuevas — hay transcripción del CSS/HTML existente a un sistema de componentes.

---

## Tokens de diseño (globals.css)

Estas variables CSS se declaran en `src/styles/globals.css` y están disponibles en todos los módulos.

```css
:root {
  /* Textos */
  --ink:  #1a1a2e;   /* texto principal */
  --ink2: #2d2d4e;   /* texto secundario */
  --ink3: #4a4a6a;   /* texto terciario / labels */
  --muted: #8888aa;  /* texto muted */
  --soft:  #c4c4d8;  /* texto muy tenue */
  --line:  #e8e8f0;  /* separadores / bordes */

  /* Fondos */
  --bg:       #f5f4f0;  /* fondo de página */
  --bg2:      #eeecf0;  /* fondo alternativo (tabs, track sliders) */
  --surface:  #fff;     /* fondo de cards */
  --surface2: #f9f8ff;  /* fondo de cards secundarias */

  /* Colores semánticos */
  --emerald:     #00c896;   /* acento principal / positivo */
  --emerald-bg:  #e6fff9;
  --emerald-mid: #00a07a;   /* texto sobre emerald-bg */

  --crimson:    #e84545;    /* negativo / peligro */
  --crimson-bg: #fff0f0;

  --amber:     #f5a400;     /* advertencia / mixto */
  --amber-bg:  #fff8e6;
  --amber-mid: #c07800;

  --cobalt:    #3b5bdb;     /* informativo / links */
  --cobalt-bg: #eef2ff;

  --violet:    #7c3aed;     /* ISR en barra distribución */
  --violet-bg: #f5f0ff;

  --teal:    #0891b2;
  --teal-bg: #e0f7fa;

  /* Bordes y sombras */
  --r:         14px;
  --rs:        8px;
  --shadow:    0 1px 3px rgba(26,26,46,.06), 0 4px 16px rgba(26,26,46,.06);
  --shadow-lg: 0 8px 40px rgba(26,26,46,.15);

  /* Tipografía */
  --sans: 'Inter', system-ui, -apple-system, sans-serif;
  --mono: 'JetBrains Mono', monospace;
}
```

---

## Tipografía

| Uso | Familia | Tamaño | Peso |
|-----|---------|--------|------|
| Body general | --sans | 14px | 400 |
| Labels de slider | --sans | 13px | 400, color: --ink3 |
| Valores numéricos | --mono | 14px | 500, color: --ink |
| Valores positivos | --mono | - | color: --emerald-mid |
| Valores negativos | --mono | - | color: --crimson |
| Card titles | --sans | 11px | 600, uppercase, letter-spacing: .08em, color: --muted |
| Hero título | --sans | clamp(20px, 3.5vw, 30px) | 700 |
| Eyebrow hero | --mono | 10px | -, color: --emerald, letter-spacing: .2em, uppercase |

---

## Layout

### Desktop (> 840px)
```
┌─────────────────────────────────────────────────────────────┐
│  HERO (full width, bg: --ink)                               │
├──────────────────────────────┬──────────────────────────────┤
│  Panel izquierdo (1fr)       │  Panel derecho (360px)      │
│  - Cards de inputs           │  - Sticky result panel      │
│  - Sliders                   │  - Neto mensual grande      │
│  - Chips de opciones         │  - Barra distribución       │
│  - CCSS card                 │  - Resumen anual            │
│  - IVA info                  │  - Tabla desglose           │
│  - Breakdown table           │                             │
└──────────────────────────────┴──────────────────────────────┘
│  FOOTER (full width, bg: --ink)                             │
└─────────────────────────────────────────────────────────────┘
```

### Mobile (≤ 840px)
- Two-col → single column
- Panel resultado sticky → static (posición normal en el flujo)

---

## Componentes de diseño

### Hero

```
bg: --ink (dark navy)
padding: 36px 0 28px
overflow: hidden (para el ::before y ::after de gradientes radiales)

::before — gradiente radial emerald top-right
::after  — gradiente radial cobalt bottom-center

Contenido:
  [eyebrow text en mono emerald, uppercase, letter-spacing .2em]
  [h1 con <em> en emerald]
  [subtítulo en mono, color rgba(255,255,255,.45)]
  [badges — .hbadge con borde semi-transparente]
    .hbadge.g → borde emerald, color emerald
    .hbadge.a → borde amber, color amber
```

### Card

```css
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r);  /* 14px */
  padding: 20px;
  box-shadow: var(--shadow);
  margin-bottom: 14px;
}
```

**Card title** (la línea con texto uppercase + línea decorativa):
```css
.card-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line);
}
```

Los iconos en el card-title usan `.ci` (26×26px, border-radius 6px):
- `.ci-g` → background: --emerald-bg
- `.ci-a` → background: --amber-bg
- `.ci-b` → background: --cobalt-bg
- `.ci-r` → background: --crimson-bg

### SliderField

Estructura HTML exacta (como CSS Module):
```
<div class="sr">
  <div class="sr-top">
    <label class="sr-label">
      [texto del label]
      <Tooltip content="..." />   ← si tiene tooltip
    </label>
    <span class="sr-val [g|a|b|r]">[valor formateado]</span>
  </div>
  <div class="sr-track">
    <div class="sr-fill" id="fill-X" />    ← fill animado
    <input type="range" ... />
  </div>
  <div class="sr-hints">
    <span>[min label]</span>
    <span>[max label]</span>
  </div>
</div>
```

Fill del slider: `linear-gradient(90deg, var(--emerald), var(--cobalt))`  
Ancho del fill: `(value - min) / (max - min) * 100%`  
Transición: `width .08s`

El `<input type=range>` está posicionado absolutamente sobre el track, con `opacity: 0`, para que el track visual custom se vea debajo.

### Chip

```css
.chip {
  font-size: 12px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--line);
  background: var(--surface);
  color: var(--ink3);
  cursor: pointer;
  transition: all .15s;
}
.chip.on-g {   /* activo verde */
  background: var(--emerald-bg);
  border-color: var(--emerald);
  color: var(--emerald-mid);
}
.chip.on-a {   /* activo amber */
  background: var(--amber-bg);
  border-color: var(--amber);
  color: var(--amber-mid);
}
```

Los chips se agrupan en `.chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px }`

### Tooltip

El tooltip inline que aparece en los labels de los sliders:

```
<span class="tipw">
  <span class="tpic">?</span>      ← círculo gris 16px con ? en mono
  <div class="tipb">...</div>      ← bubble que aparece on hover
</span>
```

```css
.tipw { position: relative; display: inline-flex; align-items: center; }
.tpic {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px;
  background: var(--bg2); border: 1px solid var(--line);
  border-radius: 50%; font-size: 9px; font-family: var(--mono);
  color: var(--muted); cursor: help; user-select: none;
}
.tipb {
  position: absolute; bottom: calc(100% + 8px); left: 50%;
  transform: translateX(-50%);
  background: var(--ink); color: #fff;
  font-size: 12px; line-height: 1.5; padding: 10px 12px;
  border-radius: 8px; width: 260px; z-index: 100;
  box-shadow: 0 8px 24px rgba(0,0,0,.3);
  visibility: hidden; opacity: 0; transition: all .15s;
  pointer-events: none;
}
.tipw:hover .tipb { visibility: visible; opacity: 1; }
```

### Regime Tabs (Solo / Mixto)

```css
.rtabs {
  display: flex; background: var(--bg2);
  border-radius: var(--r); padding: 4px;
  margin-bottom: 14px; border: 1px solid var(--line); gap: 4px;
}
.rtab {
  flex: 1; padding: 9px 10px; border-radius: 10px;
  border: none; background: transparent;
  font-size: 13px; font-weight: 500; color: var(--muted);
  cursor: pointer; transition: all .2s;
}
.rtab.solo  { background: var(--surface); color: var(--emerald-mid); box-shadow: var(--shadow); }
.rtab.mixto { background: var(--surface); color: var(--amber-mid);   box-shadow: var(--shadow); }
```

Cada tab tiene:
- `.ri` → emoji/icon, 16px, display block, margin-bottom 1px
- `.rs` → subtítulo, 10px, mono, opacity .7, display block

### Modal

```css
.modal-overlay {
  display: none; /* o visibility: hidden */
  position: fixed; inset: 0;
  background: rgba(26,26,46,.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  align-items: center; justify-content: center;
  padding: 16px;
}
.modal-overlay.open { display: flex; }

.modal-box {
  background: var(--surface);
  border-radius: var(--r);
  box-shadow: var(--shadow-lg);
  max-width: 560px; width: 100%;
  max-height: 90vh; overflow-y: auto;
  position: relative;
}
```

El modal tiene un header con título y botón de cierre (×), y contenido scrollable.

### Panel de resultado (derecho, sticky)

```
bg: --surface
border: 1px solid --line
border-radius: --r
box-shadow: --shadow
position: sticky
top: 20px (en desktop)

Contenido:
  [Neto mensual — número grande en mono, color: --emerald-mid]
  [Equivalente en USD — mono pequeño, muted]
  [Pill de meses facturados]
  [Bruto mensual]
  [CCSS mensual]
  [ISR mensual]
  [Tasa efectiva]
  [--- separador ---]
  [Barra de distribución]
  [Leyenda de distribución]
  [--- separador ---]
  [Resumen anual — 4 filas]
```

### Barra de distribución

```css
.dist-bar {
  display: flex; height: 8px; border-radius: 4px;
  overflow: hidden; margin-bottom: 8px;
}
/* Segmentos coloreados: */
/* Neto: #00c896, ISR: #7c3aed, CCSS: #e84545, Pensión: #f5a400 */
```

Leyenda: `.dl-i { display: flex; align-items: center; gap: 4px; font-size: 11px; }`  
Cada ítem tiene un `.dl-d` (círculo 8×8px del color correspondiente).

### Tabla desglose (breakdown)

```
<table id="bkdn">
  <tr class="sh">           ← section header (fila de sección sin borde)
  <tr>                      ← fila normal
  <tr class="sub">          ← subtotal (fondo --bg2, fuente 500)
  <tr class="tot">          ← total final (fondo --ink, color blanco, fuente 600)
</table>
```

Cada fila tiene:
- Columna label: `.bkdn-label-wrapper` con icon + texto + tooltip opcional
- Columna valor: `.bkdn-amount` (CRC, mono 13px) + `.bkdn-usd` (USD, mono 11px, muted)
- Classes de color: `.bkdn-pos` (emerald), `.bkdn-neg` (crimson), `.bkdn-neu` (amber)

### IVA strip

```css
.iva-strip {
  padding: 12px 14px; border-radius: 10px;
  font-size: 12px; line-height: 1.6;
}
.iva-strip.loc { background: var(--amber-bg); border: 1px solid rgba(245,164,0,.3); color: var(--amber-mid); }
.iva-strip.ext { background: var(--emerald-bg); border: 1px solid rgba(0,200,150,.3); color: var(--emerald-mid); }
```

### Footer

```css
footer {
  background: var(--ink);
  color: rgba(255,255,255,.5);
  padding: 40px 0;
  margin-top: 40px;
  font-size: 12px;
}
```

Links sociales: `.footer-social-link` con hover que cambia color.  
Estado copiado: `.footer-social-link-copied` — clase que se agrega por 2s al copiar el email, cambia color a emerald y muestra checkmark.

---

## Decisiones de diseño relevantes para CSS Modules

### Namespacing

Cada componente tiene su `.module.css`. Importar como:
```typescript
import styles from './SliderField.module.css'
// uso: className={styles.srTrack}
```

Las variables CSS globales (de `globals.css`) se usan directamente con `var(--emerald)` etc. en los módulos — funcionan porque están en `:root`.

### Composición de clases

Para chips con variante activa, combinar con `clsx`:
```typescript
import clsx from 'clsx'
className={clsx(styles.chip, active && styles.onG)}
```

### Animación del fill del slider

El fill es un `<div>` posicionado absolutamente, su ancho se actualiza en `onChange` del input via estado React. No usar refs directamente (aunque sería más performante) para mantener el código idiomático React en v1.

---

## Responsive

```css
/* En globals.css o PageLayout.module.css */
.twoCol {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 20px;
  align-items: start;
}

@media (max-width: 840px) {
  .twoCol {
    grid-template-columns: 1fr;
  }
  /* El panel sticky se vuelve static automáticamente */
}
```

---

## Notas de accesibilidad

- Todos los `<input type="range">` deben tener `aria-label` descriptivo
- Los chips que funcionan como radio buttons deben tener `role="radio"` y `aria-checked`
- Los modales: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apuntando al título
- El botón de cierre de modal debe tener `aria-label="Cerrar"`
