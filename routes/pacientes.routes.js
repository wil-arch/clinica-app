const express = require('express');
const router  = express.Router();
const db      = require('../db');

/* =========================
   OBTENER PACIENTES
========================= */

router.get('/', async (req, res) => {
    try {
        const [resultado] = await db.query(
            'SELECT * FROM pacientes ORDER BY id DESC'
        );
        return res.json(resultado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error servidor' });
    }
});

/* =========================
   CREAR PACIENTE
========================= */

router.post('/', async (req, res) => {
    try {
        const { nombre, documento, telefono, email, direccion, fecha_nacimiento } = req.body;

        await db.query(
            `INSERT INTO pacientes (nombre, documento, telefono, email, direccion, fecha_nacimiento)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, documento, telefono, email, direccion, fecha_nacimiento]
        );

        return res.status(201).json({ mensaje: 'Paciente creado correctamente' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error creando paciente' });
    }
});

/* =========================
   EDITAR PACIENTE
========================= */

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, documento, telefono, email, direccion, fecha_nacimiento } = req.body;

        await db.query(
            `UPDATE pacientes
             SET nombre=?, documento=?, telefono=?, email=?, direccion=?, fecha_nacimiento=?
             WHERE id=?`,
            [nombre, documento, telefono, email, direccion, fecha_nacimiento, id]
        );

        return res.json({ mensaje: 'Paciente actualizado correctamente' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error actualizando paciente' });
    }
});


/* =========================
   ELIMINAR PACIENTE
========================= */
router.delete('/:id', async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Obtener el email del paciente (para borrar su usuario vinculado)
        const [pacienteData] = await conn.query(
            'SELECT email FROM pacientes WHERE id = ?', [req.params.id]
        );

        // 2. Eliminar citas asociadas al paciente
        await conn.query('DELETE FROM citas WHERE paciente_id = ?', [req.params.id]);

        // 3. Eliminar el paciente
        await conn.query('DELETE FROM pacientes WHERE id = ?', [req.params.id]);

        // 4. Eliminar su usuario vinculado (si existe, por email)
        if (pacienteData.length > 0) {
            await conn.query(
                'DELETE FROM usuarios WHERE email = ? AND rol = "consulta"',
                [pacienteData[0].email]
            );
        }

        await conn.commit();
        conn.release();

        return res.json({ mensaje: 'Paciente eliminado correctamente' });

    } catch (error) {
        await conn.rollback();
        conn.release();
        console.error(error);
        return res.status(500).json({ mensaje: 'Error eliminando paciente' });
    }
});

/* =========================
   MIS PACIENTES (médico)
========================= */

router.get('/mis-pacientes', async (req, res) => {
    try {
        const { id } = req.usuario;

        const [pacientes] = await db.query(`
            SELECT DISTINCT pacientes.*
            FROM pacientes
            INNER JOIN citas ON citas.paciente_id = pacientes.id
            WHERE citas.medico_id = ?
            ORDER BY pacientes.nombre
        `, [id]);

        return res.json(pacientes);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error obteniendo pacientes' });
    }
});

module.exports = router;