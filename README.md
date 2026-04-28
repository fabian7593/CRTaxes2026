# 🧮 Calculadora Fiscal CR 2026 — Trabajador Independiente

<div align="center">

![Costa Rica](https://img.shields.io/badge/Costa%20Rica-2026-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/status-active-success?style=for-the-badge)

**Calculadora completa de impuestos y cargas sociales para trabajadores independientes en Costa Rica**

[Reportar Bug](../../issues) • [Solicitar Feature](../../issues)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [¿Qué es un Trabajador Independiente?](#-qué-es-un-trabajador-independiente)
- [Marco Legal y Normativo](#-marco-legal-y-normativo)
- [Componentes del Cálculo](#-componentes-del-cálculo)
  - [CCSS - Caja Costarricense de Seguro Social](#1-ccss---caja-costarricense-de-seguro-social)
  - [ISR - Impuesto Sobre la Renta](#2-isr---impuesto-sobre-la-renta)
  - [IVA - Impuesto al Valor Agregado](#3-iva---impuesto-al-valor-agregado)
- [Características](#-características)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Glosario de Términos](#-glosario-de-términos)
- [Contribuir](#-contribuir)
- [Autor](#-autor)
- [Licencia](#-licencia)
- [Licencia](#-licencia)

---

## 🎯 Descripción

Esta calculadora fiscal está diseñada específicamente para **trabajadores independientes** (freelancers, contractors, profesionales liberales) en Costa Rica que necesitan calcular su ingreso neto después de impuestos y cargas sociales.

La herramienta considera todos los aspectos fiscales relevantes para 2026:
- ✅ Escala contributiva CCSS para trabajadores independientes (actualizada con ajuste IVM enero 2026)
- ✅ Tramos ISR escalonados según Decreto 45333-H
- ✅ Deducción ficta del 25% o gastos reales documentados
- ✅ Régimen de IVA según tipo de cliente (local vs. exportación)
- ✅ Créditos fiscales por hijos y cónyuge
- ✅ Pensión voluntaria deducible (RVP)
- ✅ Simulador de riesgo por subdeclaración a la CCSS

---

## 👤 ¿Qué es un Trabajador Independiente?

En Costa Rica, un **trabajador independiente (TI)** es una persona física que:

1. **Presta servicios profesionales** sin relación de dependencia laboral
2. **Factura directamente** a sus clientes (locales o internacionales)
3. **No tiene patrono**, por lo tanto:
   - ❌ No cotiza al ROP (Régimen Obligatorio de Pensiones Complementarias)
   - ❌ No cotiza al FCL (Fondo de Capitalización Laboral)
   - ✅ Debe inscribirse en la CCSS como trabajador independiente
   - ✅ Debe declarar y pagar ISR mediante el formulario D-101

### Ejemplos comunes:
- Desarrolladores de software freelance
- Diseñadores gráficos
- Consultores
- Contadores independientes
- Profesionales que trabajan para empresas extranjeras (remote workers)
- Cualquier profesional que emita facturas por servicios

---

## 📜 Marco Legal y Normativo

### Legislación Aplicable

| Normativa | Descripción | Vigencia |
|-----------|-------------|----------|
| **Decreto N° 45333-H** | Tramos ISR 2026 para personas físicas con actividad lucrativa | 2026 |
| **Decreto N° 44756-MTSS** | Escala contributiva CCSS trabajadores independientes | Gaceta N°232, 10 dic 2024 |
| **Acuerdo JD CCSS N°9038/2019** | Incrementos trienales IVM (+0.16pp cada 3 años) | Quinto incremento: 1 ene 2026 |
| **Ley 7092** | Ley del Impuesto Sobre la Renta | Art. 8 inc. s) reformado dic-2025 |
| **Ley 9635** | Ley de Fortalecimiento de las Finanzas Públicas | Art. 8 (IVA exportación servicios) |
| **Ley 7983** | Régimen Voluntario de Pensiones | Art. 71 (deducción 10% bruto) |
| **Ley 9416** | TRIBU-CR (Tributación Digital) | Cruce automático de datos fiscales |

### Fuentes Oficiales

- **Ministerio de Hacienda**: [hacienda.go.cr](https://www.hacienda.go.cr)
- **CCSS**: [ccss.sa.cr](https://www.ccss.sa.cr)
- **Tribunal Fiscal Administrativo**: Resoluciones y jurisprudencia
- **La Gaceta**: Publicaciones oficiales del Gobierno de Costa Rica

---

## 🧾 Componentes del Cálculo

### 1. CCSS - Caja Costarricense de Seguro Social

La CCSS es el sistema de seguridad social obligatorio en Costa Rica. Para trabajadores independientes, la cotización se divide en dos componentes:

#### 📊 Escala Contributiva 2026

La CCSS utiliza un sistema de **categorías progresivas** basadas en el ingreso bruto mensual:

| Categoría | Rango de Ingreso (CRC/mes) | SEM (Salud) Afiliado | IVM (Pensión) Afiliado 2026 | Total Afiliado |
|-----------|---------------------------|---------------------|---------------------------|----------------|
| **Cat. 1** | Hasta ₡341.227 | 2.89% | 4.16% | **7.05%** |
| **Cat. 2** | ₡341.228 – ₡734.217 | 4.33% | 5.65% | **9.98%** |
| **Cat. 3** | ₡734.218 – ₡1.468.434 | 6.24% | 7.53% | **13.77%** |
| **Cat. 4** | ₡1.468.435 – ₡2.202.651 | 8.02% | 7.98% | **16.00%** |
| **Cat. 5** | Más de ₡2.202.651 | 10.69% | 8.42% | **19.11%** |

#### 🏥 SEM - Seguro de Enfermedad y Maternidad

**¿Qué cubre?**
- Atención médica general y especializada
- Hospitalización y cirugías
- Medicamentos
- Emergencias
- Maternidad y parto
- Exámenes de laboratorio y diagnóstico

**Tasa conjunta**: 12% del ingreso bruto
- **Afiliado**: 2.89% – 10.69% (según categoría)
- **Estado**: Complementa el resto hasta llegar al 12%

#### 🏦 IVM - Invalidez, Vejez y Muerte

**¿Qué cubre?**
- Pensión por vejez (requiere 300 cuotas = 25 años y 65 años de edad)
- Pensión por invalidez
- Pensión por muerte (para beneficiarios)

**Ajuste 2026**: El 1° de enero de 2026 entró en vigor el quinto incremento trienal (+0.16 puntos porcentuales) según acuerdo JD CCSS Sesión N°9038/2019.



#### ⚠️ Base Mínima de Cotización (BMC)

**BMC 2026**: ₡341.228/mes

Si tu ingreso bruto mensual es menor a ₡341.228, la CCSS te cobrará sobre esta base mínima de todas formas. Esto garantiza acceso completo a los servicios de salud.

#### 🚨 Obligatoriedad y Sanciones

**Importante**: Inscribirse en Hacienda como trabajador independiente = **obligación automática** de inscribirse en la CCSS dentro de 8 días hábiles.

**Sanciones por subdeclaración (Art. 44 Ley Constitutiva CCSS)**:
- Multa fija: 3 salarios base (₡1.386.600 en 2026)
- Cuotas omitidas retroactivas con intereses moratorios (8.52% anual)
- TRIBU-CR cruza automáticamente: facturación electrónica + D-101 Hacienda + reportes CCSS

---

### 2. ISR - Impuesto Sobre la Renta

El ISR es el impuesto que se paga sobre las ganancias netas anuales. Costa Rica utiliza un sistema de **tramos escalonados progresivos**.

#### 📊 Tramos ISR 2026 (Decreto 45333-H)

| Tramo | Desde (CRC/año) | Hasta (CRC/año) | Tasa | Impuesto Máximo del Tramo |
|-------|----------------|-----------------|------|---------------------------|
| **Exento** | ₡0 | ₡6.244.000 | 0% | ₡0 |
| **Tramo 1** | ₡6.244.001 | ₡8.329.000 | 10% | ₡208.500 |
| **Tramo 2** | ₡8.329.001 | ₡10.414.000 | 15% | ₡312.750 |
| **Tramo 3** | ₡10.414.001 | ₡20.872.000 | 20% | ₡2.091.600 |
| **Tramo 4** | ₡20.872.001 | en adelante | 25% | (sin límite) |

#### 🧮 ¿Cómo funciona el cálculo escalonado?

**Ejemplo**: Ingreso neto anual de ₡15.000.000

```
Tramo exento (₡0 – ₡6.244.000):
  ₡6.244.000 × 0% = ₡0

Tramo 1 (₡6.244.001 – ₡8.329.000):
  ₡2.085.000 × 10% = ₡208.500

Tramo 2 (₡8.329.001 – ₡10.414.000):
  ₡2.085.000 × 15% = ₡312.750

Tramo 3 (₡10.414.001 – ₡15.000.000):
  ₡4.586.000 × 20% = ₡917.200

ISR total anual: ₡1.438.450
Tasa efectiva: 9.59%
```

**Nota importante**: La tasa del 25% **NO** se aplica sobre el total del ingreso, solo sobre el excedente de ₡20.872.000.

#### 💰 Base Imponible (Renta Neta)

La renta neta se calcula como:

```
Renta Neta = Ingreso Bruto Anual 
           - Deducciones permitidas 
           - Pensión voluntaria (si aplica)
           - CCSS anual (si usás deducción ficta)
```

#### 📝 Deducciones Permitidas (Art. 8 Ley 7092)

Tenés dos opciones (no se pueden combinar):

**Opción 1: Deducción Ficta del 25%**
- Podés deducir automáticamente el **25% del ingreso bruto**
- No necesitás facturas ni comprobantes
- Es la opción más simple y común para servicios digitales
- **Adicional**: Si usás esta opción, podés deducir también la CCSS anual completa

**Opción 2: Gastos Reales Documentados**
- Deducís el monto exacto de tus gastos con facturas electrónicas
- Incluye: equipo, software, internet, contador, alquiler de oficina, etc.
- Útil si tus gastos superan el 25% del bruto
- **No podés** deducir la CCSS adicional si usás esta opción



#### 🎁 Créditos Fiscales

Los créditos fiscales se **restan directamente del ISR calculado** (no de la base imponible):

| Concepto | Monto Anual | Requisitos |
|----------|-------------|------------|
| **Por hijo** | ₡20.520 c/u | Menor de edad, o menor de 25 años en estudios superiores, o con discapacidad |
| **Por cónyuge** | ₡31.080 | Dependiente económicamente (sin ingresos o menores al salario mínimo) |

**Ejemplo**: ISR calculado ₡500.000 - 2 hijos (₡41.040) - cónyuge (₡31.080) = **ISR final ₡427.880**

#### 💼 Pensión Voluntaria Deducible (Art. 71 Ley 7983)

Si aportás a un **Régimen Voluntario de Pensiones (RVP)** en una Operadora de Pensiones Complementarias (OPC):

- **Deducible**: Hasta el **10% del ingreso bruto anual**
- **Operadoras**: BAC Pensiones, BCR Pensiones, BN Vital, Popular Pensiones, etc.
- **Beneficio**: Reduce la renta neta imponible antes de aplicar los tramos ISR
- **Importante**: Como TI no tenés ROP (requiere patrono), el RVP es tu mejor herramienta para complementar la pensión IVM

#### 📅 Declaración y Pago

- **Formulario**: D-101 (Declaración Jurada del Impuesto Sobre la Renta)
- **Plazo**: Antes del 15 de marzo del año siguiente
- **Pagos parciales**: Se pueden hacer pagos trimestrales anticipados (D-110)
- **Plataforma**: ATV (Administración Tributaria Virtual) - Ministerio de Hacienda

---

### 3. IVA - Impuesto al Valor Agregado

El IVA es un impuesto del **13%** que se aplica sobre la venta de bienes y servicios en Costa Rica.

#### 🌎 Exportación de Servicios (Art. 8 Ley 9635)

**Si tu cliente es una empresa en el exterior** (EE.UU., Europa, etc.) que usa tu servicio fuera de Costa Rica:

✅ **Estás exento de IVA**
- No cobrás el 13% al cliente
- Emitís Factura Electrónica de Exportación v4.4 al 0%
- El D-104 mensual igual es obligatorio (declaración en ceros)
- Podés acumular crédito fiscal por compras locales con IVA


#### 🏢 Cliente Local

**Si tu cliente es una empresa o persona en Costa Rica**:

❌ **Debés cobrar IVA del 13%**
- Cobrás ₡113 por cada ₡100 de servicio
- El IVA **no sale de tu bolsillo** — lo paga el cliente
- Debés trasladarlo a Hacienda mediante el **D-104 mensual**
- Plazo: Antes del día 15 de cada mes
- Omitir la declaración genera multa de ₡231.100


El cliente paga ₡1.728.900, vos recibís ₡1.530.000 en tu bolsillo y trasladás ₡198.900 a Hacienda.

#### 📋 Facturación Electrónica

Desde 2018, la facturación electrónica es **obligatoria** en Costa Rica:

- **Sistema**: Plataforma del Ministerio de Hacienda (ATV)
- **Tipos de factura**:
  - v4.3: Factura electrónica estándar (cliente local)
  - v4.4: Factura electrónica de exportación (cliente exterior)
- **Proveedores**: [Orioltech](https://orioltech.com/), Hacienda, etc.
- **Validación**: Cada factura debe ser validada por Hacienda en tiempo real

---

## ⚡ Características de la web

### Cálculos Automáticos
- ✅ Categoría CCSS automática según ingreso bruto
- ✅ ISR escalonado con visualización de tramos activos
- ✅ Tasa efectiva real (CCSS + ISR / bruto)
- ✅ Conversión automática USD ↔ CRC
- ✅ Distribución visual del ingreso (neto, ISR, CCSS, pensión)

### Escenarios Soportados
- 💻 **Solo servicios profesionales**: Freelancer puro, contractor
- ⚡ **Régimen mixto**: Empleo formal + servicios externos (el tramo exento ya se consume con el salario)

### Herramientas Adicionales
- 📊 **Tablas CCSS completas**: SEM, IVM y resumen por categoría
- 📈 **Visualización de tramos ISR**: Muestra qué porción de tu ingreso cae en cada tramo
- 🏦 **Explicación fondos de pensión**: ROP, FCL, IVM, RVP — cuáles aplican a un TI
- ⚠️ **Simulador de riesgo CCSS**: Calcula el costo real de subdeclarar ingresos

### Optimización Fiscal
- 🎯 Comparación automática: deducción ficta 25% vs. gastos reales
- 💰 Cálculo de ahorro fiscal con pensión voluntaria (RVP)
- 📉 Créditos fiscales por hijos y cónyuge
- 🌍 Diferenciación IVA: cliente local vs. exportación

---

## 📖 Glosario de Términos

### Siglas y Acrónimos Fiscales

| Término | Significado | Descripción |
|---------|-------------|-------------|
| **ATV** | Administración Tributaria Virtual | Plataforma digital del Ministerio de Hacienda para trámites fiscales en línea |
| **BMC** | Base Mínima de Cotización | Ingreso mínimo sobre el cual se debe cotizar a la CCSS (₡341.228/mes en 2026) |
| **CCSS** | Caja Costarricense de Seguro Social | Institución que administra el sistema de seguridad social en Costa Rica |
| **D-101** | Declaración Jurada del ISR | Formulario para declarar el Impuesto Sobre la Renta anualmente |
| **D-104** | Declaración del IVA | Formulario mensual para declarar el Impuesto al Valor Agregado |
| **D-110** | Declaración de Pagos Parciales ISR | Formulario para pagos trimestrales anticipados del ISR |
| **FCL** | Fondo de Capitalización Laboral | Ahorro obligatorio para trabajadores con patrono (no aplica a TI) |
| **ISR** | Impuesto Sobre la Renta | Impuesto anual sobre las ganancias netas de personas físicas y jurídicas |
| **IVA** | Impuesto al Valor Agregado | Impuesto del 13% sobre la venta de bienes y servicios en Costa Rica |
| **IVM** | Invalidez, Vejez y Muerte | Régimen de pensiones de la CCSS que cubre jubilación, invalidez y muerte |
| **OPC** | Operadora de Pensiones Complementarias | Entidad autorizada para administrar fondos de pensión voluntaria |
| **ROP** | Régimen Obligatorio de Pensiones Complementarias | Ahorro obligatorio para trabajadores con patrono (no aplica a TI) |
| **RVP** | Régimen Voluntario de Pensiones | Sistema de ahorro voluntario para complementar la pensión IVM |
| **SEM** | Seguro de Enfermedad y Maternidad | Componente de la CCSS que cubre servicios de salud |
| **TI** | Trabajador Independiente | Persona física que presta servicios sin relación de dependencia laboral |
| **TRIBU-CR** | Tributación Digital Costa Rica | Sistema de cruce automático de información fiscal entre instituciones |

### Términos Fiscales Clave

| Término | Descripción |
|---------|-------------|
| **Base Imponible** | Monto sobre el cual se calcula un impuesto (ingreso bruto menos deducciones) |
| **Crédito Fiscal** | Monto que se resta directamente del impuesto calculado (no de la base imponible) |
| **Deducción Ficta** | Deducción automática del 25% del ingreso bruto sin necesidad de comprobantes |
| **Escala Contributiva** | Sistema de categorías progresivas de la CCSS según nivel de ingresos |
| **Exportación de Servicios** | Servicios prestados a clientes en el exterior, exentos de IVA |
| **Factura Electrónica v4.3** | Formato de factura para clientes locales (con IVA 13%) |
| **Factura Electrónica v4.4** | Formato de factura para exportación de servicios (IVA 0%) |
| **Gastos Reales Documentados** | Deducciones basadas en facturas electrónicas de gastos del negocio |
| **Renta Neta** | Ingreso bruto menos deducciones permitidas (base para calcular ISR) |
| **Tasa Efectiva** | Porcentaje real de impuestos pagados sobre el ingreso bruto total |
| **Tramos Escalonados** | Sistema progresivo del ISR donde cada porción del ingreso tributa a tasas diferentes |

### Conceptos de Seguridad Social

| Término | Descripción |
|---------|-------------|
| **Afiliado** | Persona inscrita en la CCSS que paga cuotas y tiene derecho a servicios |
| **Categoría CCSS** | Nivel de cotización asignado según el ingreso bruto mensual declarado |
| **Cuotas Omitidas** | Pagos de CCSS no realizados que generan deuda con intereses moratorios |
| **Pensión por Vejez** | Beneficio mensual al cumplir 65 años y 300 cuotas (25 años de cotización) |
| **Subdeclaración** | Declarar ingresos menores a los reales para pagar menos CCSS (sancionable) |

---


## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Este proyecto está abierto a la comunidad para mantenerlo actualizado con los cambios fiscales de Costa Rica.

### ¿Cómo contribuir?

1. **Fork** el repositorio
2. Creá una **rama** para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrí un **Pull Request**


### Reportar Bugs

Si encontrás un error en los cálculos o en la aplicación:

1. Andá a la sección [Issues](../../issues)
2. Creá un nuevo issue con:
   - Descripción clara del problema
   - Pasos para reproducirlo
   - Resultado esperado vs. resultado obtenido

---

## 👨‍💻 Autor

**Fabián Rosales**

- 🌐 GitHub: [@fabian7593](https://github.com/fabian7593) (Arcane Coder)
- 💼 LinkedIn: [frosales-softdev](https://www.linkedin.com/in/frosales-softdev/)
- 📧 Contacto: [A través de GitHub](https://github.com/fabian7593)

### Sobre el Autor

Senior Software Engineer con más de 12 años de experiencia en desarrollo de aplicaciones móviles nativas (Android/iOS), backends con TypeScript/Node.js y sistemas .NET. Ha trabajado en proyectos de fintech, banca, salud y medios, entregando productos end-to-end que han alcanzado más de 250K descargas acumuladas.

Creador de proyectos open-source con 338 estrellas en GitHub, incluyendo MagicalCamera (biblioteca Android ampliamente adoptada), Tenshi (framework backend TypeScript modular), y Vortex TV (plataforma OTT multi-servicio). Especializado en arquitecturas limpias, microservicios, multi-tenant, monolith, integración de APIs complejas (GraphQL, REST).

Este proyecto nace de la experiencia personal como trabajador independiente en Costa Rica y la necesidad de contar con una herramienta clara, actualizada y transparente para calcular impuestos y cargas sociales en el ecosistema tech costarricense.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - mirá el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2026 Fabián Rosales

Se concede permiso, de forma gratuita, a cualquier persona que obtenga una copia
de este software y archivos de documentación asociados (el "Software"), para usar
el Software sin restricciones, incluyendo sin limitación los derechos de usar,
copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias
del Software, y permitir a las personas a quienes se les proporcione el Software
hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las
copias o porciones sustanciales del Software.

EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O
IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A LAS GARANTÍAS DE COMERCIABILIDAD,
IDONEIDAD PARA UN PROPÓSITO PARTICULAR Y NO INFRACCIÓN.
```

---

## ⚠️ Disclaimer Legal

Esta calculadora es una **herramienta informativa y educativa**. Los cálculos se basan en la legislación vigente de Costa Rica para 2026, pero:

- ❗ **No constituye asesoría legal, fiscal ni contable**
- ❗ **No reemplaza la consulta con un contador o abogado**
- ❗ Cada caso puede tener particularidades que requieren análisis profesional
- ❗ La legislación fiscal puede cambiar — verificá siempre con fuentes oficiales
- ❗ El autor no se hace responsable por decisiones tomadas basadas en esta herramienta

**Recomendación**: Usá esta calculadora como punto de partida, pero consultá con un profesional en contabilidad o derecho tributario para tu situación específica.

---

## 🔗 Enlaces Útiles

### Instituciones Oficiales
- [Ministerio de Hacienda](https://www.hacienda.go.cr) - Impuestos y ATV
- [CCSS](https://www.ccss.sa.cr) - Seguridad social
- [SUPEN](https://www.supen.fi.cr) - Superintendencia de Pensiones
- [La Gaceta](https://www.imprentanacional.go.cr/gaceta/) - Publicaciones oficiales

### Recursos para Trabajadores Independientes
- [Colegio de Contadores](https://www.ccpcr.or.cr)
- [Cámara de Tecnologías de Información y Comunicación (CAMTIC)](https://www.camtic.org)
- [Guía CCSS Trabajador Independiente](https://www.ccss.sa.cr/tramites_servicios)

### Herramientas Complementarias
- [ATV - Administración Tributaria Virtual](https://atv.hacienda.go.cr)
- [Facturación Electrónica Hacienda](https://www.hacienda.go.cr/contenido/14350-factura-electronica)
- [Calculadora BCCR Tipo de Cambio](https://www.bccr.fi.cr)

### Opciones de Facturación Electrónica
- [Orioltech](https://orioltech.com/) - Plataforma de facturación electrónica para Costa Rica


---

<div align="center">

**¿Te resultó útil esta herramienta?**

⭐ Dale una estrella al repositorio

🤝 Contribuí con mejoras mediante Pull Requests

---

Hecho con ❤️ en Costa Rica 🇨🇷

</div>
