// backend/index.js

const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;

// Configurar CORS para permitir solicitudes solo desde localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',  // Permite solo peticiones desde tu frontend
}));

app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "bj200027",
  database: "banco",
});

db.connect((err) => {
  if (err) {
    console.error("Error de conexión a la BD:", err);
  } else {
    console.log("Conectado a la base de datos MySQL");
  }
});

// Endpoint para login
app.post("/api/login", (req, res) => {
  const { correo, password } = req.body;

  const query = "SELECT * FROM usuarios WHERE correo = ?";
  db.query(query, [correo], (err, results) => {
    if (err) return res.status(500).json({ error: "Error en el servidor" });

    if (results.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const usuario = results[0];

    // Comparar la contraseña (sin cifrar)
    if (password === usuario.password) {
      res.status(200).json({ success: true, usuario: usuario.nombre });
    } else {
      res.status(401).json({ error: "Contraseña incorrecta" });
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
