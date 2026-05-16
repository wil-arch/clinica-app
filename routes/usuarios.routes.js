const express = require('express');
const router = express.Router();

const db = require('../db');

const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

/* =========================
   VALIDACIÓN DE ARCHIVO
========================= */

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const mimeValido = file.mimetype === 'image/jpeg';
    const extValida = extension === '.jpg' || extension === '.jpeg';

    if (mimeValido && extValida) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes JPG'));
    }
};

/* =========================
   CONFIGURACIÓN MULTER
========================= */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/usuarios');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + '.jpg';
        cb(null, uniqueName);
    }
});

const upload = multer({ storage, fileFilter });

/* =========================
   REGISTRO USUARIO
========================= */

router.post('/registro', (req, res) => {
    upload.single('foto')(req, res, async (error) => {

        if (error instanceof multer.MulterError) {
            return res.status(400).json({ mensaje: 'Error de carga: ' + error.message });
        }
        if (error) {
            return res.status(400).json({ mensaje: error.message });
        }

        try {
            const { nombre, email, password, rol } = req.body;

            // await con pool.promise()
            const [existe] = await db.query(
                'SELECT id FROM usuarios WHERE email = ?',
                [email]
            );

            if (existe.length > 0) {
                return res.status(400).json({ mensaje: 'El email ya existe' });
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const foto = req.file ? req.file.filename : 'default.png';

            const [resultado] = await db.query(
                `INSERT INTO usuarios (nombre, email, password, rol, foto)
                 VALUES (?, ?, ?, ?, ?)`,
                [nombre, email, passwordHash, rol, foto]
            );

            const usuarioId = resultado.insertId;

            /* =========================
               SI ES MÉDICO
            ========================= */

            if (rol === 'medico') {
                const { especialidad, telefono, consultorio } = req.body;

                await db.query(
                    `INSERT INTO medicos (id, nombre, especialidad, telefono, email, consultorio)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [usuarioId, nombre, especialidad || null, telefono || null, email, consultorio || null]
                );

                return res.status(201).json({ mensaje: 'Usuario (médico) registrado correctamente' });
            }

            return res.status(201).json({ mensaje: 'Usuario registrado correctamente' });

        } catch (err) {
            console.error('Error en registro:', err);
            return res.status(500).json({ mensaje: 'Error interno: ' + err.message });
        }
    });
});

/* =========================
   LOGIN
========================= */

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [resultado] = await db.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        if (resultado.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const usuario = resultado[0];
        const passwordCorrecta = await bcrypt.compare(password, usuario.password);

        if (!passwordCorrecta) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.json({
            mensaje: 'Login correcto',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                foto: usuario.foto
            }
        });

    } catch (err) {
        console.error('Error en login:', err);
        return res.status(500).json({ mensaje: 'Error interno' });
    }
});

/* =========================
   OBTENER USUARIOS
========================= */

router.get('/', async (req, res) => {
    try {
        const [usuarios] = await db.query(
            'SELECT id, nombre, email, rol, foto FROM usuarios'
        );
        return res.json(usuarios);
    } catch (err) {
        console.error('Error obteniendo usuarios:', err);
        return res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
});

/* =========================
   ACTUALIZAR USUARIO
========================= */

router.put('/:id', async (req, res) => {
    try {
        const { nombre, email, rol } = req.body;

        await db.query(
            `UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id = ?`,
            [nombre, email, rol, req.params.id]
        );

        return res.json({ mensaje: 'Usuario actualizado' });

    } catch (err) {
        console.error('Error actualizando usuario:', err);
        return res.status(500).json({ mensaje: 'Error actualizando usuario' });
    }
});

/* =========================
   ELIMINAR USUARIO
========================= */

router.delete('/:id', async (req, res) => {
    try {
        await db.query(
            'DELETE FROM usuarios WHERE id = ?',
            [req.params.id]
        );
        return res.json({ mensaje: 'Usuario eliminado correctamente' });

    } catch (err) {
        console.error('Error eliminando usuario:', err);
        return res.status(500).json({ mensaje: 'Error eliminando usuario' });
    }
});

module.exports = router;