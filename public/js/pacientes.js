import { apiFetch, mostrarToast } from './apiClient.js';

let editando         = false;
let pacienteEditando = null;

const formulario = document.getElementById('formPaciente');
const tabla      = document.getElementById('tablaPacientes');

/* =========================
   OBTENER PACIENTES
========================= */

async function obtenerPacientes() {
    try {
        const respuesta = await apiFetch('/api/pacientes');
        const pacientes = await respuesta.json();

        tabla.innerHTML = '';
        pacientes.forEach(paciente => {
            tabla.innerHTML += `
                <tr>
                    <td>${paciente.nombre}</td>
                    <td>${paciente.documento}</td>
                    <td>${paciente.telefono}</td>
                    <td>${paciente.email}</td>
                    <td>
                        <div class="acciones">
                            <button class="btn-editar"   onclick='editarPaciente(${JSON.stringify(paciente)})'>Editar</button>
                            <button class="btn-eliminar" onclick="eliminarPaciente(${paciente.id})">Eliminar</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
    }
}

/* =========================
   CREAR / EDITAR PACIENTE
========================= */

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos  = Object.fromEntries(new FormData(formulario));
    const url    = editando ? `/api/pacientes/${pacienteEditando}` : '/api/pacientes';
    const metodo = editando ? 'PUT' : 'POST';

    try {
        const respuesta = await apiFetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            mostrarToast(data.mensaje || 'Paciente guardado correctamente', 'exito');
            formulario.reset();
            editando         = false;
            pacienteEditando = null;
            obtenerPacientes();
        } else {
            mostrarToast(data.mensaje || 'Error al guardar paciente', 'error');
        }

    } catch (error) {
        console.error('Error al guardar paciente:', error);
        mostrarToast('Ocurrió un error al guardar el paciente', 'error');
    }
});

/* =========================
   ELIMINAR
========================= */

async function eliminarPaciente(id) {
    if (!confirm('¿Eliminar paciente?')) return;

    try {
        const respuesta = await apiFetch(`/api/pacientes/${id}`, { method: 'DELETE' });
        const data      = await respuesta.json();

        mostrarToast(data.mensaje || 'Paciente eliminado', 'exito');
        obtenerPacientes();

    } catch (error) {
        console.error('Error al eliminar paciente:', error);
        mostrarToast('Ocurrió un error al eliminar el paciente', 'error');
    }
}

/* =========================
   EDITAR PACIENTE
========================= */

function editarPaciente(paciente) {
    editando         = true;
    pacienteEditando = paciente.id;

    formulario.nombre.value            = paciente.nombre;
    formulario.documento.value         = paciente.documento;
    formulario.telefono.value          = paciente.telefono;
    formulario.email.value             = paciente.email;
    formulario.direccion.value         = paciente.direccion;
    formulario.fecha_nacimiento.value  = paciente.fecha_nacimiento?.split('T')[0];
}

/* =========================
   EXPONER FUNCIONES GLOBALES
   (requerido por type="module")
========================= */

window.editarPaciente   = editarPaciente;
window.eliminarPaciente = eliminarPaciente;

/* =========================
   INICIAR
========================= */

obtenerPacientes();