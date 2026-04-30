// ─── STATE ────────────────────────────────────────────
let reg='solo',cli=false,ded='ficto',con=0,pen=0;
let tcLoaded=false;
let tcManual=false;
let currency='usd'; // 'usd' o 'crc'
let tcVenta=460; // tipo de cambio venta (USD a CRC)
let tcCompra=450; // tipo de cambio compra (CRC a USD)

// ─── HELPERS ─────────────────────────────────────────
const $=id=>document.getElementById(id);
const NF=new Intl.NumberFormat('es-CR');
const fm=(n,d=0)=>NF.format(+(Math.round(n*1e6)/1e6).toFixed(d));
const fC=n=>'₡'+fm(Math.abs(n));
const fU=n=>(n<0?'-':'')+'$'+fm(Math.abs(n));
const fP=n=>(n*100).toFixed(1)+'%';
const uf=(el,id)=>{const p=(el.value-el.min)/(el.max-el.min)*100;$(id).style.width=p+'%'};

function initFills(){
  [['sl-rate','fill-rate'],['sl-tc','fill-tc'],['sl-meses','fill-meses'],
   ['sl-sal','fill-sal'],['sl-gastos','fill-gastos'],['sl-hijos','fill-hijos']
  ].forEach(([s,f])=>{const e=$(s);if(e)uf(e,f)});
}

// ─── RIESGO CCSS ─────────────────────────────────────
function calcRiesgoCCSS(){
  const bruto=Math.max(341228,+$('sl-rate').value * +$('sl-tc').value);
  const decl=+$('riesgo-sl').value;
  $('riesgo-decl-val').textContent=fC(decl);

  if(decl>=bruto){
    $('riesgo-ccss-result').innerHTML=`<div class="alt ok">Reportás el monto real. Sin exposición a sanciones de la CCSS.</div>`;
    return;
  }

  const catReal=getCat(bruto);
  const catDecl=getCat(decl);
  const cuotaReal=catReal.ca;
  const cuotaDecl=catDecl.ca;
  const ahorroPorMes=cuotaReal-cuotaDecl;
  const ahorroAnual=ahorroPorMes*12;
  const pct=((bruto-decl)/bruto*100).toFixed(0);

  // Sanciones: art. 44 Ley CCSS — multa de 3 salarios base + cuotas omitidas + intereses
  const salBase=462200; // salario base 2026
  const multaFija=salBase*3;
  const cuotasOmitAnual=ahorroAnual;
  const intereses1ano=cuotasOmitAnual*0.0852; // tasa moratoria 8.52% (misma que Hacienda)
  const costoTotal=multaFija+cuotasOmitAnual+intereses1ano;
  const ratio=(costoTotal/ahorroAnual).toFixed(1);

  $('riesgo-ccss-result').innerHTML=`
    <div style="background:var(--crimson-bg);border:1px solid rgba(232,69,69,.3);border-radius:10px;padding:14px 16px">
      <div style="font-size:12px;font-weight:600;color:var(--crimson);margin-bottom:10px">
        Reportás ${pct}% menos — Cat. real: ${catReal.cat} · Cat. declarada: ${catDecl.cat}
      </div>

      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:12px">
          <span style="color:var(--ink3)">Cuota real mensual (cat. ${catReal.cat})</span>
          <span style="font-family:var(--mono);color:var(--emerald-mid)">${fC(cuotaReal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px">
          <span style="color:var(--ink3)">Cuota declarada mensual (cat. ${catDecl.cat})</span>
          <span style="font-family:var(--mono);color:var(--crimson)">${fC(cuotaDecl)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;border-top:1px solid var(--line);padding-top:6px">
          <span style="color:var(--ink3)">"Ahorro" mensual</span>
          <span style="font-family:var(--mono);font-weight:600;color:var(--amber-mid)">${fC(ahorroPorMes)}/mes · ${fC(ahorroAnual)}/año</span>
        </div>
      </div>

      <div style="font-size:11px;font-weight:600;color:var(--crimson);margin-bottom:8px">Costo si te detectan (art. 44 Ley CCSS):</div>
      <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:11px">
          <span style="color:var(--ink3)">Cuotas omitidas retroactivas (1 año)</span>
          <span style="font-family:var(--mono);color:var(--crimson)">${fC(cuotasOmitAnual)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px">
          <span style="color:var(--ink3)">Multa fija (3 salarios base, art. 44)</span>
          <span style="font-family:var(--mono);color:var(--crimson)">${fC(multaFija)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px">
          <span style="color:var(--ink3)">Intereses moratorios (8,52% / año)</span>
          <span style="font-family:var(--mono);color:var(--crimson)">${fC(intereses1ano)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:600;border-top:1px solid rgba(232,69,69,.3);padding-top:6px">
          <span style="color:var(--ink)">Total sanción estimada (1er año)</span>
          <span style="font-family:var(--mono);color:var(--crimson)">${fC(costoTotal)}</span>
        </div>
      </div>

      <div style="background:rgba(232,69,69,.08);border-radius:8px;padding:10px 12px;font-size:11px;color:var(--crimson)">
        Por cada ₡1 "ahorrado" en cuotas arriesgás <strong>${ratio} colones</strong> en sanciones. TRIBU-CR cruza tu factura electrónica, tu D-101 de Hacienda y tus reportes CCSS automáticamente.
      </div>
    </div>`;
}

// ─── MODALS ───────────────────────────────────────────
function openModal(id){
  $(id).classList.add('open');
  document.body.style.overflow='hidden';
  
  // Si es el modal de riesgo CCSS, inicializar el slider con el valor bruto actual
  if(id === 'modal-ccss-riesgo'){
    const rate = +$('sl-rate').value;
    const tc = +$('sl-tc').value;
    const ccssBase = Math.max(341228, rate * tc);
    const rSl = $('riesgo-sl');
    
    // Establecer el valor del slider al bruto actual
    rSl.value = ccssBase;
    
    // Actualizar el max del slider para dar rango útil
    rSl.max = Math.max(8000000, ccssBase * 2);
    
    // Actualizar la visualización
    uf(rSl, 'riesgo-fill');
    $('riesgo-decl-val').textContent = fC(ccssBase);
    $('riesgo-bruto-display').textContent = fC(ccssBase);
    
    // Calcular el resultado inicial
    calcRiesgoCCSS();
  }
}
function closeModal(id){$(id).classList.remove('open');document.body.style.overflow=''}
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open'))&&(document.body.style.overflow='')});

// ─── CCSS DATA ────────────────────────────────────────
// Base: Escala Contributiva TI-AV, Gaceta N°232, 10 dic 2024 (Decreto N°44756-MTSS)
// IVM afiliado 2026 = 2025 + 0.0016 (acuerdo JD CCSS Sesión N°9038/2019, quinto incremento ene-2026)
const CCSS=[
  {cat:1,max:341227, ivm26:.0416,ivm_est:.0529,ivm_lpt:.0030,sem:.0289,sem_est:.0911},
  {cat:2,max:734217, ivm26:.0565,ivm_est:.0410,ivm_lpt:.0000,sem:.0433,sem_est:.0767},
  {cat:3,max:1468434,ivm26:.0753,ivm_est:.0222,ivm_lpt:.0000,sem:.0624,sem_est:.0576},
  {cat:4,max:2202651,ivm26:.0798,ivm_est:.0177,ivm_lpt:.0000,sem:.0802,sem_est:.0398},
  {cat:5,max:Infinity,ivm26:.0842,ivm_est:.0133,ivm_lpt:.0000,sem:.1069,sem_est:.0131},
];
function getCat(ing){
  const b=Math.max(341228,ing);
  const c=CCSS.find(c=>b<=(c.max===Infinity?1e12:c.max))||CCSS[4];
  return{...c,b,ta:c.ivm26+c.sem,cs:c.sem*b,ci:c.ivm26*b,ca:(c.ivm26+c.sem)*b};
}

// ─── ISR TRAMOS 2026 ─────────────────────────────────
const TR=[
  {d:0,h:6244000,t:0,l:'Exento'},
  {d:6244000,h:8329000,t:.10,l:'10%'},
  {d:8329000,h:10414000,t:.15,l:'15%'},
  {d:10414000,h:20872000,t:.20,l:'20%'},
  {d:20872000,h:1e12,t:.25,l:'25%'},
];
function calcISR(rn){
  let tot=0,det=[];
  for(const t of TR){
    if(rn<=t.d){det.push({...t,base:0,imp:0});continue}
    const base=Math.min(rn,t.h)-t.d,imp=base*t.t;
    tot+=imp;det.push({...t,base,imp});
  }
  return{tot,det};
}

// ─── ISR RÉGIMEN MIXTO (sin tramo exento) ────────────
function calcISRMixto(rn, salarioAnual){
  let tot=0,det=[];
  
  // Si el salario consume todo o parte del tramo exento
  const exentoConsumido = Math.min(salarioAnual, 6244000);
  const exentoRestante = Math.max(0, 6244000 - exentoConsumido);
  
  // Si el salario ya consumió el tramo exento, los honorarios empiezan en el 10%
  if(exentoConsumido >= 6244000){
    // Tramo exento ya consumido por el salario
    det.push({d:0,h:6244000,t:0,l:'Exento',base:0,imp:0});
    
    // Los honorarios empiezan directamente en el 10%
    for(let i=1; i<TR.length; i++){
      const t = TR[i];
      const tramoInicio = i===1 ? 0 : (TR[i].d - 6244000);
      const tramoFin = TR[i].h - 6244000;
      
      if(rn <= tramoInicio){
        det.push({...t,base:0,imp:0});
        continue;
      }
      
      const base = Math.min(rn, tramoFin) - tramoInicio;
      const imp = base * t.t;
      tot += imp;
      det.push({...t,base,imp});
    }
  } else {
    // Hay exento restante, aplicar cálculo normal
    const rnConExento = rn + exentoRestante;
    for(const t of TR){
      if(rnConExento<=t.d){det.push({...t,base:0,imp:0});continue}
      const base=Math.min(rnConExento,t.h)-t.d,imp=base*t.t;
      tot+=imp;det.push({...t,base,imp});
    }
  }
  
  return{tot,det};
}

// ─── SETTERS ─────────────────────────────────────────
function setReg(r){
  reg=r;
  $('psolo').className='rtab '+(r==='solo'?'solo':'');
  $('pmixto').className='rtab '+(r==='mixto'?'mixto':'');
  $('wrap-sal').style.display=r==='mixto'?'block':'none';
  $('wmixto').className='wstrip '+(r==='mixto'?'show':'');
  calc();
}
function setCliente(c){
  cli=c==='loc';
  $('bext').className='chip '+(c==='ext'?'on-g':'');
  $('bloc').className='chip '+(c==='loc'?'on-a':'');
  calc();
}
function setDed(d){
  ded=d;
  $('bficto').className='chip '+(d==='ficto'?'on-g':'');
  $('breal').className='chip '+(d==='real'?'on-a':'');
  $('wrap-gastos').style.display=d==='real'?'block':'none';
  calc();
}
function setCon(v){con=v;$('bnoc').className='chip '+(v===0?'on-g':'');$('bc').className='chip '+(v===1?'on-g':'');calc()}
function setPen(v){pen=v;$('bnop').className='chip '+(v===0?'on-g':'');$('bp').className='chip '+(v===1?'on-g':'');calc()}

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

// ─── RENDER CCSS TABLES (for modal) ──────────────────
function renderCCSSTables(ccssBase,catInfo){
  const semH=`<thead><tr class="th-b"><th colspan="5">TABLA 1 — SEGURO SALUD (SEM) · Tasa conjunta 12% · Gaceta N°232 dic 2024</th></tr><tr class="th-sub"><th>Cat.</th><th>Rango (CRC)</th><th>Afiliado</th><th>Estado</th><th>Conjunto</th></tr></thead>`;
  const semR=CCSS.map((c,i)=>{
    const cur=ccssBase<=(c.max===Infinity?1e12:c.max)&&(i===0||ccssBase>CCSS[i-1].max);
    const rng=i===0?'Hasta '+fC(c.max):(c.max===Infinity?'> '+fC(CCSS[i-1].max):fC(CCSS[i-1].max+1)+'–'+fC(c.max));
    return`<tr class="${cur?'cur':''}"><td>Cat ${c.cat}${cur?'<span class="you-b">vos</span>':''}</td><td>${rng}</td><td class="ca">${(c.sem*100).toFixed(2)}%</td><td>${(c.sem_est*100).toFixed(2)}%</td><td>12.00%</td></tr>`;
  }).join('');
  const ivmH=`<thead><tr class="th-p"><th colspan="5">TABLA 2 — SEGURO PENSIÓN (IVM) · Gaceta N°232 + ajuste +0.16pp ene-2026</th></tr><tr class="th-sub"><th>Cat.</th><th>Rango (CRC)</th><th>Afiliado 2026</th><th>Estado+LPT</th><th>Conjunto</th></tr></thead>`;
  const ivmR=CCSS.map((c,i)=>{
    const cur=ccssBase<=(c.max===Infinity?1e12:c.max)&&(i===0||ccssBase>CCSS[i-1].max);
    const rng=i===0?'Hasta '+fC(c.max):(c.max===Infinity?'> '+fC(CCSS[i-1].max):fC(CCSS[i-1].max+1)+'–'+fC(c.max));
    return`<tr class="${cur?'cur':''}"><td>Cat ${c.cat}${cur?'<span class="you-b">vos</span>':''}</td><td>${rng}</td><td class="ca">${(c.ivm26*100).toFixed(2)}%</td><td>${((c.ivm_est+c.ivm_lpt)*100).toFixed(2)}%</td><td>${((c.ivm26+c.ivm_est+c.ivm_lpt)*100).toFixed(2)}%</td></tr>`;
  }).join('');
  const sumH=`<thead><tr class="th-g"><th colspan="4">RESUMEN — LO QUE PAGÁS VOS (SEM + IVM afiliado 2026)</th></tr><tr class="th-sub"><th>Cat.</th><th>Rango</th><th>Total afiliado</th><th>Cuota mensual</th></tr></thead>`;
  const sumR=CCSS.map((c,i)=>{
    const cur=ccssBase<=(c.max===Infinity?1e12:c.max)&&(i===0||ccssBase>CCSS[i-1].max);
    const rng=i===0?'Hasta '+fC(c.max):(c.max===Infinity?'> '+fC(CCSS[i-1].max):fC(CCSS[i-1].max+1)+'–'+fC(c.max));
    const mid=c.max===Infinity?CCSS[i-1].max*1.5:i===0?c.max/2:(CCSS[i-1].max+c.max)/2;
    return`<tr class="${cur?'cur':''}"><td>Cat ${c.cat}${cur?'<span class="you-b">vos</span>':''}</td><td>${rng}</td><td class="ca">${((c.sem+c.ivm26)*100).toFixed(2)}%</td><td style="color:${cur?'var(--emerald-mid)':'var(--muted)'}">${cur?fC(catInfo.ca):'~'+fC((c.sem+c.ivm26)*mid)}</td></tr>`;
  }).join('');
  $('ccss-tbl-modal').innerHTML=
    semH+'<tbody>'+semR+'</tbody>'+
    '<tbody><tr class="ctbl-gap"><td colspan="5"></td></tr></tbody>'+
    ivmH+'<tbody>'+ivmR+'</tbody>'+
    '<tbody><tr class="ctbl-gap"><td colspan="5"></td></tr></tbody>'+
    sumH+'<tbody>'+sumR+'</tbody>';
  $('ccss-footer-modal').innerHTML=`<span>Cuota mensual: <strong>${fC(catInfo.ca)}</strong></span><span>SEM: <strong>${fC(catInfo.cs)}</strong></span><span>IVM: <strong>${fC(catInfo.ci)}</strong></span><span>Anual: <strong>${fC(catInfo.ca*12)}</strong></span><span class="w">BMC: ₡341.228 (SEM)</span>`;
}

// ─── MAIN CALC ────────────────────────────────────────
function calc(){
  const rate   =+$('sl-rate').value;
  const tc     =+$('sl-tc').value;
  const meses  =+$('sl-meses').value;
  const hijos  =+$('sl-hijos').value;
  const gastosR=+$('sl-gastos').value;
  const salCRC =+$('sl-sal').value;

  // Calcular el ingreso en CRC según la moneda seleccionada
  let rateUSD, rateCRC;
  if(currency === 'usd'){
    rateUSD = rate;
    rateCRC = rate * tc; // tc es VENTA (USD a CRC)
  } else {
    rateCRC = rate;
    rateUSD = rate / tc; // tc es COMPRA (CRC a USD)
  }

  // ccssBase = ingreso bruto mensual en CRC
  const ccssBase = Math.max(341228, rateCRC);

  // Actualizar displays según la moneda
  if(currency === 'usd'){
    $('out-rate').textContent=fU(rate);
  } else {
    $('out-rate').textContent=fC(rate);
  }
  $('out-tc').textContent='₡'+tc;
  $('out-meses').textContent=meses+' meses';
  $('out-hijos').textContent=hijos;
  $('out-gastos').textContent=fC(gastosR);
  $('out-sal').textContent=fC(salCRC);
  // CCSS display: muestra el bruto mensual real en CRC
  $('out-ccss').textContent=fC(ccssBase);
  if(currency === 'usd'){
    $('out-ccss-sub').textContent=`= ${fU(rateUSD)} × ₡${fm(tc)}${ccssBase===341228&&rateCRC<341228?' (BMC mín)':''}`;
  } else {
    $('out-ccss-sub').textContent=`= ${fC(rateCRC)}${ccssBase===341228&&rateCRC<341228?' (BMC mín)':''}`;
  }

  // Sync slider riesgo con el bruto actual
  $('riesgo-bruto-display').textContent=fC(ccssBase);
  // Ajustar max del slider de riesgo al doble del bruto para dar rango útil
  const rSl=$('riesgo-sl');
  rSl.max=Math.max(8000000,ccssBase);
  if(+rSl.value>ccssBase){rSl.value=ccssBase;uf(rSl,'riesgo-fill');}
  $('riesgo-decl-val').textContent=fC(+rSl.value);
  calcRiesgoCCSS();

  const spBruto=rateCRC*meses, spUSD=rateUSD*meses;
  const catInfo=getCat(ccssBase);
  const ccssMes=catInfo.ca, ccssAno=ccssMes*12;

  let dedGastos=ded==='ficto'?spBruto*0.25:gastosR+ccssAno;
  const penAno=pen?spBruto*0.10:0;
  const cCred=hijos*20520+con*31080;

  let rentaNeta,isrBruto,isrFinal,tramoDet;
  if(reg==='solo'){
    const ccssDed=ded==='ficto'?ccssAno:0;
    rentaNeta=Math.max(0,spBruto-dedGastos-penAno-ccssDed);
    const r=calcISR(rentaNeta);isrBruto=r.tot;tramoDet=r.det;
    isrFinal=Math.max(0,isrBruto-cCred);
  } else {
    // Régimen mixto: el salario consume el tramo exento
    const ccssDed=ded==='ficto'?ccssAno:0;
    rentaNeta=Math.max(0,spBruto-dedGastos-penAno-ccssDed);
    const salarioAnual = salCRC * 12;
    
    // Usar función especial para régimen mixto
    const r=calcISRMixto(rentaNeta, salarioAnual);
    isrBruto=r.tot;
    tramoDet=r.det;
    isrFinal=Math.max(0,isrBruto-cCred);
  }

  const netoAno=spBruto-ccssAno-isrFinal;
  const netoMes=netoAno/meses; // sin divisor — neto mensual real
  const brutMes=spBruto/meses;

  // ── Compact CCSS display ─────────────────────────
  const catRangeLabels=['hasta ₡341.227','₡341.228 – ₡734.217','₡734.218 – ₡1.468.434','₡1.468.435 – ₡2.202.651','más de ₡2.202.651'];
  $('ccss-cat-name').textContent=`Cat. ${catInfo.cat} · ${catRangeLabels[catInfo.cat-1]}`;
  $('ccss-sem-tag').textContent=`${(catInfo.sem*100).toFixed(2)}%`;
  $('ccss-ivm-tag').textContent=`${(catInfo.ivm26*100).toFixed(2)}%`;
  $('cf-mes').textContent=fC(ccssMes);
  $('cf-sem').textContent=fC(catInfo.cs);
  $('cf-ivm').textContent=fC(catInfo.ci);
  $('cf-ano').textContent=fC(ccssAno);

  // Update modal tables dynamically
  renderCCSSTables(ccssBase,catInfo);

  // ROP labels
  $('ivm-pct-show').textContent=`Afiliado 2026: ${(catInfo.ivm26*100).toFixed(2)}% · Estado: ${(catInfo.ivm_est*100).toFixed(2)}%`;
  $('sem-pct-show').textContent=`Afiliado: ${(catInfo.sem*100).toFixed(2)}% · Estado: ${(catInfo.sem_est*100).toFixed(2)}%`;

  // ── Scenario strip ────────────────────────────────
  $('sc-strip-wrap').innerHTML=reg==='solo'
    ?'<div class="sc-strip"></div>'
    :'<div class="sc-strip"></div>';

  // ── Right panel ───────────────────────────────────
  $('r-neto').textContent=fC(netoMes);
  $('r-neto-usd').textContent=fU(netoMes/tc)+' / mes';
  $('r-meses-pill').textContent=meses+' meses facturados';
  $('r-bruto').textContent=fC(brutMes);
  $('r-bruto-u').textContent=fU(brutMes/tc);
  $('r-ccss').textContent=fC(ccssMes);
  $('r-ccss-pct').textContent=fP(catInfo.ta)+' (cat. '+catInfo.cat+')';
  $('r-isr').textContent=fC(isrFinal/meses);
  $('r-isr-u').textContent=fU(isrFinal/meses/tc);
  $('r-tasa').textContent=fP((ccssAno+isrFinal)/spBruto);

  // dist bar
  const pN=netoAno/spBruto,pI=isrFinal/spBruto,pC=ccssAno/spBruto,pP=penAno/spBruto;
  const segs=[{c:'#00c896',p:pN,l:'Neto'},{c:'#7c3aed',p:pI,l:'ISR'},{c:'#e84545',p:pC,l:'CCSS'},{c:'#f5a400',p:pP,l:'Pensión'}].filter(s=>s.p>0.001);
  $('dist-bar').innerHTML=segs.map(s=>`<div class="db-seg" style="width:${(s.p*100).toFixed(1)}%;background:${s.c}"></div>`).join('');
  $('dist-leg').innerHTML=segs.map(s=>`<div class="dl-i"><div class="dl-d" style="background:${s.c}"></div>${s.l} ${(s.p*100).toFixed(1)}%</div>`).join('');

  // anual summary
  const aSums=[
    {l:'Ingreso bruto anual',v:spBruto,u:spUSD,pos:true},
    {l:'CCSS anual',v:-ccssAno,u:-ccssAno/tc},
    {l:'ISR anual',v:-isrFinal,u:-isrFinal/tc},
    {l:'Neto anual en bolsillo',v:netoAno,u:netoAno/tc,pos:true,tot:true},
  ];
  $('anual-sum').innerHTML=aSums.map(r=>`
    <div class="anual-row${r.tot?' tot':''}">
      <span style="font-size:12px;color:var(--ink3)">${r.l}</span>
      <div style="text-align:right">
        <div style="font-family:var(--mono);font-size:${r.tot?'14px':'12px'};font-weight:${r.tot?'600':'400'};color:${r.pos?'var(--emerald-mid)':r.v<0?'var(--crimson)':'var(--ink)'}">${r.v<0?'−':'+'}${fC(r.v)}</div>
        <div style="font-family:var(--mono);font-size:9px;color:var(--muted)">${fU(Math.abs(r.u))}</div>
      </div>
    </div>`).join('');

  // ── IVA ──────────────────────────────────────────
  $('ivainfo').innerHTML=cli
    ?`<div class="iva-strip loc"><strong>🏢 Cliente local — IVA 13% aplicable.</strong> Cobrás ₡${fm(rateCRC*0.13)} adicionales/mes al cliente y los trasladás a Hacienda vía D-104 antes del día 15 de cada mes. El IVA no sale de tu bolsillo — lo paga el cliente — pero omitir la declaración genera multa de ₡231.100.</div>`
    :`<div class="iva-strip ext"><strong>🌎 Cliente exterior — IVA exento (art. 8 Ley 9635).</strong> Emitís Factura Electrónica de Exportación v4.4 al 0%. El D-104 mensual igual es obligatorio; acumulás crédito fiscal por compras locales con IVA, recuperable si te inscribís en el Registro de Exportadores.</div>`;

  // ── Breakdown table ───────────────────────────────
  const rows=[];
  
  // Definir tooltips para cada concepto
  const tooltips = {
    spBruto: 'Ingreso total del año por servicios profesionales antes de cualquier deducción o impuesto.',
    dedFicto: 'La ley permite deducir automáticamente el 25% del ingreso bruto sin necesidad de presentar facturas ni comprobantes. Es la opción más simple para servicios digitales.',
    dedReal: 'Gastos documentados con facturas electrónicas: equipo, software, internet, contador, alquiler de oficina, etc. Solo se puede usar si supera el 25% ficto.',
    pension: 'Aporte voluntario a una OPC (BAC Pensiones, BCR, BN Vital, Popular). Deducible hasta el 10% del ingreso bruto anual según art. 71 Ley 7983. Reduce la base imponible del ISR.',
    ccssDed: 'Si usás deducción ficta del 25%, podés deducir adicionalmente la CCSS anual completa según art. 8 inc. b) Ley 7092. No aplica si usás gastos reales.',
    rentaNeta: 'Base sobre la cual se calculan los tramos del ISR. Es el ingreso bruto menos todas las deducciones permitidas.',
    isrBruto: 'Impuesto calculado aplicando los tramos escalonados 2026 (0%, 10%, 15%, 20%, 25%) sobre la renta neta.',
    creditos: 'Se restan directamente del ISR calculado (no de la base imponible). ₡20.520/año por hijo + ₡31.080/año por cónyuge dependiente.',
    isrFinal: 'ISR bruto menos créditos fiscales. Este es el monto que pagás a Hacienda mediante el D-101.',
    ccssTI: 'Cuota anual obligatoria a la CCSS como trabajador independiente. Se calcula según tu categoría (1-5) basada en el ingreso bruto mensual.',
    iva: 'Si tu cliente es local, cobrás 13% adicional que trasladás a Hacienda. El IVA no sale de tu bolsillo, lo paga el cliente.',
    netoAnual: 'Dinero real que te queda en el bolsillo después de pagar CCSS e ISR.',
    netoMensual: 'Promedio mensual del neto anual. Es tu ingreso real disponible por mes.'
  };

  if(reg==='mixto'){
    rows.push({sec:'Empleo formal'});
    rows.push({l:'Salario bruto anual',v:salCRC*12,u:salCRC*12/tc,cls:'bkdn-pos'});
    rows.push({l:'CCSS obrero (~9.83%)',v:-(salCRC*.0983*12),u:0,cls:'bkdn-neg',note:'estimado'});
    rows.push({sec:'Servicios profesionales'});
  }
  
  rows.push({
    l:`SP bruto (${meses} meses × ${currency==='usd'?fU(rateUSD):fC(rateCRC)})`,
    v:spBruto,
    u:spUSD,
    cls:'bkdn-pos',
    tip:tooltips.spBruto
  });
  
  rows.push({
    l:`Deducible ${ded==='ficto'?'ficto 25%':'gastos reales'} (art. 8 Ley 7092)`,
    v:-dedGastos,
    u:-dedGastos/tc,
    cls:'bkdn-neg',
    tip:ded==='ficto'?tooltips.dedFicto:tooltips.dedReal
  });
  
  if(pen) rows.push({
    l:'Pensión voluntaria deducible 10% (art. 71 Ley 7983)',
    v:-penAno,
    u:-penAno/tc,
    cls:'bkdn-neg',
    tip:tooltips.pension
  });
  
  if(ded==='ficto') rows.push({
    l:'CCSS TI deducible adicional (art. 8 inc. b)',
    v:-ccssAno,
    u:-ccssAno/tc,
    cls:'bkdn-neg',
    tip:tooltips.ccssDed
  });
  
  rows.push({
    l:'= Renta neta imponible',
    v:rentaNeta,
    u:rentaNeta/tc,
    cls:'',
    sub:true,
    icon:'📊',
    tip:tooltips.rentaNeta
  });
  
  rows.push({
    l:'ISR escalonado (tramos 2026)',
    v:-isrBruto,
    u:-isrBruto/tc,
    cls:'bkdn-neg',
    tip:tooltips.isrBruto
  });
  
  if(cCred>0) rows.push({
    l:`Créditos fiscales (${hijos} hijo${hijos!==1?'s':''} ${con?'+ cónyuge':''})`,
    v:cCred,
    u:cCred/tc,
    cls:'bkdn-pos',
    tip:tooltips.creditos
  });
  
  rows.push({
    l:'= ISR definitivo',
    v:-isrFinal,
    u:-isrFinal/tc,
    cls:'bkdn-neg',
    sub:true,
    icon:'💰',
    tip:tooltips.isrFinal
  });
  
  rows.push({
    l:`CCSS TI (cat. ${catInfo.cat} · ${(catInfo.ta*100).toFixed(2)}% · ${fC(ccssMes)}/mes × 12)`,
    v:-ccssAno,
    u:-ccssAno/tc,
    cls:'bkdn-neg',
    tip:tooltips.ccssTI
  });
  
  if(cli) rows.push({
    l:'IVA 13% (pass-through al cliente)',
    v:0,
    u:0,
    cls:'bkdn-neu',
    note:'no sale de tu bolsillo',
    tip:tooltips.iva
  });
  
  rows.push({
    l:'= Neto anual en bolsillo',
    v:netoAno,
    u:netoAno/tc,
    cls:'bkdn-pos',
    sub:true,
    icon:'✓',
    tip:tooltips.netoAnual
  });
  
  rows.push({
    l:'Neto mensual promedio',
    v:netoMes,
    u:netoMes/tc,
    cls:'bkdn-pos',
    tot:true,
    icon:'💵',
    tip:tooltips.netoMensual
  });

  $('bkdn').innerHTML=rows.map(r=>{
    if(r.sec) return`<tr class="sh"><td colspan="2">${r.sec}</td></tr>`;
    const z=r.v===0;
    const tipHtml = r.tip ? `<span class="tipw"><span class="tpic">?</span><div class="tipb">${r.tip}</div></span>` : '';
    const iconHtml = r.icon ? `<span class="bkdn-icon">${r.icon}</span>` : '';
    return`<tr class="${r.tot?'tot':r.sub?'sub':''}">
      <td>
        <span class="bkdn-label-wrapper">
          ${iconHtml}
          <span class="bkdn-label-text">${r.l}</span>
          ${tipHtml}
        </span>
        ${r.note?`<span class="bkdn-note">(${r.note})</span>`:''}
      </td>
      <td class="${r.cls}">
        <div class="bkdn-amount">${z?'—':(r.v<0?'−':'')+fC(r.v)}</div>
        <div class="bkdn-usd">${z?'':(r.u<0?'−':'')+fU(Math.abs(r.u))}</div>
      </td>
    </tr>`;
  }).join('');

  // ── Tramos (modal) ────────────────────────────────
  const maxB=Math.max(...tramoDet.map(t=>t.base),1);
  $('tramogrid').innerHTML=tramoDet.map(t=>{
    const act=t.base>0;
    const w=act?Math.min(100,t.base/maxB*100).toFixed(1):'0';
    return`<div class="tramo-item${act?' act':''}">
      <span class="t-pct">${t.l}</span>
      <div class="t-bar"><div class="t-fill" style="width:${w}%"></div></div>
      <span class="t-range">${act?fC(t.base):'—'}</span>
      <span class="t-imp">${act&&t.t>0?fC(t.imp):(act?'₡0':'—')}</span>
    </div>`;
  }).join('');
  $('tramotot').textContent=fC(isrBruto);
}

// ─── FETCH TIPO DE CAMBIO ────────────────────────────
async function fetchTipoCambio(){
  try {
    const response = await fetch('https://tipodecambio.paginasweb.cr/api', {
      method: 'GET',
      headers: {'Accept': 'application/json'},
      signal: AbortSignal.timeout(5000) // timeout 5 segundos
    });
    
    if(!response.ok) throw new Error('API response not ok');
    
    const data = await response.json();
    
    // Validar que tenga los campos venta y compra
    if(data && data.venta && data.compra && !isNaN(parseFloat(data.venta)) && !isNaN(parseFloat(data.compra))){
      tcVenta = Math.round(parseFloat(data.venta));
      tcCompra = Math.round(parseFloat(data.compra));
      
      // Actualizar el slider solo si no ha sido modificado por el usuario
      if(!tcManual){
        const sliderTC = $('sl-tc');
        // Usar venta por defecto (USD a CRC)
        sliderTC.value = tcVenta;
        uf(sliderTC, 'fill-tc');
        
        // Actualizar display
        $('out-tc').textContent = '₡' + tcVenta;
        
        console.log(`✓ Tipo de cambio cargado: Venta ₡${tcVenta} / Compra ₡${tcCompra} (${data.fecha || 'sin fecha'})`);
      }
      
      calc();
    } else {
      throw new Error('Invalid data format');
    }
  } catch(error) {
    console.warn('⚠ No se pudo cargar el tipo de cambio desde la API:', error.message);
    console.log('→ Usando valores por defecto: Venta ₡460 / Compra ₡450');
    
    // Valores por defecto si falla la API
    if(!tcManual){
      tcVenta = 460;
      tcCompra = 450;
      const sliderTC = $('sl-tc');
      sliderTC.value = tcVenta;
      uf(sliderTC, 'fill-tc');
      $('out-tc').textContent = '₡460';
      calc();
    }
  }
}

// ─── INIT ─────────────────────────────────────────────
initFills();
fetchTipoCambio(); // Cargar tipo de cambio al iniciar
calc();


// ─── COPY EMAIL ───────────────────────────────────────
function copyEmail(event) {
  event.preventDefault();
  
  const email = 'fabian7593@gmail.com';
  const link = event.currentTarget;
  
  // Intentar copiar al portapapeles
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(email)
      .then(() => {
        // Mostrar feedback visual
        link.classList.add('footer-social-link-copied');
        
        // Remover la clase después de 2 segundos
        setTimeout(() => {
          link.classList.remove('footer-social-link-copied');
        }, 2000);
      })
      .catch(err => {
        console.warn('No se pudo copiar al portapapeles:', err);
        // Fallback: abrir cliente de email
        window.location.href = 'mailto:' + email;
      });
  } else {
    // Fallback para navegadores antiguos
    window.location.href = 'mailto:' + email;
  }
}
