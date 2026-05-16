const mysql = require('mysql2');
require('dotenv').config();

/* =========================
   POOL DE CONEXIONES MYSQL
========================= */

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/* =========================
   PROMISIFY DE CONSULTAS
========================= */

const db = pool.promise();

/* =========================
   VERIFICAR CONEXIÓN
========================= */

pool.getConnection((error, connection) => {

    if (error) {
        console.log('Error de conexión:', error);
        return;
    }

    console.log('MySQL pool conectado correctamente');
    connection.release();
});

module.exports = db;