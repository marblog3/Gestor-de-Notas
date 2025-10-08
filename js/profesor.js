


// --- VALIDACIÓN DE SESIÓN ---
const activeUser = sessionStorage.getItem("activeUser");
if (!activeUser) {
    window.location.href = "principal.html";
}


function crearFilaEstudiante() {
    return `
    <tr>
        <td><span class="orden"></span></td>
        <td><input type="text" name="nombre" maxlength="35" class="nota"></td>
        ${Array(11).fill('<td><input type="number" min="1" max="10" class="nota" maxlength="2"></td>').join('')}
        <td class="final-container">
            <input type="number" min="1" max="10" class="nota" maxlength="2" readonly>
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

// --- Validaciones ---
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

// --- Inicializar ---
document.addEventListener('DOMContentLoaded', function () {
    const tablaEstudiantes = document.getElementById('tabla-estudiantes');
    for (let i = 0; i < 12; i++) {
        tablaEstudiantes.insertAdjacentHTML("beforeend", crearFilaEstudiante());
    }
    actualizarOrden();
    configurarNavegacion();
    aplicarValidaciones();
});

// --- Botones ---
const guardarBtn = document.getElementById("guardarBtn");
const modificarBtn = document.getElementById("modificarBtn");
const boletin = document.getElementById("boletin");
const agregarFilaBtn = document.getElementById("agregarFilaBtn");
const calcularPromedioBtn = document.getElementById("calcularPromedioBtn");

// Agregar fila
agregarFilaBtn.addEventListener("click", () => {
    const tablaEstudiantes = document.getElementById('tabla-estudiantes');
    tablaEstudiantes.insertAdjacentHTML("beforeend", crearFilaEstudiante());
    actualizarOrden();
    configurarNavegacion();
    aplicarValidaciones();
});

// Modificar
modificarBtn.addEventListener("click", () => {
    document.querySelectorAll(".select-preview").forEach(span => {
        const valor = span.textContent;
        const select = document.createElement("select");
        select.innerHTML = span.dataset.options || "";
        for (let opt of select.options) {
            if (opt.text === valor) {
                opt.selected = true;
                break;
            }
        }
        span.replaceWith(select);
    });
    boletin.classList.remove("vista-previa");
    guardarBtn.style.display = "inline-block";
    modificarBtn.style.display = "none";
    exportarBtn.style.display = "inline-block";
    aplicarValidaciones();
});

// --- Navegación con Enter ---
function configurarNavegacion() {
    const inputsNotas = document.querySelectorAll("input[type='number'], input[type='text']");
    inputsNotas.forEach((input) => {
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

// --- Eliminar fila ---
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-row")) {
        e.target.closest("tr").remove();
        actualizarOrden();
    }
});

// --- Bloquear botón atrás ---
window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.go(-1);
    window.location.href = "principal.html";
};

// --- Selección de materia ---
document.querySelectorAll(".menu-materia a[data-materia]").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const materia = e.target.dataset.materia;
        document.getElementById("materia-seleccionada").textContent = materia;
    });
});

document.querySelectorAll(".menu-materia a[data-materia]").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const materia = e.target.dataset.materia;
        const spanMateria = document.getElementById("materia-seleccionada");
        spanMateria.textContent = materia;
        document.getElementById("menu-materia").style.display = "none";
    });
});

function getMateriaSeleccionada() {
    return document.getElementById("materia-seleccionada").textContent || "";
}






const exportarBtn = document.getElementById("exportarBtn");

function getSelectText(el) {
    if (!el) return "";
    if (el.tagName === "SELECT") {
        return el.options[el.selectedIndex]?.text || "";
    }
    return el.textContent || "";
}

exportarBtn.addEventListener("click", async () => {
    let ciclo = getSelectText(document.querySelector("td:nth-child(1) select, td:nth-child(1) .select-preview"));
    let materia = getMateriaSeleccionada();
    let profesor = document.querySelector("td:nth-child(3) input")?.value || "";
    let dni = document.querySelector("#dni")?.value || "";
    let anio = getSelectText(document.querySelector("tr:nth-child(2) td:nth-child(1) select, tr:nth-child(2) td:nth-child(1) .select-preview"));
    let division = getSelectText(document.querySelector("tr:nth-child(2) td:nth-child(2) select, tr:nth-child(2) td:nth-child(2) .select-preview"));
    let turno = getSelectText(document.querySelector("tr:nth-child(2) td:nth-child(3) select, tr:nth-child(2) td:nth-child(3) .select-preview"));
    let preceptor = document.querySelector("tr:nth-child(2) td:nth-child(4) input")?.value || "";

    // Encabezados generales
    let headerGeneral = [
        "CICLO LECTIVO", "MATERIA", "PROFESOR/A", "D.N.I",
        "AÑO", "DIVISIÓN", "TURNO", "PRECEPTOR/A"
    ];
    let datosGenerales = [
        ciclo, materia, profesor, dni, anio, division, turno, preceptor
    ];

    // Encabezados de alumnos
    let headerAlumnos = [
        "N° DE ORDEN",
        "APELLIDOS Y NOMBRES DEL ESTUDIANTE",
        "CALIFICACIONES/VALORACIONES PARCIALES (1ºC)",
        "1º VALORACIÓN PRELIMINAR",
        "CALIFICACIÓN 1º CUATRIMESTRE",
        "INASISTENCIAS 1ºC",
        "CALIFICACIONES/VALORACIONES PARCIALES (2ºC)",
        "2º VALORACIÓN PRELIMINAR",
        "CALIFICACIÓN 2º CUATRIMESTRE",
        "INASISTENCIAS 2ºC",
        "INTENSIFICACIÓN 1ºC",
        "DICIEMBRE",
        "FEBRERO",
        "CALIFICACIÓN FINAL"
    ];

    // Datos de alumnos
    let filasAlumnos = [];
    document.querySelectorAll(".tabla-3 tbody tr").forEach(tr => {
        let orden = tr.querySelector(".orden")?.textContent || "";
        let celdas = tr.querySelectorAll("input");
        let fila = [
            orden,
            celdas[0]?.value || "",
            celdas[1]?.value || "",
            celdas[2]?.value || "",
            celdas[3]?.value || "",
            celdas[4]?.value || "",
            celdas[5]?.value || "",
            celdas[6]?.value || "",
            celdas[7]?.value || "",
            celdas[8]?.value || "",
            celdas[9]?.value || "",
            celdas[10]?.value || "",
            celdas[11]?.value || "",
            celdas[12]?.value || ""
        ];
        filasAlumnos.push(fila);
    });

    // Crear workbook
    let workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet("Planilla");

    worksheet.addRow(headerGeneral);
    worksheet.addRow(datosGenerales);
    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow(headerAlumnos);
    filasAlumnos.forEach(fila => worksheet.addRow(fila));

    // Estilos
    worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
        row.eachCell(function (cell) {
            cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
        });
        if (rowNumber === 1 || rowNumber === 5) {
            row.eachCell(cell => { cell.font = { bold: true }; });
        }
    });

    worksheet.columns.forEach(column => { column.width = 30; });
    worksheet.getColumn(2).width = 35;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(8).width = 30;

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), "Planilla_Calificaciones.xlsx");
});

// --- FUNCIÓN DE CÁLCULO DE REPORTE---
function calcularReporte() {
    let sumaNotasClase = 0;
    let cantidadAlumnosConNota = 0;
    let alumnosAprobados = 0;
    const notaAprobacion = 7; // Se considera aprobado con 7 o más

    document.querySelectorAll("#tabla-estudiantes tr").forEach(tr => {
        const inputs = tr.querySelectorAll('input[type="number"]');

        // Las posiciones de las notas según la estructura de la tabla:
        const nota1erCuatri = inputs[2]; // CALIFICACIÓN 1º CUATRIMESTRE
        const nota2doCuatri = inputs[6]; // CALIFICACIÓN 2º CUATRIMESTRE
        const inputFinal = inputs[inputs.length - 1]; // CALIFICACIÓN FINAL

        const val1 = parseFloat(nota1erCuatri.value);
        const val2 = parseFloat(nota2doCuatri.value);

        // Si ambas notas son números válidos, calcula el promedio del alumno
        if (!isNaN(val1) && !isNaN(val2)) {
            const promedio = (val1 + val2) / 2;
            // Muestra el promedio en el campo de calificación final
            inputFinal.value = promedio.toFixed(2);

            // Suma para el reporte general
            sumaNotasClase += promedio;
            cantidadAlumnosConNota++;

            // Cuenta si el alumno aprobó
            if (promedio >= notaAprobacion) {
                alumnosAprobados++;
            }
        }
    });

    // Actualiza el cuadro de reporte general
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

// Asigna la función restaurada al botón
if (calcularPromedioBtn) {
    calcularPromedioBtn.addEventListener("click", calcularReporte);
}



// =================================================================
// LÓGICA DE LA API DE GOOGLE 
// =================================================================
const CLIENT_ID = '385519034733-oug8nbcd676633k9u8bfkfo6v0a2394k.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/gmail.send';

let tokenClient;
let gapiInited = false;
let gisInited = false;

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
    });
    gapiInited = true;
    checkAuthButton();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '',
    });
    gisInited = true;
    checkAuthButton();
}

function checkAuthButton() {
    if (gapiInited && gisInited) {
        document.getElementById('guardarBtn').disabled = false;
    }
}

document.getElementById("guardarBtn").addEventListener("click", handleAuthClick);

function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            console.error("Error en la autorización:", resp);
            alert("Hubo un error en la autorización con Google.");
            throw (resp);
        }
        await enviarEmailDeAviso();
        ejecutarLogicaOriginalDeGuardado();
    };

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
    const profesor = document.querySelector("td:nth-child(3) input")?.value || "El Profesor/a";
    const emailDestino = "mvbenitezramirez@eest5.com";

    const asuntoOriginal = `Notificación de carga de notas: ${materia}`;
    const asuntoCodificado = encodeSubject(asuntoOriginal);

    const cuerpoMensaje = 'Hola,\r\n\r\n' +
        `Este es un aviso para informarle que el profesor/a ${profesor} ha cargado/actualizado las notas para ${materia}.\r\n\r\n` +
        'Saludos cordiales,\r\n' +
        'Sistema de Gestión E.E.S.T.N°5';

    const emailString = [
        `To: ${emailDestino}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${asuntoCodificado}`,
        '',
        cuerpoMensaje
    ].join('\n');

    const base64EncodedEmail = btoa(emailString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    try {
        const response = await gapi.client.gmail.users.messages.send({
            'userId': 'me',
            'resource': {
                'raw': base64EncodedEmail
            }
        });
        console.log("Correo de notificación enviado exitosamente:", response);
        alert("¡Notificación enviada con éxito!");

    } catch (error) {
        console.error("Error al enviar el correo:", error);
        alert("Hubo un error al enviar la notificación. Revisa la consola para más detalles.");
    }
}

function ejecutarLogicaOriginalDeGuardado() {
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
    exportarBtn.style.display = "inline-block";

    localStorage.setItem("notificacionAlumno", "¡El profesor cargó tus notas!");


}



guardarBtn.addEventListener("click", () => {

    // Guardar notas (lo que ya tienes)

    boletin.classList.add("vista-previa");



    //  Crear una notificación en localStorage

    localStorage.setItem("notificacionAlumno", "¡El profesor cargó tus notas!");

});




