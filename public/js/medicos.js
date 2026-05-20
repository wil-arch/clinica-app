import { apiFetch, mostrarToast } from './apiClient.js';

const formulario = document.getElementById('formMedico');
const tabla      = document.getElementById('tablaMedicos');

let editando       = false;
let medicoEditando = null;

/* =========================
   OBTENER MEDICOS
========================= */

async function obtenerMedicos() {
    try {
        const respuesta = await apiFetch('/api/medicos');
        const medicos   = await respuesta.json();

        tabla.innerHTML = '';
        medicos.forEach(medico => {
            tabla.innerHTML += `
                <tr onclick='verMedico(${JSON.stringify(medico)})' style="cursor:pointer;">
                    <td>${medico.nombre}</td>
                    <td>${medico.especialidad}</td>
                    <td>${medico.telefono}</td>
                    <td>${medico.email}</td>
                    <td>${medico.consultorio}</td>
                    <td>
                        <div class="acciones">
                            <button class="btn-editar"   onclick='editarMedico(${JSON.stringify(medico)})'>Editar</button>
                            <button class="btn-eliminar" onclick="eliminarMedico(${medico.id})">Eliminar</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error al obtener médicos:', error);
    }
}

/* =========================
   GUARDAR / EDITAR
========================= */

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos  = Object.fromEntries(new FormData(formulario));
    const url    = editando ? `/api/medicos/${medicoEditando}` : '/api/medicos';
    const metodo = editando ? 'PUT' : 'POST';

    try {
        const respuesta = await apiFetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            mostrarToast(data.mensaje || 'Médico guardado correctamente', 'exito');
            formulario.reset();
            editando       = false;
            medicoEditando = null;
            obtenerMedicos();
        } else {
            mostrarToast(data.mensaje || 'Error al guardar médico', 'error');
        }

    } catch (error) {
        console.error('Error al guardar médico:', error);
        mostrarToast('Ocurrió un error al guardar el médico', 'error');
    }
});

/* =========================
   EDITAR
========================= */

function editarMedico(medico) {
    editando       = true;
    medicoEditando = medico.id;

    formulario.nombre.value       = medico.nombre;
    formulario.especialidad.value = medico.especialidad;
    formulario.telefono.value     = medico.telefono;
    formulario.email.value        = medico.email;
    formulario.consultorio.value  = medico.consultorio;
}

/* =========================
   ELIMINAR
========================= */

async function eliminarMedico(id) {
    if (!confirm('¿Eliminar médico?')) return;

    try {
        const respuesta = await apiFetch(`/api/medicos/${id}`, { method: 'DELETE' });
        const data      = await respuesta.json();

        mostrarToast(data.mensaje || 'Médico eliminado', 'exito');
        obtenerMedicos();

    } catch (error) {
        console.error('Error al eliminar médico:', error);
        mostrarToast('Ocurrió un error al eliminar el médico', 'error');
    }
}

/* =========================
   VER DETALLE (MODAL)
========================= */

function verMedico(medico) {
    document.getElementById('modal-nombre').textContent       = medico.nombre;
    document.getElementById('modal-especialidad').textContent = medico.especialidad;
    document.getElementById('modal-telefono').textContent     = medico.telefono;
    document.getElementById('modal-email').textContent        = medico.email;
    document.getElementById('modal-consultorio').textContent  = medico.consultorio;

    document.getElementById('modal-btn-editar').onclick = () => {
        editarMedico(medico);
        cerrarModalMedico();
    };

    document.getElementById('modal-medico').style.display = 'flex';
}

function cerrarModalMedico() {
    document.getElementById('modal-medico').style.display = 'none';
}

/* =========================
   EXPONER FUNCIONES GLOBALES
   (requerido por type="module")
========================= */

window.editarMedico      = editarMedico;
window.eliminarMedico    = eliminarMedico;
window.verMedico         = verMedico;
window.cerrarModalMedico = cerrarModalMedico;

/* =========================
   INICIAR
========================= */

obtenerMedicos();