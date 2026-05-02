---
inclusion: always
---

# Product Overview — Calculadora Fiscal CR 2026

## Purpose

Calculadora web open source para trabajadores independientes (freelancers, contractors, profesionales liberales) en Costa Rica. Permite calcular con precisión el ingreso neto real después de CCSS, ISR y otros impuestos, basándose en la legislación fiscal vigente para 2026.

El proyecto nace de la experiencia personal del autor como trabajador independiente en Costa Rica, ante la falta de herramientas claras y actualizadas. Es de uso libre, transparente en sus cálculos, y está diseñado para ser fácilmente actualizable cada año fiscal.

## Target users

- Freelancers costarricenses que facturan en USD (clientes extranjeros, remote work)
- Freelancers costarricenses que facturan en CRC (clientes locales)
- Profesionales con régimen mixto: trabajan para una empresa Y tienen clientes propios
- Contadores y asesores fiscales que quieren explicar los cálculos a sus clientes
- Cualquier persona que quiera entender cuánto se lleva realmente en el bolsillo

## Key features

1. Cálculo de CCSS (Seguro de Salud SEM + Pensión IVM) por categoría contributiva (1-5)
2. Cálculo de ISR escalonado con tramos 2026 (Decreto 45333-H)
3. Soporte para régimen individual (solo servicios) y régimen mixto (empleo + servicios)
4. Deducción ficta 25% o gastos reales documentados
5. Créditos fiscales por hijos y cónyuge
6. Pensión voluntaria deducible (RVP, art. 71 Ley 7983)
7. Diferenciación IVA: cliente local (13%) vs exportación de servicios (0%)
8. Switcher de moneda: ingresar tarifa en USD o en CRC
9. Tipo de cambio en tiempo real desde API pública del BCCR
10. Simulador de riesgo por subdeclaración a la CCSS (con cálculo de sanciones art. 44)
11. Página de documentación que carga el README desde GitHub API

## Business objectives

- Ser la herramienta fiscal más completa, actualizada y transparente para TI en Costa Rica
- Facilitar contribuciones de la comunidad para mantener los datos fiscales actualizados cada año
- Ser parte del portafolio público del autor (Fabián Rosales, Senior Software Engineer)
- Demostrar arquitectura moderna (React + Vite + TypeScript) con código limpio y mantenible

## Disclaimer importante

Esta calculadora es una herramienta informativa y educativa. No constituye asesoría legal, fiscal ni contable. Cada usuario debe verificar con un contador o abogado su situación particular.

## Extensibilidad futura

La arquitectura está diseñada para agregar nuevos tipos de contribuyentes en el futuro:
- Sociedades Anónimas (S.A.)
- Sociedades de Responsabilidad Limitada (S.R.L.)
- Otras categorías según la legislación costarricense

Los valores fiscales están externalizados en `src/config/fiscal.config.json` para facilitar actualizaciones anuales sin modificar código.
