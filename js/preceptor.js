// Verifica si hay sesión activa al cargar la página
const activeUser = sessionStorage.getItem("activeUser");
if (!activeUser) {
    window.location.href = "principal.html";
}

window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.go(1);
    window.location.href = "principal.html";
};

function logout() {
    sessionStorage.removeItem("activeUser");
    window.location.replace("principal.html");
}

// FUNCIÓN MIGRADA: Carga Profesores y Alumnos desde la DB
async function cargarSelects() {
    const profesorSelect = document.getElementById("profesorSelect");
    const alumnoSelect = document.getElementById("alumnoSelect");

    profesorSelect.innerHTML = "<option value=''>Cargando...</option>";
    alumnoSelect.innerHTML = "<option value=''>Cargando...</option>";

    try {
        const response = await fetch('../api/get_users.php');
        const users = await response.json();

        profesorSelect.innerHTML = "<option value=''>Seleccione un Profesor</option>";
        alumnoSelect.innerHTML = "<option value=''>Seleccione un Alumno</option>";

        users.forEach(user => {
            if (user.role === "Profesor") {
                profesorSelect.innerHTML += `<option value="${user.email}">${user.fullname || user.email}</option>`;
            }
            if (user.role === "Alumno") {
                alumnoSelect.innerHTML += `<option value="${user.email}">${user.fullname || user.email}</option>`;
            }
        });
    } catch (e) {
        console.error("Error al cargar usuarios desde la DB:", e);
        profesorSelect.innerHTML = "<option value=''>Error al cargar usuarios</option>";
        alumnoSelect.innerHTML = "<option value=''>Error al cargar usuarios</option>";
    }
}

// FUNCIÓN MIGRADA: Asigna materia a profesor usando el endpoint de la DB
async function asignarMateria() {
    const profesor = document.getElementById("profesorSelect").value;
    const materia = document.getElementById("materiaInput").value;

    if (!profesor || !materia) return alert("Seleccione profesor y materia");
    
    try {
        const response = await fetch('../api/assign_course.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: profesor, data: { materia } })
        });
        const data = await response.json();

        if (data.success) {
            const li = document.createElement("li");
            li.textContent = `${profesor} → ${materia}`;
            document.getElementById("materiasList").appendChild(li);
            alert(data.message);
        } else {
            alert(data.message || "Error al asignar materia.");
        }
    } catch (e) {
        alert("Error de conexión con el servidor al asignar materia.");
    }
}

// FUNCIÓN MIGRADA: Asigna curso a alumno usando el endpoint de la DB
async function asignarAlumno() {
    const alumno = document.getElementById("alumnoSelect").value;
    const anio = document.getElementById("anioInput").value;
    const division = document.getElementById("divisionInput").value;
    const especialidad = document.getElementById("especialidadInput").value;

    if (!alumno || !anio || !division || !especialidad) return alert("Complete todos los campos");

    const curso_info = { anio, division, especialidad };

    try {
        const response = await fetch('../api/assign_course.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: alumno, data: curso_info })
        });
        const data = await response.json();

        if (data.success) {
            const li = document.createElement("li");
            li.textContent = `${alumno} → Año ${anio}, División ${division}, Especialidad ${especialidad}`;
            document.getElementById("alumnosList").appendChild(li);
            alert(data.message);
        } else {
            alert(data.message || "Error al asignar curso.");
        }
    } catch (e) {
        alert("Error de conexión con el servidor al asignar alumno.");
    }
}


// Inicialización
cargarSelects();