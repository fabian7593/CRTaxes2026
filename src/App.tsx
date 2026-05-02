import fiscalConfig from '@/config/fiscal.config.json'

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'var(--sans)' }}>
      <h1 style={{ color: 'var(--emerald)' }}>Calculadora Fiscal CR 2026</h1>
      <p>React + Vite + TypeScript setup complete ✅</p>
      
      <div style={{ marginTop: '20px', padding: '15px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '10px' }}>Fiscal Config Test:</h3>
        <ul style={{ marginTop: '10px', fontSize: '13px', fontFamily: 'var(--mono)', lineHeight: '1.8' }}>
          <li>Version: {fiscalConfig._version}</li>
          <li>CCSS Categories: {fiscalConfig.ccss.categorias.length}</li>
          <li>ISR Brackets (Persona Física): {fiscalConfig.isr.tramosPersonaFisica.length}</li>
          <li>ISR Brackets (Persona Jurídica): {fiscalConfig.isr.tramosPersonaJuridica.length}</li>
          <li>TC Default (Venta): ₡{fiscalConfig.tipoCambio.ventaDefault}</li>
        </ul>
      </div>

      <div style={{ marginTop: '15px', padding: '15px', background: 'var(--emerald-bg)', border: '1px solid var(--emerald)', borderRadius: 'var(--r)' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--emerald-mid)', marginBottom: '10px' }}>Regímenes Fiscales Disponibles:</h3>
        <ul style={{ marginTop: '10px', fontSize: '12px', lineHeight: '1.8' }}>
          {Object.entries(fiscalConfig.regimenes).map(([key, regimen]) => (
            <li key={key} style={{ marginBottom: '8px' }}>
              <strong style={{ color: 'var(--emerald-mid)' }}>{regimen.nombre}</strong>
              <br />
              <span style={{ fontSize: '11px', color: 'var(--ink3)' }}>{regimen.descripcion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
