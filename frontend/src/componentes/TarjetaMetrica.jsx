// Tarjeta de métrica del dashboard: chip de ícono sobre fondo suave, número
// grande y una línea de detalle opcional. El número usa tinta de texto (no un
// color de acento) para que todas las cifras se lean con el mismo peso; la
// identidad de cada métrica vive en el chip. `icono` recibe un componente de
// lucide-react.
export default function TarjetaMetrica({
  icono: Icono,
  valor,
  etiqueta,
  detalle,
  fondo = 'var(--cp-blue-light)',
  colorIcono = 'var(--cp-blue-dark)',
}) {
  return (
    <div
      style={{
        background: 'var(--cp-surface)',
        border: '1px solid var(--cp-border)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--sh-sm)',
        padding: '16px 18px',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--r-sm)',
          background: fondo,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        {Icono && <Icono size={18} color={colorIcono} strokeWidth={2.2} />}
      </div>
      <div
        style={{
          fontSize: 27,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          color: 'var(--cp-text-1)',
          marginBottom: 5,
        }}
      >
        {valor}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cp-text-1)' }}>{etiqueta}</div>
      {detalle && <div style={{ fontSize: 11.5, color: 'var(--cp-text-3)', marginTop: 2 }}>{detalle}</div>}
    </div>
  )
}
