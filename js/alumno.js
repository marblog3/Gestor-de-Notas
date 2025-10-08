
// Verifica si hay sesión activa al cargar la página
const activeUser = sessionStorage.getItem("activeUser");
if (!activeUser) {
    // Si no hay sesión activa → redirige al login
    window.location.href = "principal.html";
}


window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.go(1);
    window.location.href = "principal.html";
};

// Función de cierre de sesión
function logout() {
    sessionStorage.removeItem("activeUser"); // Elimina la sesión activa
    window.location.replace("principal.html");   // Redirige y reemplaza historial
}


// ------------ SCRIPT DE EXPORTACIÓN A EXCEL ------------
const exportarBtn = document.getElementById("exportarBtn");

async function exportarAExcel() {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Boletín Alumno");

        let datosGenerales = [];
        document.querySelectorAll("#tabla-datos-generales input").forEach(inp => {
            datosGenerales.push(inp.value || "");
        });
        worksheet.addRow(["CICLO LECTIVO", "ESTUDIANTE", "DNI", "ESPECIALIDAD", "AÑO", "DIVISIÓN", "TURNO", "PRECEPTOR/A"]);
        worksheet.addRow(datosGenerales);
        worksheet.addRow([]);

        const headerMaterias = ["MATERIA", "AÑO", "1° CUATRIMESTRE", "2° CUATRIMESTRE", "INTENSIFICACIÓN 1° CUAT.", "DICIEMBRE", "FEBRERO", "CALIFICACIÓN FINAL", "OBSERVACIONES"];
        const headerPendientes = ["MATERIA", "AÑO", "CICLO LECTIVO DEL CURSADO", "MARZO", "JUNIO", "JULIO", "AGOSTO", "DICIEMBRE", "FEBRERO", "CALIFICACIÓN FINAL", "MODELO DE INT.", "OBSERVACIONES"];

        const tablaMaterias = document.getElementById('tabla-materias');
        const filasMaterias = [];
        tablaMaterias.querySelectorAll("tbody tr").forEach(tr => {
            const fila = [];
            tr.querySelectorAll("input").forEach(input => {
                fila.push(input.value || "");
            });
            filasMaterias.push(fila);
        });
        worksheet.addRow([]);
        worksheet.addRow(headerMaterias);
        filasMaterias.forEach(fila => worksheet.addRow(fila));

        const tablaPendientes = document.getElementById('tabla-pendientes');
        const filasPendientes = [];
        tablaPendientes.querySelectorAll("tbody tr").forEach(tr => {
            const fila = [];
            tr.querySelectorAll("input").forEach(input => {
                fila.push(input.value || "");
            });
            filasPendientes.push(fila);
        });
        worksheet.addRow([]);
        worksheet.addRow([]);
        worksheet.addRow(headerPendientes);
        filasPendientes.forEach(fila => worksheet.addRow(fila));

        worksheet.eachRow({ includeEmpty: true }, function (row) {
            row.eachCell({ includeEmpty: true }, function (cell) {
                cell.border = {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            });
        });

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(2).font = { bold: true };
        worksheet.getRow(5).font = { bold: true };
        worksheet.getRow(6 + filasMaterias.length + 2).font = { bold: true };

        worksheet.addRow([]);
        worksheet.addRow([]);

        const obsHeaderRow = worksheet.addRow(['OBSERVACIONES']);
        worksheet.mergeCells(`A${obsHeaderRow.number}:E${obsHeaderRow.number}`);
        const headerCell = worksheet.getCell(`A${obsHeaderRow.number}`);
        headerCell.font = { bold: true };
        headerCell.alignment = { vertical: 'middle', horizontal: 'center' };
        headerCell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        const obsInputs = document.querySelectorAll(".obs-3");
        const obsValues = Array.from(obsInputs)
            .map(input => input.value.trim())
            .filter(text => text.length > 0);

        obsValues.forEach(textoDeInput => {
            const contentRow = worksheet.addRow([textoDeInput]);
            worksheet.mergeCells(`A${contentRow.number}:E${contentRow.number}`);

            const contentCell = worksheet.getCell(`A${contentRow.number}`);
            contentCell.alignment = {
                vertical: 'middle',
                horizontal: 'left',
                wrapText: true
            };
            contentCell.border = {
                top: { style: 'thin' }, left: { style: 'thin' },
                bottom: { style: 'thin' }, right: { style: 'thin' }
            };
        });

        const filasConTexto = obsValues.length;
        const filasMinimas = 6;
        if (filasConTexto < filasMinimas) {
            const filasAAgregar = filasMinimas - filasConTexto;
            for (let i = 0; i < filasAAgregar; i++) {
                const emptyRow = worksheet.addRow(['']);
                worksheet.mergeCells(`A${emptyRow.number}:E${emptyRow.number}`);

                const emptyCell = worksheet.getCell(`A${emptyRow.number}`);
                emptyCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                emptyCell.border = {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                };
            }
        }

        worksheet.columns.forEach(column => { column.width = 20; });
        worksheet.getColumn(1).width = 30;
        worksheet.getColumn(9).width = 40;
        worksheet.getColumn(12).width = 40;

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Boletin_Alumno.xlsx");

    } catch (error) {
        console.error("Error al exportar a Excel:", error);
        alert("Hubo un error al generar el archivo de Excel. Revisa la consola para más detalles.");
    }
}
exportarBtn.addEventListener("click", exportarAExcel);

// ------------ SCRIPT PARA NOTIFICACIONES ------------
document.addEventListener("DOMContentLoaded", () => {
    const notiIcon = document.getElementById("notification-icon");
    if (!notiIcon) return; // Si no encuentra el icono, no hace nada

    const notiWrapper = notiIcon.querySelector(".icon-wrapper");
    const notiDot = notiIcon.querySelector(".notification-dot");
    const notiPanel = notiIcon.querySelector(".notification-panel");
    const notiList = document.getElementById("notification-list");

    const notiMessage = localStorage.getItem("notificacionAlumno");

    // 1. Revisa si existe una notificación al cargar la página
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

    // 2. Evento para abrir/cerrar el panel al hacer clic en la campana
    notiWrapper.addEventListener("click", (event) => {
        event.stopPropagation();
        notiPanel.classList.toggle("show");

        if (notiDot.classList.contains("show")) {
            notiDot.classList.remove("show");
            localStorage.removeItem("notificacionAlumno");
        }
    });

    // 3. Evento para cerrar el panel al hacer clic fuera
    document.addEventListener("click", (event) => {
        if (!notiIcon.contains(event.target)) {
            notiPanel.classList.remove("show");
        }
    });
});

