// Gestor-de-Notas/js/preceptor.js (Archivo completo REEMPLAZADO)

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

// --- Cache global de materias (copiado de admin.js) ---
let allMateriasCache = [];

/* ------------------------------------------
   FUNCIONES DE ASIGNACIÓN (Copiadas de admin.js)
   ------------------------------------------ */

// Carga selectores de Profesor y Alumno (sin filtrar por curso aún)
async function cargarSelects() {
    const profesorSelect = document.getElementById("profesorSelect");
    const alumnoSelect = document.getElementById("alumnoSelect");
    // (Omitimos el preceptorSelectAdmin que no está en esta vista)

    if (profesorSelect) profesorSelect.innerHTML = "<option value=''>Cargando...</option>";
    if (alumnoSelect) alumnoSelect.innerHTML = "<option value=''>Cargando...</option>";

    try {
        const response = await fetch('../api/get_users.php');
        const users = await response.json();

        if (profesorSelect) profesorSelect.innerHTML = "<option value=''>Seleccione un Profesor</option>";
        if (alumnoSelect) alumnoSelect.innerHTML = "<option value=''>Seleccione un Alumno</option>";

        // Filtrar y ordenar
        const profesores = users.filter(u => u.role === 'Profesor').sort((a, b) => (a.fullname || '').localeCompare(b.fullname || ''));
        const alumnos = users.filter(u => u.role === 'Alumno').sort((a, b) => (a.fullname || '').localeCompare(b.fullname || ''));

        if (profesorSelect) {
            profesores.forEach(user => {
                profesorSelect.innerHTML += `<option value="${user.email}">${user.fullname || user.email}</option>`;
            });
            // Listener para cargar asignaciones existentes del profesor
            profesorSelect.addEventListener('change', (e) => {
                cargarAsignacionesProfesor(e.target.value);
            });
        }
        if (alumnoSelect) {
             alumnos.forEach(user => {
                alumnoSelect.innerHTML += `<option value="${user.email}">${user.fullname || user.email}</option>`;
            });
        }

    } catch (e) {
        console.error("Error al cargar usuarios desde la DB:", e);
        if (profesorSelect) profesorSelect.innerHTML = "<option value=''>Error al cargar usuarios</option>";
        if (alumnoSelect) alumnoSelect.innerHTML = "<option value=''>Error al cargar usuarios</option>";
    }
}

// Carga las asignaciones de un profesor específico (Función original de preceptor.js)
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
                    // Mostramos el turno también
                    li.textContent = `${asig.materia} (${asig.anio} ${asig.division} - Turno: ${asig.turno || 'N/A'})`;
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

// --- LÓGICA DINÁMICA DE FORMULARIOS (Copiada de admin.js) ---

// Obtiene la especialidad de la tabla 'cursos'
async function getEspecialidadFromCurso(anio, division) {
    if (!anio || !division) return null;
    try {
        const response = await fetch(`../api/get_especialidad.php?anio=${anio}&division=${division}`);
        const data = await response.json();
        return data.success ? data.especialidad : null;
    } catch (e) {
        console.error("Fallo al obtener especialidad:", e);
        return null;
    }
}

// Carga materias en el select de "Asignar Profesor" basado en el curso
async function loadMateriasForCourse(materiasCache) {
    const anioSelected = document.getElementById("anioSelectProfesor").value;
    const divisionSelected = document.getElementById("divisionSelectProfesor").value;
    const especialidadSelected = document.getElementById("especialidadSelectProfesor").value;
    const materiaSelectAdmin = document.getElementById("materiaSelectAdmin"); // ID de admin.html

    if (!materiaSelectAdmin) return;

    materiaSelectAdmin.innerHTML = '<option value="">Cargando materias...</option>';

    if (!anioSelected || !divisionSelected || !especialidadSelected) {
        materiaSelectAdmin.innerHTML = `<option value="">Seleccione Año, División y Especialidad</option>`;
        return;
    }

    const especialidadFiltro = especialidadSelected;
    const isCicloBasico = especialidadFiltro === 'Ciclo Básico';

    let filteredMateriasForSelect = materiasCache;

    if (isCicloBasico) {
        filteredMateriasForSelect = materiasCache.filter(m =>
            m.especialidad === 'Ciclo Básico' || m.especialidad === 'Tronco Común' || !m.especialidad
        );
    } else {
        filteredMateriasForSelect = materiasCache.filter(m =>
            m.especialidad === especialidadFiltro || m.especialidad === 'Tronco Común' || !m.especialidad
        );
    }

    materiaSelectAdmin.innerHTML = '<option value="">Seleccione una materia</option>';
    if (filteredMateriasForSelect.length === 0) {
        const msg = `No hay materias definidas para ${especialidadFiltro} o Tronco Común.`;
        materiaSelectAdmin.innerHTML = `<option value="">${msg}</option>`;
    } else {
        filteredMateriasForSelect.sort((a, b) => a.nombre.localeCompare(b.nombre));
        filteredMateriasForSelect.forEach(materia => {
            const option = `<option value="${materia.nombre}">${materia.nombre}</option>`;
            materiaSelectAdmin.innerHTML += option;
        });
    }
}

// Carga el caché de materias
async function cargarMaterias() {
    const materiaSelectAdmin = document.getElementById("materiaSelectAdmin");

    if (allMateriasCache.length === 0) {
        if (materiaSelectAdmin) materiaSelectAdmin.innerHTML = '<option value="">Cargando materias...</option>';
        try {
            const response = await fetch('../api/get_materias.php');
            allMateriasCache = await response.json();
        } catch (e) {
            if (materiaSelectAdmin) materiaSelectAdmin.innerHTML = '<option value="">Error al cargar</option>';
            return;
        }
    }
    // Llenar select de asignación
    if (materiaSelectAdmin) {
        loadMateriasForCourse(allMateriasCache);
    }
}

// Configura los listeners para el filtro dinámico de materias
function setupMateriaFiltering() {
    const anioSelect = document.getElementById("anioSelectProfesor");
    const divisionSelect = document.getElementById("divisionSelectProfesor");
    const especialidadSelect = document.getElementById("especialidadSelectProfesor");

    if (!anioSelect || !divisionSelect || !especialidadSelect) return;

    const applyFilter = async () => {
        const anio = anioSelect.value;
        const division = divisionSelect.value;

        if (!anio || !division) {
            especialidadSelect.value = ''; 
            loadMateriasForCourse(allMateriasCache);
            return;
        }

        const especialidad = await getEspecialidadFromCurso(anio, division);
        if (especialidad && especialidadSelect.querySelector(`option[value="${especialidad}"]`)) {
            especialidadSelect.value = especialidad;
        } else {
            especialidadSelect.value = ''; 
        }
        loadMateriasForCourse(allMateriasCache);
    };

    anioSelect.addEventListener('change', applyFilter);
    divisionSelect.addEventListener('change', applyFilter);
    especialidadSelect.addEventListener('change', () => loadMateriasForCourse(allMateriasCache));

    loadMateriasForCourse(allMateriasCache);
}

// Configura la asignación automática de especialidad y turno en "Asignar Alumno"
function setupEspecialidadAuto() {
    const anioSelect = document.getElementById('anioInput');
    const divisionSelect = document.getElementById('divisionInput');
    const especialidadSelect = document.getElementById('especialidadInput');
    const turnoSelect = document.getElementById('turnoInputAlumno');

    if (!anioSelect || !divisionSelect || !especialidadSelect || !turnoSelect) return;

    const updateEspecialidadYTurno = async () => {
        const anio = anioSelect.value;
        const division = divisionSelect.value;

        if (!anio || !division) {
            especialidadSelect.value = '';
            turnoSelect.value = '';
            return;
        }

        try {
            const response = await fetch(`../api/get_course_info.php?anio=${anio}&division=${division}`);
            const data = await response.json();

            if (data.success) {
                if (data.especialidad !== undefined && especialidadSelect.querySelector(`option[value="${data.especialidad}"]`)) {
                    especialidadSelect.value = data.especialidad;
                } else {
                    especialidadSelect.value = '';
                }
                if (data.turno !== undefined && turnoSelect.querySelector(`option[value="${data.turno}"]`)) {
                    turnoSelect.value = data.turno;
                } else {
                    turnoSelect.value = '';
                }
            } else {
                especialidadSelect.value = '';
                turnoSelect.value = '';
            }
        } catch (e) {
            console.error("Error al obtener info del curso:", e);
            especialidadSelect.value = '';
            turnoSelect.value = '';
        }
    };

    anioSelect.addEventListener('change', updateEspecialidadYTurno);
    divisionSelect.addEventListener('change', updateEspecialidadYTurno);
}

// --- Listeners de Submit de Formularios (Copiados de admin.js) ---

// Listener para asignar Profesor (Incluye Turno)
document.getElementById('asignarProfesorForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const profesor = document.getElementById("profesorSelect").value;
    const materia = document.getElementById("materiaSelectAdmin").value; // ID de admin
    const anio = document.getElementById("anioSelectProfesor").value;
    const division = document.getElementById("divisionSelectProfesor").value;
    const turno = document.getElementById("turnoSelectProfesor").value;

    if (!profesor || !materia || !anio || !division || !turno) {
        alert("Complete Profesor, Materia, Año, División y Turno.");
        return;
    }

    const asignacion_info = { materia: materia, anio: anio, division: division, turno: turno };

    try {
        const response = await fetch('../api/assign_subject.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: profesor, data: asignacion_info })
        });
        const data = await response.json();

        if (data.success) {
            alert(data.message);
            cargarAsignacionesProfesor(profesor); // Recarga la lista de materias del profe
        } else {
            alert(data.message || "Error al asignar materia.");
        }
    } catch (e) {
        alert("Error de conexión con el servidor al asignar materia.");
        console.error(e);
    }
});

// Listener para asignar Alumno (Incluye Turno)
document.getElementById('asignarAlumnoForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const alumno = document.getElementById("alumnoSelect").value;
    const anio = document.getElementById("anioInput").value;
    const division = document.getElementById("divisionInput").value;
    const especialidad = document.getElementById("especialidadInput").value;
    const turno = document.getElementById("turnoInputAlumno").value;

    if (!alumno || !anio || !division || !especialidad || !turno) {
        alert("Complete todos los campos del alumno, incluyendo el Turno.");
        return;
    }

    const curso_info = { anio, division, especialidad, turno };

    try {
        const response = await fetch('../api/assign_course.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: alumno, data: curso_info })
        });
        const data = await response.json();

        if (data.success) {
            alert(data.message);
            document.getElementById('asignarAlumnoForm').reset();
            // Actualizar lista de asignaciones (si es necesario, aunque aquí no hay lista)
            const li = document.createElement("li");
            li.textContent = `${alumno} → Año ${anio}, Div ${division}, ${especialidad}, Turno ${turno}`;
            document.getElementById("alumnosList").appendChild(li);

        } else {
            alert(data.message || "Error al asignar curso.");
        }
    } catch (e) {
        alert("Error de conexión con el servidor al asignar alumno.");
        console.error(e);
    }
});


/* ------------------------------------------
   LÓGICA DE CONTROL DE CURSO (PRECEPTOR) - (Sin cambios)
   ------------------------------------------ */

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
        const alumnosResponse = await fetch(`../api/get_users_by_course.php?anio=${anio}&division=${division}&role=Alumno`);
        const alumnos = await alumnosResponse.json();

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
                    <td class="text-left-align">${profesor.materias.join(', ')}</td>
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
    sessionStorage.setItem("reviewingUserEmail", alumnoEmail);
    sessionStorage.setItem("reviewerRole", activeUser.role);
    // Redirigir a la vista de boletín
    window.location.href = `../html/alumno.html`;
}



// --- INICIALIZACIÓN (MODIFICADA) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Lógica para el dropdown de usuario ---
    const emailDisplay = document.getElementById('user-email-display');
    if (emailDisplay && activeUser && activeUser.email) {
        let emailName = activeUser.email.split('@')[0];
        if (emailName.length > 20) {
            emailName = emailName.substring(0, 17) + '...';
        }
        emailDisplay.textContent = emailName;
    }
    // --- Fin lógica dropdown ---

    // Cargas iniciales
    cargarSelects(); // Carga selects de Alumno y Profesor
    cargarMaterias(); // Carga el caché de materias y lo aplica al select de admin

    // Configurar lógica automática y filtros
    setupMateriaFiltering(); // Para Select Materia en Asignar Profesor
    setupEspecialidadAuto(); // Para Asignar Alumno (Especialidad y Turno)

    // Llenar selects de Año/División en formularios y filtros
    const anioOptions = ['1ro', '2do', '3ro', '4to', '5to', '6to', '7mo'];
    const divisionOptions = ['1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va', '9na'];

    const fillSelect = (id, options, defaultText) => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = `<option value="">${defaultText}</option>`; // Texto por defecto
            options.forEach(opt => {
                select.innerHTML += `<option value="${opt}">${opt}</option>`;
            });
        }
    };

    // Llenar selects de "Asignar Profesor"
    fillSelect('anioSelectProfesor', anioOptions, 'Seleccionar año');
    fillSelect('divisionSelectProfesor', divisionOptions, 'Seleccionar división');
    
    // Llenar selects de "Asignar Alumno"
    fillSelect('anioInput', anioOptions, 'Seleccionar año');
    fillSelect('divisionInput', divisionOptions, 'Seleccionar división'); 
    
    // Llenar selects de "Control de Cursos"
    fillSelect('filtroAnio', anioOptions, 'Todos los Años');
    fillSelect('filtroDivision', divisionOptions, 'Todas las Divisiones');

    // Listener para los filtros del curso
    document.getElementById("filtroAnio").addEventListener('change', cargarAlumnosFiltrados);
    document.getElementById("filtroDivision").addEventListener('change', cargarAlumnosFiltrados);

    // Carga inicial de la tabla de control (probablemente mostrará "Seleccione...")
    cargarAlumnosFiltrados();
});

// Función de Info Personal (Lógica de tu Meta 3)
function showPersonalInfo() {
    if (activeUser) {
        alert(
            'Información Personal:\n\n' +
            'Email: ' + (activeUser.email || 'No disponible') + '\n' +
            'Nombre: ' + (activeUser.fullname || 'No disponible') + '\n' +
            'DNI: ' + (activeUser.dni || 'No disponible') + '\n' +
            'Rol: ' + (activeUser.role || 'No disponible')
        );
    } else {
        alert('No se pudieron cargar los datos del usuario.');
    }
}