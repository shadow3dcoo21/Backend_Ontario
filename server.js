const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'build' o 'dist' en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Ruta para gestionar las solicitudes a la API externa
app.post('/api/contact', async (req, res) => {
  try {
    console.log('Recibiendo solicitud de formulario:', req.body);
    
    const response = await axios.post(process.env.SPERANT_API_URL, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.SPERANT_API_KEY
      }
    });

    console.log('Respuesta de la API externa:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error al enviar datos a la API externa:', error.message);
    
    if (error.response) {
      console.error('Datos de error:', error.response.data);
      console.error('Estado de error:', error.response.status);
      console.error('Headers de error:', error.response.headers);
      
      res.status(error.response.status).json({
        error: 'Error en la respuesta de la API externa',
        details: error.response.data
      });
    } else if (error.request) {
      console.error('No se recibió respuesta de la API externa');
      res.status(500).json({
        error: 'No se recibió respuesta de la API externa',
        details: error.request
      });
    } else {
      console.error('Error al configurar la solicitud:', error.message);
      res.status(500).json({
        error: 'Error al configurar la solicitud',
        message: error.message
      });
    }
  }
});

// Manejar todas las demás solicitudes GET enviando React app (en producción)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});