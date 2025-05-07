
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

// NUEVOS ENDPOINTS:

// 1. Endpoint para crear usuario
app.post("/api/usuarios", (req, res) => {
  const { nombre, apellido, correo, password } = req.body;
  
  // Validar que se reciban todos los campos necesarios
  if (!nombre || !apellido || !correo || !password) {
    return res.status(400).json({ 
      error: "Todos los campos son obligatorios (nombre, apellido, correo, password)" 
    });
  }
  
  // Verificar si el correo ya existe
  db.query("SELECT * FROM usuarios WHERE correo = ?", [correo], (err, results) => {
    if (err) return res.status(500).json({ error: "Error en el servidor" });
    
    if (results.length > 0) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }
    
    // Si el correo no existe, crear el nuevo usuario
    const nuevoUsuario = {
      nombre,
      apellido,
      correo,
      password  // Usando la contraseña sin cifrar como en tu ejemplo original
      // Si quieres usar bcrypt:
      // password: bcrypt.hashSync(password, 10)
    };
    
    db.query("INSERT INTO usuarios SET ?", nuevoUsuario, (err, result) => {
      if (err) {
        console.error("Error al crear usuario:", err);
        return res.status(500).json({ error: "Error al crear el usuario" });
      }
      
      res.status(201).json({ 
        success: true, 
        message: "Usuario creado exitosamente", 
        idusuarios: result.insertId 
      });
    });
  });
});

// 2. Endpoint para obtener todos los usuarios
app.get("/api/usuarios", (req, res) => {
  db.query("SELECT idusuarios, nombre, apellido, correo FROM usuarios", (err, results) => {
    if (err) {
      console.error("Error al obtener usuarios:", err);
      return res.status(500).json({ error: "Error al obtener los usuarios" });
    }
    
    res.status(200).json(results);
  });
});

// 3. Endpoint para obtener un usuario por ID
app.get("/api/usuarios/:idusuarios", (req, res) => {
  const userId = req.params.idusuarios;
  
  db.query(
    "SELECT idusuarios, nombre, apellido, correo FROM usuarios WHERE idusuarios = ?", 
    [userId], 
    (err, results) => {
      if (err) {
        console.error("Error al obtener usuario:", err);
        return res.status(500).json({ error: "Error al obtener el usuario" });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      
      res.status(200).json(results[0]);
    }
  );
});

// 4. Endpoint para actualizar un usuario
app.put("/api/usuarios/:idusuarios", (req, res) => {
  const userId = req.params.idusuarios;
  const { nombre, apellido, correo, password } = req.body;
  
  // Verificar que el usuario existe
  db.query("SELECT * FROM usuarios WHERE idusuarios = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Error en el servidor" });
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    // Si se está actualizando el correo, verificar que no exista ya
    if (correo && correo !== results[0].correo) {
      db.query("SELECT * FROM usuarios WHERE correo = ? AND idusuarios != ?", [correo, userId], (err, checkResults) => {
        if (err) return res.status(500).json({ error: "Error en el servidor" });
        
        if (checkResults.length > 0) {
          return res.status(409).json({ error: "El correo ya está registrado por otro usuario" });
        }
        
        procederConActualizacion();
      });
    } else {
      procederConActualizacion();
    }
    
    function procederConActualizacion() {
      // Construir objeto con los campos a actualizar
      const datosActualizados = {};
      if (nombre) datosActualizados.nombre = nombre;
      if (apellido) datosActualizados.apellido = apellido;
      if (correo) datosActualizados.correo = correo;
      if (password) datosActualizados.password = password; // Sin cifrar
      // Si quieres usar bcrypt:
      // if (password) datosActualizados.password = bcrypt.hashSync(password, 10);
      
      // Actualizar usuario
      db.query(
        "UPDATE usuarios SET ? WHERE idusuarios = ?", 
        [datosActualizados, userId], 
        (err, result) => {
          if (err) {
            console.error("Error al actualizar usuario:", err);
            return res.status(500).json({ error: "Error al actualizar el usuario" });
          }
          
          res.status(200).json({ 
            success: true, 
            message: "Usuario actualizado exitosamente" 
          });
        }
      );
    }
  });
});

// 5. Endpoint para eliminar un usuario
app.delete("/api/usuarios/:idusuarios", (req, res) => {
  const userId = req.params.idusuarios	;
  
  // Verificar que el usuario existe
  db.query("SELECT * FROM usuarios WHERE idusuarios = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Error en el servidor" });
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    // Eliminar el usuario
    db.query("DELETE FROM usuarios WHERE idusuarios = ?", [userId], (err, result) => {
      if (err) {
        console.error("Error al eliminar usuario:", err);
        return res.status(500).json({ error: "Error al eliminar el usuario" });
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Usuario eliminado exitosamente" 
      });
    });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});