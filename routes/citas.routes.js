const express = require('express');
const router  = express.Router();
const db      = require('../db');

/* =========================
   OBTENER CITAS
========================= */

router.get('/', async (req, res) => {
    try {
        const { rol, id } = req.usuario;

        const sqlBase = `
            SELECT citas.*, pacientes.nombre AS paciente,
                   medicos.nombre AS medico, medicos.especialidad
            FROM citas
            INNER JOIN pacientes ON citas.paciente_id = pacientes.id
            INNER JOIN medicos   ON citas.medico_id   = medicos.id
        `;

        let resultado;

        if (rol === 'admin' || rol === 'recepcionista') {
            [resultado] = await db.query(sqlBase + ' ORDER BY citas.id DESC');
        }
        else if (rol === 'medico') {
            [resultado] = await db.query(
                sqlBase + ' WHERE citas.medico_id = ? ORDER BY citas.id DESC', [id]
            );
        }
        else if (rol === 'consulta') {
            [resultado] = await db.query(
                sqlBase + ' WHERE citas.paciente_id = (SELECT id FROM pacientes WHERE email = (SELECT email FROM usuarios WHERE id = ?)) ORDER BY citas.id DESC', [id]
            );
        }
        else {
            return res.status(403).json({ mensaje: 'Rol sin permisos' });
        }

        return res.json(resultado);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error servidor' });
    }
});

/* =========================
   CREAR CITA
========================= */

router.post('/', async (req, res) => {
    try {
        const { rol, id } = req.usuario;
        let { paciente_id, medico_id, fecha, hora, motivo } = req.body;

        /* ── Si es consulta busca su paciente_id real por email ── */
        if (rol === 'consulta') {
            const [usuarioData] = await db.query(
                'SELECT email FROM usuarios WHERE id = ?', [id]
            );

            if (usuarioData.length === 0) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }

            const [pacienteData] = await db.query(
                'SELECT id FROM pacientes WHERE email = ?',
                [usuarioData[0].email]
            );

            if (pacienteData.length === 0) {
                return res.status(400).json({
                    mensaje: 'No tienes perfil de paciente. Contacta al administrador.'
                });
            }

            paciente_id = pacienteData[0].id;
        }

        if (rol === 'medico' && Number(medico_id) !== id) {
            return res.status(403).json({ mensaje: 'No puedes crear citas para otros médicos' });
        }

        /* ── Validar duplicados ── */
        const [existe] = await db.query(
            'SELECT id FROM citas WHERE medico_id = ? AND fecha = ? AND hora = ?',
            [medico_id, fecha, hora]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                mensaje: 'El médico ya tiene una cita en ese horario'
            });
        }

        await db.query(
            `INSERT INTO citas (paciente_id, medico_id, fecha, hora, motivo)
             VALUES (?, ?, ?, ?, ?)`,
            [paciente_id, medico_id, fecha, hora, motivo]
        );

        return res.status(201).json({ mensaje: 'Cita creada correctamente' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error creando cita' });
    }
});

/* =========================
   EDITAR CITA
========================= */

router.put('/:id', async (req, res) => {
    try {
        const { rol, id: usuarioId } = req.usuario;
        const { id } = req.params;
       const { paciente_id, medico_id, fecha, hora, motivo, estado, notas_medico, notas_recepcionista } = req.body;

        if (rol === 'medico' && medico_id && Number(medico_id) !== usuarioId) {
            return res.status(403).json({ mensaje: 'Solo puedes modificar tus citas' });
        }

        /* ── Actualización parcial (estado, motivo, notas) ── */
if (!paciente_id && !medico_id && !fecha && !hora) {
    await db.query(
        `UPDATE citas
         SET
           estado              = COALESCE(?, estado),
           motivo              = COALESCE(?, motivo),
           notas_medico        = COALESCE(?, notas_medico),
           notas_recepcionista = COALESCE(?, notas_recepcionista)
         WHERE id = ?`,
        [estado || null, motivo || null, notas_medico || null, notas_recepcionista || null, id]
    );
    return res.json({ mensaje: 'Cita actualizada correctamente' });
}
        /* ── Validar duplicados al editar ── */
        const [existe] = await db.query(
            'SELECT id FROM citas WHERE medico_id = ? AND fecha = ? AND hora = ? AND id != ?',
            [medico_id, fecha, hora, id]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                mensaje: 'El médico ya tiene una cita en ese horario'
            });
        }

        await db.query(
            `UPDATE citas
             SET paciente_id=?, medico_id=?, fecha=?, hora=?, motivo=?, estado=?
             WHERE id=?`,
            [paciente_id, medico_id, fecha, hora, motivo, estado, id]
        );

        return res.json({ mensaje: 'Cita actualizada correctamente' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error actualizando cita' });
    }
});

/* =========================
   ELIMINAR CITA
========================= */

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM citas WHERE id = ?', [req.params.id]);
        return res.json({ mensaje: 'Cita eliminada correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error eliminando cita' });
    }
});

module.exports = router;