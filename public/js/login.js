/* =========================
   TOAST
========================= */
function mostrarToast(mensaje, tipo = 'info', duracion = 3000) {
    const iconos = {
        exito: '✔',
        error: '✖',
        info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `<span>${iconos[tipo]}</span><span>${mensaje}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
    }, duracion);
}

/* =========================
   LOGIN
========================= */
const formulario = document.getElementById('formLogin');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const formData = new FormData(formulario);
        const datos = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        /* =========================
           PETICIÓN AL BACKEND
        ========================= */
        const respuesta = await fetch(
            'http://localhost:3000/api/usuarios/login',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            }
        );

        let data = null;
        try {
            data = await respuesta.json();
        } catch (e) {
            data = null;
        }

        /* =========================
           RESPUESTA ERROR
        ========================= */
        if (!respuesta.ok) {
            mostrarToast(data?.mensaje || `Error HTTP: ${respuesta.status}`, 'error');
            return;
        }

        /* =========================
           LOGIN EXITOSO
        ========================= */
        mostrarToast('¡Login exitoso! Redirigiendo...', 'exito');
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500); // espera a que se vea el toast antes de redirigir

    } catch (error) {
        console.error(error);
        mostrarToast('Error de conexión con el servidor', 'error');
    }
});