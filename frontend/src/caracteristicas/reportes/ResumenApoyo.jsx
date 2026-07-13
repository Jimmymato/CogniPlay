import { MessageSquareHeart } from 'lucide-react'
import { tarjeta, tituloSeccion } from '../tableroTerapeuta/detalle/estilos'

// Resumen del periodo en lenguaje de apoyo. Los textos los genera el backend
// y describen el desempeño observado; nunca son un diagnóstico (la última
// frase siempre lo aclara).
export default function ResumenApoyo({ frases }) {
  return (
    <section style={tarjeta} aria-label="Resumen en lenguaje de apoyo">
      <h2
        style={{
          ...tituloSeccion,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
        }}
      >
        <MessageSquareHeart size={16} color="var(--cp-purple)" aria-hidden="true" />
        Resumen del periodo
      </h2>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {frases.map((frase, indice) => {
          const esAclaracion = indice === frases.length - 1
          return (
            <li
              key={frase}
              style={{
                display: 'flex',
                gap: 8,
                fontSize: 13,
                lineHeight: 1.5,
                color: esAclaracion ? 'var(--cp-text-3)' : 'var(--cp-text-1)',
                fontStyle: esAclaracion ? 'italic' : 'normal',
              }}
            >
              {!esAclaracion && (
                <span aria-hidden="true" style={{ color: 'var(--cp-purple)', fontWeight: 700 }}>
                  •
                </span>
              )}
              {frase}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
