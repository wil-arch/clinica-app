const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Token requerido.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload;
        next();

    } catch (error) {
        return res.status(403).json({ mensaje: 'Token inválido o expirado.' });
    }
}

function soloAdmin(req, res, next) {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso restringido a administradores.' });
    }
    next();
}

function adminORecepcionista(req, res, next) {
    const roles = ['admin', 'recepcionista'];
    if (!roles.includes(req.usuario.rol)) {
        return res.status(403).json({ mensaje: 'Sin permisos para esta acción.' });
    }
    next();
}

function adminRecepcionistaMedico(req, res, next) {
    const roles = ['admin', 'recepcionista', 'medico'];
    if (!roles.includes(req.usuario.rol)) {
        return res.status(403).json({ mensaje: 'Sin permisos.' });
    }
    next();
}

module.exports = {
    verificarToken,
    soloAdmin,
    adminORecepcionista,
    adminRecepcionistaMedico   
};
