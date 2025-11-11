// Gestor-de-Notas/js/profesor.js (Archivo completo a REEMPLAZAR)
// --- VALIDACIÓN DE SESIÓN (MODIFICADA PARA SER ROBUSTA) ---
const activeUserJSON = sessionStorage.getItem("activeUser");
if (!activeUserJSON) {
    window.location.href = "principal.html";
}
// *** CAMBIO: Usar 'let' en lugar de 'const' para permitir la actualización ***
let activeUser = JSON.parse(activeUserJSON);

/**
 * Función para verificar y completar los datos del usuario activo.
 * Esto evita errores si la sesión de sessionStorage es antigua (ej. no tiene 'fullname').
 */
async function checkActiveUserData() {
    if (!activeUser.fullname || !activeUser.dni) {
        console.warn("Datos de sesión incompletos. Buscando datos actualizados...");
        try {
            const response = await fetch(`../api/get_user_by_email.php?email=${activeUser.email}`);
            const data = await response.json();
            if (data.success && data.user) {
                // Actualiza el objeto global 'activeUser'
                activeUser = data.user; 
                // Actualiza la sesión en el navegador para futuras cargas
                sessionStorage.setItem("activeUser", JSON.stringify(activeUser));
                console.log("Sesión actualizada:", activeUser);
            } else {
                throw new Error(data.message || "No se pudieron obtener los datos completos del usuario.");
            }
        } catch (e) {
            console.error(e);
            alert("Error crítico: No se pudieron verificar los datos de tu sesión. Serás redirigido al login.");
            logout(); // Redirige si falla
        }
    }
}


// --- MANEJO DE MODAL DE NOTIFICACIÓN ---
function openAlertModalProfesor(message) {
    document.getElementById('alertMessageProfesor').textContent = message;
    document.getElementById('alertModalProfesor').classList.add('show');
}

function closeAlertModalProfesor() {
    document.getElementById('alertModalProfesor').classList.remove('show');
}

// Variable global para guardar las asignaciones del profesor
let profesorAsignaciones = [];

//-- Cargar datos asignados al profesor (MODIFICADA para que el filtro funcione) ---//
async function cargarDatosAsignados() {
    try {
        const response = await fetch(`../api/get_user_by_email.php?email=${activeUser.email}`);
        const data = await response.json();

        if (data.success && data.user.curso_info) {
            // Asegurarse de que curso_info es un array, o un JSON que contiene un array
            profesorAsignaciones = JSON.parse(data.user.curso_info); // Guarda las asignaciones globalmente
            // Si el curso_info es un objeto simple, asumimos que las asignaciones están en la raíz
            if (!Array.isArray(profesorAsignaciones)) {
                profesorAsignaciones = []; // O manejar la estructura de objeto si se requiere
            }


            const materiaSelect = document.getElementById("materia-seleccionada");
            const anioSelect = document.getElementById("anio-select");
            const divisionSelect = document.getElementById("division-select");

            materiaSelect.innerHTML = '<option value="">Seleccionar materia</option>';

            if (Array.isArray(profesorAsignaciones)) {
                profesorAsignaciones.forEach((asig, index) => {
                    // Muestra el Turno en el selector para diferenciar
                    let suffix = (asig.anio || asig.division) ? ` (${asig.anio || ''} ${asig.division || ''} - ${asig.turno || ''})` : '';
                    const optionText = `${asig.materia}${suffix}`;
                    materiaSelect.innerHTML += `<option value="${index}">${optionText}</option>`;
                });
            }

            materiaSelect.addEventListener('change', (e) => {
                const selectedIndex = e.target.value;
                if (selectedIndex !== "") {
                    const asignacionSeleccionada = profesorAsignaciones[selectedIndex];
                    anioSelect.value = asignacionSeleccionada.anio;
                    divisionSelect.value = asignacionSeleccionada.division;
                    cargarAlumnos(); // <-- Dispara la carga de alumnos filtrados
                } else {
                    // Si se selecciona la opción vacía, limpia los campos y la tabla
                    anioSelect.value = "";
                    divisionSelect.value = "";
                    cargarAlumnos();
                }
            });
        }
    } catch (e) {
        console.error("Error al cargar las asignaciones del profesor:", e);
    }
}


/**
 * CREA LA FILA DEL ALUMNO CON LA NUEVA ESTRUCTURA DE 22 COLUMNAS
 */
function crearFilaEstudiante() {
    // 5 inputs para Parciales por cuatrimestre
    const parciales = Array(5).fill('<td><input type="number" min="1" max="10" step="0.01" class="nota parcial-input" maxlength="4"></td>').join('');

    // Controles para Valoración Preliminar (Select para TEA/TEP/TED y un Input numérico)
    const valoracionPreliminar = `
        <td>
            <select class="valoracion-select">
                <option value="">-</option>
                <option value="TEA">TEA</option>
                <option value="TEP">TEP</option>
                <option value="TED">TED</option>
            </select>
            <input type="number" min="1" max="10" step="0.01" class="nota valoracion-num-input" maxlength="4">
        </td>
    `;
    // Columna para Calificación Cuatrimestral (Promedio/Final)
    const calificacionCuatrimestral = '<td><input type="number" min="1" max="10" step="0.01" class="nota cuat-final-input" maxlength="4" readonly></td>';

    // Columna para Inasistencias (solo número 0-365)
    const inasistencias = '<td><input type="number" min="0" max="365" class="nota inasistencia-input" maxlength="3"></td>';

    // Columnas de Intensificación (solo número 1-10)
    const intensificacion = '<td><input type="number" min="1" max="10" step="0.01" class="nota intensificacion-input" maxlength="4"></td>';

    return `
    <tr>
        <td><span class="orden"></span></td>
        <td><input type="text" name="nombre" maxlength="100" class="nota nombre-alumno" readonly></td>
        
        ${parciales}
        ${valoracionPreliminar.replace('valoracion-select', 'valoracion-select cuat1-vp-select').replace('valoracion-num-input', 'valoracion-num-input cuat1-num-input')}
        ${calificacionCuatrimestral.replace('cuat-final-input', 'cuat1-final-input')}
        ${inasistencias.replace('inasistencia-input', 'cuat1-inasist-input')}

        ${parciales}
        ${valoracionPreliminar.replace('valoracion-select', 'valoracion-select cuat2-vp-select').replace('valoracion-num-input', 'valoracion-num-input cuat2-num-input')}
        ${calificacionCuatrimestral.replace('cuat-final-input', 'cuat2-final-input')}
        ${inasistencias.replace('inasistencia-input', 'cuat2-inasist-input')}

        ${intensificacion.replace('intensificacion-input', 'intensificacion-input int1c-input')}
        ${intensificacion.replace('intensificacion-input', 'intensificacion-input dic-input')}
        ${intensificacion.replace('intensificacion-input', 'intensificacion-input feb-input')}
        <td class="final-container">
            <input type="number" min="1" max="10" step="0.01" class="nota calificacion-final" maxlength="4" readonly>
            <span class="remove-row">X</span>
        </td>
    </tr>`;
}


// --- Reordenar números de filas ---
function actualizarOrden() {
    document.querySelectorAll("#tabla-estudiantes tr").forEach((tr, index) => {
        const span = tr.querySelector(".orden");
        if (span) span.textContent = index + 1;
    });
}

// --- Validaciones (Actualizadas para la nueva estructura) ---
function aplicarValidaciones() {
    // **VALIDACIÓN 1: NOMBRE** (Solo texto, aunque se carga como readonly)
    document.querySelectorAll(".nombre-alumno").forEach(inp => {
        inp.removeEventListener("input", limitText);
        inp.addEventListener("input", limitText);
        // Aseguramos que solo se pueda leer
        inp.readOnly = true;
    });

    // **VALIDACIÓN 2: INASISTENCIAS** (Números 0-365)
    document.querySelectorAll(".cuat1-inasist-input, .cuat2-inasist-input").forEach(inp => {
        inp.removeEventListener("input", limitInasistencias);
        inp.addEventListener("input", limitInasistencias);
    });

    // **VALIDACIÓN 3: NOTAS NUMÉRICAS** (1-10 con 2 decimales)
    document.querySelectorAll(".tabla-3 input[type='number']").forEach(inp => {
        inp.removeEventListener("keydown", limitNumerosNota);
        inp.addEventListener("keydown", limitNumerosNota);
        inp.removeEventListener("input", enforceNotaRange);
        inp.addEventListener("input", enforceNotaRange);
    });

    // **CÁLCULO AUTOMÁTICO AL CAMBIAR NOTAS**
    // Incluir todos los inputs que afectan el cálculo final
    document.querySelectorAll('.parcial-input, .cuat1-num-input, .cuat2-num-input, .int1c-input, .dic-input, .feb-input').forEach(input => {
        input.removeEventListener('change', actualizarCalificacionFinal);
        input.addEventListener('change', actualizarCalificacionFinal);
    });

    // **INTEGRACIÓN: Llenar campo numérico de VP desde promedio de parciales**
    document.querySelectorAll('#tabla-estudiantes tr').forEach(tr => {
        // En cada fila, escucha el cambio en cualquier parcial
        tr.querySelectorAll('.parcial-input').forEach(parcialInput => {
            parcialInput.removeEventListener('change', () => actualizarPromedioParcial(tr));
            parcialInput.addEventListener('change', () => actualizarPromedioParcial(tr));
        });
    });
}

// Funciones auxiliares de validación
function limitText(e) {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "").slice(0, 100);
}
function limitInasistencias(e) {
    e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
}

// --- CORREGIDA: permite hasta 365 en inasistencias ---
function enforceNotaRange(e) {
    const input = e.target;

    // Si es una columna de inasistencias, permitir 0–365
    if (input.classList.contains("cuat1-inasist-input") || input.classList.contains("cuat2-inasist-input")) {
        const val = parseInt(input.value);
        if (isNaN(val) || val < 0) input.value = '0';
        if (val > 365) input.value = '365';
        return; // sale para no aplicar el límite de 1–10
    }

    // En el resto de inputs, aplica el rango de nota 1–10
    const val = parseFloat(input.value);
    if (val < 1 || val > 10) {
        if (val < 1) input.value = '1';
        if (val > 10) input.value = '10';
    }
}


// --- CORREGIDA: permite escribir libremente números 0–365 en inasistencias ---
function limitNumerosNota(e) {
    const input = e.target;

    // Permitir teclas de control siempre
    if (["Backspace", "Tab", "Enter", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key)) return;

    // Solo números (sin letras ni símbolos)
    if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
        return;
    }

    // Si es una columna de inasistencias -> permitir 0–365 (hasta 3 cifras)
    if (input.classList.contains("cuat1-inasist-input") || input.classList.contains("cuat2-inasist-input")) {
        const nextVal = input.value + e.key;
        if (!/^\d{0,3}$/.test(nextVal) || parseInt(nextVal) > 365) {
            e.preventDefault();
        }
        return;
    }

    // Para el resto (notas), mantener límite de 1–10 con 2 decimales
    let nextVal = input.value + e.key;
    if (nextVal.includes('.')) {
        if (!/^\d{0,2}(\.\d{0,2})?$/.test(nextVal)) {
            e.preventDefault();
        }
    } else if (parseInt(nextVal, 10) > 10 || nextVal.length > 2) {
        e.preventDefault();
    }
}


// --- FUNCIÓN DE ASISTENCIA: Calcula el promedio de parciales para el campo numérico de VP ---
function actualizarPromedioParcial(tr) {
    // 1C Parciales
    const parciales1C = Array.from(tr.querySelectorAll('.parcial-input')).slice(0, 5);
    const cuat1NumInput = tr.querySelector('.cuat1-num-input');

    // 2C Parciales
    const parciales2C = Array.from(tr.querySelectorAll('.parcial-input')).slice(5, 10);
    const cuat2NumInput = tr.querySelector('.cuat2-num-input');

    // Lógica para 1C
    let suma1 = 0, count1 = 0;
    parciales1C.forEach(input => {
        const val = parseFloat(input.value);
        if (!isNaN(val) && val >= 1 && val <= 10) {
            suma1 += val;
            count1++;
        }
    });
    // Solo actualiza el campo si se ingresó al menos un parcial. Permite al profesor sobrescribir manualmente.
    if (count1 > 0) {
        cuat1NumInput.value = (suma1 / count1).toFixed(2);
    } else if (count1 === 0 && !cuat1NumInput.value) { // Solo si está vacío
        cuat1NumInput.value = '';
    }

    // Lógica para 2C
    let suma2 = 0, count2 = 0;
    parciales2C.forEach(input => {
        const val = parseFloat(input.value);
        if (!isNaN(val) && val >= 1 && val <= 10) {
            suma2 += val;
            count2++;
        }
    });
    // Solo actualiza el campo si se ingresó al menos un parcial. Permite al profesor sobrescribir manualmente.
    if (count2 > 0) {
        cuat2NumInput.value = (suma2 / count2).toFixed(2);
    } else if (count2 === 0 && !cuat2NumInput.value) { // Solo si está vacío
        cuat2NumInput.value = '';
    }

    // Forzar el recálculo de la nota final
    actualizarCalificacionFinal();
}

// --- FUNCIÓN DE CÁLCULO DE NOTA FINAL (Lógica de negocio) ---
function actualizarCalificacionFinal() {
    // Es CRÍTICO llamar a calcularReporte al inicio para que el reporte se base en los valores actualizados.
    calcularReporte();

    document.querySelectorAll("#tabla-estudiantes tr").forEach(tr => {
        const anioSelect = document.getElementById("anio-select");
        const is7mo = anioSelect && anioSelect.value === '7mo';
        const notaAprobacion = 7;

        // Inputs numéricos importantes (Valores numéricos de VP)
        const cuat1NumInput = tr.querySelector('.cuat1-num-input');
        const cuat2NumInput = tr.querySelector('.cuat2-num-input');
        const int1cInput = tr.querySelector('.int1c-input');
        const dicInput = tr.querySelector('.dic-input');
        const febInput = tr.querySelector('.feb-input');
        const finalInput = tr.querySelector('.calificacion-final');

        // Calificaciones cuatrimestrales finales (visualización)
        const cuat1FinalInput = tr.querySelector('.cuat1-final-input');
        const cuat2FinalInput = tr.querySelector('.cuat2-final-input');
        const cuat1VPSelect = tr.querySelector('.cuat1-vp-select');
        const cuat2VPSelect = tr.querySelector('.cuat2-vp-select');

        // Función auxiliar para obtener nota o 0 si no es válida (cubre 1-10)
        const getNota = (input) => {
            const val = parseFloat(input?.value);
            return !isNaN(val) && val >= 1 && val <= 10 ? val : 0;
        };

        // **NUEVO CÓDIGO**: Si el campo de VP/Calificación Cuatrimestral tiene valor (manual o por promedio), usar ese valor
        let nota1 = getNota(cuat1NumInput);
        let nota2 = getNota(cuat2NumInput);

        let int1c = getNota(int1cInput);
        let dic = getNota(dicInput);
        let feb = getNota(febInput);

        let finalValue = '';

        // 1. Llenar los campos de Calificación 1C y 2C con la nota de VP/CC
        cuat1FinalInput.value = nota1 > 0 ? nota1.toFixed(2) : '';
        cuat2FinalInput.value = nota2 > 0 ? nota2.toFixed(2) : '';

        // --- Lógica de Aprobación y Final ---
        if (nota1 >= notaAprobacion && nota2 >= notaAprobacion) {
            // Aprobación Directa: Se promedia si ambos cuatrimestres están aprobados.
            finalValue = ((nota1 + nota2) / 2).toFixed(2);
            // Limpiar campos no usados (importante para que no se guarden notas residuales en la BD)
            int1cInput.value = '';
            dicInput.value = '';
            febInput.value = '';
        } else if (nota1 > 0 || nota2 > 0 || int1c > 0 || dic > 0 || feb > 0) {
            // Requisitos de Cuatrimestre cumplidos, pero desaprobado (o falta nota)

            // Regla: Si desaprueba el 1C o 2C, se borra la Calificación Final (se deja en blanco)
            // Se debe llenar la columna de Instancia (Agosto/Dic/Feb)

            if (is7mo) {
                // CASO 7mo AÑO: IGNORA Intensificación 1C (Agosto)
                int1cInput.value = '';

                if (feb >= notaAprobacion) {
                    finalValue = feb.toFixed(2);
                } else if (dic >= notaAprobacion) {
                    finalValue = dic.toFixed(2);
                } else if (finalInput.value) {
                    finalValue = finalInput.value; // Mantiene la nota final si ya existía (ej. desaprobada anterior)
                } else {
                    finalValue = ''; // Desaprobado, esperando próxima instancia
                }

            } else {
                // CASO 1ro - 6to AÑO: Usa Intensificación 1C (Agosto)

                // 1. Caso 1C desaprobado y 2C aprobado
                if (nota1 < notaAprobacion && nota2 >= notaAprobacion) {

                    if (int1c >= notaAprobacion) {
                        finalValue = ((int1c + nota2) / 2).toFixed(2); // Promedia int1c y 2C
                        dicInput.value = '';
                        febInput.value = '';
                    } else {
                        // Desaprobó Intensificación 1C o no fue -> Va a Diciembre/Febrero
                        if (feb >= notaAprobacion) {
                            finalValue = feb.toFixed(2);
                        } else if (dic >= notaAprobacion) {
                            finalValue = dic.toFixed(2);
                        } else if (finalInput.value) {
                            finalValue = finalInput.value;
                        } else {
                            finalValue = ''; // Pendiente
                        }
                    }

                    // 2. Caso 2C desaprobado (1C aprobado o no importa, va a Dic/Feb)
                } else if (nota2 < notaAprobacion || nota1 < notaAprobacion) { // Incluye ambos desaprobados
                    int1cInput.value = '';

                    if (feb >= notaAprobacion) {
                        finalValue = feb.toFixed(2);
                    } else if (dic >= notaAprobacion) {
                        finalValue = dic.toFixed(2);
                    } else if (finalInput.value) {
                        finalValue = finalInput.value;
                    } else {
                        finalValue = ''; // Desaprobado, esperando instancia
                    }
                }
            }
        } else {
            // Faltan notas de cuatrimestre, queda en espera.
            finalValue = '';
            int1cInput.value = '';
            dicInput.value = '';
            febInput.value = '';
        }

        // Si la nota final es un número, se aplica. Si es vacío, se limpia.
        finalInput.value = (finalValue === '') ? '' : finalValue;


        // 3. Aplicar estilos TEA/TEP/TED a los selects
        const updateVPSelect = (num, select) => {
            if (num >= 7) select.value = 'TEA';
            else if (num >= 4 && num <= 6) select.value = 'TEP';
            else if (num >= 1 && num <= 3) select.value = 'TED';
            else select.value = '';
        };

        updateVPSelect(nota1, cuat1VPSelect);
        updateVPSelect(nota2, cuat2VPSelect);
    });
}



if (document.getElementById("calcularPromedioBtn")) {
    document.getElementById("calcularPromedioBtn").addEventListener("click", actualizarCalificacionFinal);
}


// --- Cargar Alumnos desde la DB (FILTRADO) ---
async function cargarAlumnos() {
    const tablaEstudiantes = document.getElementById('tabla-estudiantes');
    tablaEstudiantes.innerHTML = '';

    const materiaSelect = document.getElementById("materia-seleccionada");
    const selectedIndex = materiaSelect.value;

    if (selectedIndex === "") {
        tablaEstudiantes.innerHTML = '<tr><td colspan="22">Seleccione una materia y curso para cargar los alumnos.</td></tr>'; // Colspan 22
        document.getElementById("turno-profesor").value = '';
        document.getElementById("preceptor-profesor").value = '';
        return;
    }

    const asignacionSeleccionada = profesorAsignaciones[selectedIndex];
    const anio = asignacionSeleccionada.anio;
    const division = asignacionSeleccionada.division;
    const turno = asignacionSeleccionada.turno; // Nuevo: Obtener turno de la asignación

    if (!anio || !division) {
        tablaEstudiantes.innerHTML = '<tr><td colspan="22">La materia seleccionada no tiene asignado un Año/División.</td></tr>';
        return;
    }

    // Corrección del error de conexión: Llama a la función que ahora usa la API correcta
    await cargarInfoCurso(anio, division, turno);

    try {
        const response = await fetch(`../api/get_users_by_course.php?anio=${anio}&division=${division}&role=Alumno`);
        const alumnos = await response.json();

        if (alumnos && alumnos.length > 0) {
            alumnos.forEach((alumno, index) => {
                const fila = document.createElement("tr");
                fila.dataset.email = alumno.email;

                // Llamamos a la función crearFilaEstudiante que ya tiene la estructura
                fila.innerHTML = crearFilaEstudiante();

                // Llenamos los campos específicos
                fila.querySelector(".orden").textContent = index + 1;
                fila.querySelector('input[name="nombre"]').value = alumno.fullname;

                tablaEstudiantes.appendChild(fila);
            });
        } else {
            tablaEstudiantes.innerHTML = '<tr><td colspan="22">No se encontraron alumnos para este curso/materia.</td></tr>';
        }
    } catch (e) {
        console.error("Error al cargar alumnos desde la DB (filtrado):", e);
        tablaEstudiantes.innerHTML = '<tr><td colspan="22">Error al comunicarse con el servidor.</td></tr>';
    }

    actualizarOrden();
    configurarNavegacion();
    aplicarValidaciones();
    cargarNotasExistentes();
}


// --- NUEVA FUNCIÓN: Carga la info del curso (Turno y Preceptor) (Punto 4: Corrección de error de conexión) ---
async function cargarInfoCurso(anio, division, turnoAsignado) {
    const turnoInput = document.getElementById("turno-profesor");
    const preceptorInput = document.getElementById("preceptor-profesor");

    if (!turnoInput || !preceptorInput) return;

    turnoInput.value = 'Cargando...';
    preceptorInput.value = 'Cargando...';

    try {
        // Llamada al endpoint PHP corregido
        const response = await fetch(`../api/get_course_info.php?anio=${anio}&division=${division}`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            // El Turno viene ahora del backend, pero usamos el de la asignación del profesor si está disponible
            turnoInput.value = turnoAsignado || data.turno || 'N/A';
            preceptorInput.value = data.preceptor_name || 'No asignado';
        } else {
            turnoInput.value = turnoAsignado || 'N/A';
            preceptorInput.value = 'No asignado';
            console.error("Error al obtener info del curso:", data.message);
        }
    } catch (e) {
        // Muestra el error de conexión si falla el fetch
        turnoInput.value = 'Error de Conexión';
        preceptorInput.value = 'Error de Conexión';
        console.error("Error de conexión al cargar info del curso:", e);
    }
}

// *** MODIFICADO: DOMContentLoaded ahora es 'async' y llama a checkActiveUserData ***
document.addEventListener('DOMContentLoaded', async function () {
    // 1. Asegura que los datos del usuario estén completos ANTES de usarlos
    await checkActiveUserData();

    // 2. Continúa con la carga normal (ahora 'activeUser' está completo)
    const inputNombre = document.querySelector("td:nth-child(3) input");
    if (inputNombre) inputNombre.value = activeUser.fullname || "";
    const inputDni = document.getElementById("dni");
    if (inputDni) inputDni.value = activeUser.dni || "";

    establecerCicloLectivoAutomatico();
    cargarDatosAsignados();
});


// --- Carga de notas existentes (Ajustada para nueva estructura) ---
async function cargarNotasExistentes() {
    const materiaCompleta = getMateriaSeleccionada();

    // Extrae solo el nombre de la materia de la cadena "Materia (Año División Turno)"
    let materiaLimpia = materiaCompleta;
    const match = materiaCompleta.match(/(.*)\s\((.*)\s(.*)\s-\s(.*)\)/);
    if (match) {
        materiaLimpia = match[1].trim(); // Solo el nombre de la materia
    }

    if (!materiaLimpia || materiaLimpia === "Seleccionar materia") return;

    try {
        // Fetch de todas las notas (el backend filtra si no se pasa email)
        const response = await fetch('../api/get_grades.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alumno_email: '' })
        });

        if (!response.ok) {
            console.error("Error del servidor al cargar notas:", response.status, response.statusText);
            return;
        }

        const notas = await response.json();
        if (!Array.isArray(notas)) return;

        // Cargar las notas recibidas
        document.querySelectorAll("#tabla-estudiantes tr").forEach(tr => {
            const alumnoEmail = tr.dataset.email;
            if (!alumnoEmail) return;

            // Busca notas que coincidan con el email del alumno Y el nombre de la materia limpia
            const nota = notas.find(n => n.alumno_email === alumnoEmail && n.materia.startsWith(materiaLimpia));
            if (!nota) return;

            // Mapeo de inputs a la nueva estructura:
            // Inputs: [0]Nombre(text), [1-5]P1C, [6]VP1C-Num, [7]C1C-Final, [8]I1C, [9-13]P2C, [14]VP2C-Num, [15]C2C-Final, [16]I2C, [17]Int1C, [18]Dic, [19]Feb, [20]Final
            const inputs = Array.from(tr.querySelectorAll('input[type="number"]'));

            // PARCIALES 1C
            if (inputs[0]) inputs[0].value = nota.parcial1_1c || '';
            if (inputs[1]) inputs[1].value = nota.parcial2_1c || '';
            if (inputs[2]) inputs[2].value = nota.parcial3_1c || '';
            if (inputs[3]) inputs[3].value = nota.parcial4_1c || '';
            if (inputs[4]) inputs[4].value = nota.parcial5_1c || '';

            // 1. Inputs Numéricos de VP (col. 8 y 16 en HTML)
            if (inputs[5]) inputs[5].value = nota.nota_valoracion_prel_1c || '';

            // PARCIALES 2C (Index 8 al 12)
            if (inputs[8]) inputs[8].value = nota.parcial1_2c || '';
            if (inputs[9]) inputs[9].value = nota.parcial2_2c || '';
            if (inputs[10]) inputs[10].value = nota.parcial3_2c || '';
            if (inputs[11]) inputs[11].value = nota.parcial4_2c || '';
            if (inputs[12]) inputs[12].value = nota.parcial5_2c || '';

            if (inputs[13]) inputs[13].value = nota.nota_valoracion_prel_2c || '';

            // 2. Inasistencias (Se dejan vacías, pero deben usarse los nombres correctos)
            if (inputs[7]) inputs[7].value = nota.inasistencias_1c || 0;
            if (inputs[15]) inputs[15].value = nota.inasistencias_2c || 0;

            // 3. Intensificación/Final (col. 19, 20, 21, 22 en HTML)
            if (inputs[16]) inputs[16].value = nota.intensificacion_1c_agosto || '';
            if (inputs[17]) inputs[17].value = nota.diciembre || ''; // Diciembre
            if (inputs[18]) inputs[18].value = nota.febrero || ''; // Febrero
            if (inputs[19]) inputs[19].value = nota.final || ''; // Final

            // 4. Se debe recalcular el final para que se actualicen las celdas de solo lectura (Finales de Cuatrimestre y TEA/TEP/TED)
            if (inputs[5]) actualizarCalificacionFinal();
        });

    } catch (error) {
        console.error("Falló la función para cargar notas existentes:", error);
    }
}


function guardarDatosEnServidor(materia, anioCurso, divisionCurso) { // <-- ¡MODIFICADO!
    const notasDeAlumnos = [];


    document.querySelectorAll("#tabla-estudiantes tr").forEach(fila => {
        const alumnoEmail = fila.dataset.email;
        const nombreAlumno = fila.querySelector('input[name="nombre"]').value.trim();
        if (alumnoEmail && nombreAlumno) {
            // Inputs de número (20 en total): 5p1c, 1vnum1c, 1c1c, 1i1c, 5p2c, 1vnum2c, 1c2c, 1i2c, 1int, 1dic, 1feb, 1final
            const inputs = Array.from(fila.querySelectorAll('input[type="number"]'));
            // Selects (2 en total): 1vp1c, 1vp2c
            const selects = Array.from(fila.querySelectorAll('select'));

            // Mapeo (Input number index):
            // [0-4] P1C, [5] VP1C-Num, [6] C1C-Final, [7] I1C, [8-12] P2C, [13] VP2C-Num, [14] C2C-Final, [15] I2C, [16] Int1C, [17] Dic, [18] Feb, [19] Final

            notasDeAlumnos.push({
                alumno_email: alumnoEmail,

                // PARCIALES 1C
                parcial1_1c: inputs[0]?.value || null,
                parcial2_1c: inputs[1]?.value || null,
                parcial3_1c: inputs[2]?.value || null,
                parcial4_1c: inputs[3]?.value || null,
                parcial5_1c: inputs[4]?.value || null,

                // VALORACIÓN PRELIMINAR 1C (SELECT y NUM)
                valoracion_prel_1c: selects[0]?.value || null,
                nota_valoracion_prel_1c: inputs[5]?.value || null,
                calificacion_1c: inputs[6]?.value || null,
                inasistencias_1c: inputs[7]?.value || 0,

                // PARCIALES 2C
                parcial1_2c: inputs[8]?.value || null,
                parcial2_2c: inputs[9]?.value || null,
                parcial3_2c: inputs[10]?.value || null,
                parcial4_2c: inputs[11]?.value || null,
                parcial5_2c: inputs[12]?.value || null,

                // VALORACIÓN PRELIMINAR 2C (SELECT y NUM)
                valoracion_prel_2c: selects[1]?.value || null,
                nota_valoracion_prel_2c: inputs[13]?.value || null,
                calificacion_2c: inputs[14]?.value || null,
                inasistencias_2c: inputs[15]?.value || 0,

                // INSTANCIAS FINALES
                intensificacion_1c_agosto: inputs[16]?.value || null,
                diciembre: inputs[17]?.value || null,
                febrero: inputs[18]?.value || null,
                final: inputs[19]?.value || null,
                observaciones: null,
            });
        }
    });

    fetch('../api/save_grades.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            grades: notasDeAlumnos,
            materia: materia,
            profesor_email: activeUser.email,
            profesor_nombre: activeUser.fullname, // <-- *** CAMPO VERIFICADO ***
            activeUserRole: activeUser.role,
            anioCurso: anioCurso, 
            divisionCurso: divisionCurso 
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                openAlertModalProfesor("Notas guardadas correctamente. Los alumnos verán sus calificaciones.");
                
            } else {
                openAlertModalProfesor(`Hubo un error al guardar en la Planilla: ${data.message}`);
            }
        })
        .catch(e => {
            openAlertModalProfesor("Error de conexión con el servidor al guardar notas.");
            console.error(e);
        });
}


// --- El resto de funciones (botones, navegación, logout, etc.) se mantienen igual ---

if (document.getElementById("calcularPromedioBtn")) {
    document.getElementById("calcularPromedioBtn").addEventListener("click", actualizarCalificacionFinal);
}

const guardarBtn = document.getElementById("guardarBtn");
const modificarBtn = document.getElementById("modificarBtn");
const notificarBtn = document.getElementById("notificarBtn");
const exportarBtn = document.getElementById("exportarBtn");
const boletin = document.getElementById("boletin");
const calcularPromedioBtn = document.getElementById("calcularPromedioBtn");

// --- Lógica de botones ---



if (modificarBtn) {
    modificarBtn.addEventListener("click", () => {
        document.querySelectorAll(".select-preview").forEach(span => {
            const select = document.createElement("select");
            select.innerHTML = span.dataset.options || "";
            select.className = "select-1";
            for (let opt of select.options) {
                if (opt.text === span.textContent) {
                    opt.selected = true;
                    break;
                }
            }
            span.replaceWith(select);
        });
        boletin.classList.remove("vista-previa");
        guardarBtn.style.display = "inline-block";
        modificarBtn.style.display = "none";
        notificarBtn.style.display = "none";
        exportarBtn.style.display = "none";
        aplicarValidaciones();

        // [CÓDIGO AÑADIDO/MODIFICADO]
        const materiaSelect = document.getElementById("materia-seleccionada");
        // Forzamos la recarga de alumnos y notas con la materia ya restaurada
        if (materiaSelect && materiaSelect.value !== "") {
            cargarAlumnos(); 
        }
    });
}

if (notificarBtn) {
    notificarBtn.addEventListener("click", () => {
        handleAuthClick();
    });
}

// Guardar
if (guardarBtn) {
    guardarBtn.addEventListener("click", () => {
        const materiaCompleta = getMateriaSeleccionada();

        let materiaLimpia = materiaCompleta;
        const match = materiaCompleta.match(/(.*)\s\((.*)\s(.*)\s-\s(.*)\)/);
        if (match) {
            materiaLimpia = match[1].trim();
        }

        // ****** INICIO DEL CÓDIGO CORREGIDO PARA CAPTURAR ASIGNACIÓN ******
        const asignacionSelect = document.getElementById("materia-seleccionada");
        const asignacionIndex = asignacionSelect.value;

        // **NUEVO CÓDIGO DE VALIDACIÓN RÁPIDA**
        if (asignacionIndex === "" || !profesorAsignaciones[asignacionIndex]) {
            openAlertModalProfesor("ADVERTENCIA: No se seleccionó una materia. Los cambios no se guardarán en la Planilla. Por favor, haga clic en 'Modificar' para seleccionar una materia.");
            return;
        }

        const asignacion = profesorAsignaciones[asignacionIndex];
        const anioCurso = asignacion.anio;
        const divisionCurso = asignacion.division;
        // ******************************************************************

        // Antes de pasar a vista previa, calculamos el promedio final
        actualizarCalificacionFinal();

        // El resto del código no cambia
        document.querySelectorAll("select").forEach(select => {
            const valor = getSelectText(select);
            const span = document.createElement("span");
            span.textContent = valor;
            span.className = "select-preview";
            span.dataset.options = select.innerHTML;
            select.replaceWith(span);
        });
        boletin.classList.add("vista-previa");

        guardarBtn.style.display = "none";
        modificarBtn.style.display = "inline-block";
        notificarBtn.style.display = "inline-block";
        exportarBtn.style.display = "inline-block";

        // ****** LLAMADA A LA FUNCIÓN CORREGIDA ******
        guardarDatosEnServidor(materiaLimpia, anioCurso, divisionCurso); // <-- ¡LLAMADA CON ARGUMENTOS!
    });
}


// --- Navegación con Enter (Mantenida) ---
function configurarNavegacion() {
    // Debe incluir los selects y inputs numéricos para la navegación fluida
    const inputsAndSelects = document.querySelectorAll("input[type='number'], input[type='text'], select");
    inputsAndSelects.forEach((input) => {
        input.removeEventListener("keydown", navegarConEnter);
        input.addEventListener("keydown", navegarConEnter);
    });
}
function navegarConEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const inputsAndSelects = document.querySelectorAll("input[type='number'], input[type='text'], select");
        const current = Array.from(inputsAndSelects).indexOf(event.target);
        // Saltamos 1 si es input, 2 si es select (para ir del select al input numérico o al siguiente campo)
        const step = event.target.tagName === 'SELECT' ? 2 : 1;
        const next = inputsAndSelects[current + step];
        if (next) next.focus();
    }
}

// --- Eliminar fila (Mantenida) ---
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-row")) {
        e.target.closest("tr").remove();
        actualizarOrden();
    }
});

// --- Bloquear botón atrás (Mantenida) ---
window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.go(-1);
    window.location.href = "principal.html";
};


function getMateriaSeleccionada() {
    const select = document.getElementById("materia-seleccionada");
    if (select && select.value !== "") {
        return select.options[select.selectedIndex]?.text || "";
    }
    const span = document.querySelector("#materia-seleccionada.select-preview");
    if (span) {
        return span.textContent;
    }

    return "";
}


// --- EXPORTAR A EXCEL (Mantenida con ajuste de campos) ---
function getSelectText(el) {
    if (!el) return "";
    if (el.tagName === "SELECT") {
        return el.options[el.selectedIndex]?.text || "";
    }
    return el.textContent || "";
}

if (exportarBtn) {
    exportarBtn.addEventListener("click", async () => {
        let ciclo = getSelectText(document.querySelector("#ciclo-lectivo-select, #ciclo-lectivo-select + .select-preview"));
        let materia = getMateriaSeleccionada();

        let materiaLimpia = materia;
        const match = materia.match(/(.*)\s\((.*)\s(.*)\s-\s(.*)\)/);
        if (match) {
            materiaLimpia = match[1].trim();
        }

        let profesor = document.querySelector("td:nth-child(3) input")?.value || "";
        let dni = document.querySelector("#dni")?.value || "";
        let anio = document.querySelector("#anio-select")?.value || "";
        let division = document.querySelector("#division-select")?.value || "";
        let turno = document.getElementById("turno-profesor")?.value || "";
        let preceptor = document.getElementById("preceptor-profesor")?.value || "";

        // Actualizar encabezados para reflejar la nueva estructura (22 columnas)
        let headerGeneral = ["CICLO LECTIVO", "MATERIA", "PROFESOR/A", "D.N.I", "AÑO", "DIVISIÓN", "TURNO", "PRECEPTOR/A"];
        let datosGenerales = [ciclo, materia, profesor, dni, anio, division, turno, preceptor];

        // Encabezados de 3 filas para la tabla de notas
        let header1 = ["N° DE ORDEN", "APELLIDOS Y NOMBRES DEL ESTUDIANTE", "", "1° CUATRIMESTRE", "", "", "", "", "", "2° CUATRIMESTRE", "", "", "", "", "", "PERÍODOS DE INTENSIFICACIÓN", "", "", "CALIFICACIÓN FINAL"];
        let header2 = ["", "", "CALIFICACIONES/VALORACIONES PARCIALES", "", "", "1º VALORACIÓN PRELIMINAR", "CALIFICACIÓN 1º CUATRIMESTRE", "INASISTENCIAS DEL 1º CUATRIMESTRE", "CALIFICACIONES/VALORACIONES PARCIALES", "", "", "2º VALORACIÓN PRELIMINAR", "CALIFICACIÓN 2º CUATRIMESTRE", "INASISTENCIAS DEL 2º CUATRIMESTRE", "", "INTENSIFICACIÓN 1º CUAT.", "DICIEMBRE", "FEBRERO", ""];
        let header3 = ["", "", "1", "2", "3", "4", "5", "", "", "", "1", "2", "3", "4", "5", "", "", "", "", "", "", ""];

        // Mapeo de valores de la tabla a las filas de datos
        let filasAlumnos = [];
        document.querySelectorAll(".tabla-3 tbody tr").forEach(tr => {
            let orden = tr.querySelector(".orden")?.textContent || "";
            // Seleccionamos TODOS los inputs/selects de la fila: 1 (nombre) + 5*2 (parciales) + 2*2 (VP Select/Num) + 2*1 (Final Cuat) + 2*1 (Inasistencias) + 3 (Int/Dic/Feb) + 1 (Final)
            let celdas = Array.from(tr.querySelectorAll('input, select'));

            // Extracción de valores de forma posicional
            let nombre = celdas[0]?.value || "";

            let p1 = celdas[1]?.value || ""; let p2 = celdas[2]?.value || ""; let p3 = celdas[3]?.value || ""; let p4 = celdas[4]?.value || ""; let p5 = celdas[5]?.value || "";
            let vp1_select = getSelectText(celdas[6]);
            let vp1_num = celdas[7]?.value || "";
            let c1c_final = celdas[8]?.value || "";
            let i1c_inasist = celdas[9]?.value || "";

            let p6 = celdas[10]?.value || ""; let p7 = celdas[11]?.value || ""; let p8 = celdas[12]?.value || ""; let p9 = celdas[13]?.value || ""; let p10 = celdas[14]?.value || "";
            let vp2_select = getSelectText(celdas[15]);
            let vp2_num = celdas[16]?.value || "";
            let c2c_final = celdas[17]?.value || "";
            let i2c_inasist = celdas[18]?.value || "";

            let int1c = celdas[19]?.value || "";
            let dic = celdas[20]?.value || "";
            let feb = celdas[21]?.value || "";
            let final = celdas[22]?.value || "";


            let fila = [
                orden,
                nombre,
                // 1º Cuatrimestre
                p1, p2, p3, p4, p5,
                `${vp1_select} (${vp1_num})`,
                c1c_final,
                i1c_inasist,
                // 2º Cuatrimestre
                p6, p7, p8, p9, p10,
                `${vp2_select} (${vp2_num})`,
                c2c_final,
                i2c_inasist,
                // Intensificación y Final
                int1c,
                dic,
                feb,
                final,
            ];
            filasAlumnos.push(fila);
        });

        let workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet("Planilla");

        // 1. Datos Generales
        worksheet.addRow(headerGeneral);
        worksheet.addRow(datosGenerales);
        worksheet.addRow([]);
        worksheet.addRow([]);

        // 2. Encabezados de Notas (combinando celdas)
        worksheet.addRow(header1);
        worksheet.addRow(header2);
        worksheet.addRow(header3);

        // Merge celdas de encabezado (Manual)
        worksheet.mergeCells('A5:A7'); // N° DE ORDEN
        worksheet.mergeCells('B5:B7'); // APELLIDOS Y NOMBRES
        worksheet.mergeCells('C5:J5'); // 1° CUATRIMESTRE
        worksheet.mergeCells('K5:R5'); // 2° CUATRIMESTRE
        worksheet.mergeCells('S5:U6'); // PERÍODOS DE INTENSIFICACIÓN
        worksheet.mergeCells('V5:V7'); // CALIFICACIÓN FINAL

        worksheet.mergeCells('C6:G6'); // CALIFICACIONES/VALORACIONES PARCIALES (1C)
        worksheet.mergeCells('K6:O6'); // CALIFICACIONES/VALORACIONES PARCIALES (2C)

        worksheet.mergeCells('H6:H7'); // 1º VP
        worksheet.mergeCells('I6:I7'); // C1C
        worksheet.mergeCells('J6:J7'); // I1C

        worksheet.mergeCells('P6:P7'); // 2º VP
        worksheet.mergeCells('Q6:Q7'); // C2C
        worksheet.mergeCells('R6:R7'); // I2C

        // Celdas individuales de la Fila 3 (columnas C-G y K-O) no se fusionan.

        // 3. Filas de Alumnos
        filasAlumnos.forEach(fila => worksheet.addRow(fila));

        // Estilos
        worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
            row.eachCell(function (cell) {
                cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            });
            if (rowNumber === 1 || rowNumber === 5) {
                row.eachCell(cell => { cell.font = { bold: true }; });
            }
        });

        worksheet.columns.forEach(column => { column.width = 15; }); // Ancho por defecto
        worksheet.getColumn(2).width = 35; // Ancho para Nombre

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: "application/octet-stream" }), `Planilla_Calificaciones_${materiaLimpia}.xlsx`);
    });
}


// --- Cálculo de Reporte (Ajustada para usar la función principal) ---
function calcularReporte() {
    let sumaNotasClase = 0;
    let cantidadAlumnosConNota = 0;
    let alumnosAprobados = 0;
    const notaAprobacion = 7;

    document.querySelectorAll("#tabla-estudiantes tr").forEach(tr => {
        // Ejecutamos la lógica de cálculo de la nota final para rellenar los campos

        const finalInput = tr.querySelector('.calificacion-final');

        let finalValue = parseFloat(finalInput.value) || 0;


        // Usamos la nota final CALCULADA O GUARDADA para el reporte
        let notaReporte = finalValue;

        if (notaReporte > 0) {
            sumaNotasClase += notaReporte;
            cantidadAlumnosConNota++;
            if (notaReporte >= notaAprobacion) {
                alumnosAprobados++;
            }
        }
    });

    if (cantidadAlumnosConNota > 0) {
        const promedioGeneral = sumaNotasClase / cantidadAlumnosConNota;
        const porcentajeAprobados = (alumnosAprobados / cantidadAlumnosConNota) * 100;
        document.getElementById("promedio-general").textContent = promedioGeneral.toFixed(2);
        document.getElementById("porcentaje-aprobados").textContent = porcentajeAprobados.toFixed(2) + "%";
    } else {
        document.getElementById("promedio-general").textContent = "-";
        document.getElementById("porcentaje-aprobados").textContent = "-";
    }
}
if (document.getElementById("calcularPromedioBtn")) {
    // El botón llama a actualizarCalificacionFinal, y esa función llama a calcularReporte
    document.getElementById("calcularPromedioBtn").addEventListener("click", actualizarCalificacionFinal);
}


// =================================================================
// LÓGICA DE LA API DE GOOGLE (Mantenida)
// =================================================================
const CLIENT_ID = '385519034733-oug8nbcd676633k9u8bfkfo6v0a2394k.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/gmail.send';

let tokenClient;

function gapiLoaded() {
    gapi.load('client', async () => {
        try {
            await gapi.client.init({
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
            });
        } catch (e) {
            console.error("Error initializing GAPI client", e);
        }
    });
}

function gisLoaded() {
    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: async (resp) => {
                if (resp.error) {
                    console.error("Error en la autorización:", resp);
                    alert("Hubo un error en la autorización con Google.");
                    throw (resp);
                }
                await enviarEmailDeAviso();
            },
        });
    } catch (e) {
        console.error("Error initializing GIS client", e);
    }
}

function handleAuthClick() {
    if (!tokenClient) {
        alert("La autenticación de Google no se ha cargado todavía. Por favor, espere un momento y vuelva a intentarlo.");
        return;
    }
    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

function encodeSubject(subject) {
    const encoded = btoa(unescape(encodeURIComponent(subject)));
    return `=?UTF-8?B?${encoded}?=`;
}

async function enviarEmailDeAviso() {
    const materia = getMateriaSeleccionada() || "la materia";
    const profesor = activeUser.fullname || "El Profesor/a";
    const emailDestino = "mvbenitezramirez@eest5.com";

    const asuntoOriginal = `Notificación de carga de notas: ${materia}`;
    const asuntoCodificado = encodeSubject(asuntoOriginal);

    const cuerpoMensaje = 'Hola,\r\n\r\n' +
        `Este es un aviso para informarle que el profesor/a ${profesor} ha cargado/actualizado las notas para ${materia}.\r\n\r\n` +
        'Saludos cordiales,\r\n' +
        'Sistema de Gestión E.E.S.T.N°5';

    const emailString = [`To: ${emailDestino}`, 'Content-Type: text/plain; charset=utf-8', 'MIME-Version: 1.0', `Subject: ${asuntoCodificado}`, '', cuerpoMensaje].join('\n');
    const base64EncodedEmail = btoa(emailString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    try {
        const response = await gapi.client.gmail.users.messages.send({ 'userId': 'me', 'resource': { 'raw': base64EncodedEmail } });
        console.log("Correo de notificación enviado exitosamente:", response);
        alert("¡Notificación enviada con éxito!");
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        alert("Hubo un error al enviar la notificación. Revisa la consola para más detalles.");
    }
}

// --- NUEVA FUNCIÓN: Establece el ciclo lectivo al año actual ---
function establecerCicloLectivoAutomatico() {
    const anioActual = new Date().getFullYear();
    const cicloSelect = document.getElementById("ciclo-lectivo-select");

    if (cicloSelect) {
        let anioExiste = false;
        for (let option of cicloSelect.options) {
            if (option.value == anioActual) {
                option.selected = true;
                anioExiste = true;
                break;
            }
        }
        if (!anioExiste) {
            const nuevaOpcion = new Option(anioActual, anioActual, true, true);
            cicloSelect.add(nuevaOpcion, cicloSelect.options[1]);
        }
    }
}
function logout() {
    sessionStorage.removeItem("activeUser");
    window.location.replace("principal.html");
}