const express = require('express');

const router = express.Router();

const db = require('../db');

/* =========================
   OBTENER PACIENTES
========================= */

router.get('/', (req, res) => {

    const sql =
        'SELECT * FROM pacientes ORDER BY id DESC';

    db.query(sql, (error, resultado) => {

        if(error){

            console.log(error);

            return res.status(500).json({
                mensaje: 'Error servidor'
            });
        }

        res.json(resultado);
    });
});

/* =========================
   CREAR PACIENTE
========================= */

router.post('/', (req, res) => {

    const {

        nombre,
        documento,
        telefono,
        email,
        direccion,
        fecha_nacimiento

    } = req.body;

    const sql = `
        INSERT INTO pacientes
        (
            nombre,
            documento,
            telefono,
            email,
            direccion,
            fecha_nacimiento
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(

        sql,

        [
            nombre,
            documento,
            telefono,
            email,
            direccion,
            fecha_nacimiento
        ],

        (error, resultado) => {

            if(error){

                console.log(error);

                return res.status(500).json({
                    mensaje: 'Error creando paciente'
                });
            }

            res.status(201).json({

                mensaje: 'Paciente creado correctamente'
            });
        }
    );
});

/* =========================
   ELIMINAR PACIENTE
========================= */

router.delete('/:id', (req, res) => {

    const { id } = req.params;

    const sql =
        'DELETE FROM pacientes WHERE id = ?';

    db.query(sql, [id], (error, resultado) => {

        if(error){

            console.log(error);

            return res.status(500).json({
                mensaje: 'Error eliminando paciente'
            });
        }

        res.json({

            mensaje: 'Paciente eliminado'
        });
    });
});

/* =========================
   EDITAR PACIENTE
========================= */

router.put('/:id',(req, res) => {

    const { id } = req.params;

    const {

        nombre,
        documento,
        telefono,
        email,
        direccion,
        fecha_nacimiento

    } = req.body;

    const sql = `
        UPDATE pacientes
        SET

            nombre = ?,
            documento = ?,
            telefono = ?,
            email = ?,
            direccion = ?,
            fecha_nacimiento = ?

        WHERE id = ?
    `;

    db.query(

        sql,

        [
            nombre,
            documento,
            telefono,
            email,
            direccion,
            fecha_nacimiento,
            id
        ],

        (error, resultado) => {

            if(error){

                console.log(error);

                return res.status(500).json({
                    mensaje: 'Error actualizando paciente'
                });
            }

            res.json({

                mensaje: 'Paciente actualizado correctamente'
            });
        }
    );
});


module.exports = router;

