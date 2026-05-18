const express = require('express');
const router  = express.Router();
const db      = require('../db');

/* =========================
   ESTADÍSTICAS DASHBOARD
========================= */

router.get('/', async (req, res) => {
    try {
        const [resultado] = await db.query(`
            SELECT
                (SELECT COUNT(*) FROM pacientes)                        AS totalPacientes,
                (SELECT COUNT(*) FROM medicos)                          AS totalMedicos,
                (SELECT COUNT(*) FROM citas)                            AS totalCitas,
                (SELECT COUNT(*) FROM citas WHERE estado = 'pendiente') AS citasPendientes
        `);

        return res.json(resultado[0]);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error obteniendo estadísticas' });
    }
});

module.exports = router;