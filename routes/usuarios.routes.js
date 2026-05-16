const express = require('express');

const router = express.Router();

const db = require('../db');

const multer = require('multer');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const path = require('path');

/* =========================
   CONFIGURAR MULTER
========================= */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/usuarios');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (extension === '.jpg' || extension === '.jpeg' || extension === '.png') {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes JPG y PNG'));
    }
};

const upload = multer({ storage, fileFilter });

/* =========================
   REGISTRO
========================= */

router.post('/registro', (req, res) => {
    upload.single('foto')(req, res, async (error) => {
        if (error) {
            console.log(error);
            return res.status(400).json({
                mensaje: 'Solo se permiten imágenes JPG y PNG'
            });
        }

        try {
            const {
                nombre,
                email,
                password,
                rol
            } = req.body;

            const verificarSQL = 'SELECT * FROM usuarios WHERE email = ?';

            db.query(verificarSQL, [email], async (error, resultado) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({
                        mensaje: 'Error servidor'
                    });
                }

                if (resultado.length > 0) {
                    return res.status(400).json({
                        mensaje: 'El email ya existe'
                    });
                }

                const passwordHash = await bcrypt.hash(password, 10);

                const foto = req.file ? req.file.filename : 'default.png';

                const sql = `
                    INSERT INTO usuarios
                    (nombre, email, password, rol, foto)
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [
                        nombre,
                        email,
                        passwordHash,
                        rol,
                        foto
                    ],
                    (error, resultado) => {
                        if (error) {
                            console.log(error);
                            return res.status(500).json({
                                mensaje: 'Error registro'
                            });
                        }

                        const usuarioId = resultado?.insertId;

                        if (rol === 'medico') {
                            const {
                                especialidad,
                                telefono,
                                consultorio
                            } = req.body;

                            const sqlMedico = `
                                INSERT INTO medicos
                                (
                                    id,
                                    nombre,
                                    especialidad,
                                    telefono,
                                    email,
                                    consultorio
                                )
                                VALUES (?, ?, ?, ?, ?, ?)
                            `;

                            return db.query(
                                sqlMedico,
                                [
                                    usuarioId,
                                    nombre,
                                    especialidad || null,
                                    telefono || null,
                                    email,
                                    consultorio || null
                                ],
                                (errMedico) => {
                                    if (errMedico) {
                                        console.log(errMedico);
                                        return res.status(500).json({
                                            mensaje: 'Usuario registrado, pero error al crear médico en tabla medicos'
                                        });
                                    }

                                    return res.status(201).json({
                                        mensaje: 'Usuario (médico) registrado correctamente'
                                    });
                                }
                            );
                        }

                        return res.status(201).json({
                            mensaje: 'Usuario registrado correctamente'
                        });
                    }
                );
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                mensaje: 'Error interno'
            });
        }
    });
});

/* =========================
   LOGIN
========================= */

router.post('/login', (req, res) => {
    console.log('LOGIN body recibido:', req.body);

    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ mensaje: 'Datos inválidos' });
    }

    const { email, password } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE email = ?';

    db.query(sql, [email], async (error, resultado) => {
        if (error) {
            console.log(error);
            return res.status(500).json({
                mensaje: 'Error servidor'
            });
        }

        if (resultado.length === 0) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        const usuario = resultado[0];
        const passwordCorrecta = await bcrypt.compare(password, usuario.password);

        if (!passwordCorrecta) {
            return res.status(401).json({
                mensaje: 'Contraseña incorrecta'
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '8h'
            }
        );

        res.json({
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
    });
});

/* =========================
   OBTENER USUARIOS
========================= */

router.get('/', (req, res) => {

    const sql =
        'SELECT id, nombre, email, rol, foto FROM usuarios';

    db.query(sql, (error, resultados) => {

        if (error) {

            console.log(error);

            return res.status(500).json({

                mensaje:
                    'Error al obtener usuarios'
            });
        }

        return res.json(resultados);
    });
});


/* =========================
   ACTUALIZAR USUARIO
========================= */

router.put('/:id', (req, res) => {

    const {
        nombre,
        email,
        rol
    } = req.body;

    const sql = `
        UPDATE usuarios
        SET
            nombre = ?,
            email = ?,
            rol = ?
        WHERE id = ?
    `;

    db.query(

        sql,

        [
            nombre,
            email,
            rol,
            req.params.id
        ],

        (error) => {

            if (error) {

                console.log(error);

                return res.status(500).json({

                    mensaje:
                        'Error actualizando usuario'
                });
            }

            return res.json({

                mensaje:
                    'Usuario actualizado'
            });
        }
    );
});

/* =========================
   ELIMINAR USUARIO
========================= */

router.delete('/:id', (req, res) => {

    const sql =
        'DELETE FROM usuarios WHERE id = ?';

    db.query(

        sql,

        [req.params.id],

        (error) => {

            if (error) {

                console.log(error);

                return res.status(500).json({

                    mensaje:
                        'Error eliminando usuario'
                });
            }

            return res.json({

                mensaje:
                    'Usuario eliminado correctamente'
            });
        }
    );
});

module.exports = router;