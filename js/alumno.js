
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
document.addEventListener("DOMContentLoaded", () => {
    // ... (El código de la notificación que ya tienes) ...

    // --- FUNCIÓN NUEVA: Cargar las notas del alumno ---
    function cargarNotasDelAlumno() {
        const activeUserData = JSON.parse(sessionStorage.getItem("activeUser"));
        if (!activeUserData || !activeUserData.email) return;

        const alumnoEmail = activeUserData.email;
        const alumnoData = JSON.parse(localStorage.getItem(alumnoEmail));
        
        if (!alumnoData || !alumnoData.curso) {
            console.log("Este alumno no tiene un curso asignado.");
            return;
        }

        const curso = alumnoData.curso;
        const tablaMateriasBody = document.querySelector("#tabla-materias tbody");
        tablaMateriasBody.innerHTML = ''; // Limpiamos la tabla antes de llenarla

        // Recorremos todo localStorage en busca de planillas de notas
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            // Verificamos si es una clave de notas y si pertenece al curso del alumno
            if (key.startsWith('notas_') && key.includes(`${curso.anio}-${curso.division}-${curso.especialidad}`)) {
                const materia = key.split('_').pop(); // Extraemos el nombre de la materia de la clave
                const notasData = JSON.parse(localStorage.getItem(key));

                // Buscamos las notas específicas de este alumno
                const misNotas = notasData[alumnoEmail];
                
                if (misNotas) {
                    // Creamos una nueva fila en la tabla de materias del alumno
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td><input type="text" class="mate1" value="${materia}" readonly></td>
                        <td><input type="number" class="mate1" value="${curso.anio}" readonly></td>
                        <td><input type="number" class="mate1" value="${misNotas.c1 || ''}" readonly></td>
                        <td><input type="number" class="mate1" value="${misNotas.c2 || ''}" readonly></td>
                        <td><input type="number" class="mate1" readonly></td> <td><input type="number" class="mate1" readonly></td> <td><input type="number" class="mate1" readonly></td> <td><input type="number" class="mate1" value="${misNotas.final || ''}" readonly></td>
                        <td><input type="text" class="mate1" readonly></td> `;
                    tablaMateriasBody.appendChild(fila);
                }
            }
        }
    }
    
    // Llamamos a la función al cargar la página
    cargarNotasDelAlumno();
});
document.addEventListener("DOMContentLoaded", () => {
    const activeUser = JSON.parse(sessionStorage.getItem("activeUser"));

    if (activeUser) {
        const tabla = document.querySelector("#tabla-datos-generales");

        if (tabla) {
            // Nombre
            const inputNombre = tabla.querySelector("td:nth-child(2) input");
            if (inputNombre) inputNombre.value = activeUser.fullname || "";

            // DNI
            const inputDni = tabla.querySelector("td:nth-child(3) input");
            if (inputDni) inputDni.value = activeUser.dni || "";
        }
    }
});


// CARGAR NOTAS DEL PROFESOR EN LOS INPUTS EXISTENTES DEL ALUMNO//
document.addEventListener("DOMContentLoaded", () => {
    const alumnoData = JSON.parse(sessionStorage.getItem("activeUser"));
    if (!alumnoData) return;

    const notasGuardadas = JSON.parse(localStorage.getItem("notasRegistradas")) || [];

    // Filtramos notas para el alumno actual (primero por DNI si existe, si no por fullname)
    const notasDelAlumno = notasGuardadas.filter(n => {
        if (alumnoData.dni && n.dni) return n.dni.toString() === alumnoData.dni.toString();
        return n.alumno && alumnoData.fullname && n.alumno.toLowerCase().trim() === alumnoData.fullname.toLowerCase().trim();
    });

    if (notasDelAlumno.length === 0) return;

    const tabla = document.getElementById("tabla-materias");
    if (!tabla) return;
    const tbody = tabla.querySelector("tbody") || tabla;

    // Helper: clonar una fila existente para agregar más si hace falta
    function clonarFilaTemplate() {
        const primeraFila = tbody.querySelector("tr");
        if (!primeraFila) {
            // crear una fila mínima si no hay plantillas (9 inputs)
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><input type="text" class="mate1"></td>
                <td><input type="number" min="1" max="9999" class="mate1"></td>
                <td><input type="number" min="1" max="10" class="mate1"></td>
                <td><input type="number" min="1" max="10" class="mate1"></td>
                <td><input type="number" min="1" max="10" class="mate1"></td>
                <td><input type="number" min="1" max="10" class="mate1"></td>
                <td><input type="number" min="1" max="10" class="mate1"></td>
                <td><input type="number" min="1" max="10" class="mate1"></td>
                <td><input type="text" class="mate1"></td>
            `;
            tbody.appendChild(tr);
            return tr;
        } else {
            const nuevo = primeraFila.cloneNode(true);
            // limpiar inputs
            nuevo.querySelectorAll("input").forEach(i => i.value = "");
            tbody.appendChild(nuevo);
            return nuevo;
        }
    }

    // Recorremos las notas y las ubicamos en la tabla del alumno
    notasDelAlumno.forEach(nota => {
        // 1) buscar fila con la misma materia (ignorando mayúsculas)
        let fila = Array.from(tbody.querySelectorAll("tr")).find(tr => {
            const inMat = tr.querySelector("td:nth-child(1) input");
            return inMat && inMat.value.trim().toLowerCase() === (nota.materia || "").toLowerCase().trim();
        });

        // 2) si no existe, buscar primera fila vacía en materia
        if (!fila) {
            fila = Array.from(tbody.querySelectorAll("tr")).find(tr => {
                const inMat = tr.querySelector("td:nth-child(1) input");
                return inMat && inMat.value.trim() === "";
            });
        }

        // 3) si tampoco hay filas vacías, clonamos una fila nueva
        if (!fila) fila = clonarFilaTemplate();

        const inputs = Array.from(fila.querySelectorAll("input"));

        // Asegurarnos que la fila tenga al menos 9 inputs (si no, adaptamos)
        while (inputs.length < 9) {
            const td = document.createElement("td");
            const inp = document.createElement("input");
            inp.type = "text";
            td.appendChild(inp);
            fila.appendChild(td);
            inputs.push(inp);
        }

        // Asignación respetando el orden: 
        // [0] materia | [1] año | [2] 1° | [3] 2° | [4] intensificacion 1°Cuat | [5] diciembre | [6] febrero | [7] calificacion final | [8] observaciones
        inputs[0].value = nota.materia || inputs[0].value || "";
        inputs[1].value = (nota.year || (new Date()).getFullYear()) || inputs[1].value || "";
        inputs[2].value = nota.nota_1Cuat || inputs[2].value || "";
        inputs[3].value = nota.nota_2Cuat || inputs[3].value || "";
        inputs[4].value = nota.intensificacion || inputs[4].value || "";
        inputs[5].value = nota.diciembre || inputs[5].value || "";
        inputs[6].value = nota.febrero || inputs[6].value || "";
        inputs[7].value = nota.final || inputs[7].value || "";
        inputs[8].value = nota.observaciones || (`Profesor: ${nota.profesor || ""}`) || inputs[8].value || "";

        // Opcional: bloquear edición de las notas para el alumno (si querés que no pueda editarlas)
        // inputs.slice(0,9).forEach(i => i.disabled = true);
    });
});
