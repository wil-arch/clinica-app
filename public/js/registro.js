const formulario = document.getElementById('formRegistro');
const fotoInput = formulario.querySelector('input[name="foto"]');

/* =========================
   VALIDACIÓN ARCHIVO
========================= */

function validarImagen(file) {
    if (!file) return false;
    const nombre = file.name.toLowerCase();
    const extension = nombre.split('.').pop();
    const extensionValida = extension === 'jpg' || extension === 'jpeg';
    const mimeValido = file.type === 'image/jpeg';
    return extensionValida && mimeValido;
}

/* =========================
   BLOQUEO INMEDIATO AL SELECCIONAR
========================= */

fotoInput.addEventListener('change', () => {
    const archivo = fotoInput.files[0];
    if (archivo && !validarImagen(archivo)) {
        alert('Solo se permiten imágenes JPG');
        fotoInput.value = '';
    }
});

/* =========================
   REGISTRO USUARIO
========================= */

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const archivo = fotoInput.files[0];
    if (archivo && !validarImagen(archivo)) {
        alert('Solo se permiten imágenes JPG');
        fotoInput.value = '';
        return;
    }

    try {
        const formData = new FormData(formulario);

        const respuesta = await fetch('/api/usuarios/registro', {
            method: 'POST',
            body: formData
        });

        let data;
        try {
            data = await respuesta.json();
        } catch (e) {
            data = { mensaje: 'Error: respuesta inválida del servidor' };
        }

        if (!respuesta.ok) {
            alert(data.mensaje || 'Error en el registro');
            return;
        }

        alert(data.mensaje || 'Usuario registrado correctamente');
        formulario.reset();
        window.location.href = 'login.html';

    } catch (error) {
        console.error(error);
        alert('Error del servidor');
    }
});