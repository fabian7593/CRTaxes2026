// ─── CURRENCY HANDLER ─────────────────────────────────
// Este archivo maneja la lógica de cambio de moneda

// ─── CURRENCY SWITCHER ───────────────────────────────
function setCurrency(cur){
  const prevCurrency = currency;
  currency = cur;
  
  // Actualizar botones
  $('bcur-usd').className='chip '+(cur==='usd'?'on-g':'');
  $('bcur-crc').className='chip '+(cur==='crc'?'on-g':'');
  
  const slRate = $('sl-rate');
  const currentValue = +slRate.value;
  
  if(prevCurrency !== cur){
    // Convertir el valor actual a la nueva moneda
    if(cur === 'crc'){
      // Cambiar de USD a CRC
      const newValue = Math.round(currentValue * tcVenta);
      slRate.min = 200000;
      slRate.max = 6000000;
      slRate.step = 50000;
      slRate.value = newValue;
      
      // Actualizar labels y tooltips
      $('lbl-rate').innerHTML = `Tarifa mensual servicios (CRC/mes)
        <span class="tipw">
          <span class="tpic">?</span>
          <div class="tipb">Tu ingreso mensual promedio por servicios profesionales independientes en colones. Si trabajás para clientes locales que te pagan en colones, este es el monto que recibís mensualmente. El tipo de cambio COMPRA del BCCR se usa como referencia para mostrar el equivalente en dólares.</div>
        </span>`;
      $('lbl-tc').innerHTML = `Tipo de cambio CRC → USD (COMPRA · API en vivo)
        <span class="tipw">
          <span class="tpic">?</span>
          <div class="tipb"><strong>Tipo de cambio COMPRA:</strong> Es el que usarías si quisieras convertir colones a dólares. Se muestra como referencia para que veas el equivalente en USD de tus ingresos en colones. El BCCR publica diariamente ambos tipos de cambio (compra y venta).</div>
        </span>`;
      $('hints-rate').innerHTML = '<span>₡200k</span><span>₡6M</span>';
      
      // Actualizar el tipo de cambio mostrado a COMPRA
      $('sl-tc').value = tcCompra;
      
    } else {
      // Cambiar de CRC a USD
      const newValue = Math.round(currentValue / tcCompra);
      slRate.min = 500;
      slRate.max = 12000;
      slRate.step = 100;
      slRate.value = newValue;
      
      // Actualizar labels y tooltips
      $('lbl-rate').innerHTML = `Tarifa mensual servicios (USD/mes)
        <span class="tipw">
          <span class="tpic">?</span>
          <div class="tipb">Tu ingreso mensual promedio por servicios profesionales independientes en dólares. Si trabajás para clientes extranjeros, este es el monto que te pagan mensualmente. El tipo de cambio VENTA del BCCR se usa para convertir a colones y calcular la CCSS.</div>
        </span>`;
      $('lbl-tc').innerHTML = `Tipo de cambio USD → CRC (VENTA · API en vivo)
        <span class="tipw">
          <span class="tpic">?</span>
          <div class="tipb"><strong>Tipo de cambio VENTA:</strong> Es el que usás cuando convertís dólares a colones (cuando te pagan en USD). El BCCR publica diariamente el tipo de cambio de referencia. La calculadora lo carga automáticamente desde la API oficial, pero podés ajustarlo manualmente si tu banco usa una tasa diferente.</div>
        </span>`;
      $('hints-rate').innerHTML = '<span>$500</span><span>$12,000</span>';
      
      // Actualizar el tipo de cambio mostrado a VENTA
      $('sl-tc').value = tcVenta;
    }
    
    // Actualizar fills
    uf(slRate, 'fill-rate');
    uf($('sl-tc'), 'fill-tc');
  }
  
  calcFromRate();
}

// ─── CALC FROM RATE (cuando cambia el slider de tarifa) ──
function calcFromRate(){
  uf($('sl-rate'), 'fill-rate');
  calc();
}
