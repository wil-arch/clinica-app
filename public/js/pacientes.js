let editando = false;

let pacienteEditando = null;

const formulario =
    document.getElementById('formPaciente');

const tabla =
    document.getElementById('tablaPacientes');

/* =========================
   OBTENER PACIENTES
========================= */

async function obtenerPacientes(){

    const respuesta =
        await fetch('/api/pacientes');

    const pacientes =
        await respuesta.json();

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

    <button
        class="btn-editar"
        onclick='editarPaciente(${JSON.stringify(paciente)})'
    >
        Editar
    </button>

    <button
        class="btn-eliminar"
        onclick="eliminarPaciente(${paciente.id})"
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
   CREAR PACIENTE
========================= */

formulario.addEventListener('submit', async (e) => {

    e.preventDefault();

    const formData =
        new FormData(formulario);

    const datos =
        Object.fromEntries(formData);

    let url =
        '/api/pacientes';

    let metodo =
        'POST';

    /* =========================
       EDITAR
    ========================= */

    if(editando){

        url =
            `/api/pacientes/${pacienteEditando}`;

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

    pacienteEditando = null;

    obtenerPacientes();
});

/* =========================
   ELIMINAR
========================= */

async function eliminarPaciente(id){

    const confirmar =
        confirm('¿Eliminar paciente?');

    if(!confirmar) return;

    const respuesta = await fetch(

        `/api/pacientes/${id}`,

        {
            method: 'DELETE'
        }
    );

    const data =
        await respuesta.json();

    alert(data.mensaje);

    obtenerPacientes();
}

/* =========================
   EDITAR PACIENTE
========================= */

function editarPaciente(paciente){

    editando = true;

    pacienteEditando =
        paciente.id;

    formulario.nombre.value =
        paciente.nombre;

    formulario.documento.value =
        paciente.documento;

    formulario.telefono.value =
        paciente.telefono;

    formulario.email.value =
        paciente.email;

    formulario.direccion.value =
        paciente.direccion;

    formulario.fecha_nacimiento.value =
        paciente.fecha_nacimiento
            ?.split('T')[0];
}

/* =========================
   INICIAR
========================= */

obtenerPacientes();