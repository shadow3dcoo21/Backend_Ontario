const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración CORS directamente en este archivo (sin importar)
const whitelist = [
  'https://sordomundo.pro',
  'https://www.sordomundo.pro',
  'https://sordomundo.vercel.app', 
  'http://sordomundo.pro',
  'https://localhost:3000',
  'http://localhost:3000',
  'https://ontario.com.pe',
  'http://localhost:5173',
  'https://localhost:5173'
];

// Middleware básico
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Ruta GET para la raíz del sitio
app.get('/', (req, res) => {
  res.send('Bienvenido al servidor de API. El servidor está funcionando correctamente.');
});

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
      res.status(error.response.status).json({
        error: 'Error en la respuesta de la API externa',
        details: error.response.data
      });
    } else if (error.request) {
      res.status(500).json({
        error: 'No se recibió respuesta de la API externa'
      });
    } else {
      res.status(500).json({
        error: 'Error al configurar la solicitud',
        message: error.message
      });
    }
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});