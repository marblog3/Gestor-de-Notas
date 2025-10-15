// Mostrar login
function showLogin() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('register-error-msg').innerHTML = '';
}

// Mostrar registro
function showRegister() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'block';
    document.getElementById('error-msg').innerHTML = '';
}

// LOGIN - MIGRADOS A PHP
async function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('error-msg');

    if (!username || !password) {
        errorMsg.innerHTML = 'Complete todos los campos';
        return;
    }

    if (!username.endsWith("@eest5.com")) {
        errorMsg.innerHTML = "Debe usar un correo institucional (@eest5.com)";
        return;
    }

    try {
        const response = await fetch('../api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (data.success) {
            const user = data.user;
            sessionStorage.setItem("activeUser", JSON.stringify(user));
            errorMsg.innerHTML = '';
            redirectByRole(user.role);
        } else {
            errorMsg.innerHTML = data.message || 'Credenciales incorrectas';
        }

    } catch (e) {
        errorMsg.innerHTML = 'Error de conexión con el servidor.';
        console.error(e);
    }
}

// Redirección según rol
function redirectByRole(role) {
    switch (role) {
        case "Profesor":
            window.location.href = "profesor.html";
            break;
        case "Preceptor":
            window.location.href = "preceptor.html";
            break;
        case "Alumno":
            window.location.href = "alumno.html";
            break;
        case "Administrador":
            window.location.href = "admin.html";
            break;
        default:
            alert("Rol desconocido o no asignado.");
    }
}

// REGISTRO - MIGRADO A PHP
async function register() {
    const fullname = document.getElementById('register-fullname').value.trim();
    const dni = document.getElementById('register-dni').value.trim();
    const username = document.getElementById('register-username').value.trim();
    const errorMsg = document.getElementById('register-error-msg');

    if (!fullname || !dni || !username) {
        errorMsg.innerHTML = 'Complete todos los campos';
        return;
    }

    if (!username.endsWith("@eest5.com")) {
        errorMsg.innerHTML = "Debe usar un correo institucional (@eest5.com)";
        return;
    }

    try {
        const response = await fetch('../api/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname, dni, username })
        });
        const data = await response.json();

        if (data.success) {
        showCustomAlert("Tu solicitud fue enviada al administrador. Espera su aprobación.");
        } else {
            errorMsg.innerHTML = data.message || 'Error al enviar solicitud.';
        }
    } catch (e) {
        errorMsg.innerHTML = 'Error de conexión con el servidor.';
        console.error(e);
    }
}

// Tecla Enter para login/registro
document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        const loginVisible = document.getElementById('login-container').style.display !== "none";
        if (loginVisible) {
            login();
        } else {
            register();
        }
    }
});

// Evita la redirección si ya hay sesión activa
document.addEventListener("DOMContentLoaded", () => {
    const activeUser = sessionStorage.getItem("activeUser");
    if (activeUser) {
        const user = JSON.parse(activeUser);
        if (!window.location.pathname.endsWith("principal.html")) return;
        alert("Ya tienes una sesión activa.");
        redirectByRole(user.role);
    }
});

// Evitar volver atrás al presionar el botón del navegador
window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.go(1);
};


// =======================================================
// ===== LÓGICA PARA GOOGLE SIGN-IN Y MODAL PERSONALIZADO =====
// =======================================================

// --- Funciones para la Ventana Modal ---
function showCustomAlert(message) {
  document.getElementById('custom-alert-message').textContent = message;
  document.getElementById('custom-alert-overlay').style.display = 'flex';
}

function closeCustomAlert() {
  document.getElementById('custom-alert-overlay').style.display = 'none';
  showLogin(); // Muestra el formulario de login después de cerrar
}

// --- Lógica de Google Sign-In ---

// Función para decodificar el token JWT de Google
function parseJwt(token) {
    try {
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// Función que se ejecuta cuando Google devuelve una credencial
async function handleGoogleCredentialResponse(response) {
    const data = parseJwt(response.credential);
    if (!data) {
        document.getElementById('error-msg').innerHTML = "Error al procesar la respuesta de Google.";
        return;
    }

    const userEmail = data.email;
    const userName = data.name;

    // 1. Validar que sea un correo institucional
    if (!userEmail.endsWith("@eest5.com")) {
        document.getElementById('error-msg').innerHTML = "Debe usar un correo institucional (@eest5.com)";
        return;
    }

    // 2. Enviar datos a un nuevo script PHP para que verifique o registre
    try {
        const res = await fetch('../api/google_auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, fullname: userName })
        });
        const result = await res.json();

        if (result.success && result.action === 'login') {
            // Si el usuario existe, PHP nos devuelve sus datos y lo logueamos
            sessionStorage.setItem("activeUser", JSON.stringify(result.user));
            redirectByRole(result.user.role);
        } else if (result.success && result.action === 'pending') {
            // Si el usuario no existía, se agregó a pendientes
            showCustomAlert("Tu solicitud con Google fue enviada. Espera la aprobación del administrador.");
        } else {
            // Cualquier otro error
            document.getElementById('error-msg').innerHTML = result.message || 'Ocurrió un error.';
        }
    } catch (e) {
        document.getElementById('error-msg').innerHTML = 'Error de conexión con el servidor.';
        console.error(e);
    }
}
