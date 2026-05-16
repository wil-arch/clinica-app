const express = require('express');
const router = express.Router();
const db = require('../db');

/* =========================
   SEGURIDAD USUARIO
========================= */

function getUsuario(req, res) {
    const usuarioRol = req.headers['x-usuario-rol'];
    const usuarioId = req.headers['x-usuario-id'];

    if (!usuarioRol || !usuarioId) {
        res.status(401).json({
            mensaje: 'No autenticado: faltan datos de usuario en headers'
        });
        return null;
    }

    return {
        rol: usuarioRol,
        id: Number(usuarioId)
    };
}

/* =========================
   OBTENER CITAS
========================= */

router.get('/', (req, res) => {

    const usuario = getUsuario(req, res);
    if (!usuario) return;

    const usuarioRol = usuario.rol;
    const usuarioId = usuario.id;

    // ADMIN
    if (usuarioRol === 'admin') {

        const sql = `
            SELECT citas.*, pacientes.nombre AS paciente, medicos.nombre AS medico, medicos.especialidad
            FROM citas
            INNER JOIN pacientes ON citas.paciente_id = pacientes.id
            INNER JOIN medicos ON citas.medico_id = medicos.id
            ORDER BY citas.id DESC
        `;

        return db.query(sql, (error, resultado) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ mensaje: 'Error servidor' });
            }
            return res.json(resultado);
        });
    }

    // MÉDICO
    if (usuarioRol === 'medico') {

        const sql = `
            SELECT citas.*, pacientes.nombre AS paciente, medicos.nombre AS medico, medicos.especialidad
            FROM citas
            INNER JOIN pacientes ON citas.paciente_id = pacientes.id
            INNER JOIN medicos ON citas.medico_id = medicos.id
            WHERE citas.medico_id = ?
            ORDER BY citas.id DESC
        `;

        return db.query(sql, [usuarioId], (error, resultado) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ mensaje: 'Error servidor' });
            }
            return res.json(resultado);
        });
    }

    // PACIENTE
    if (usuarioRol === 'consulta') {

        const sql = `
            SELECT citas.*, pacientes.nombre AS paciente, medicos.nombre AS medico, medicos.especialidad
            FROM citas
            INNER JOIN pacientes ON citas.paciente_id = pacientes.id
            INNER JOIN medicos ON citas.medico_id = medicos.id
            WHERE citas.paciente_id = ?
            ORDER BY citas.id DESC
        `;

        return db.query(sql, [usuarioId], (error, resultado) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ mensaje: 'Error servidor' });
            }
            return res.json(resultado);
        });
    }

    return res.status(403).json({
        mensaje: 'Prohibido: rol insuficiente'
    });
});

/* =========================
   CREAR CITA
========================= */

router.post('/', (req, res) => {

    const usuario = getUsuario(req, res);
    if (!usuario) return;

    const {
        paciente_id,
        medico_id,
        fecha,
        hora,
        motivo
    } = req.body;

    const usuarioRol = usuario.rol;
    const usuarioId = usuario.id;

    if (usuarioRol === 'medico' && Number(medico_id) !== usuarioId) {
        return res.status(403).json({
            mensaje: 'Prohibido: no puedes crear citas para otros médicos'
        });
    }

    if (usuarioRol === 'consulta' && Number(paciente_id) !== usuarioId) {
        return res.status(403).json({
            mensaje: 'Prohibido: no puedes crear citas para otros pacientes'
        });
    }

    if (!['admin', 'medico', 'consulta'].includes(usuarioRol)) {
        return res.status(403).json({
            mensaje: 'Prohibido: rol insuficiente'
        });
    }

    const verificarSQL = `
        SELECT * FROM citas
        WHERE medico_id = ? AND fecha = ? AND hora = ?
    `;

    db.query(verificarSQL, [medico_id, fecha, hora], (error, resultado) => {

        if (error) {
            console.log(error);
            return res.status(500).json({ mensaje: 'Error servidor' });
        }

        if (resultado.length > 0) {
            return res.status(400).json({
                mensaje: 'El médico ya tiene una cita en ese horario'
            });
        }

        const sql = `
            INSERT INTO citas (paciente_id, medico_id, fecha, hora, motivo)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sql, [paciente_id, medico_id, fecha, hora, motivo], (error) => {

            if (error) {
                console.log(error);
                return res.status(500).json({ mensaje: 'Error creando cita' });
            }

            return res.status(201).json({
                mensaje: 'Cita creada correctamente'
            });
        });
    });
});

/* =========================
   EDITAR CITA
========================= */

router.put('/:id', (req, res) => {

    const usuario = getUsuario(req, res);
    if (!usuario) return;

    const { id } = req.params;
    const {
        paciente_id,
        medico_id,
        fecha,
        hora,
        motivo,
        estado
    } = req.body;

    const usuarioRol = usuario.rol;
    const usuarioId = usuario.id;

    if (usuarioRol === 'medico' && Number(medico_id) !== usuarioId) {
        return res.status(403).json({
            mensaje: 'Prohibido: solo puedes modificar tus citas'
        });
    }

    if (estado && !paciente_id && !medico_id && !fecha && !hora && !motivo) {

        const sql = `UPDATE citas SET estado = ? WHERE id = ?`;

        return db.query(sql, [estado, id], (error) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ mensaje: 'Error actualizando cita' });
            }

            return res.json({ mensaje: 'Estado actualizado correctamente' });
        });
    }

    const verificarSQL = `
        SELECT * FROM citas
        WHERE medico_id = ? AND fecha = ? AND hora = ? AND id != ?
    `;

    db.query(verificarSQL, [medico_id, fecha, hora, id], (error, resultado) => {

        if (error) {
            console.log(error);
            return res.status(500).json({ mensaje: 'Error servidor' });
        }

        if (resultado.length > 0) {
            return res.status(400).json({
                mensaje: 'El médico ya tiene una cita en ese horario'
            });
        }

        const sql = `
            UPDATE citas
            SET paciente_id=?, medico_id=?, fecha=?, hora=?, motivo=?, estado=?
            WHERE id=?
        `;

        db.query(sql, [paciente_id, medico_id, fecha, hora, motivo, estado, id], (error) => {

            if (error) {
                console.log(error);
                return res.status(500).json({ mensaje: 'Error actualizando cita' });
            }

            return res.json({ mensaje: 'Cita actualizada correctamente' });
        });
    });
});

/* =========================
   ELIMINAR CITA
========================= */

router.delete('/:id', (req, res) => {

    const sql = 'DELETE FROM citas WHERE id = ?';

    db.query(sql, [req.params.id], (error) => {

        if (error) {
            console.log(error);
            return res.status(500).json({ mensaje: 'Error eliminando cita' });
        }

        return res.json({ mensaje: 'Cita eliminada correctamente' });
    });
});

module.exports = router;