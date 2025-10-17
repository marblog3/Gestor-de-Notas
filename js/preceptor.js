// Verifica si hay sesión activa al cargar la página
const activeUserJSON = sessionStorage.getItem("activeUser");
if (!activeUserJSON) {
    window.location.href = "principal.html";
}
const activeUser = JSON.parse(activeUserJSON);


window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.go(1);
    window.location.href = "principal.html";
};

function logout() {
    sessionStorage.removeItem("activeUser");
    // Limpiar variables de revisión al cerrar sesión
    sessionStorage.removeItem("reviewingUserEmail");
    sessionStorage.removeItem("reviewerRole");
    window.location.replace("principal.html");
}

/* ------------------------------------------
   FUNCIONES DE ASIGNACIÓN (Carga de Selects)
   ------------------------------------------ */

// Carga selectores de Profesor y Alumno (sin filtrar por curso aún)
async function cargarSelects() {
    const profesorSelect = document.getElementById("profesorSelect");
    const alumnoSelect = document.getElementById("alumnoSelect");

    // Lógica para cargar todos los profesores y alumnos en los selects de asignación (para que el Admin pueda asignarlos).
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
        
        profesorSelect.addEventListener('change', (e) => {
            cargarAsignacionesProfesor(e.target.value);
        });

    } catch (e) {
        console.error("Error al cargar usuarios desde la DB:", e);
        profesorSelect.innerHTML = "<option value=''>Error al cargar usuarios</option>";
        alumnoSelect.innerHTML = "<option value=''>Error al cargar usuarios</option>";
    }
}

// Carga las materias desde el nuevo endpoint para el SELECT de asignación de materias
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

// Carga las asignaciones de un profesor específico
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

// Asigna materia, año y división a un profesor
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
            cargarAsignacionesProfesor(profesor); 
        } else {
            alert(data.message || "Error al asignar materia.");
        }
    } catch (e) {
        alert("Error de conexión con el servidor al asignar materia.");
        console.error(e);
    }
}

// Asigna curso a alumno usando el endpoint de la DB
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

/* ------------------------------------------
   LÓGICA DE CONTROL DE CURSO (PRECEPTOR) - NUEVA
   ------------------------------------------ */

// Función principal para cargar y mostrar la tabla de alumnos y profesores filtrados
async function cargarAlumnosFiltrados() {
    const anio = document.getElementById("filtroAnio").value;
    const division = document.getElementById("filtroDivision").value;
    const tbodyAlumnos = document.querySelector("#alumnosPreceptorTable tbody");
    const tbodyProfesores = document.querySelector("#profesoresCursoTable tbody");
    
    tbodyAlumnos.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
    tbodyProfesores.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';

    if (!anio || !division) {
        tbodyAlumnos.innerHTML = '<tr><td colspan="5">Por favor, seleccione un Año y una División.</td></tr>';
        tbodyProfesores.innerHTML = '<tr><td colspan="3">Por favor, seleccione un curso.</td></tr>';
        return;
    }
    
    try {
        // --- 1. Cargar Alumnos del Curso (Requiere la API get_users_by_course.php) ---
        const alumnosResponse = await fetch(`../api/get_users_by_course.php?anio=${anio}&division=${division}&role=Alumno`);
        const alumnos = await alumnosResponse.json();

        // --- 2. Cargar Profesores del Curso (Requiere la API get_profesores_by_course.php) ---
        const profesoresResponse = await fetch(`../api/get_profesores_by_course.php?anio=${anio}&division=${division}`);
        const profesores = await profesoresResponse.json();
        
        // MOSTRAR ALUMNOS
        if (alumnos.length > 0) {
            tbodyAlumnos.innerHTML = '';
            alumnos.forEach(alumno => {
                const cursoInfo = JSON.parse(alumno.curso_info).curso;
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${alumno.fullname}</td>
                    <td>${alumno.dni}</td>
                    <td>${cursoInfo.anio} ${cursoInfo.division}</td>
                    <td>${cursoInfo.especialidad}</td>
                    <td>
                        <button onclick="revisarBoletinPreceptor('${alumno.email}')">Ver Boletín</button>
                    </td>
                `;
                tbodyAlumnos.appendChild(row);
            });
        } else {
            tbodyAlumnos.innerHTML = '<tr><td colspan="5">No se encontraron alumnos en este curso.</td></tr>';
        }
        
        // MOSTRAR PROFESORES
        if (profesores.length > 0) {
            tbodyProfesores.innerHTML = '';
            // Función para agrupar materias por profesor
            const profesoresMap = new Map();
            profesores.forEach(p => {
                if (!profesoresMap.has(p.email)) {
                    profesoresMap.set(p.email, { fullname: p.fullname, email: p.email, materias: [] });
                }
                profesoresMap.get(p.email).materias.push(p.materia);
            });

            profesoresMap.forEach(profesor => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${profesor.fullname}</td>
                    <td>${profesor.email}</td>
                    <td>${profesor.materias.join(', ')}</td>
                `;
                tbodyProfesores.appendChild(row);
            });

        } else {
            tbodyProfesores.innerHTML = '<tr><td colspan="3">No hay profesores asignados directamente a este curso.</td></tr>';
        }

    } catch (e) {
        console.error("Error general al cargar curso:", e);
        tbodyAlumnos.innerHTML = '<tr><td colspan="5">Error de conexión con el servidor.</td></tr>';
        tbodyProfesores.innerHTML = '<tr><td colspan="3">Error de conexión con el servidor.</td></tr>';
    }
}


// Redirecciona al boletín en modo gestión para el Preceptor
function revisarBoletinPreceptor(alumnoEmail) {
    // 1. Guardar el email del alumno que el Preceptor quiere ver (CRÍTICO)
    sessionStorage.setItem("reviewingUserEmail", alumnoEmail);
    
    // 2. Guardar el rol del revisor (Preceptor)
    sessionStorage.setItem("reviewerRole", activeUser.role); 

    // 3. Redirigir a la vista de boletín (alumno.html)
    // El Preceptor puede modificar las notas
    window.location.href = `../html/alumno.html?mode=edit&alumno=${alumnoEmail}`; 
}



// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarSelects(); 
    cargarMateriasParaSelect(); 
    
    // Listener para los filtros del curso - se disparan al cambiar
    document.getElementById("filtroAnio").addEventListener('change', cargarAlumnosFiltrados);
    document.getElementById("filtroDivision").addEventListener('change', cargarAlumnosFiltrados);
    
    // AÑADIDO: Llama al filtro una vez para cargar los alumnos iniciales (ej. 7mo 4ta)
    cargarAlumnosFiltrados(); 
});