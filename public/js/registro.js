const formulario =
    document.getElementById('formRegistro');

const fotoInput =
    formulario.querySelector('input[name="foto"]');

/* =========================
   REGISTRO USUARIO
========================= */

formulario.addEventListener('submit', async (e) => {

    e.preventDefault();

    const archivo = fotoInput.files[0];

    if (archivo) {

        const nombre = archivo.name.toLowerCase();

        if (
            !nombre.endsWith('.jpg') &&
            !nombre.endsWith('.jpeg') &&
            !nombre.endsWith('.png')
        ) {
            alert('Solo se permiten imágenes JPG y PNG');
            return;
        }
    }

    try {

        const formData =
            new FormData(formulario);

        const respuesta = await fetch(

            '/api/usuarios/registro',

            {
                method: 'POST',
                body: formData
            }
        );

        let data = null;

        try {
            data = await respuesta.json();
        } catch (e) {
            data = { mensaje: 'Respuesta no JSON del servidor' };
        }

        alert(data?.mensaje || `Error HTTP: ${respuesta.status}`);

        /* =========================
           REDIRIGIR AL LOGIN
        ========================= */

        if (respuesta.ok) {

            formulario.reset();

            window.location.href = 'login.html';
        }

    } catch (error) {

        console.error(error);
        alert('Error del servidor');
    }
});