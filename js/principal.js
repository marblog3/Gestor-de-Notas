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

// LOGIN
function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        document.getElementById('error-msg').innerHTML = 'Complete todos los campos';
        return;
    }

    // ADMIN FIJO
    if (username === "admin@eest5.com" && password === "admin123") {
        sessionStorage.setItem("activeUser", JSON.stringify({ email: username, role: "Administrador" }));
        window.location.href = "admin.html";
        return;
    }

    // Validar correo institucional
    if (!username.endsWith("@eest5.com")) {
        document.getElementById('error-msg').innerHTML = "Debe usar un correo institucional (@eest5.com)";
        return;
    }

    const savedUser = localStorage.getItem(username);
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.password === btoa(password)) {
            sessionStorage.setItem("activeUser", JSON.stringify(user));
            redirectByRole(user.role);
        } else {
            document.getElementById('error-msg').innerHTML = 'Contraseña incorrecta';
        }
    } else {
        document.getElementById('error-msg').innerHTML = 'Usuario no encontrado';
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

// REGISTRO
function register() {
    const fullname = document.getElementById('register-fullname').value.trim();
    const dni = document.getElementById('register-dni').value.trim();
    const username = document.getElementById('register-username').value.trim();

    if (!fullname || !dni || !username) {
        document.getElementById('register-error-msg').innerHTML = 'Complete todos los campos';
        return;
    }

    if (!username.endsWith("@eest5.com")) {
        document.getElementById('register-error-msg').innerHTML = "Debe usar un correo institucional (@eest5.com)";
        return;
    }

    const pendingUsers = JSON.parse(localStorage.getItem("pendingUsers")) || [];
    pendingUsers.push({
        username,
        fullname,
        dni,
        requestedAt: new Date().toISOString()
    });
    localStorage.setItem("pendingUsers", JSON.stringify(pendingUsers));

    alert("Tu solicitud fue enviada al administrador. Espera su aprobación.");
    showLogin();
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

// Al cargar: si hay sesión activa, NO redirige automáticamente,
// solo evita entrar si se escribe manualmente "principal.html"
document.addEventListener("DOMContentLoaded", () => {
    const activeUser = sessionStorage.getItem("activeUser");
    if (activeUser) {
        const user = JSON.parse(activeUser);
        if (!window.location.pathname.endsWith("principal.html")) return;
        // Mostrar mensaje y redirigir a su página
        alert("Ya tienes una sesión activa.");
        redirectByRole(user.role);
    }
});

// Evitar volver atrás al presionar el botón del navegador (solo mantiene la página actual)
window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.go(1);
};
a