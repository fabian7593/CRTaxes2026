---
inclusion: always
---

# Product Overview — Calculadora Fiscal CR 2026

## Purpose

Calculadora web open source para múltiples regímenes fiscales en Costa Rica. Permite calcular con precisión el ingreso neto real después de CCSS, ISR y otros impuestos, basándose en la legislación fiscal vigente para 2026.

El proyecto nace de la experiencia personal del autor como trabajador independiente en Costa Rica, ante la falta de herramientas claras y actualizadas. Es de uso libre, transparente en sus cálculos, y está diseñado para ser fácilmente actualizable cada año fiscal.

## Regímenes fiscales soportados

La calculadora soporta 4 regímenes fiscales diferentes, cada uno con sus propias reglas de cálculo:

1. **Persona Física Independiente**: Trabajador independiente (freelancer, contractor, profesional liberal) sin relación de dependencia. Aplica CCSS, créditos fiscales, y tramos ISR persona física.

2. **Persona Física Mixta**: Asalariado con ingresos adicionales por servicios profesionales independientes. El salario consume el tramo exento del ISR, los honorarios tributan desde el primer colón al 10%. Aplica CCSS y créditos fiscales.

3. **Sociedad Anónima (S.A.)**: Persona jurídica con responsabilidad limitada al capital aportado. No aplica CCSS ni créditos fiscales. Usa tramos ISR persona jurídica (5%, 10%, 20%, 30%) + impuesto anual fijo de ₡69,000.

4. **Sociedad de Responsabilidad Limitada (S.R.L.)**: Persona jurídica con estructura legal más flexible que S.A. Mismos tramos ISR que S.A. pero con estructura legal distinta.

## Target users

- Freelancers costarricenses que facturan en USD (clientes extranjeros, remote work)
- Freelancers costarricenses que facturan en CRC (clientes locales)
- Profesionales con régimen mixto: trabajan para una empresa Y tienen clientes propios
- Dueños de sociedades (S.A. o S.R.L.) que necesitan calcular ISR sobre utilidades
- Contadores y asesores fiscales que quieren explicar los cálculos a sus clientes
- Cualquier persona que quiera entender cuánto se lleva realmente en el bolsillo

## Key features

1. **Soporte para 4 regímenes fiscales**: Persona Física Independiente, Persona Física Mixta, S.A., y S.R.L.
2. Cálculo de CCSS (Seguro de Salud SEM + Pensión IVM) por categoría contributiva (1-5) para personas físicas
3. Cálculo de ISR escalonado con tramos 2026 (Decreto 45333-H):
   - Tramos persona física: 0%, 10%, 15%, 20%, 25%
   - Tramos persona jurídica: 5%, 10%, 20%, 30%
4. Soporte para régimen individual (solo servicios) y régimen mixto (empleo + servicios)
5. Deducción ficta 25% o gastos reales documentados
6. Créditos fiscales por hijos y cónyuge (solo personas físicas)
7. Pensión voluntaria deducible (RVP, art. 71 Ley 7983)
8. Diferenciación IVA: cliente local (13%) vs exportación de servicios (0%)
9. Switcher de moneda: ingresar tarifa en USD o en CRC
10. Tipo de cambio en tiempo real desde API pública del BCCR
11. Simulador de riesgo por subdeclaración a la CCSS (con cálculo de sanciones art. 44)
12. Página de documentación que carga el README desde GitHub API

## Business objectives

- Ser la herramienta fiscal más completa, actualizada y transparente para TI en Costa Rica
- Facilitar contribuciones de la comunidad para mantener los datos fiscales actualizados cada año
- Ser parte del portafolio público del autor (Fabián Rosales, Senior Software Engineer)
- Demostrar arquitectura moderna (React + Vite + TypeScript) con código limpio y mantenible

## Disclaimer importante

Esta calculadora es una herramienta informativa y educativa. No constituye asesoría legal, fiscal ni contable. Cada usuario debe verificar con un contador o abogado su situación particular.

## Extensibilidad futura

La arquitectura está diseñada para agregar nuevos tipos de contribuyentes en el futuro según la legislación costarricense evolucione. Los 4 regímenes actuales cubren la mayoría de casos de uso:

- ✅ **Persona Física Independiente** (implementado)
- ✅ **Persona Física Mixta** (implementado)
- ✅ **Sociedad Anónima (S.A.)** (implementado)
- ✅ **Sociedad de Responsabilidad Limitada (S.R.L.)** (implementado)

Los valores fiscales están externalizados en `src/config/fiscal.config.json` para facilitar actualizaciones anuales sin modificar código. Cada régimen tiene su propia configuración de:
- Aplicabilidad de CCSS
- Aplicabilidad de créditos fiscales
- Tramos ISR a utilizar (persona física vs persona jurídica)
- Impuestos anuales fijos (sociedades)
