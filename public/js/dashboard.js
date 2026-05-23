import { mostrarToast, confirmarAccion } from './apiClient.js';

const usuario = JSON.parse(localStorage.getItem('usuario'));
const token   = localStorage.getItem('token');

/* =========================
   URL BACKEND
========================= */

const API_URL = 'http://localhost:3000';

/* =========================
   VALIDAR TOKEN
========================= */

try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload) throw new Error('Token inválido');
} catch (error) {
    localStorage.clear();
    window.location.replace('./login.html');
}

/* =========================
   PROTEGER RUTA
========================= */

if (!token || !usuario) {
    window.location.replace('./login.html');
}

/* =========================
   CABECERAS AUTENTICADAS
========================= */

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

/* =========================
   MOSTRAR DATOS USUARIO
========================= */

document.getElementById('nombreUsuario').innerText = usuario.nombre;
document.getElementById('rolUsuario').innerText    = usuario.rol;
document.getElementById('bienvenida').innerText    = `Bienvenido, ${usuario.nombre}`;

const foto = usuario.foto || 'default.png';
document.getElementById('fotoUsuario').src = `${API_URL}/uploads/usuarios/${foto}`;

/* =========================
   MENÚ DINÁMICO
========================= */

const menu = document.getElementById('menu');
let opciones = '';

if (usuario.rol === 'admin') {
    opciones += `
        <a href="#" onclick="mostrarPanelAdmin()">Panel general</a>
        <a href="#" onclick="mostrarSeccion('medicos')">Médicos</a>
        <a href="#" onclick="mostrarSeccion('pacientes')">Pacientes</a>
        <a href="#" onclick="mostrarSeccion('citas')">Citas</a>
        <a href="#" onclick="mostrarSeccion('usuarios')">Usuarios</a>
    `;
}

if (usuario.rol === 'recepcionista') {
    opciones += `
        <a href="#" onclick="mostrarSeccion('pacientes')">Pacientes</a>
        <a href="#" onclick="mostrarSeccion('citas')">Citas</a>
    `;
}

if (usuario.rol === 'medico') {
    opciones += `
        <a href="#" onclick="mostrarSeccion('misPacientes'); cargarMisPacientes();">Mis pacientes</a>
        <a href="#" onclick="mostrarSeccion('citas'); cargarCitas();">Mis citas</a>
    `;
}

if (usuario.rol === 'consulta') {
    opciones += `
        <a href="#" onclick="mostrarSeccion('solicitarCita'); cargarMedicosSelect();">Solicitar cita</a>
        <a href="#" onclick="mostrarSeccion('misCitas'); cargarMisCitas();">Mis citas</a>
    `;
}

menu.innerHTML = opciones;

/* =========================
   MOSTRAR SECCIÓN
========================= */

function mostrarSeccion(tipo) {
    const secciones = [
        'medicos', 'pacientes', 'citas', 'usuarios',
        'solicitarCita', 'misCitas', 'misPacientes'
    ];

    secciones.forEach(s => {
        const el = document.getElementById(
            'seccion' + s.charAt(0).toUpperCase() + s.slice(1)
        );
        if (!el) return;
        el.style.display = (tipo === s || tipo === 'todos') ? 'block' : 'none';
    });
}

/* =========================
   CERRAR SESIÓN
========================= */

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = './index.html';
}

/* =========================
   DASHBOARD
========================= */

async function cargarDashboard() {
    try {
        const respuesta = await fetch(`${API_URL}/api/dashboard`, { headers });
        if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);

        const data = await respuesta.json();

        if (document.getElementById('totalPacientes'))
            document.getElementById('totalPacientes').innerText = data.totalPacientes || 0;
        if (document.getElementById('totalMedicos'))
            document.getElementById('totalMedicos').innerText = data.totalMedicos || 0;
        if (document.getElementById('totalCitas'))
            document.getElementById('totalCitas').innerText = data.totalCitas || 0;
        if (document.getElementById('citasPendientes'))
            document.getElementById('citasPendientes').innerText = data.citasPendientes || 0;

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}

/* =========================
   MODAL
========================= */

let _modalTipo = '';
let _modalId   = null;

const CAMPOS = {
    medicos:   ['nombre', 'especialidad', 'telefono', 'email', 'consultorio'],
    pacientes: ['nombre', 'documento', 'telefono', 'email', 'direccion'],
    citas: usuario.rol === 'medico'
        ? ['estado', 'notas_medico']
        : usuario.rol === 'recepcionista'
        ? ['estado', 'motivo', 'notas_recepcionista']
        : ['estado', 'motivo', 'notas_medico', 'notas_recepcionista'],
    usuarios: ['nombre', 'email', 'rol']
};

/* =========================
   CARGAR MÉDICOS
========================= */

async function cargarMedicos() {
    try {
        const res     = await fetch(`${API_URL}/api/medicos`, { headers });
        const medicos = await res.json();

        document.getElementById('listaMedicos').innerHTML =
            medicos.map(m => `
                <div class="item-card" onclick='verDetalle("medicos", ${JSON.stringify(m)})'>
                    <p class="item-nombre">${m.nombre}</p>
                    <p class="item-sub">${m.especialidad}</p>
                </div>
            `).join('');
    } catch (error) {
        console.error(error);
    }
}

/* =========================
   CARGAR MÉDICOS EN SELECT
   (solo para rol consulta)
========================= */

async function cargarMedicosSelect() {
    try {
        const res     = await fetch(`${API_URL}/api/medicos`, { headers });
        const medicos = await res.json();
        const select  = document.getElementById('medico_id');
        if (!select) return;

        select.innerHTML = '<option value="">Seleccione un médico</option>';
        medicos.forEach(m => {
            const opt       = document.createElement('option');
            opt.value       = m.id;
            opt.textContent = `${m.nombre} — ${m.especialidad}`;
            select.appendChild(opt);
        });
    } catch (error) {
        console.error(error);
    }
}

/* =========================
   CARGAR PACIENTES
========================= */

async function cargarPacientes() {
    try {
        const res       = await fetch(`${API_URL}/api/pacientes`, { headers });
        const pacientes = await res.json();

        document.getElementById('listaPacientes').innerHTML =
            pacientes.map(p => `
                <div class="item-card" onclick='verDetalle("pacientes", ${JSON.stringify(p)})'>
                    <p class="item-nombre">${p.nombre}</p>
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
        const res   = await fetch(`${API_URL}/api/citas`, { headers });
        const citas = await res.json();

        document.getElementById('listaCitas').innerHTML =
            citas.map(c => {
                const fecha = c.fecha
                    ? new Date(c.fecha).toLocaleDateString('es-CO')
                    : '—';
                return `
                    <div class="item-card" onclick='verDetalle("citas", ${JSON.stringify(c)})'>
                        <p class="item-nombre">${c.paciente || c.medico || '—'}</p>
                        <p class="item-sub">📅 ${fecha} — ${c.hora || ''}</p>
                        <p class="item-sub">Estado: <strong>${c.estado || 'pendiente'}</strong></p>
                    </div>
                `;
            }).join('');
    } catch (error) {
        console.error(error);
    }
}

/* =========================
   CARGAR MIS CITAS (consulta)
========================= */

async function cargarMisCitas() {
    try {
        const res   = await fetch(`${API_URL}/api/citas`, { headers });
        const citas = await res.json();
        const lista = document.getElementById('listaMisCitas');
        if (!lista) return;

        if (citas.length === 0) {
            lista.innerHTML = '<p class="lista-vacia">No tienes citas registradas.</p>';
            return;
        }

        lista.innerHTML = citas.map(c => {
            const fecha = c.fecha
                ? new Date(c.fecha).toLocaleDateString('es-CO')
                : '—';

            const btnCancelar = c.estado === 'pendiente'
                ? `<button class="btn-cancelar-cita" onclick="cancelarCita(${c.id})">
                       Cancelar cita
                   </button>`
                : '';

            return `
                <div class="item-card">
                    <p class="item-nombre">Dr. ${c.medico}</p>
                    <p class="item-sub">${c.especialidad}</p>
                    <p class="item-sub">📅 ${fecha} — ${c.hora}</p>
                    <p class="item-sub">Estado: <strong>${c.estado || 'pendiente'}</strong></p>
                    <p class="item-sub">Motivo: ${c.motivo || '—'}</p>
                    ${btnCancelar}
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error(error);
    }
}

/* =========================
   CARGAR MIS PACIENTES (médico)
========================= */

async function cargarMisPacientes() {
    try {
        const res       = await fetch(`${API_URL}/api/pacientes/mis-pacientes`, { headers });
        const pacientes = await res.json();
        const lista     = document.getElementById('listaMisPacientes');
        if (!lista) return;

        if (pacientes.length === 0) {
            lista.innerHTML = '<p class="lista-vacia">Aún no tienes pacientes asignados.</p>';
            return;
        }

        const v = x => (x != null && x !== '' && x !== 'null') ? x : '—';

        lista.innerHTML = pacientes.map(p => `
            <div class="item-card" onclick='verDetalle("pacientes", ${JSON.stringify(p)})'>
                <p class="item-nombre">${v(p.nombre)}</p>
                <p class="item-sub">📄 Doc: ${v(p.documento)}</p>
                <p class="item-sub">📧 ${v(p.email)}</p>
                <p class="item-sub">📞 ${v(p.telefono)}</p>
                <p class="item-sub">🏠 ${v(p.direccion)}</p>
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
        const res      = await fetch(`${API_URL}/api/usuarios`, { headers });
        const usuarios = await res.json();

        document.getElementById('listaUsuarios').innerHTML =
            usuarios.map(u => `
                <div class="item-card" onclick='verDetalle("usuarios", ${JSON.stringify(u)})'>
                    <p class="item-nombre">${u.nombre}</p>
                    <p class="item-sub">${u.rol}</p>
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
            paciente_id: document.getElementById('paciente_id').value,
            medico_id:   document.getElementById('medico_id').value,
            fecha:       document.getElementById('fecha').value,
            hora:        document.getElementById('hora').value,
            motivo:      document.getElementById('motivo').value
        };

        const res  = await fetch(`${API_URL}/api/citas`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            mostrarToast(data.mensaje || 'Error al crear la cita', 'error');
            return;
        }

        mostrarToast(data.mensaje || 'Cita solicitada correctamente', 'exito');
        document.getElementById('formSolicitarCita').reset();

    } catch (error) {
        console.error(error);
        mostrarToast('Error al crear la cita', 'error');
    }
}

/* =========================
   VER DETALLE
========================= */

function verDetalle(tipo, datos) {
    _modalTipo = tipo;
    _modalId   = datos.id;

    document.getElementById('modal-titulo').textContent =
        datos.nombre || datos.paciente || 'Detalle';

    const estadoOpciones = [
        'pendiente', 'confirmada', 'en consulta',
        'atendida', 'cancelada', 'finalizada'
    ];

    document.getElementById('modal-campos').innerHTML =
        CAMPOS[tipo].map(campo => {
            if (campo === 'estado') {
                const opciones = estadoOpciones.map(op =>
                    `<option value="${op}" ${(datos[campo] || 'pendiente') === op ? 'selected' : ''}>
                        ${op.charAt(0).toUpperCase() + op.slice(1)}
                    </option>`
                ).join('');
                return `
                    <div class="modal-campo">
                        <label class="modal-label">Estado</label>
                        <select class="modal-input" name="estado">${opciones}</select>
                    </div>
                `;
            }
            return `
                <div class="modal-campo">
                    <label class="modal-label">${campo.replace('_', ' ')}</label>
                    <input class="modal-input" name="${campo}" value="${datos[campo] ?? ''}">
                </div>
            `;
        }).join('');

    document.getElementById('modal-detalle').style.display = 'flex';
}

/* =========================
   GUARDAR CAMBIOS
========================= */

async function guardarCambios() {
    try {
        const inputs = document.querySelectorAll('#modal-campos .modal-input');
        const body   = {};
        inputs.forEach(i => { body[i.name] = i.value; });

        const res  = await fetch(`${API_URL}/api/${_modalTipo}/${_modalId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (res.ok) {
            mostrarToast(data.mensaje || 'Cambios guardados correctamente', 'exito');
        } else {
            mostrarToast(data.mensaje || 'Error al guardar cambios', 'error');
        }

        cerrarModal();
        cargarMedicos();
        cargarPacientes();
        cargarCitas();
        cargarUsuarios();

    } catch (error) {
        console.error(error);
        mostrarToast('Error al guardar', 'error');
    }
}

/* =========================
   ELIMINAR
========================= */

async function eliminarRegistro() {
    const confirmado = await confirmarAccion('¿Estás seguro de eliminar este registro?');
    if (!confirmado) return;

    try {
        const res  = await fetch(`${API_URL}/api/${_modalTipo}/${_modalId}`, {
            method: 'DELETE',
            headers
        });

        const data = await res.json();

        if (res.ok) {
            mostrarToast(data.mensaje || 'Registro eliminado', 'exito');
        } else {
            mostrarToast(data.mensaje || 'Error al eliminar', 'error');
        }

        cerrarModal();
        cargarMedicos();
        cargarPacientes();
        cargarCitas();
        cargarUsuarios();

    } catch (error) {
        console.error(error);
        mostrarToast('Error al eliminar', 'error');
    }
}

/* =========================
   CERRAR MODAL
========================= */

function cerrarModal() {
    document.getElementById('modal-detalle').style.display = 'none';
}

document.getElementById('modal-detalle').addEventListener('click', (e) => {
    if (e.target.id === 'modal-detalle') cerrarModal();
});

/* =========================
   BÚSQUEDA Y FILTRADO
========================= */

function filtrarLista(inputId, contenedorId) {
    const termino  = document.getElementById(inputId).value.toLowerCase();
    const tarjetas = document.getElementById(contenedorId).querySelectorAll('.item-card');
    tarjetas.forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(termino) ? 'block' : 'none';
    });
}

/* =========================
   INICIAR
========================= */

if (usuario.rol === 'admin') {
    cargarMedicos();
    cargarPacientes();
    cargarCitas();
    cargarUsuarios();
    cargarDashboard();
    mostrarPanelAdmin();
    ['seccionMisPacientes', 'seccionMisCitas', 'seccionSolicitarCita'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function mostrarPanelAdmin() {
    mostrarSeccion('todos');
    ['seccionMisPacientes', 'seccionMisCitas', 'seccionSolicitarCita'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

if (usuario.rol === 'recepcionista') {
    cargarPacientes();
    cargarCitas();
    cargarDashboard();
    mostrarSeccion('pacientes');
}

if (usuario.rol === 'medico') {
    cargarCitas();
    cargarMisPacientes();
    cargarDashboard();
    mostrarSeccion('citas');
}

if (usuario.rol === 'consulta') {
    mostrarSeccion('solicitarCita');
    cargarMedicosSelect();
    cargarMisCitas();

    const inputPaciente = document.getElementById('paciente_id');
    if (inputPaciente) inputPaciente.value = usuario.id;

    const formSolicitud = document.getElementById('formSolicitarCita');
    if (formSolicitud) formSolicitud.addEventListener('submit', solicitarCita);
}

/* =========================
   OCULTAR MÉTRICAS
========================= */

if (usuario.rol !== 'admin') {
    const cards = document.querySelector('.cards-dashboard');
    if (cards) cards.style.display = 'none';
}


/* =========================
   CANCELAR CITA (consulta)
========================= */

async function cancelarCita(id) {
    const confirmado = await confirmarAccion('¿Seguro que deseas cancelar esta cita?');
    if (!confirmado) return;

    try {
        const res  = await fetch(`${API_URL}/api/citas/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ estado: 'cancelada' })
        });

        const data = await res.json();

        if (res.ok) {
            mostrarToast('Cita cancelada correctamente', 'exito');
            cargarMisCitas(); // refresca las tarjetas
        } else {
            mostrarToast(data.mensaje || 'No se pudo cancelar', 'error');
        }

    } catch (error) {
        console.error(error);
        mostrarToast('Error al cancelar la cita', 'error');
    }
}

/* =========================
   EXPONER FUNCIONES AL HTML
========================= */

window.cerrarSesion      = cerrarSesion;
window.mostrarPanelAdmin = mostrarPanelAdmin;
window.mostrarSeccion    = mostrarSeccion;
window.verDetalle        = verDetalle;
window.guardarCambios    = guardarCambios;
window.eliminarRegistro  = eliminarRegistro;
window.cerrarModal       = cerrarModal;
window.filtrarLista      = filtrarLista;
window.solicitarCita     = solicitarCita;
window.cancelarCita = cancelarCita;