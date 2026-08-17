import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import EstadoVacio from '../../../componentes/EstadoVacio'
import { tarjeta, tituloSeccion } from './estilos'

const ESTILO_TOOLTIP = {
  background: 'var(--cp-surface)',
  border: '1px solid var(--cp-border)',
  borderRadius: 8,
  fontSize: 12,
  fontFamily: 'var(--cp-font)',
}

const ESTILO_TICK = { fontSize: 11, fontFamily: 'var(--cp-font)', fill: 'var(--cp-text-3)' }

// Varios intentos caen el mismo día, así que el eje va por número de intento y
// la fecha con hora queda en el tooltip.
const formatearEtiqueta = (valor, carga) => {
  const fecha = carga?.[0]?.payload?.fecha
  return fecha ? `Intento ${valor} · ${fecha}` : `Intento ${valor}`
}

// Evolución de la precisión y el puntaje del niño en el tiempo (Recharts).
// La precisión llega como string (Decimal serializado) → Number().
export default function GraficosEvolucion({ intentos }) {
  const datos = [...intentos]
    .sort((a, b) => new Date(a.creadoEn) - new Date(b.creadoEn))
    .map((i, indice) => ({
      intento: indice + 1,
      fecha: new Date(i.creadoEn).toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      precision: Math.round(Number(i.precision)),
      puntaje: i.puntaje,
    }))

  return (
    <section style={tarjeta} aria-label="Evolución en el tiempo">
      <h2 style={tituloSeccion}>Evolución en el tiempo</h2>

      {datos.length < 2 ? (
        <EstadoVacio
          icono={TrendingUp}
          titulo="Aún no hay suficientes datos"
          mensaje="Cuando el niño registre más intentos, aquí verás su evolución."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h3 style={estiloSubtitulo}>Precisión (%) por intento</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={datos} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="degradadoPrecision" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--cp-blue)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--cp-blue)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--cp-border)" />
                <XAxis dataKey="intento" tick={ESTILO_TICK} tickLine={false} />
                <YAxis domain={[0, 100]} tick={ESTILO_TICK} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={ESTILO_TOOLTIP}
                  labelFormatter={formatearEtiqueta}
                  formatter={(valor) => `${valor} %`}
                />
                <ReferenceLine y={85} stroke="var(--cp-green)" strokeDasharray="4 4" />
                <ReferenceLine y={60} stroke="var(--cp-warm)" strokeDasharray="4 4" />
                <Area
                  type="monotone"
                  dataKey="precision"
                  name="Precisión"
                  stroke="var(--cp-blue)"
                  strokeWidth={2}
                  fill="url(#degradadoPrecision)"
                  dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 style={estiloSubtitulo}>Puntaje por intento</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={datos} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--cp-border)" />
                <XAxis dataKey="intento" tick={ESTILO_TICK} tickLine={false} />
                <YAxis tick={ESTILO_TICK} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={ESTILO_TOOLTIP}
                  labelFormatter={formatearEtiqueta}
                  formatter={(valor) => `${valor} pts`}
                />
                <Line
                  type="monotone"
                  dataKey="puntaje"
                  name="Puntaje"
                  stroke="var(--cp-purple)"
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  )
}

const estiloSubtitulo = {
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--cp-text-2)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 6,
}
