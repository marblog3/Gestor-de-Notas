
// Verifica si hay sesión activa al cargar la página
const activeUser = sessionStorage.getItem("activeUser");
if (!activeUser) {
    // Si no hay sesión activa → redirige al login
    window.location.href = "principal.html";
}


//-- Script para evitar volver atrás con el historial -->

window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.go(1);
    window.location.href = "principal.html";
};



function logout() {
    sessionStorage.removeItem("activeUser");
    window.location.href = "principal.html";
}

function cargarSelects() {
    const profesorSelect = document.getElementById("profesorSelect");
    const alumnoSelect = document.getElementById("alumnoSelect");

    // Limpia los selectores antes de cargarlos
    profesorSelect.innerHTML = "";
    alumnoSelect.innerHTML = "";

    // Recorre todos los usuarios registrados en localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const user = JSON.parse(localStorage.getItem(key));

        // Agrega opciones al select de profesores
        if (user.role === "Profesor") {
            profesorSelect.innerHTML += `<option value="${user.email || user.username}">${user.email || user.username}</option>`;
        }

        // Agrega opciones al select de alumnos
        if (user.role === "Alumno") {
            alumnoSelect.innerHTML += `<option value="${user.email || user.username}">${user.email || user.username}</option>`;
        }
    }
}

function asignarMateria() {
    const profesor = document.getElementById("profesorSelect").value;
    const materia = document.getElementById("materiaInput").value;

    // Validación de campos
    if (!profesor || !materia) return alert("Seleccione profesor y materia");

    // Crea elemento de lista con la asignación
    const li = document.createElement("li");
    li.textContent = `${profesor} → ${materia}`;
    document.getElementById("materiasList").appendChild(li);
}


function asignarAlumno() {
    const alumno = document.getElementById("alumnoSelect").value;
    const anio = document.getElementById("anioInput").value;
    const division = document.getElementById("divisionInput").value;
    const especialidad = document.getElementById("especialidadInput").value;

    // Validación de campos
    if (!alumno || !anio || !division || !especialidad) return alert("Complete todos los campos");

    // Crea elemento de lista con la asignación
    const li = document.createElement("li");
    li.textContent = `${alumno} → Año ${anio}, División ${division}, Especialidad ${especialidad}`;
    document.getElementById("alumnosList").appendChild(li);
}


cargarSelects();
a