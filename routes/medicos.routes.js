const express = require('express');
const router  = express.Router();
const db      = require('../db');

/* =========================
   OBTENER MÉDICOS
========================= */

router.get('/', async (req, res) => {
    try {
        const [resultado] = await db.query(
            'SELECT * FROM medicos ORDER BY id DESC'
        );
        return res.json(resultado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error obteniendo médicos' });
    }
});

/* =========================
   CREAR MÉDICO
========================= */

router.post('/', async (req, res) => {
    try {
        const { nombre, especialidad, telefono, email, consultorio } = req.body;

        await db.query(
            `INSERT INTO medicos (nombre, especialidad, telefono, email, consultorio)
             VALUES (?, ?, ?, ?, ?)`,
            [nombre, especialidad, telefono, email, consultorio]
        );

        return res.status(201).json({ mensaje: 'Médico creado correctamente' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error creando médico' });
    }
});

/* =========================
   ACTUALIZAR MÉDICO
========================= */

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, especialidad, telefono, email, consultorio } = req.body;

        await db.query(
            `UPDATE medicos
             SET nombre=?, especialidad=?, telefono=?, email=?, consultorio=?
             WHERE id=?`,
            [nombre, especialidad, telefono, email, consultorio, id]
        );

        return res.json({ mensaje: 'Médico actualizado correctamente' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error actualizando médico' });
    }
});

/* =========================
   ELIMINAR MÉDICO
========================= */

/* =========================
   ELIMINAR MÉDICO
========================= */
router.delete('/:id', async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Eliminar citas asociadas al médico
        await conn.query('DELETE FROM citas WHERE medico_id = ?', [req.params.id]);

        // 2. Eliminar el médico
        await conn.query('DELETE FROM medicos WHERE id = ?', [req.params.id]);

        // 3. Eliminar su usuario vinculado (mismo id)
        await conn.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);

        await conn.commit();
        conn.release();

        return res.json({ mensaje: 'Médico eliminado correctamente' });

    } catch (error) {
        await conn.rollback();
        conn.release();
        console.error(error);
        return res.status(500).json({ mensaje: 'Error eliminando médico' });
    }
});

module.exports = router;