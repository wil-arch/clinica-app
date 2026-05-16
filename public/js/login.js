const formulario =
    document.getElementById('formLogin');

/* =========================
   LOGIN
========================= */

formulario.addEventListener('submit', async (e) => {

    e.preventDefault();

    try {

        const formData =
            new FormData(formulario);

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

                headers: {
                    'Content-Type': 'application/json'
                },

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
           RESPUESTA
        ========================= */

        if (!respuesta.ok) {

            alert(data?.mensaje || `Error HTTP: ${respuesta.status}`);
            return;
        }

        /* =========================
           LOGIN EXITOSO
        ========================= */

        alert('Login exitoso');

        localStorage.setItem(
            'token',
            data.token
        );

        localStorage.setItem(
            'usuario',
            JSON.stringify(data.usuario)
        );

        window.location.href = 'dashboard.html';

    } catch (error) {

        console.error(error);

        alert('Error de conexión con el servidor');
    }
});