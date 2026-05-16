const formulario =
    document.getElementById('formMedico');

const tabla =
    document.getElementById('tablaMedicos');

let editando = false;

let medicoEditando = null;

/* =========================
   OBTENER MEDICOS
========================= */

async function obtenerMedicos(){

    const respuesta =
        await fetch('/api/medicos');

    const medicos =
        await respuesta.json();

    tabla.innerHTML = '';

    medicos.forEach(medico => {

        tabla.innerHTML += `

            // DESPUÉS
        
                <tr onclick='verMedico(${JSON.stringify(medico)})' style="cursor:pointer;">

                <td>${medico.nombre}</td>

                <td>${medico.especialidad}</td>

                <td>${medico.telefono}</td>

                <td>${medico.email}</td>

                <td>${medico.consultorio}</td>

                <td>

                    <div class="acciones">

                        <button
                            class="btn-editar"
                            onclick='editarMedico(${JSON.stringify(medico)})'
                        >
                            Editar
                        </button>

                        <button
                            class="btn-eliminar"
                            onclick="eliminarMedico(${medico.id})"
                        >
                            Eliminar
                        </button>

                    </div>

                </td>

            </tr>
        `;
    });
}

/* =========================
   GUARDAR / EDITAR
========================= */

formulario.addEventListener('submit', async (e) => {

    e.preventDefault();

    const formData =
        new FormData(formulario);

    const datos =
        Object.fromEntries(formData);

    let url =
        '/api/medicos';

    let metodo =
        'POST';

    if(editando){

        url =
            `/api/medicos/${medicoEditando}`;

        metodo =
            'PUT';
    }

    const respuesta = await fetch(

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

    formulario.reset();

    editando = false;

    medicoEditando = null;

    obtenerMedicos();
});

/* =========================
   EDITAR
========================= */

function editarMedico(medico){

    editando = true;

    medicoEditando =
        medico.id;

    formulario.nombre.value =
        medico.nombre;

    formulario.especialidad.value =
        medico.especialidad;

    formulario.telefono.value =
        medico.telefono;

    formulario.email.value =
        medico.email;

    formulario.consultorio.value =
        medico.consultorio;
}

/* =========================
   ELIMINAR
========================= */

async function eliminarMedico(id){

    const confirmar =
        confirm('¿Eliminar médico?');

    if(!confirmar) return;

    const respuesta = await fetch(

        `/api/medicos/${id}`,

        {
            method: 'DELETE'
        }
    );

    const data =
        await respuesta.json();

    alert(data.mensaje);

    obtenerMedicos();
}

/* =========================
   VER DETALLE (MODAL)
========================= */
function verMedico(medico) {

    // Llenar el modal con los datos
    document.getElementById('modal-nombre').textContent      = medico.nombre;
    document.getElementById('modal-especialidad').textContent = medico.especialidad;
    document.getElementById('modal-telefono').textContent    = medico.telefono;
    document.getElementById('modal-email').textContent       = medico.email;
    document.getElementById('modal-consultorio').textContent = medico.consultorio;

    // Guardar referencia para el botón "Editar"
    document.getElementById('modal-btn-editar').onclick = () => {
        editarMedico(medico);   // reutiliza la función que ya tienes
        cerrarModalMedico();
    };

    // Mostrar el modal
    document.getElementById('modal-medico').style.display = 'flex';
}

function cerrarModalMedico() {
    document.getElementById('modal-medico').style.display = 'none';
}


/* =========================
   INICIAR
========================= */

obtenerMedicos();