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
    // Limpiar variables de revisión si existen al cerrar sesión
    sessionStorage.removeItem("reviewingUserEmail");
    sessionStorage.removeItem("reviewerRole");
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
        
        // Listener para cargar las asignaciones del profesor seleccionado
        profesorSelect.addEventListener('change', (e) => {
            cargarAsignacionesProfesor(e.target.value);
        });

    } catch (e) {
        console.error("Error al cargar usuarios desde la DB:", e);
        profesorSelect.innerHTML = "<option value=''>Error al cargar usuarios</option>";
        alumnoSelect.innerHTML = "<option value=''>Error al cargar usuarios</option>";
    }
}

// FUNCIÓN DE PRECEPTORÍA: Carga las materias desde el nuevo endpoint para el SELECT
async function cargarMateriasParaSelect() {
    const materiaSelect = document.getElementById("materiaInputPreceptor");
    if (!materiaSelect) return;
    materiaSelect.innerHTML = "<option value=''>Cargando materias...</option>";
    
    try {
        const response = await fetch('../api/get_materias.php');
        const materias = await response.json();

        materiaSelect.innerHTML = "<option value=''>Seleccionar materia</option>";

        materias.forEach(materia => {
            const display = materia.especialidad ? `${materia.nombre} (${materia.especialidad})` : materia.nombre;
            materiaSelect.innerHTML += `<option value="${materia.nombre}">${display}</option>`;
        });
    } catch (e) {
        console.error("Error al cargar materias para el select:", e);
        materiaSelect.innerHTML = "<option value=''>Error al cargar materias</option>";
    }
}

// FUNCIÓN DE PRECEPTORÍA: Carga las asignaciones de un profesor específico
async function cargarAsignacionesProfesor(profesorEmail) {
    const listaMateriasAsignadas = document.getElementById("materiasList");
    listaMateriasAsignadas.innerHTML = '<li>Cargando asignaciones...</li>';

    if (!profesorEmail) {
        listaMateriasAsignadas.innerHTML = '<li>Seleccione un profesor.</li>';
        return;
    }

    try {
        const response = await fetch(`../api/get_user_by_email.php?email=${profesorEmail}`);
        const data = await response.json();

        listaMateriasAsignadas.innerHTML = '';
        
        if (data.success && data.user.curso_info) {
            const asignaciones = JSON.parse(data.user.curso_info);

            if (Array.isArray(asignaciones) && asignaciones.length > 0) {
                asignaciones.forEach(asig => {
                    const li = document.createElement("li");
                    li.textContent = `${asig.materia} (${asig.anio} ${asig.division})`;
                    listaMateriasAsignadas.appendChild(li);
                });
            } else {
                listaMateriasAsignadas.innerHTML = '<li>No hay materias asignadas aún.</li>';
            }
        } else {
            listaMateriasAsignadas.innerHTML = '<li>No hay materias asignadas aún.</li>';
        }

    } catch (e) {
        console.error("Error al cargar asignaciones del profesor:", e);
        listaMateriasAsignadas.innerHTML = '<li>Error al cargar la lista.</li>';
    }
}


// FUNCIÓN ACTUALIZADA: Asigna materia, año y división a un profesor
async function asignarMateria() {
    const profesor = document.getElementById("profesorSelect").value;
    const materia = document.getElementById("materiaInputPreceptor").value;
    const anio = document.getElementById("anioInputProf").value;
    const division = document.getElementById("divisionInputProf").value;

    if (!profesor || !materia || materia === 'Seleccionar materia' || !anio || !division) {
        return alert("Complete todos los campos para asignar la materia.");
    }

    const asignacion_info = { materia, anio, division };

    try {
        const response = await fetch('../api/assign_subject.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: profesor, data: asignacion_info })
        });
        const data = await response.json();

        if (data.success) {
            alert(data.message);
            cargarAsignacionesProfesor(profesor); // Recarga la lista de asignaciones
        } else {
            alert(data.message || "Error al asignar materia.");
        }
    } catch (e) {
        alert("Error de conexión con el servidor al asignar materia.");
        console.error(e);
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
            body: JSON.stringify({ email: alumno, data: curso_info }) // Usa la clave 'data'
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


// --- NUEVAS FUNCIONES DE REVISIÓN DE BOLETINES ---

// 1. Carga el select de alumnos que tienen notas cargadas
async function cargarAlumnosConNotas() {
    const select = document.getElementById("boletinAlumnoSelect");
    
    try {
        // Nuevo endpoint para obtener solo alumnos con notas
        const response = await fetch('../api/get_alumnos_con_notas.php');
        const data = await response.json();

        if (data.success && data.alumnos.length > 0) {
            select.innerHTML = '<option value="">Seleccione un alumno</option>';
            data.alumnos.forEach(alumno => {
                // El valor es el email (identificador único)
                select.innerHTML += `<option value="${alumno.alumno_email}">${alumno.fullname || alumno.alumno_email}</option>`;
            });
        } else {
            select.innerHTML = '<option value="">Ningún alumno tiene notas cargadas.</option>';
        }

    } catch (e) {
        console.error("Error al cargar alumnos con notas:", e);
        select.innerHTML = '<option value="">Error al cargar la lista.</option>';
    }
}

// 2. Redirige a la vista del boletín del alumno seleccionado
function revisarBoletin() {
    const select = document.getElementById("boletinAlumnoSelect");
    const alumnoEmail = select.value;
    const statusMsg = document.getElementById("boletinStatus");
    const activeUserObj = JSON.parse(activeUser); // Obtener el objeto del preceptor logueado

    if (!alumnoEmail) {
        statusMsg.textContent = "Por favor, seleccione un alumno.";
        statusMsg.style.color = "red";
        return;
    }

    // 1. Guardar el email del alumno que el preceptor quiere ver (CRÍTICO)
    sessionStorage.setItem("reviewingUserEmail", alumnoEmail);
    
    // 2. Guardar el rol del revisor (Preceptor)
    if (activeUserObj) {
        sessionStorage.setItem("reviewerRole", activeUserObj.role);
    }

    // 3. Redirigir a la vista de boletín (alumno.html)
    // El alumno.js deberá leer reviewingUserEmail en lugar de activeUser.email
    window.location.href = "alumno.html";
}


// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarSelects(); 
    cargarMateriasParaSelect(); 
    cargarAlumnosConNotas(); // Carga la lista de alumnos para revisión
});
