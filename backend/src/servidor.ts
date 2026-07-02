import { app } from './app'
import { entorno } from './config/entorno'

app.listen(entorno.puerto, () => {
  console.log(`CogniPlay API escuchando en http://localhost:${entorno.puerto}`)
})
