import { BrowserRouter } from 'react-router-dom'
import { ProveedorAuth } from './caracteristicas/autenticacion/ContextoAuth'
import Enrutador from './app/enrutador/Enrutador'

// Raíz de la aplicación: enrutado + proveedor de autenticación disponibles para
// todas las vistas.
function App() {
  return (
    <BrowserRouter>
      <ProveedorAuth>
        <Enrutador />
      </ProveedorAuth>
    </BrowserRouter>
  )
}

export default App
