// =======================================================
// Inicialización de eventos al cargar el DOM
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
  const guardarBtn = document.getElementById("guardarBtn");
  const modificarBtn = document.getElementById("modificarBtn");
  const descargarBtn = document.getElementById("descargarBtn");
  const boletin = document.getElementById("boletin");

  // Evento para guardar cambios → activa vista previa
  guardarBtn.addEventListener("click", () => {
    boletin.classList.add("vista-previa");          // Aplica estilo de vista previa
    guardarBtn.style.display = "none";              // Oculta botón de guardar
    modificarBtn.style.display = "inline-block";    // Muestra botón de modificar
    descargarBtn.style.display = "inline-block";    // Muestra botón de descarga
  });

  // Evento para modificar → desactiva vista previa
  modificarBtn.addEventListener("click", () => {
    boletin.classList.remove("vista-previa");       // Quita estilo de vista previa
    guardarBtn.style.display = "inline-block";      // Muestra botón de guardar
    modificarBtn.style.display = "none";            // Oculta botón de modificar
    descargarBtn.style.display = "none";            // Oculta botón de descarga
  });
});

// =======================================================
// Función de inicio de sesión
// =======================================================
function login() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  // Caso especial → acceso fijo para administrador
  if (email === "admin@eest5.com" && password === "admin123") {
    sessionStorage.setItem("activeUser", JSON.stringify({ email, role: "Administrador" }));
    window.location.href = "admin.html"; // Redirige directo al panel admin
    return;
  }

  // Validación de dominio institucional
  if (!email.endsWith("@eest5.com")) {
    document.getElementById('error-msg').innerHTML = "Solo se permiten correos institucionales (@eest5.com)";
    return;
  }

  // Búsqueda del usuario en localStorage
  const savedUser = localStorage.getItem(email);
  if (savedUser) {
    const user = JSON.parse(savedUser);

    // Validación de contraseña en base64
    if (user.password === btoa(password)) {
      sessionStorage.setItem("activeUser", JSON.stringify(user));

      // Redirección según rol del usuario
      if (user.role === "Profesor") window.location.href = "profesor.html";
      else if (user.role === "Preceptor") window.location.href = "preceptor.html";
      else if (user.role === "Alumno") window.location.href = "alumno.html";
      else window.location.href = "principal.html"; // Fallback
    } else {
      document.getElementById('error-msg').innerHTML = "Contraseña incorrecta";
    }
  } else {
    document.getElementById('error-msg').innerHTML = "Usuario no encontrado";
  }
}

// =======================================================
// Función de cierre de sesión
// =======================================================
function logout() {
  sessionStorage.removeItem("activeUser"); // Elimina datos de sesión
  window.location.replace("principal.html");   // Redirige y reemplaza historial
}

// =======================================================
// Control de navegación atrás
// Bloquea el uso del botón atrás si no hay sesión activa
// =======================================================
window.addEventListener("popstate", function () {
  if (!sessionStorage.getItem("activeUser")) {
    window.location.replace("principal.html");
  }
});

// =======================================================
// Función de registro de nuevos usuarios
// =======================================================
function register() {
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;

  // Validación de dominio institucional
  if (!email.endsWith("@eest5.com")) {
    document.getElementById('register-error-msg').innerHTML = "Solo se permiten correos institucionales (@eest5.com)";
    return;
  }

  // Verificación de contraseñas iguales
  if (password !== confirmPassword) {
    document.getElementById('register-error-msg').innerHTML = "Las contraseñas no coinciden";
    return;
  }

  // Determinación automática del rol según el correo
  let role = "Alumno";
  if (email.includes("admin")) role = "Administrador";
  else if (email.includes("preceptor")) role = "Preceptor";
  else if (email.includes("prof")) role = "Profesor";

  // Almacenamiento seguro en localStorage (password en base64)
  const user = { email, password: btoa(password), role };
  localStorage.setItem(email, JSON.stringify(user));

  // Cambia la vista a login tras registrar
  showLogin();
}
a