const express = require('express');
const cors = require('cors');
const path = require('path');
const pacientesRoutes  = require('./routes/pacientes.routes');
const medicosRoutes    = require('./routes/medicos.routes');
const citasRoutes      = require('./routes/citas.routes');
const dashboardRoutes  = require('./routes/dashboard.routes');
const usuariosRoutes   = require('./routes/usuarios.routes');
const { verificarToken, soloAdmin, adminORecepcionista, adminRecepcionistaMedico } = require('./middleware/auth');

require('dotenv').config();

/* =========================
   CONEXIÓN DB
========================= */

require('./db');

/* =========================
   INICIALIZAR EXPRESS
========================= */

const app = express();

/* =========================
   MIDDLEWARES GLOBALES
========================= */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   RUTAS PÚBLICAS
   
========================= */

app.use('/api/usuarios', usuariosRoutes);

/* =========================
   RUTAS PROTEGIDAS
   
========================= */

app.use('/api/pacientes', verificarToken, adminRecepcionistaMedico, pacientesRoutes);
app.use('/api/medicos',   verificarToken, medicosRoutes);
app.use('/api/citas',     verificarToken, citasRoutes);
app.use('/api/dashboard', verificarToken, dashboardRoutes);

/* =========================
   ARCHIVOS ESTÁTICOS
========================= */

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =========================
   RUTA PRINCIPAL
========================= */

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* =========================
   SERVIDOR
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});