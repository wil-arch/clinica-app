import { mostrarToast } from './apiClient.js';

const formulario = document.getElementById('formRegistro');
const fotoInput  = formulario.querySelector('input[name="foto"]');

/* =========================
   VALIDACIÓN ARCHIVO
========================= */

function validarImagen(file) {
    if (!file) return false;
    const extension = file.name.toLowerCase().split('.').pop();
    return (extension === 'jpg' || extension === 'jpeg') && file.type === 'image/jpeg';
}

/* =========================
   BLOQUEO AL SELECCIONAR
========================= */

fotoInput.addEventListener('change', () => {
    const archivo = fotoInput.files[0];
    if (archivo && !validarImagen(archivo)) {
        mostrarToast('Solo se permiten imágenes JPG', 'error');
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
        mostrarToast('Solo se permiten imágenes JPG', 'error');
        fotoInput.value = '';
        return;
    }

    try {
        const respuesta = await fetch('/api/usuarios/registro', {
            method: 'POST',
            body: new FormData(formulario)
        });

        let data;
        try {
            data = await respuesta.json();
        } catch (e) {
            data = { mensaje: 'Error: respuesta inválida del servidor' };
        }

        if (!respuesta.ok) {
            mostrarToast(data.mensaje || 'Error en el registro', 'error');
            return;
        }

        mostrarToast(data.mensaje || 'Usuario registrado correctamente', 'exito');
        formulario.reset();

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        console.error(error);
        mostrarToast('Error del servidor', 'error');
    }
});