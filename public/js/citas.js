import { apiFetch } from './apiClient.js';

let editando = false;

let citaEditando = null;

const formulario =
    document.getElementById('formCita');

const tabla =
    document.getElementById('tablaCitas');

const selectPacientes =
    document.getElementById('selectPacientes');

const selectMedicos =
    document.getElementById('selectMedicos');

/* =========================
   CARGAR PACIENTES
========================= */

async function cargarPacientes(){

    try {

        const respuesta =
            await apiFetch('/api/pacientes');

        const pacientes =
            await respuesta.json();

        let opciones = '';

        pacientes.forEach(paciente => {

            opciones += `
                <option value="${paciente.id}">
                    ${paciente.nombre}
                </option>
            `;
        });

        selectPacientes.innerHTML += opciones;

    } catch (error) {

        console.error('Error al cargar pacientes:', error);
    }
}

/* =========================
   CARGAR MEDICOS
========================= */

async function cargarMedicos(){

    try {

        const respuesta =
            await apiFetch('/api/medicos');

        const medicos =
            await respuesta.json();

        let opciones = '';

        medicos.forEach(medico => {

            opciones += `
                <option value="${medico.id}">
                    ${medico.nombre}
                    - ${medico.especialidad}
                </option>
            `;
        });

        selectMedicos.innerHTML += opciones;

    } catch (error) {

        console.error('Error al cargar médicos:', error);
    }
}

/* =========================
   OBTENER CITAS
========================= */

async function obtenerCitas(){

    try {

        const respuesta =
            await apiFetch('/api/citas');

        const citas =
            await respuesta.json();

        let filas = '';

        citas.forEach(cita => {

            filas += `
                <tr>
                    <td>${cita.paciente}</td>
                    <td>${cita.medico}</td>
                    <td>${cita.especialidad}</td>
                    <td>${cita.fecha}</td>
                    <td>${cita.hora}</td>
                    <td>
                        <select
                            onchange="cambiarEstado(
                                ${cita.id},
                                this.value
                            )"
                        >
                            <option
                                ${cita.estado === 'pendiente'
                                    ? 'selected'
                                    : ''}
                                value="pendiente"
                            >
                                Pendiente
                            </option>
                            <option
                                ${cita.estado === 'confirmada'
                                    ? 'selected'
                                    : ''}
                                value="confirmada"
                            >
                                Confirmada
                            </option>
                            <option
                                ${cita.estado === 'cancelada'
                                    ? 'selected'
                                    : ''}
                                value="cancelada"
                            >
                                Cancelada
                            </option>
                            <option
                                ${cita.estado === 'finalizada'
                                    ? 'selected'
                                    : ''}
                                value="finalizada"
                            >
                                Finalizada
                            </option>
                        </select>
                    </td>
                    <td>
                        <div class="acciones">
                            <button
                                class="btn-editar"
                                onclick='editarCita(${JSON.stringify(cita)})'
                            >
                                Editar
                            </button>
                            <button
                                class="btn-eliminar"
                                onclick="eliminarCita(${cita.id})"
                            >
                                Eliminar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
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

    const formData =
        new FormData(formulario);

    const datos =
        Object.fromEntries(formData);

    let url =
        '/api/citas';

    let metodo =
        'POST';

    if(editando){

        url =
            `/api/citas/${citaEditando}`;

        metodo =
            'PUT';
    }

    try {

        const respuesta = await apiFetch(

            url,

            {
                method: metodo,

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(datos)
            }
        );

        const data =
            await respuesta.json();

        alert(data.mensaje);

        if(respuesta.ok){

            formulario.reset();

            /* =========================
               TEXTO BOTON NORMAL
            ========================= */

            formulario.querySelector('button')
                .innerText = 'Agendar cita';

            editando = false;

            citaEditando = null;

            obtenerCitas();
        }

    } catch (error) {

        console.error('Error al guardar cita:', error);

        alert('Ocurrió un error al guardar la cita.');
    }
});

/* =========================
   CAMBIAR ESTADO
========================= */

async function cambiarEstado(id, estado){

    try {

        const respuesta = await apiFetch(

            `/api/citas/${id}`,

            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({ estado })
            }
        );

        const data =
            await respuesta.json();

        if(!respuesta.ok){

            console.error('Error al cambiar estado:', data.mensaje);

            alert('No se pudo actualizar el estado.');

            obtenerCitas();
        }

    } catch (error) {

        console.error('Error al cambiar estado:', error);

        alert('Ocurrió un error al cambiar el estado.');
    }
}

/* =========================
   ELIMINAR
========================= */

async function eliminarCita(id){

    const confirmar =
        confirm('¿Eliminar cita?');

    if(!confirmar) return;

    try {

        const respuesta = await apiFetch(

            `/api/citas/${id}`,

            {
                method: 'DELETE'
            }
        );

        const data =
            await respuesta.json();

        alert(data.mensaje);

        obtenerCitas();

    } catch (error) {

        console.error('Error al eliminar cita:', error);

        alert('Ocurrió un error al eliminar la cita.');
    }
}

/* =========================
   EDITAR CITA
========================= */

function editarCita(cita){

    editando = true;

    citaEditando =
        cita.id;

    formulario.paciente_id.value =
        cita.paciente_id;

    formulario.medico_id.value =
        cita.medico_id;

    formulario.fecha.value =
        cita.fecha?.split('T')[0];

    formulario.hora.value =
        cita.hora;

    formulario.motivo.value =
        cita.motivo;

    formulario.estado.value =
        cita.estado;

    formulario.querySelector('button')
        .innerText = 'Actualizar cita';
}

/* =========================
   EXPONER FUNCIONES GLOBALES
   (requerido por type="module")
========================= */

window.editarCita    = editarCita;
window.eliminarCita  = eliminarCita;
window.cambiarEstado = cambiarEstado;

/* =========================
   INICIAR
========================= */

cargarPacientes();

cargarMedicos();

obtenerCitas();