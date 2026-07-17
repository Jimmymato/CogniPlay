import BarraLateral from './BarraLateral'
import BarraSuperior from './BarraSuperior'
import useMediaQuery, { CONSULTA_ESCRITORIO } from '../hooks/useMediaQuery'

// Estructura de pantalla del terapeuta. En escritorio: barra lateral fija +
// cabecera con título y acciones + contenido ancho. En pantallas angostas se
// conserva el diseño móvil original con la barra superior.
export default function DisenoTerapeuta({ titulo, subtitulo, acciones, children }) {
  const esEscritorio = useMediaQuery(CONSULTA_ESCRITORIO)

  if (!esEscritorio) {
    return (
      <div style={{ minHeight: '100%', background: 'var(--cp-bg)' }}>
        <BarraSuperior />
        <main style={{ padding: '24px 20px 40px', maxWidth: 1100, margin: '0 auto' }}>
          <header
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 22,
            }}
          >
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                {titulo}
              </h1>
              {subtitulo && <p style={{ color: 'var(--cp-text-2)', fontSize: 14 }}>{subtitulo}</p>}
            </div>
            {acciones}
          </header>
          {children}
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--cp-bg)' }}>
      <BarraLateral />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            padding: '16px 28px',
            background: 'var(--cp-surface)',
            borderBottom: '1px solid var(--cp-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em' }}>{titulo}</h1>
            {subtitulo && (
              <p style={{ color: 'var(--cp-text-2)', fontSize: 12.5, marginTop: 2 }}>{subtitulo}</p>
            )}
          </div>
          {acciones && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{acciones}</div>}
        </header>
        <main style={{ flex: 1, width: '100%', maxWidth: 1560, margin: '0 auto', padding: '24px 28px 44px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
