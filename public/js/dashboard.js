const usuario =
    JSON.parse(localStorage.getItem('usuario'));

const token =
    localStorage.getItem('token');

/* =========================
   URL BACKEND
========================= */

const API_URL = 'http://localhost:3000';

/* =========================
   PROTEGER RUTA
========================= */

if (!token || !usuario) {

    window.location.href = 'login.html';
}

/* =========================
   MOSTRAR DATIOS USUARIO
========================= */

document.getElementById('nombreUsuario')
    .innerText = usuario.nombre;

document.getElementById('rolUsuario')
    .innerText = usuario.rol;

const foto = usuario.foto || 'default.png';

document.getElementById('fotoUsuario')
    .src = `${API_URL}/uploads/usuarios/${foto}`;

document.getElementById('bienvenida')
    .innerText = `Bienvenido, ${usuario.nombre}`;

/* =========================
   MENÚ DINÁMICO
========================= */

const menu = document.getElementById('menu');

let opciones = '';

if (usuario.rol === 'admin') {

    opciones += `
        <a href="#" onclick="mostrarSeccion('todos')">
            Panel general
        </a>

        <a href="#" onclick="mostrarSeccion('medicos')">
            Médicos
        </a>

        <a href="#" onclick="mostrarSeccion('pacientes')">
            Pacientes
        </a>

        <a href="#" onclick="mostrarSeccion('citas')">
            Citas
        </a>

        <a href="#" onclick="mostrarSeccion('usuarios')">
            Usuarios
        </a>
    `;
}

if (usuario.rol === 'recepcionista') {

    opciones += `
        <a href="#" onclick="mostrarSeccion('pacientes')">
            Pacientes
        </a>

        <a href="#" onclick="mostrarSeccion('citas')">
            Citas
        </a>
    `;
}

if (usuario.rol === 'medico') {

    opciones += `
        <a href="#" onclick="mostrarSeccion('citas')">
            Mis citas
        </a>
    `;
}

/* =========================
   USUARIO CONSULTA
========================= */

if (usuario.rol === 'consulta') {

    opciones += `
        <a href="#" onclick="mostrarSeccion('solicitarCita')">
            Solicitar cita
        </a>

        <a href="#" onclick="mostrarSeccion('misCitas')">
            Mis citas
        </a>
    `;
}

menu.innerHTML = opciones;

/* =========================
   MOSTRAR SECCIÓN
========================= */

function mostrarSeccion(tipo) {

    const secciones = [

        'medicos',
        'pacientes',
        'citas',
        'usuarios',
        'solicitarCita',
        'misCitas'
    ];

    secciones.forEach(s => {

        const el = document.getElementById(
            'seccion' + s.charAt(0).toUpperCase() + s.slice(1)
        );

        if (!el) return;

        el.style.display =
            (tipo === s || tipo === 'todos')
                ? 'block'
                : 'none';
    });
}

/* =========================
   CERRAR SESIÓN
========================= */

function cerrarSesion() {

    localStorage.removeItem('token');

    localStorage.removeItem('usuario');

    window.location.href = 'login.html';
}

/* =========================
   DASHBOARD
========================= */

async function cargarDashboard() {

    try {

        const respuesta = await fetch(

            `${API_URL}/api/dashboard`,

            {
                headers: {

                    'Content-Type': 'application/json',

                    'x-usuario-rol': usuario.rol,

                    'x-usuario-id': usuario.id
                }
            }
        );

        if (!respuesta.ok) {

            throw new Error(
                `Error HTTP: ${respuesta.status}`
            );
        }

        const data = await respuesta.json();

        if (document.getElementById('totalPacientes')) {

            document.getElementById('totalPacientes')
                .innerText = data.totalPacientes || 0;
        }

        if (document.getElementById('totalMedicos')) {

            document.getElementById('totalMedicos')
                .innerText = data.totalMedicos || 0;
        }

        if (document.getElementById('totalCitas')) {

            document.getElementById('totalCitas')
                .innerText = data.totalCitas || 0;
        }

        if (document.getElementById('citasPendientes')) {

            document.getElementById('citasPendientes')
                .innerText = data.citasPendientes || 0;
        }

    } catch (error) {

        console.error(
            'Error al cargar dashboard:',
            error
        );
    }
}

/* =========================
   MODAL
========================= */

let _modalTipo = '';

let _modalId = null;

const CAMPOS = {

    medicos: [
        'nombre',
        'especialidad',
        'telefono',
        'email',
        'consultorio'
    ],

    pacientes: [
        'nombre',
        'telefono',
        'email'
    ],

    citas: [
        'paciente',
        'fecha',
        'estado'
    ],

    usuarios: [
        'nombre',
        'email',
        'rol'
    ]
};

/* =========================
   CARGAR MÉDICOS
========================= */

async function cargarMedicos() {

    try {

        const res = await fetch(

            `${API_URL}/api/medicos`,

            {
                headers: {

                    'Content-Type': 'application/json',

                    'x-usuario-rol': usuario.rol,

                    'x-usuario-id': usuario.id
                }
            }
        );

        const medicos = await res.json();

        document.getElementById('listaMedicos')
            .innerHTML = medicos.map(m => `
                <div class="item-card"
                     onclick='verDetalle("medicos", ${JSON.stringify(m)})'>

                    <p class="item-nombre">
                        ${m.nombre}
                    </p>

                    <p class="item-sub">
                        ${m.especialidad}
                    </p>
                </div>
            `).join('');

    } catch (error) {

        console.error(error);
    }
}

/* =========================
   CARGAR PACIENTES
========================= */

async function cargarPacientes() {

    try {

        const res = await fetch(

            `${API_URL}/api/pacientes`,

            {
                headers: {

                    'Content-Type': 'application/json',

                    'x-usuario-rol': usuario.rol,

                    'x-usuario-id': usuario.id
                }
            }
        );

        const pacientes = await res.json();

        document.getElementById('listaPacientes')
            .innerHTML = pacientes.map(p => `
                <div class="item-card"
                     onclick='verDetalle("pacientes", ${JSON.stringify(p)})'>

                    <p class="item-nombre">
                        ${p.nombre}
                    </p>
                </div>
            `).join('');

    } catch (error) {

        console.error(error);
    }
}

/* =========================
   CARGAR CITAS
========================= */

async function cargarCitas() {

    try {

        const res = await fetch(

            `${API_URL}/api/citas`,

            {
                headers: {

                    'Content-Type': 'application/json',

                    'x-usuario-rol': usuario.rol,

                    'x-usuario-id': usuario.id
                }
            }
        );

        const citas = await res.json();

        document.getElementById('listaCitas')
            .innerHTML = citas.map(c => `
                <div class="item-card"
                     onclick='verDetalle("citas", ${JSON.stringify(c)})'>

                    <p class="item-nombre">
                        ${c.paciente}
                    </p>

                    <p class="item-sub">
                        ${c.fecha}
                    </p>
                </div>
            `).join('');

    } catch (error) {

        console.error(error);
    }
}

/* =========================
   CARGAR USUARIOS
========================= */

async function cargarUsuarios() {

    try {

        const res = await fetch(

            `${API_URL}/api/usuarios`,

            {
                headers: {

                    'Content-Type': 'application/json',

                    'x-usuario-rol': usuario.rol,

                    'x-usuario-id': usuario.id
                }
            }
        );

        const usuarios = await res.json();

        document.getElementById('listaUsuarios')
            .innerHTML = usuarios.map(u => `
                <div class="item-card"
                     onclick='verDetalle("usuarios", ${JSON.stringify(u)})'>

                    <p class="item-nombre">
                        ${u.nombre}
                    </p>

                    <p class="item-sub">
                        ${u.rol}
                    </p>
                </div>
            `).join('');

    } catch (error) {

        console.error(error);
    }
}

/* =========================
   SOLICITAR CITA
========================= */

async function solicitarCita(event) {

    event.preventDefault();

    try {

        const body = {

            paciente_id:
                document.getElementById('paciente_id').value,

            medico_id:
                document.getElementById('medico_id').value,

            fecha:
                document.getElementById('fecha').value,

            hora:
                document.getElementById('hora').value,

            motivo:
                document.getElementById('motivo').value
        };

        const res = await fetch(

            `${API_URL}/api/citas`,

            {
                method: 'POST',

                headers: {

                    'Content-Type': 'application/json',

                    'x-usuario-rol': usuario.rol,

                    'x-usuario-id': usuario.id
                },

                body: JSON.stringify(body)
            }
        );

        const data = await res.json();

        if (!res.ok) {

            return alert(data.mensaje);
        }

        alert(data.mensaje);

    } catch (error) {

        console.error(error);

        alert('Error al crear cita');
    }
}

/* =========================
   VER DETALLE
========================= */

function verDetalle(tipo, datos) {

    _modalTipo = tipo;

    _modalId = datos.id;

    document.getElementById('modal-titulo')
        .textContent = datos.nombre || 'Detalle';

    document.getElementById('modal-campos')
        .innerHTML = CAMPOS[tipo].map(campo => `

            <div class="modal-campo">

                <label class="modal-label">

                    ${campo.replace('_', ' ')}

                </label>

                <input
                    class="modal-input"
                    name="${campo}"
                    value="${datos[campo] ?? ''}"
                >
            </div>

        `).join('');

    document.getElementById('modal-detalle')
        .style.display = 'flex';
}

/* =========================
   GUARDAR CAMBIOS
========================= */

async function guardarCambios() {

    try {

        const inputs = document.querySelectorAll(
            '#modal-campos .modal-input'
        );

        const body = {};

        inputs.forEach(i => {

            body[i.name] = i.value;
        });

        const res = await fetch(

            `${API_URL}/api/${_modalTipo}/${_modalId}`,

            {
                method: 'PUT',

                headers: {

                    'Content-Type': 'application/json',

                    'x-usuario-rol': usuario.rol,

                    'x-usuario-id': usuario.id
                },

                body: JSON.stringify(body)
            }
        );

        const data = await res.json();

        alert(data.mensaje);

        cerrarModal();

        cargarMedicos();
        cargarPacientes();
        cargarCitas();
        cargarUsuarios();

    } catch (error) {

        console.error(error);

        alert('Error al guardar');
    }
}

/* =========================
   ELIMINAR
========================= */

async function eliminarRegistro() {

    const confirmar = confirm(
        '¿Eliminar registro?'
    );

    if (!confirmar) return;

    try {

        const res = await fetch(

            `${API_URL}/api/${_modalTipo}/${_modalId}`,

            {
                method: 'DELETE',

                headers: {

                    'Content-Type': 'application/json',

                    'x-usuario-rol': usuario.rol,

                    'x-usuario-id': usuario.id
                }
            }
        );

        const data = await res.json();

        alert(data.mensaje);

        cerrarModal();

        cargarMedicos();
        cargarPacientes();
        cargarCitas();
        cargarUsuarios();

    } catch (error) {

        console.error(error);

        alert('Error al eliminar');
    }
}

/* =========================
   CERRAR MODAL
========================= */

function cerrarModal() {

    document.getElementById('modal-detalle')
        .style.display = 'none';
}

document.getElementById('modal-detalle')
    .addEventListener('click', (e) => {

        if (e.target.id === 'modal-detalle') {

            cerrarModal();
        }
    });

/* =========================
   INICIAR
========================= */

if (usuario.rol === 'admin') {

    cargarMedicos();
    cargarPacientes();
    cargarCitas();
    cargarUsuarios();
    cargarDashboard();
}

if (usuario.rol === 'recepcionista') {

    cargarPacientes();
    cargarCitas();
    cargarDashboard();
}

if (usuario.rol === 'medico') {

    cargarCitas();
    cargarDashboard();
}

/* =========================
   CONSULTA
========================= */

if (usuario.rol === 'consulta') {

    mostrarSeccion('solicitarCita');

    cargarDashboard();

    const formSolicitud =
        document.getElementById('formSolicitarCita');

    if (formSolicitud) {

        formSolicitud.addEventListener(
            'submit',
            solicitarCita
        );
    }
}

/* =========================
   OCULTAR MÉTRICAS
========================= */

if (usuario.rol !== 'admin') {

    const cards =
        document.querySelector('.cards-dashboard');

    if (cards) {

        cards.style.display = 'none';
    }
}