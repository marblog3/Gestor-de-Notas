// --- VALIDACIÓN DE SESIÓN ---
const activeUserJSON = sessionStorage.getItem("activeUser");
if (!activeUserJSON) {
    window.location.href = "principal.html";
}
const activeUser = JSON.parse(activeUserJSON);

// --- MANEJO DE MODAL DE NOTIFICACIÓN ---
function openAlertModalProfesor(message) {
    document.getElementById('alertMessageProfesor').textContent = message;
    document.getElementById('alertModalProfesor').classList.add('show');
}

function closeAlertModalProfesor() {
    document.getElementById('alertModalProfesor').classList.remove('show');
}

//-- Cargar datos asignados al profesor (MODIFICADA para evitar paréntesis vacíos) ---//
async function cargarDatosAsignados() {
    try {
        // Usa el email del usuario activo para buscar sus datos, incluyendo curso_info
        const response = await fetch(`../api/get_user_by_email.php?email=${activeUser.email}`);
        const data = await response.json();

        // 1. Validar que la respuesta sea exitosa y contenga 'curso_info'
        if (data.success && data.user.curso_info) {
            
            // 2. Parsear el JSON del campo curso_info
            const asignaciones = JSON.parse(data.user.curso_info);
            const materiaSelect = document.getElementById("materia-seleccionada");
            const anioSelect = document.getElementById("anio-select");
            const divisionSelect = document.getElementById("division-select");

            materiaSelect.innerHTML = '<option value="">Seleccionar materia</option>';

            // 3. Iterar y llenar el select solo si es un array válido
            if (Array.isArray(asignaciones)) {
                asignaciones.forEach((asig, index) => {
                    
                    // --- CORRECCIÓN PARA EVITAR PARÉNTESIS VACÍOS ---
                    let suffix = '';
                    // Solo añade (Año División) si existe Año O División
                    if (asig.anio || asig.division) {
                        suffix = ` (${asig.anio || ''} ${asig.division || ''})`;
                    }
                    
                    const optionText = `${asig.materia}${suffix}`;
                    // --------------------------------------------------

                    // El value es el índice para recuperar la asignación al seleccionar
                    materiaSelect.innerHTML += `<option value="${index}">${optionText}</option>`;
                });
            }

            // 4. Configurar el evento 'change' para rellenar Año y División
            materiaSelect.addEventListener('change', (e) => {
                const selectedIndex = e.target.value;
                if (selectedIndex !== "") {
                    // Obtiene la asignación completa usando el índice (value)
                    const asignacionSeleccionada = asignaciones[selectedIndex];
                    anioSelect.value = asignacionSeleccionada.anio;
                    divisionSelect.value = asignacionSeleccionada.division;
                    cargarNotasExistentes(); // Cargar notas después de seleccionar
                } else {
                    anioSelect.value = "";
                    divisionSelect.value = "";
                }
            });
        }
    } catch (e) {
        console.error("Error al cargar las asignaciones del profesor:", e);
    }
}


function crearFilaEstudiante() {
    return `
    <tr>
        <td><span class="orden"></span></td>
        <td><input type="text" name="nombre" maxlength="35" class="nota"></td>
        ${Array(11).fill('<td><input type="number" min="1" max="10" class="nota" maxlength="2"></td>').join('')}
        <td class="final-container">
            <input type="number" min="1" max="10" class="nota" maxlength="2" readonly>
        </td>
        <td><input type="text" name="observaciones" class="nota"></td> </tr>`;
}

// --- Reordenar números de filas ---
function actualizarOrden() {
    document.querySelectorAll("#tabla-estudiantes tr").forEach((tr, index) => {
        const span = tr.querySelector(".orden");
        if (span) span.textContent = index + 1;
    });
}

// --- Validaciones (Mantenidas) ---
function aplicarValidaciones() {
    const dniInput = document.getElementById("dni");
    if (dniInput) {
        dniInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9.]/g, "");
            if (!/^\d{0,2}(\.\d{0,3}(\.\d{0,3})?)?$/.test(e.target.value)) {
                e.target.value = e.target.value.slice(0, -1);
            }
        });
    }

    document.querySelectorAll("input[type='text']").forEach(inp => {
        if (inp.id !== "dni") {
            inp.addEventListener("input", (e) => {
                e.target.value = e.target.value.replace(/[0-9]/g, "");
                if (e.target.value.length > 35) {
                    e.target.value = e.target.value.slice(0, 35);
                }
            });
        }
    });

    document.querySelectorAll(".tabla-3 input[type='number']").forEach(inp => {
        inp.addEventListener("keydown", (e) => {
            if (["Backspace", "Tab", "Enter", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
                return;
            }
            let nextVal = e.target.value + e.key;
            let num = parseInt(nextVal, 10);
            if (num < 1 || num > 10) {
                e.preventDefault();
            }
        });
    });
}


// --- Cargar Alumnos desde la DB ---
async function cargarAlumnos() {
    const tablaEstudiantes = document.getElementById('tabla-estudiantes');
    tablaEstudiantes.innerHTML = ''; // Limpiamos

    try {
        const response = await fetch('../api/get_users.php');
        const users = await response.json();
        
        // Filtra solo alumnos
        const alumnos = users.filter(u => u.role === "Alumno");

        if (alumnos.length > 0) {
            alumnos.forEach((alumno, index) => {
                const fila = document.createElement("tr");
                fila.dataset.email = alumno.email; 
                fila.innerHTML = `
                    <td><span class="orden">${index + 1}</span></td>
                    <td><input type="text" name="nombre" value="${alumno.fullname}" class="nota" disabled></td>
                    ${Array(11).fill('<td><input type="number" min="1" max="10" class="nota" maxlength="2"></td>').join('')}
                    <td class="final-container">
                        <input type="number" min="1" max="10" class="nota" maxlength="2" readonly>
                        <span class="remove-row">X</span>
                    </td>
                `;
                tablaEstudiantes.appendChild(fila);
            });
        } else {
            // Si no hay alumnos, crea filas vacías como fallback visual
            for (let i = 0; i < 12; i++) {
                tablaEstudiantes.insertAdjacentHTML("beforeend", crearFilaEstudiante());
            }
        }
    } catch (e) {
        console.error("Error al cargar alumnos desde la DB:", e);
    }
    
    actualizarOrden();
    configurarNavegacion();
    aplicarValidaciones();
    // La carga de notas se hace al seleccionar la materia en el evento 'change'
}


document.addEventListener('DOMContentLoaded', function () {
    const inputNombre = document.querySelector("td:nth-child(3) input");
    if (inputNombre) inputNombre.value = activeUser.fullname || "";
    const inputDni = document.getElementById("dni");
    if (inputDni) inputDni.value = activeUser.dni || "";

    establecerCicloLectivoAutomatico();
    cargarDatosAsignados(); // Carga las materias, años y divisiones asignadas
    cargarAlumnos();
});


// --- Carga de notas existentes ---
async function cargarNotasExistentes() {
    const materiaCompleta = getMateriaSeleccionada();
    
    // Extrae solo el nombre de la materia de la cadena "Materia (Año División)"
    let materiaLimpia = materiaCompleta;
    const match = materiaCompleta.match(/(.*)\s\((.*)\s(.*)\)/);
    if (match) {
        materiaLimpia = match[1].trim(); // Solo el nombre de la materia
    }

    if (!materiaLimpia || materiaLimpia === "Seleccionar materia") return;

    try {
        // Enviar la materia limpia al backend para buscar las notas
        const response = await fetch('../api/get_grades.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ materia: materiaLimpia })
        });

        if (!response.ok) {
            console.error("Error del servidor al cargar notas:", response.status, response.statusText);
            return;
        }

        const notas = await response.json();

        if (!Array.isArray(notas)) {
            console.error("La respuesta del servidor no es una lista de notas válida:", notas);
            return;
        }

        // Limpiar todas las notas existentes antes de cargar las nuevas
        document.querySelectorAll("#tabla-estudiantes tr").forEach(tr => {
            const inputs = tr.querySelectorAll('input[type="number"], input[type="text"]');
            inputs.forEach((input, index) => {
                // Limpia solo los campos numéricos de notas
                if (input.type === 'number' && index >= 1 && index <= 11) {
                    input.value = '';
                }
            });
        });


        // Cargar las notas recibidas
        document.querySelectorAll("#tabla-estudiantes tr").forEach(tr => {
            const alumnoEmail = tr.dataset.email;
            if (!alumnoEmail) return;

            const nota = notas.find(n => n.alumno_email === alumnoEmail);
            if (!nota) return;
            
            // Los índices de los inputs numéricos corresponden a las columnas de la tabla
            const inputs = tr.querySelectorAll('input[type="number"], input[type="text"]');
            
            // Asumiendo la estructura de 0:Nombre(text), 1-11:Notas(number), 12:Final(number), 13:Obs(text)
            
            // Nota 1° Cuatrimestre: index 3
            inputs[3].value = nota.nota_1Cuat || ''; 
            // Nota 2° Cuatrimestre: index 7
            inputs[7].value = nota.nota_2Cuat || '';
            // Intensificación 1° Cuat.: index 9
            inputs[9].value = nota.intensificacion || '';
            // Diciembre: index 10
            inputs[10].value = nota.diciembre || '';
            // Febrero: index 11
            inputs[11].value = nota.febrero || '';
            // Final: index 12
            inputs[12].value = nota.final || '';
            // Observaciones: index 13 (si es un input[type="text"])
            const inputObs = tr.querySelector('input[name="observaciones"]');
            if (inputObs) inputObs.value = nota.observaciones || '';
        });

    } catch (error) {
        console.error("Falló la función para cargar notas existentes:", error);
    }
}


// --- Botones ---
const guardarBtn = document.getElementById("guardarBtn");
const modificarBtn = document.getElementById("modificarBtn");
const notificarBtn = document.getElementById("notificarBtn");
const exportarBtn = document.getElementById("exportarBtn");
const boletin = document.getElementById("boletin");
const agregarFilaBtn = document.getElementById("agregarFilaBtn");
const calcularPromedioBtn = document.getElementById("calcularPromedioBtn");

// --- Lógica de botones ---

if(agregarFilaBtn) {
    agregarFilaBtn.addEventListener("click", () => {
        document.getElementById('tabla-estudiantes').insertAdjacentHTML("beforeend", crearFilaEstudiante());
        actualizarOrden();
        configurarNavegacion();
        aplicarValidaciones();
    });
}

if(modificarBtn) {
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
    });
}

if(notificarBtn) {
    notificarBtn.addEventListener("click", () => {
        handleAuthClick();
    });
}


// Lógica para guardar datos en el servidor 
function guardarDatosEnServidor(materia) {
    const notasDeAlumnos = [];
    document.querySelectorAll("#tabla-estudiantes tr").forEach(fila => {
        const alumnoEmail = fila.dataset.email;
        const nombreAlumno = fila.querySelector('input[name="nombre"]').value.trim();
        if (alumnoEmail && nombreAlumno) {
            const inputsNumericos = Array.from(fila.querySelectorAll('input[type="number"]'));
            const inputObservaciones = fila.querySelector('input[name="observaciones"]');

            notasDeAlumnos.push({
                alumno_email: alumnoEmail,
                // Mapear a los índices correctos del array de inputs numéricos
                // 1° Cuatrimestre: index 2
                nota_1Cuat: inputsNumericos[2]?.value || null,
                // 2° Cuatrimestre: index 6
                nota_2Cuat: inputsNumericos[6]?.value || null,
                // Intensificación 1° Cuat.: index 9
                intensificacion: inputsNumericos[9]?.value || null,
                // Diciembre: index 10
                diciembre: inputsNumericos[10]?.value || null,
                // Febrero: index 11
                febrero: inputsNumericos[11]?.value || null,
                // Final: index 12
                final: inputsNumericos[12]?.value || null,
                observaciones: inputObservaciones?.value || null,
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
            activeUserRole: activeUser.role
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            openAlertModalProfesor("Notas guardadas correctamente. Los alumnos verán sus calificaciones.");
            localStorage.setItem("notificacionAlumno", `¡El profesor de ${materia} cargó tus notas!`);
        } else {
            openAlertModalProfesor(`Hubo un error al guardar en la Planilla: ${data.message}`);
        }
    })
    .catch(e => {
        openAlertModalProfesor("Error de conexión con el servidor al guardar notas.");
        console.error(e);
    });
}


// Guardar
if (guardarBtn) {
    guardarBtn.addEventListener("click", () => {
        const materiaCompleta = getMateriaSeleccionada();
        
        // Extrae solo el nombre de la materia de la cadena "Materia (Año División)"
        let materiaLimpia = materiaCompleta;
        const match = materiaCompleta.match(/(.*)\s\((.*)\s(.*)\)/);
        if (match) {
            materiaLimpia = match[1].trim(); // Solo el nombre de la materia
        }

        if (!materiaLimpia || materiaLimpia === "Seleccionar materia") {
            openAlertModalProfesor("ADVERTENCIA: No se seleccionó una materia. Los cambios no se guardarán en la Planilla. Por favor, haga clic en 'Modificar' para seleccionar una materia.");
            return;
        }

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

        guardarDatosEnServidor(materiaLimpia);
    });
}


// --- Navegación con Enter (Mantenida) ---
function configurarNavegacion() {
    document.querySelectorAll("input[type='number'], input[type='text']").forEach((input) => {
        input.removeEventListener("keydown", navegarConEnter);
        input.addEventListener("keydown", navegarConEnter);
    });
}
function navegarConEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const inputs = document.querySelectorAll("input[type='number'], input[type='text']");
        const current = Array.from(inputs).indexOf(event.target);
        const next = inputs[current + 1];
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
    // Devuelve el texto completo de la opción seleccionada, ej: "Matemática (4to 4ta)"
    if (select && select.value !== "") {
        return select.options[select.selectedIndex].text;
    }
    // Si está en modo vista previa, busca el span
    const span = document.querySelector("#materia-seleccionada.select-preview");
    if (span) {
         return span.textContent;
    }

    return "";
}


// --- EXPORTAR A EXCEL ---
function getSelectText(el) {
    if (!el) return "";
    if (el.tagName === "SELECT") {
        return el.options[el.selectedIndex]?.text || "";
    }
    return el.textContent || "";
}

if(exportarBtn) {
    exportarBtn.addEventListener("click", async () => {
        let ciclo = getSelectText(document.querySelector("td:nth-child(1) select, td:nth-child(1) .select-preview"));
        let materia = getMateriaSeleccionada();
        
        // Limpiar materia para el título del archivo
        let materiaLimpia = materia;
        const match = materia.match(/(.*)\s\((.*)\s(.*)\)/);
        if (match) {
            materiaLimpia = match[1].trim(); 
        }

        let profesor = document.querySelector("td:nth-child(3) input")?.value || "";
        let dni = document.querySelector("#dni")?.value || "";
        let anio = getSelectText(document.querySelector("tr:nth-child(2) td:nth-child(1) select, tr:nth-child(2) td:nth-child(1) .select-preview"));
        let division = getSelectText(document.querySelector("tr:nth-child(2) td:nth-child(2) select, tr:nth-child(2) td:nth-child(2) .select-preview"));
        let turno = getSelectText(document.querySelector("tr:nth-child(2) td:nth-child(3) select, tr:nth-child(2) td:nth-child(3) .select-preview"));
        let preceptor = document.querySelector("tr:nth-child(2) td:nth-child(4) input")?.value || "";

        let headerGeneral = ["CICLO LECTIVO", "MATERIA", "PROFESOR/A", "D.N.I", "AÑO", "DIVISIÓN", "TURNO", "PRECEPTOR/A"];
        let datosGenerales = [ciclo, materia, profesor, dni, anio, division, turno, preceptor];
        let headerAlumnos = ["N° DE ORDEN", "APELLIDOS Y NOMBRES DEL ESTUDIANTE", "CALIFICACIONES/VALORACIONES PARCIALES (1ºC)", "1º VALORACIÓN PRELIMINAR", "CALIFICACIÓN 1º CUATRIMESTRE", "INASISTENCIAS 1ºC", "CALIFICACIONES/VALORACIONES PARCIALES (2ºC)", "2º VALORACIÓN PRELIMINAR", "CALIFICACIÓN 2º CUATRIMESTRE", "INTENSIFICACIÓN 1ºC", "INASISTENCIAS 2ºC", "DICIEMBRE", "FEBRERO", "CALIFICACIÓN FINAL", "OBSERVACIONES"];

        let filasAlumnos = [];
        document.querySelectorAll(".tabla-3 tbody tr").forEach(tr => {
            let orden = tr.querySelector(".orden")?.textContent || "";
            let celdas = tr.querySelectorAll("input");
            
            // Mapeo manual de las 14 columnas de la tabla (incluyendo las 11 notas numéricas)
            let fila = [
                orden, 
                celdas[0]?.value, // Nombre
                celdas[1]?.value, // C/V Parciales (1ºC)
                celdas[2]?.value, // 1º VP
                celdas[3]?.value, // Calificación 1º C
                celdas[4]?.value, // Inasistencias 1ºC
                celdas[5]?.value, // C/V Parciales (2ºC)
                celdas[6]?.value, // 2º VP
                celdas[7]?.value, // Calificación 2º C
                celdas[8]?.value, // Intensificación 1ºC
                celdas[9]?.value, // Inasistencias 2ºC
                celdas[10]?.value, // Diciembre
                celdas[11]?.value, // Febrero
                celdas[12]?.value || "", // Calificación Final
                celdas[13]?.value || ""  // Observaciones
            ];
            filasAlumnos.push(fila);
        });

        let workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet("Planilla");

        worksheet.addRow(headerGeneral);
        worksheet.addRow(datosGenerales);
        worksheet.addRow([]);
        worksheet.addRow([]);
        worksheet.addRow(headerAlumnos);
        filasAlumnos.forEach(fila => worksheet.addRow(fila));

        worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
            row.eachCell(function (cell) {
                cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            });
            if (rowNumber === 1 || rowNumber === 5) {
                row.eachCell(cell => { cell.font = { bold: true }; });
            }
        });

        worksheet.columns.forEach(column => { column.width = 30; });
        worksheet.getColumn(2).width = 35;

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: "application/octet-stream" }), `Planilla_Calificaciones_${materiaLimpia}.xlsx`);
    });
}


// --- Cálculo de Reporte ---
function calcularReporte() {
    let sumaNotasClase = 0;
    let cantidadAlumnosConNota = 0;
    let alumnosAprobados = 0;
    const notaAprobacion = 7;

    document.querySelectorAll("#tabla-estudiantes tr").forEach(tr => {
        const inputs = tr.querySelectorAll('input[type="number"]');
        // Usamos los índices de Calificación 1º y 2º Cuatrimestre
        const nota1erCuatri = inputs[3]; // Índice 3
        const nota2doCuatri = inputs[7]; // Índice 7
        const inputFinal = inputs[inputs.length - 1];

        const val1 = parseFloat(nota1erCuatri.value);
        const val2 = parseFloat(nota2doCuatri.value);

        if (!isNaN(val1) && !isNaN(val2)) {
            const promedio = (val1 + val2) / 2;
            inputFinal.value = promedio.toFixed(2);
            sumaNotasClase += promedio;
            cantidadAlumnosConNota++;
            if (promedio >= notaAprobacion) {
                alumnosAprobados++;
            }
        } else {
             inputFinal.value = '';
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
if (calcularPromedioBtn) {
    calcularPromedioBtn.addEventListener("click", calcularReporte);
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
    } catch(e) {
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
        // Busca si el año actual ya existe como opción
        let anioExiste = false;
        for (let option of cicloSelect.options) {
            if (option.value == anioActual) {
                option.selected = true;
                anioExiste = true;
                break;
            }
        }
        // Si no existe, lo crea y lo selecciona
        if (!anioExiste) {
            const nuevaOpcion = new Option(anioActual, anioActual, true, true);
            cicloSelect.add(nuevaOpcion, cicloSelect.options[1]); // Lo añade después de "Seleccionar ciclo"
        }
    }
}