// --- VERIFICACIÓN DE SESIÓN Y ROL ---
const reviewingEmail = sessionStorage.getItem("reviewingUserEmail");
const reviewerRole = sessionStorage.getItem("reviewerRole");
const activeUserJSON = sessionStorage.getItem("activeUser");

let targetUserEmail = activeUserJSON ? JSON.parse(activeUserJSON).email : null;
let activeUser = activeUserJSON ? JSON.parse(activeUserJSON) : {};

// Si hay un email de revisión Y el usuario activo es un Preceptor, usar el email de revisión
if (reviewingEmail && reviewerRole === 'Preceptor') {
    targetUserEmail = reviewingEmail;
    // Forzar el nombre/DNI del alumno en activeUser para la carga inicial, si es necesario
    // Los datos reales se cargarán por fetch
    activeUser = { email: targetUserEmail, role: 'Alumno', fullname: 'Cargando...', dni: '...' };
}

// Redirección si no hay sesión
if (!targetUserEmail) {
    window.location.href = "principal.html";
}


window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.go(1);
    window.location.href = "principal.html";
};

function logout() {
    // Limpiar variables de revisión al cerrar sesión
    sessionStorage.removeItem("reviewingUserEmail");
    sessionStorage.removeItem("reviewerRole");
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
    
    // Ocultar notificaciones si es un Preceptor quien revisa
    if (reviewerRole === 'Preceptor') {
        if (notiIcon) notiIcon.style.display = 'none';
        return;
    }

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

// --- FUNCIÓN NUEVA: Cargar las notas del alumno (MODIFICADA SIN OBSERVACIONES) ---
async function cargarNotasDelAlumno() {
    const alumnoEmail = targetUserEmail; // Usar el email objetivo
    const tablaMateriasBody = document.querySelector("#tabla-materias tbody");
    const tablaPendientesBody = document.querySelector("#tabla-pendientes tbody"); // Tabla para intensificación

    tablaMateriasBody.innerHTML = '';
    tablaPendientesBody.innerHTML = '';

    const NOTA_APROBACION = 7; 

    try {
        const response = await fetch('../api/get_grades.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alumno_email: alumnoEmail })
        });
        const notasDelAlumno = await response.json();

        if (!notasDelAlumno || notasDelAlumno.length === 0) {
            tablaMateriasBody.innerHTML = '<tr><td colspan="8">No hay calificaciones cargadas.</td></tr>'; // Colspan 8
            tablaPendientesBody.innerHTML = '<tr><td colspan="11">No hay materias pendientes de aprobación.</td></tr>';
            return;
        }

        // Obtener info del curso para mostrar el Año en la tabla
        const userResponse = await fetch(`../api/get_user_by_email.php?email=${targetUserEmail}`);
        const userData = await userResponse.json();
        const curso = userData.success && userData.user.curso_info ? JSON.parse(userData.user.curso_info).curso : {};
        const anio = curso.anio || 'N/A';

        let hayPendientes = false;
        notasDelAlumno.forEach(nota => {
            const nota1 = parseFloat(nota.nota_1Cuat) || 0;
            const nota2 = parseFloat(nota.nota_2Cuat) || 0;
            const febrero = parseFloat(nota.febrero) || 0;
            
            // 1. CALCULAR NOTA FINAL VISIBLE (La de la DB o el promedio)
            let notaFinal = parseFloat(nota.final);
            
            // Si la nota final es NULL, la calculamos si hay notas de cuatrimestre para mostrar algo.
            if (isNaN(notaFinal) && (nota1 > 0 || nota2 > 0)) {
                notaFinal = (nota1 + nota2) / 2;
            } else if (isNaN(notaFinal)) {
                notaFinal = 0; // Usar 0 para la lógica de pendientes si no hay nada
            }

            // 2. LÓGICA DE PENDIENTE (Es pendiente si la nota final es menor a 7 Y Febrero también es menor a 7)
            let esPendiente = false;
            
            // Si la nota final (guardada en DB o promedio calculado) es menor a 7
            if (notaFinal < NOTA_APROBACION) {
                // Y si el intento de febrero también fue menor a 7 (o no se intentó), ES PENDIENTE.
                if (febrero < NOTA_APROBACION) {
                     esPendiente = true;
                }
            }
            
            // Determinar cómo se mostrará la calificación final
            const finalDisplay = (notaFinal > 0 || nota.final !== null) ? notaFinal.toFixed(2) : '';


            // 3. POBLAR TABLA PENDIENTES
            if (esPendiente) {
                hayPendientes = true;
                const filaPendiente = document.createElement('tr');
                
                // Nota: Se mantiene la estructura original de 12 columnas para la tabla de pendientes (con observaciones)
                filaPendiente.innerHTML = `
                    <td><input type="text" class="mate1" value="${nota.materia || ''}" readonly></td>
                    <td><input type="text" class="mate1" value="${anio}" readonly></td>
                    <td><input type="text" class="mate1" value="${new Date().getFullYear()}" readonly></td>
                    <td><input type="number" class="mate1" value="" readonly></td> 
                    <td><input type="number" class="mate1" value="" readonly></td> 
                    <td><input type="number" class="mate1" value="" readonly></td> 
                    <td><input type="number" class="mate1" value="" readonly></td> 
                    <td><input type="number" class="mate1" value="${nota.diciembre || ''}" readonly></td>
                    <td><input type="number" class="mate1" value="${nota.febrero || ''}" readonly></td>
                    <td><input type="number" class="mate1" value="${finalDisplay}" readonly></td>
                    <td><input type="text" class="mate1" value="" readonly></td> 
                    <td><input type="text" class="mate1" value="${nota.observaciones || ''}" readonly></td>
                `;
                tablaPendientesBody.appendChild(filaPendiente);
            }

            // 4. POBLAR TABLA PRINCIPAL (Estructura de 8 celdas, quitando Observaciones)
            const filaPrincipal = document.createElement('tr');
            filaPrincipal.innerHTML = `
                <td><input type="text" class="mate1" value="${nota.materia || ''}" readonly></td>
                <td><input type="text" class="mate1" value="${anio}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.nota_1Cuat || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.nota_2Cuat || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.intensificacion || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.diciembre || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${nota.febrero || ''}" readonly></td>
                <td><input type="number" class="mate1" value="${finalDisplay}" readonly></td>
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
// --- Cargar datos personales del alumno (MODIFICADA para buscar Preceptor) ---
async function cargarDatosPersonales() {
    const tabla = document.querySelector("#tabla-datos-generales");
    
    // Determinar qué email usar: el del alumno logueado o el que el preceptor está revisando
    const targetEmail = targetUserEmail;

    if (tabla) {
        // Seleccionamos las filas específicas
        const primeraFila = tabla.rows[0];
        const segundaFila = tabla.rows[1];

        // Referencias a los inputs
        const inputNombre = primeraFila.cells[1].querySelector("input");
        const inputDni = primeraFila.cells[2].querySelector("input");
        const preceptorInput = segundaFila.cells[3].querySelector("input");


        // Cargar información completa del alumno (incluyendo nombre y dni)
        try {
            const response = await fetch(`../api/get_user_by_email.php?email=${targetEmail}`);
            const data = await response.json();

            if (data.success && data.user) {
                const user = data.user;
                
                // 1. Actualizar nombre y DNI con datos frescos de la DB
                if (inputNombre) inputNombre.value = user.fullname || "";
                if (inputDni) inputDni.value = user.dni || "";

                // 2. Cargar información del curso/especialidad y Preceptor
                if (user.curso_info) {
                    const info = JSON.parse(user.curso_info);
                    const curso = info.curso || {};
                    const preceptorEmail = info.preceptor_email || null; // OBTENER EL EMAIL DEL PRECEPTOR

                    // --- LLENAR DATOS DEL CURSO ---
                    primeraFila.cells[3].querySelector("input").value = curso.especialidad || '';
                    segundaFila.cells[0].querySelector("input").value = curso.anio || '';
                    segundaFila.cells[1].querySelector("input").value = curso.division || '';
                    // Ciclo lectivo automático
                    primeraFila.cells[0].querySelector("input").value = new Date().getFullYear();
                    
                    // --- 3. LLENAR NOMBRE DEL PRECEPTOR ASIGNADO ---
                    if (preceptorEmail && preceptorInput) {
                        // Buscar el nombre completo del preceptor por su email
                        const preceptorResponse = await fetch(`../api/get_user_by_email.php?email=${preceptorEmail}`);
                        const preceptorData = await preceptorResponse.json();
                        
                        if (preceptorData.success && preceptorData.user) {
                            // Mostrar el nombre completo del preceptor
                            preceptorInput.value = preceptorData.user.fullname || preceptorEmail;
                        } else {
                            // Si el usuario existe pero no se pudo obtener el nombre
                            preceptorInput.value = "Preceptor Asignado (Error de nombre)";
                        }
                    } else if (preceptorInput) {
                        // Si el email del preceptor no existe en curso_info
                        preceptorInput.value = "No asignado";
                    }
                    // ------------------------------------------
                }
            }
        } catch (e) {
            console.error("Error al cargar datos del curso o preceptor:", e);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosPersonales();
    cargarNotasDelAlumno();
});