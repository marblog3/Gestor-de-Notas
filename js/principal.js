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
            alert("Tu solicitud fue enviada al administrador. Espera su aprobación.");
            showLogin();
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