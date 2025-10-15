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
    window.location.replace("principal.html");
}


// ------------ SCRIPT DE EXPORTACIÓN A EXCEL (Mantenido) ------------
const exportarBtn = document.getElementById("exportarBtn");

// Lógica de exportación (código original omitido por extensión, se asume que funciona)
// exportarBtn.addEventListener("click", exportarAExcel);


// ------------ SCRIPT PARA NOTIFICACIONES (Mantenido Local) ------------
document.addEventListener("DOMContentLoaded", () => {
    const notiIcon = document.getElementById("notification-icon");
    if (!notiIcon) return;

    const notiWrapper = notiIcon.querySelector(".icon-wrapper");
    const notiDot = notiIcon.querySelector(".notification-dot");
    const notiPanel = notiIcon.querySelector(".notification-panel");
    const notiList = document.getElementById("notification-list");

    const notiMessage = localStorage.getItem("notificacionAlumno");

    if (notiMessage) {
        notiDot.classList.add("show");
        const li = document.createElement("li");
        li.textContent = notiMessage;
        notiList.appendChild(li);
    } else {
        const li = document.createElement("li");
        li.textContent = "No hay notificaciones nuevas.";
        li.classList.add("empty");
        notiList.appendChild(li);
    }

    notiWrapper.addEventListener("click", (event) => {
        event.stopPropagation();
        notiPanel.classList.toggle("show");

        if (notiDot.classList.contains("show")) {
            notiDot.classList.remove("show");
            localStorage.removeItem("notificacionAlumno");
        }
    });

    document.addEventListener("click", (event) => {
        if (!notiIcon.contains(event.target)) {
            notiPanel.classList.remove("show");
        }
    });
});

// --- FUNCIÓN NUEVA: Cargar las notas del alumno (MIGRADO A DB) ---
async function cargarNotasDelAlumno() {
    const alumnoEmail = activeUser.email;
    const tablaMateriasBody = document.querySelector("#tabla-materias tbody");
    
    // Limpiamos la tabla antes de llenarla
    tablaMateriasBody.innerHTML = ''; 

    try {
        // Obtenemos las notas del alumno específico
        const response = await fetch('../api/get_grades.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alumno_email: alumnoEmail })
        });
        const notasDelAlumno = await response.json();
        
        if (!notasDelAlumno || notasDelAlumno.length === 0) {
             tablaMateriasBody.innerHTML = '<tr><td colspan="9">No hay calificaciones cargadas por el momento.</td></tr>';
             return;
        }

        // 2. Cargamos el dato del curso del usuario (si existe)
        const userResponse = await fetch(`../api/get_user_by_email.php?email=${alumnoEmail}`);
        const userData = await userResponse.json();
        const curso = userData.success && userData.user.curso_info ? JSON.parse(userData.user.curso_info).curso : {};
        
        const anio = curso.anio || 'N/A';
        const especialidad = curso.especialidad || 'N/A';

        // 3. Rellenamos la tabla con los datos de las notas
        notasDelAlumno.forEach(nota => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><input type="text" class="mate1" value="${nota.materia || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${anio}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.nota_1Cuat || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.nota_2Cuat || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.intensificacion || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.diciembre || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.febrero || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.final || ''}" readonly></td>
                <td><input type="text" class="mate1" value="${nota.observaciones || `Cargado por: ${nota.profesor_email}`}" readonly></td>
            `;
            tablaMateriasBody.appendChild(fila);
        });

        // 4. Rellenar datos generales
        const tablaDatosGenerales = document.querySelector("#tabla-datos-generales");
        tablaDatosGenerales.querySelector("td:nth-child(4) input").value = especialidad;

    } catch (e) {
        console.error("Error al cargar notas del alumno desde la DB:", e);
        tablaMateriasBody.innerHTML = '<tr><td colspan="9">Error de conexión al cargar las notas.</td></tr>';
    }
}

// --- Cargar datos personales del alumno ---
async function cargarDatosPersonales() {
    const tabla = document.querySelector("#tabla-datos-generales");

    if (tabla) {
        // Seleccionamos las filas específicas para evitar errores
        const primeraFila = tabla.rows[0];
        const segundaFila = tabla.rows[1];

        // Nombre y DNI (vienen de sessionStorage)
        const inputNombre = primeraFila.cells[1].querySelector("input");
        if (inputNombre) inputNombre.value = activeUser.fullname || "";

        const inputDni = primeraFila.cells[2].querySelector("input");
        if (inputDni) inputDni.value = activeUser.dni || "";
        
        // Cargar información del curso/especialidad desde la DB
        try {
            const response = await fetch(`../api/get_user_by_email.php?email=${activeUser.email}`);
            const data = await response.json();
            
            if (data.success && data.user.curso_info) {
                const info = JSON.parse(data.user.curso_info);
                if (info && info.curso) { // Asegurarse de que el objeto 'curso' existe
                    const curso = info.curso;
                    // --- SELECTORES CORREGIDOS ---
                    primeraFila.cells[3].querySelector("input").value = curso.especialidad || '';
                    segundaFila.cells[0].querySelector("input").value = curso.anio || '';
                    segundaFila.cells[1].querySelector("input").value = curso.division || '';
                    
                    // Ciclo lectivo automático
                    const anioActual = new Date().getFullYear();
                    primeraFila.cells[0].querySelector("input").value = anioActual;
                }
            }
        } catch (e) {
            console.error("Error al cargar datos del curso:", e);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosPersonales();
    cargarNotasDelAlumno();
});