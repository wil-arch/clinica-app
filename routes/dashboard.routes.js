const express = require('express');

const router = express.Router();

const db = require('../db');

/* =========================
   ESTADISTICAS DASHBOARD
========================= */

router.get('/', (req, res) => {

    const sql = `

        SELECT

        (SELECT COUNT(*) FROM pacientes)
            AS totalPacientes,

        (SELECT COUNT(*) FROM medicos)
            AS totalMedicos,

        (SELECT COUNT(*) FROM citas)
            AS totalCitas,

        (
            SELECT COUNT(*)
            FROM citas
            WHERE estado = 'pendiente'
        )
            AS citasPendientes
    `;

    db.query(sql, (error, resultado) => {

        if (error) {

            console.log(error);

            return res.status(500).json({

                mensaje:
                    'Error obteniendo estadísticas'
            });
        }

        return res.json(resultado[0]);
    });
});

module.exports = router;