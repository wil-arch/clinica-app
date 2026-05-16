const express = require('express');

const router = express.Router();

const db = require('../db');


/* =========================
   OBTENER MEDICOS
========================= */

router.get('/', (req, res) => {

    const sql =
        'SELECT * FROM medicos ORDER BY id DESC';

    db.query(sql, (error, resultado) => {

        if (error) {

            console.log(error);

            return res.status(500).json({

                mensaje:
                    'Error obteniendo médicos'
            });
        }

        return res.json(resultado);
    });
});

/* =========================
   CREAR MEDICO
========================= */

router.post('/', (req, res) => {

    const {
        nombre,
        especialidad,
        telefono,
        email,
        consultorio
    } = req.body;

    const sql = `
        INSERT INTO medicos
        (
            nombre,
            especialidad,
            telefono,
            email,
            consultorio
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(

        sql,

        [
            nombre,
            especialidad,
            telefono,
            email,
            consultorio
        ],

        (error, resultado) => {

            if (error) {

                console.log(error);

                return res.status(500).json({

                    mensaje:
                        'Error creando médico'
                });
            }

            return res.status(201).json({

                mensaje:
                    'Médico creado correctamente'
            });
        }
    );
});

/* =========================
   ACTUALIZAR MEDICO
========================= */

router.put('/:id', (req, res) => {

    const { id } = req.params;

    const {
        nombre,
        especialidad,
        telefono,
        email,
        consultorio
    } = req.body;

    const sql = `
        UPDATE medicos
        SET
            nombre = ?,
            especialidad = ?,
            telefono = ?,
            email = ?,
            consultorio = ?
        WHERE id = ?
    `;

    db.query(

        sql,

        [
            nombre,
            especialidad,
            telefono,
            email,
            consultorio,
            id
        ],

        (error) => {

            if (error) {

                console.log(error);

                return res.status(500).json({

                    mensaje:
                        'Error actualizando médico'
                });
            }

            return res.json({

                mensaje:
                    'Médico actualizado correctamente'
            });
        }
    );
});

/* =========================
   ELIMINAR MEDICO
========================= */

router.delete('/:id', (req, res) => {

    const { id } = req.params;

    const sql =
        'DELETE FROM medicos WHERE id = ?';

    db.query(sql, [id], (error) => {

        if (error) {

            console.log(error);

            return res.status(500).json({

                mensaje:
                    'Error eliminando médico'
            });
        }

        return res.json({

            mensaje:
                'Médico eliminado correctamente'
        });
    });
});

module.exports = router;

