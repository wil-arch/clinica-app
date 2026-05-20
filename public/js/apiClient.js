/* =========================
   AUTH TOKEN
========================= */
export function getAuthToken() {
    return localStorage.getItem('token');
}

/* =========================
   FETCH CON AUTH
========================= */
export async function apiFetch(url, options = {}) {
    const token = getAuthToken();
    const headers = { ...(options.headers || {}) };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, { ...options, headers });
}

/* =========================
   TOAST NOTIFICATION
========================= */
export function mostrarToast(mensaje, tipo = 'info', duracion = 3000) {
    const iconos = { exito: '✔', error: '✖', info: 'ℹ' };

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `
        <span class="toast-icono">${iconos[tipo]}</span>
        <span>${mensaje}</span>
    `;
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
   CONFIRMACIÓN PERSONALIZADA
========================= */
export function confirmarAccion(mensaje) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-box">
                <p class="confirm-mensaje">${mensaje}</p>
                <div class="confirm-acciones">
                    <button class="confirm-btn-cancelar">Cancelar</button>
                    <button class="confirm-btn-aceptar">Confirmar</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('show'));

        overlay.querySelector('.confirm-btn-aceptar').onclick = () => {
            overlay.classList.remove('show');
            overlay.addEventListener('transitionend', () => overlay.remove());
            resolve(true);
        };
        overlay.querySelector('.confirm-btn-cancelar').onclick = () => {
            overlay.classList.remove('show');
            overlay.addEventListener('transitionend', () => overlay.remove());
            resolve(false);
        };
    });
}