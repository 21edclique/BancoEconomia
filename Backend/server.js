const express = require('express');
const cors = require('cors');

// Cambiar ruta en caso de ser necesario.
// Este es el controlador
const pdfBuilder = require('./pdf_generator/pdf_builder');

// Se define la ruta, método y acción
const router = express.Router();
router.post('/',pdfBuilder.generatePDF);

// Define el servidor
const HTTP_SERVER = express();
  
// Ruta por defecto
HTTP_SERVER.get('/', (request, response) => {
    response.send("Saludos desde el servidor");
});

// Middleware
HTTP_SERVER.use(express.json());
HTTP_SERVER.use(cors());

// Rutas
HTTP_SERVER.use('/creditos/reporte', router);

// Arranque del servidor
HTTP_SERVER.listen(4000, () => {
    console.clear();
    console.log("Servidor HTTP en http://localhost:4000");
});