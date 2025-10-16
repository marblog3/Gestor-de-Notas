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
// EN ALUMNO.JS
async function cargarNotasDelAlumno() {
    const alumnoEmail = activeUser.email;
    const tablaMateriasBody = document.querySelector("#tabla-materias tbody");
    const tablaPendientesBody = document.querySelector("#tabla-pendientes tbody"); // Tabla para intensificación

    tablaMateriasBody.innerHTML = '';
    tablaPendientesBody.innerHTML = '';

    const NOTA_APROBACION = 7; // Define la nota mínima para aprobar

    try {
        const response = await fetch('../api/get_grades.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alumno_email: alumnoEmail })
        });
        const notasDelAlumno = await response.json();

        if (!notasDelAlumno || notasDelAlumno.length === 0) {
            tablaMateriasBody.innerHTML = '<tr><td colspan="9">No hay calificaciones cargadas.</td></tr>';
            tablaPendientesBody.innerHTML = '<tr><td colspan="11">No hay materias pendientes de aprobación.</td></tr>';
            return;
        }

        const userResponse = await fetch(`../api/get_user_by_email.php?email=${alumnoEmail}`);
        const userData = await userResponse.json();
        const curso = userData.success && userData.user.curso_info ? JSON.parse(userData.user.curso_info).curso : {};
        const anio = curso.anio || 'N/A';

        let hayPendientes = false;
        notasDelAlumno.forEach(nota => {
            const nota1 = parseFloat(nota.nota_1Cuat);
            const nota2 = parseFloat(nota.nota_2Cuat);


            // Lógica simplificada: si la nota final es menor a 7, es pendiente.
            const esPendiente = parseFloat(nota.final) < NOTA_APROBACION;

            if (esPendiente) {
                hayPendientes = true;
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td><input type="text" class="mate1" value="${nota.materia || ''}" readonly></td>
                    <td><input type="text" class="mate1" value="${anio}" readonly></td>
                    <td><input type="text" class="mate1" value="${new Date().getFullYear()}" readonly></td>
                    <td><input type="number" class="mate1" value="" readonly></td> <td><input type="number" class="mate1" value="" readonly></td> <td><input type="number" class="mate1" value="" readonly></td> <td><input type="number" class="mate1" value="" readonly></td> <td><input type="number" class="mate1" value="${nota.diciembre || ''}" readonly></td>
                    <td><input type="number" class="mate1" value="${nota.febrero || ''}" readonly></td>
                    <td><input type="number" class="mate1" value="${nota.final || ''}" readonly></td>
                    <td><input type="text" class="mate1" value="" readonly></td> <td><input type="text" class="mate1" value="${nota.observaciones || ''}" readonly></td>
                `;
                tablaPendientesBody.appendChild(fila);
            }

            // Siempre se muestra en la tabla principal
            const filaPrincipal = document.createElement('tr');
            filaPrincipal.innerHTML = `
                <td><input type="text" class="mate1" value="${nota.materia || ''}" readonly></td>
                <td><input type="text" class="mate1" value="${anio}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.nota_1Cuat || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.nota_2Cuat || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.intensificacion || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.diciembre || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.febrero || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.final || ''}" readonly></td>
                <td><input type="text" class="mate1" value="${nota.observaciones || ''}" readonly></td>
            `;
            tablaMateriasBody.appendChild(filaPrincipal);
        });

        if (!hayPendientes) {
            tablaPendientesBody.innerHTML = '<tr><td colspan="11">No hay materias pendientes de aprobación.</td></tr>';
        }

    } catch (e) {
        console.error("Error al cargar notas del alumno desde la DB:", e);
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
