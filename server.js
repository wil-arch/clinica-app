const express = require('express');
const cors = require('cors');
const path = require('path');
const pacientesRoutes =
    require('./routes/pacientes.routes');
const medicosRoutes =
    require('./routes/medicos.routes');
const citasRoutes =
    require('./routes/citas.routes');
const dashboardRoutes =
    require('./routes/dashboard.routes');

require('dotenv').config();

/* =========================
   CONEXIÓN DB
========================= */

require('./db');

const usuariosRoutes = require('./routes/usuarios.routes');
/* =========================
   INICIALIZAR EXPRESS
========================= */

const app = express();


/* =========================
   MIDDLEWARES
========================= */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/api/usuarios', usuariosRoutes);

app.use('/api/pacientes', pacientesRoutes);

app.use('/api/medicos', medicosRoutes);

app.use('/api/citas', citasRoutes);

app.use('/api/dashboard', dashboardRoutes);

/* =========================
   ARCHIVOS ESTÁTICOS
========================= */

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =========================
   RUTA PRINCIPAL
========================= */

app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


/* =========================
   SERVIDOR
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(` Servidor corriendo en puerto ${PORT}`);
});