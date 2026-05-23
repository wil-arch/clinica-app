import { mostrarToast } from './apiClient.js';

const formulario = document.getElementById('formRegistro');
const fotoInput  = formulario.querySelector('input[name="foto"]');

/* =========================
   LÓGICA DE ROLES
========================= */

const rolSelect      = document.getElementById('rol');
const medicoFields   = document.querySelectorAll('.medico-only');
const consultaFields = document.querySelectorAll('.consulta-only');

function ajustarCampos() {
    const rol = rolSelect.value;

    medicoFields.forEach(el => {
        const mostrar = rol === 'medico';
        el.style.display = mostrar ? 'block' : 'none';
        el.querySelectorAll('input, select').forEach(f => f.disabled = !mostrar);
    });

    consultaFields.forEach(el => {
        const mostrar = rol === 'consulta';
        el.style.display = mostrar ? 'block' : 'none';
        el.querySelectorAll('input, select').forEach(f => f.disabled = !mostrar);
    });
}

rolSelect.addEventListener('change', ajustarCampos);
ajustarCampos();

/* =========================
   FALLBACK IMÁGENES
========================= */

document.addEventListener('error', function (e) {
    const target = e.target;
    if (target.tagName === 'IMG') {
        console.log('Error cargando imagen:', target.src);
        target.src = '/img/default.png';
        target.onerror = null;
    }
}, true);

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
        ajustarCampos();

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        console.error(error);
        mostrarToast('Error del servidor', 'error');
    }
});