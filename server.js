const express = require('express');
const app = express();
const port = 80; // Define el puerto del servidor

// Crear una ruta para la página principal
app.get('/', (req, res) => {
  res.send('¡Hola desde mi servidor Node.js!');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});