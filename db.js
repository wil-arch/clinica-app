const mysql = require('mysql2');
require('dotenv').config();

/* =========================
   CONEXIÓN MYSQL
========================= */

const connection = mysql.createConnection({
    port: process.env.DB_PORT,

    host: process.env.DB_HOST,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME
});

/* =========================
   VERIFICAR CONEXIÓN
========================= */

connection.connect((error) => {

    if(error){

        console.log('Error de conexión:', error);

        return;
    }

    console.log('MySQL conectado correctamente');
});

module.exports = connection;