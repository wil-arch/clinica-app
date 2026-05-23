import { apiFetch, mostrarToast } from './apiClient.js';

let editando     = false;
let citaEditando = null;

// ── Leer rol del usuario desde localStorage ──
const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || '{}');
const rolActual    = usuarioLocal.rol || '';

const formulario      = document.getElementById('formCita');
const tabla           = document.getElementById('tablaCitas');
const selectPacientes = document.getElementById('selectPacientes');
const selectMedicos   = document.getElementById('selectMedicos');

/* =========================
   CARGAR PACIENTES
========================= */

async function cargarPacientes() {
    try {
        const respuesta = await apiFetch('/api/pacientes');
        const pacientes = await respuesta.json();
        let opciones = '';
        pacientes.forEach(p => {
            opciones += `<option value="${p.id}">${p.nombre}</option>`;
        });
        selectPacientes.innerHTML += opciones;
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
    }
}

/* =========================
   CARGAR MEDICOS
========================= */

async function cargarMedicos() {
    try {
        const respuesta = await apiFetch('/api/medicos');
        const medicos   = await respuesta.json();
        let opciones = '';
        medicos.forEach(m => {
            opciones += `<option value="${m.id}">${m.nombre} — ${m.especialidad}</option>`;
        });
        selectMedicos.innerHTML += opciones;
    } catch (error) {
        console.error('Error al cargar médicos:', error);
    }
}

/* =========================
   OBTENER CITAS
========================= */

async function obtenerCitas() {
    try {
        const respuesta = await apiFetch('/api/citas');
        const citas     = await respuesta.json();

        let filas = '';

        citas.forEach(cita => {
            // Fecha formateada (quita el ISO feo)
            const fecha = cita.fecha ? cita.fecha.split('T')[0] : cita.fecha;

            if (rolActual === 'consulta') {
                // ── Vista simplificada para paciente ──
                const puedeCancelar = cita.estado === 'pendiente';

                filas += `
                    <tr>
                        <td>Dr. ${cita.medico}</td>
                        <td>${cita.especialidad}</td>
                        <td>${fecha}</td>
                        <td>${cita.hora}</td>
                        <td><strong>${cita.estado}</strong></td>
                        <td>${cita.motivo || '—'}</td>
                        <td>
                            ${puedeCancelar
                                ? `<button class="btn-eliminar" onclick="cancelarCita(${cita.id})">Cancelar</button>`
                                : `<span style="color: var(--color-text-secondary); font-size: 13px;">—</span>`
                            }
                        </td>
                    </tr>
                `;
            } else {
                // ── Vista completa para admin / recepcionista / médico ──
                filas += `
                    <tr>
                        <td>${cita.paciente}</td>
                        <td>${cita.medico}</td>
                        <td>${cita.especialidad}</td>
                        <td>${fecha}</td>
                        <td>${cita.hora}</td>
                        <td>
                            <select onchange="cambiarEstado(${cita.id}, this.value)">
                                <option ${cita.estado === 'pendiente'  ? 'selected' : ''} value="pendiente">Pendiente</option>
                                <option ${cita.estado === 'confirmada' ? 'selected' : ''} value="confirmada">Confirmada</option>
                                <option ${cita.estado === 'cancelada'  ? 'selected' : ''} value="cancelada">Cancelada</option>
                                <option ${cita.estado === 'finalizada' ? 'selected' : ''} value="finalizada">Finalizada</option>
                            </select>
                        </td>
                        <td>
                            <div class="acciones">
                                <button class="btn-editar"   onclick='editarCita(${JSON.stringify(cita)})'>Editar</button>
                                <button class="btn-eliminar" onclick="eliminarCita(${cita.id})">Eliminar</button>
                            </div>
                        </td>
                    </tr>
                `;
            }
        });

        tabla.innerHTML = filas;

    } catch (error) {
        console.error('Error al obtener citas:', error);
    }
}

/* =========================
   CREAR / EDITAR CITA
========================= */

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos  = Object.fromEntries(new FormData(formulario));
    const url    = editando ? `/api/citas/${citaEditando}` : '/api/citas';
    const metodo = editando ? 'PUT' : 'POST';

    try {
        const respuesta = await apiFetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            mostrarToast(data.mensaje || 'Cita guardada correctamente', 'exito');
            formulario.reset();
            formulario.querySelector('button').innerText = 'Agendar cita';
            editando     = false;
            citaEditando = null;
            obtenerCitas();
        } else {
            mostrarToast(data.mensaje || 'Error al guardar la cita', 'error');
        }

    } catch (error) {
        console.error('Error al guardar cita:', error);
        mostrarToast('Ocurrió un error al guardar la cita', 'error');
    }
});

/* =========================
   CAMBIAR ESTADO (admin/recepcionista/médico)
========================= */

async function cambiarEstado(id, estado) {
    try {
        const respuesta = await apiFetch(`/api/citas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado })
        });

        if (!respuesta.ok) {
            mostrarToast('No se pudo actualizar el estado', 'error');
            obtenerCitas();
        }

    } catch (error) {
        console.error('Error al cambiar estado:', error);
        mostrarToast('Ocurrió un error al cambiar el estado', 'error');
    }
}

/* =========================
   CANCELAR CITA (solo consulta, solo pendientes)
========================= */

async function cancelarCita(id) {
    if (!confirm('¿Seguro que deseas cancelar esta cita?')) return;

    try {
        const respuesta = await apiFetch(`/api/citas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'cancelada' })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            mostrarToast('Cita cancelada correctamente', 'exito');
            obtenerCitas();
        } else {
            mostrarToast(data.mensaje || 'No se pudo cancelar la cita', 'error');
        }

    } catch (error) {
        console.error('Error al cancelar cita:', error);
        mostrarToast('Ocurrió un error al cancelar la cita', 'error');
    }
}

/* =========================
   ELIMINAR (admin/recepcionista)
========================= */

async function eliminarCita(id) {
    if (!confirm('¿Eliminar cita?')) return;

    try {
        const respuesta = await apiFetch(`/api/citas/${id}`, { method: 'DELETE' });
        const data      = await respuesta.json();
        mostrarToast(data.mensaje || 'Cita eliminada', 'exito');
        obtenerCitas();
    } catch (error) {
        console.error('Error al eliminar cita:', error);
        mostrarToast('Ocurrió un error al eliminar la cita', 'error');
    }
}

/* =========================
   EDITAR CITA
========================= */

function editarCita(cita) {
    editando     = true;
    citaEditando = cita.id;

    formulario.paciente_id.value = cita.paciente_id;
    formulario.medico_id.value   = cita.medico_id;
    formulario.fecha.value       = cita.fecha?.split('T')[0];
    formulario.hora.value        = cita.hora;
    formulario.motivo.value      = cita.motivo;
    formulario.estado.value      = cita.estado;

    formulario.querySelector('button').innerText = 'Actualizar cita';
}

/* =========================
   EXPONER FUNCIONES GLOBALES
========================= */

window.editarCita    = editarCita;
window.eliminarCita  = eliminarCita;
window.cambiarEstado = cambiarEstado;
window.cancelarCita  = cancelarCita;  // ← nueva

/* =========================
   INICIAR
========================= */

cargarPacientes();
cargarMedicos();
obtenerCitas();