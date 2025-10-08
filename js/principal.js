
// Muestra el formulario de inicio de sesión y oculta el de registro
function showLogin() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('register-error-msg').innerHTML = '';
}

// Muestra el formulario de registro y oculta el de inicio de sesión
function showRegister() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'block';
    document.getElementById('error-msg').innerHTML = '';
}

// Lógica de inicio de sesión
function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        document.getElementById('error-msg').innerHTML = 'Complete todos los campos';
        return;
    }

    if (username === "admin@eest5.com" && password === "admin123") {
        sessionStorage.setItem("activeUser", JSON.stringify({ email: username, role: "Administrador" }));
        window.location.href = "admin.html";
        return;
    }

    if (!username.endsWith("@eest5.com")) {
        document.getElementById('error-msg').innerHTML = "Debe usar un correo institucional (@eest5.com)";
        return;
    }

    const savedUser = localStorage.getItem(username);
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.password === btoa(password)) {
            sessionStorage.setItem("activeUser", JSON.stringify(user));
            if (user.role === "Profesor") {
                window.location.href = "profesor.html";
            } else if (user.role === "Preceptor") {
                window.location.href = "preceptor.html";
            } else if (user.role === "Alumno") {
                window.location.href = "alumno.html";
            } else if (user.role === "Administrador") {
                window.location.href = "admin.html";
            }
        } else {
            document.getElementById('error-msg').innerHTML = 'Contraseña incorrecta';
        }
    } else {
        document.getElementById('error-msg').innerHTML = 'Usuario no encontrado';
    }
}

// Lógica de registro de usuario (ACTUALIZADA)
function register() {
    const fullname = document.getElementById('register-fullname').value.trim();
    const dni = document.getElementById('register-dni').value.trim();
    const username = document.getElementById('register-username').value.trim();
    const role = document.getElementById('register-role').value;

    if (!fullname || !dni || !username || !role) {
        document.getElementById('register-error-msg').innerHTML = 'Complete todos los campos';
        return;
    }

    if (!username.endsWith("@eest5.com")) {
        document.getElementById('register-error-msg').innerHTML = "Debe usar un correo institucional (@eest5.com)";
        return;
    }

    const pendingUsers = JSON.parse(localStorage.getItem("pendingUsers")) || [];
    // Se almacena la solicitud con los nuevos datos
    pendingUsers.push({
        username,
        fullname,
        dni,
        role,
        requestedAt: new Date().toISOString()
    });
    localStorage.setItem("pendingUsers", JSON.stringify(pendingUsers));

    alert("Tu solicitud de registro fue enviada al administrador. Espera su aprobación.");
    showLogin();
}

// Permite enviar formularios con la tecla Enter
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

window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.go(1);
    window.location.href = "principal.html";
};
