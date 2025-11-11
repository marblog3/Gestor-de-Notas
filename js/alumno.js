// --- VERIFICACIÓN DE SESIÓN Y ROL ---
const reviewingEmail = sessionStorage.getItem("reviewingUserEmail");
const reviewerRole = sessionStorage.getItem("reviewerRole");
const activeUserJSON = sessionStorage.getItem("activeUser");

let targetUserEmail = activeUserJSON ? JSON.parse(activeUserJSON).email : null;
let activeUser = activeUserJSON ? JSON.parse(activeUserJSON) : {};

// Si hay un email de revisión Y el usuario activo es un Preceptor, usar el email de revisión
if (reviewingEmail && reviewerRole === 'Preceptor') {
    targetUserEmail = reviewingEmail;
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
    sessionStorage.removeItem("reviewingUserEmail");
    sessionStorage.removeItem("reviewerRole");
    sessionStorage.removeItem("activeUser");
    window.location.replace("principal.html");
}


// ------------ SCRIPT DE EXPORTACIÓN A EXCEL (Mantenido) ------------
const exportarBtn = document.getElementById("exportarBtn");

function getTextOrValue(element) {
    if (!element) return "";
    // *** MODIFICADO: Ahora prioriza textContent (para <p>) pero mantiene .value (para <input>) ***
    return element.textContent || element.value || "";
}

async function exportarAExcel() {
    const tablaDatos = document.getElementById("tabla-datos-generales");
    const tablaMaterias = document.getElementById("tabla-materias");
    const tablaPendientes = document.getElementById("tabla-pendientes");

    // Datos Generales
    const cicloLectivo = getTextOrValue(tablaDatos.rows[0].cells[0].querySelector('input'));
    const estudiante = getTextOrValue(tablaDatos.rows[0].cells[1].querySelector('input'));
    const dni = getTextOrValue(tablaDatos.rows[0].cells[2].querySelector('input'));
    const especialidad = getTextOrValue(tablaDatos.rows[0].cells[3].querySelector('input'));
    const anio = getTextOrValue(tablaDatos.rows[1].cells[0].querySelector('input'));
    const division = getTextOrValue(tablaDatos.rows[1].cells[1].querySelector('input'));
    const turno = getTextOrValue(tablaDatos.rows[1].cells[2].querySelector('input'));
    const preceptor = getTextOrValue(tablaDatos.rows[1].cells[3].querySelector('input'));

    let workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet("Boletín");

    // --- Estilos ---
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDDDDD' } };
    const centerAlignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    const border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    const boldFont = { bold: true };

    // --- Título ---
    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'BOLETÍN DEL ALUMNO';
    titleCell.alignment = centerAlignment;
    titleCell.font = { size: 16, bold: true };
    worksheet.getRow(1).height = 30;
    worksheet.addRow([]);

    // --- Datos Generales ---
    const headerGen = ['CICLO LECTIVO', 'ESTUDIANTE', 'DNI', 'ESPECIALIDAD', 'AÑO', 'DIVISIÓN', 'TURNO', 'PRECEPTOR/A'];
    const dataGen = [cicloLectivo, estudiante, dni, especialidad, anio, division, turno, preceptor];

    const rowHeaderGen = worksheet.addRow(headerGen.slice(0, 4));
    const rowDataGen1 = worksheet.addRow(dataGen.slice(0, 4));
    const rowHeaderGen2 = worksheet.addRow(headerGen.slice(4));
    const rowDataGen2 = worksheet.addRow(dataGen.slice(4));

    [rowHeaderGen, rowDataGen1, rowHeaderGen2, rowDataGen2].forEach(row => {
        row.eachCell((cell, colNumber) => {
            cell.alignment = centerAlignment;
            cell.border = border;
            if (row === rowHeaderGen || row === rowHeaderGen2) {
                cell.font = boldFont;
                cell.fill = headerFill;
            }
        });
    });

    worksheet.addRow([]);

    // --- Tabla de Materias Cursadas ---
    const headerMaterias = Array.from(tablaMaterias.querySelectorAll('thead th')).map(th => th.textContent.trim());
    const rowHeaderMaterias = worksheet.addRow(headerMaterias);
    rowHeaderMaterias.eachCell(cell => { cell.font = boldFont; cell.fill = headerFill; cell.alignment = centerAlignment; cell.border = border; });

    const filasMaterias = tablaMaterias.querySelectorAll('tbody tr');
    filasMaterias.forEach(fila => {
        const celdas = Array.from(fila.querySelectorAll('input, textarea')).map(input => getTextOrValue(input)); // Incluye textarea
        const row = worksheet.addRow(celdas);
        row.eachCell((cell, colNumber) => {
            cell.alignment = centerAlignment;
            cell.border = border;
            if (colNumber > 2) {
                const numValue = parseFloat(cell.value);
                if (!isNaN(numValue)) {
                    cell.value = numValue;
                    cell.numFmt = '0.00';
                } else {
                    cell.value = '';
                }
            }
        });
    });

    worksheet.addRow([]);

    // --- Tabla de Materias Pendientes ---
    worksheet.addRow(['MATERIAS PENDIENTES DE APROBACIÓN Y ACREDITACIÓN - INTENSIFICACIÓN']).eachCell(cell => {
        cell.font = { bold: true, size: 14 };
        cell.alignment = { horizontal: 'center' };
    });
    worksheet.mergeCells(worksheet.lastRow.number, 1, worksheet.lastRow.number, headerMaterias.length);

    const headerPendientes = Array.from(tablaPendientes.querySelectorAll('thead th')).map(th => th.textContent.trim());
    const rowHeaderPendientes = worksheet.addRow(headerPendientes);
    rowHeaderPendientes.eachCell(cell => { cell.font = boldFont; cell.fill = headerFill; cell.alignment = centerAlignment; cell.border = border; });

    const filasPendientes = tablaPendientes.querySelectorAll('tbody tr');
    let hayPendientesReales = false;
    filasPendientes.forEach(fila => {
        if (!fila.cells[0].textContent.includes("No hay materias pendientes")) {
            hayPendientesReales = true;
            const celdas = Array.from(fila.querySelectorAll('input, textarea')).map(input => getTextOrValue(input)); // Incluye textarea
            const row = worksheet.addRow(celdas);
            row.eachCell((cell, colNumber) => {
                cell.alignment = centerAlignment;
                cell.border = border;
                if (colNumber > 1 && colNumber < 11) {
                    const numValue = parseFloat(cell.value);
                    if (!isNaN(numValue)) {
                        cell.value = numValue;
                        cell.numFmt = '0.00';
                    } else {
                        cell.value = '';
                    }
                }
            });
        }
    });

    if (!hayPendientesReales) {
        const noPendientesRow = worksheet.addRow(['No hay materias pendientes de aprobación.']);
        worksheet.mergeCells(noPendientesRow.number, 1, noPendientesRow.number, headerPendientes.length);
        noPendientesRow.getCell(1).alignment = { horizontal: 'center' };
        noPendientesRow.getCell(1).font = { italic: true };
        noPendientesRow.getCell(1).border = border;
    }

    worksheet.addRow([]);

    // --- Observaciones (*** MODIFICADO ***) ---
    const obsContainer = document.getElementById("observaciones-container");
    // *** CAMBIO: Busca <p class="obs-text"> en lugar de <input class="obs-3"> ***
    const obsRows = Array.from(obsContainer.querySelectorAll('p.obs-text'));
    
    // *** CAMBIO: Comprueba el textContent del primer elemento ***
    if (obsRows.length > 0 && obsRows[0].textContent !== "Sin observaciones.") {
        worksheet.addRow(['OBSERVACIONES']).eachCell(cell => { cell.font = { bold: true, size: 14 }; });
        obsRows.forEach((p_element, index) => {
            // *** CAMBIO: Usa getTextOrValue en el párrafo (p_element) ***
            const row = worksheet.addRow([`${index + 1}: ${getTextOrValue(p_element)}`]);
            worksheet.mergeCells(row.number, 1, row.number, headerMaterias.length);
            row.getCell(1).border = border;
            row.getCell(1).alignment = { wrapText: true };
        });
    }

    // Ajustar anchos de columnas
    worksheet.columns.forEach((column, i) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
            let columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
                maxLength = columnLength;
            }
        });
        column.width = maxLength < 12 ? 12 : maxLength + 2;
        if (i === 1 && column.width < 30) column.width = 30;
        if (headerMaterias[i] === 'MATERIA' && column.width < 30) column.width = 30;
        if (headerPendientes[i] === 'OBSERVACIONES' && column.width < 40) column.width = 40;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), `Boletin_${estudiante.replace(/\s+/g, '_')}.xlsx`);
}

if (exportarBtn) {
    exportarBtn.addEventListener("click", exportarAExcel);
}


// --- Lógica de Notificaciones (CORREGIDA CON API Y SIN setTimeout) ---
async function setupNotifications() {
    const notiIcon = document.getElementById("notification-icon");

    if (reviewerRole === 'Preceptor') {
        if (notiIcon) notiIcon.style.display = 'none';
        return;
    }

    if (!notiIcon || !targetUserEmail) return; // Asegúrate de tener el email del alumno

    const notiWrapper = notiIcon.querySelector(".icon-wrapper");
    const notiDot = notiIcon.querySelector(".notification-dot");
    const notiPanel = notiIcon.querySelector(".notification-panel");
    const notiList = document.getElementById("notification-list");

    let hasNewNotifications = false;
    notiList.innerHTML = '<li>Cargando...</li>';

    try {
        // 1. LLAMAR A LA API PARA OBTENER NOTIFICACIONES
        const response = await fetch(`../api/get_notificaciones.php?email=${targetUserEmail}`);
        const data = await response.json();

        if (data.success && data.notificaciones.length > 0) {
            notiList.innerHTML = '';
            data.notificaciones.forEach(notif => {
                const li = document.createElement("li");
                li.textContent = notif.mensaje;
                notiList.appendChild(li);
            });
            notiDot.classList.add("show");
            hasNewNotifications = true;
        } else {
            notiList.innerHTML = '<li class="empty">No hay notificaciones nuevas.</li>';
            notiDot.classList.remove("show");
        }

    } catch (e) {
        console.error("Error al cargar notificaciones:", e);
        notiList.innerHTML = '<li class="empty">Error al cargar notificaciones.</li>';
    }


    // 2. MODIFICAR EL CLICK LISTENER
    notiWrapper.addEventListener("click", async (event) => {
        event.stopPropagation();
        notiPanel.classList.toggle("show");

        // Si el panel se está mostrando Y había notificaciones nuevas
        if (notiPanel.classList.contains("show") && hasNewNotifications) {
            notiDot.classList.remove("show");
            hasNewNotifications = false; // Ya no son nuevas

            try {
                // 3. LLAMAR A LA API PARA MARCARLAS COMO LEÍDAS
                await fetch('../api/marcar_notificaciones_leidas.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: targetUserEmail })
                });
                
            } catch (e) {
                console.error("Error al marcar notificaciones como leídas:", e);
            }
        }
    });

    // Cierre del panel (sin cambios)
    document.addEventListener("click", (event) => {
        if (notiPanel && notiIcon && !notiIcon.contains(event.target)) {
            notiPanel.classList.remove("show");
        }
    });
}


// Reemplaza completamente la función cargarNotasDelAlumno en gestor-de-notas-ultima/js/alumno.js
async function cargarNotasDelAlumno() {
    const alumnoEmail = targetUserEmail;
    const tablaMateriasBody = document.querySelector("#tabla-materias tbody");
    const tablaPendientesBody = document.querySelector("#tabla-pendientes tbody");
    const obsContainer = document.getElementById("observaciones-container");
    // Nuevo contenedor para inasistencias
    const inasistenciasContainer = document.getElementById("inasistencias-totales-container"); 
    

    tablaMateriasBody.innerHTML = '<tr><td colspan="8">Cargando calificaciones...</td></tr>';
    tablaPendientesBody.innerHTML = '<tr><td colspan="12">Cargando materias pendientes...</td></tr>';
    if (obsContainer) obsContainer.innerHTML = '';
    // Inicializa el contenedor de inasistencias
    if (inasistenciasContainer) inasistenciasContainer.innerHTML = '<table><tr><td colspan="4">Calculando inasistencias...</td></tr></table>';


    const NOTA_APROBACION = 7;
    let totalInasistencias1C = 0;
    let totalInasistencias2C = 0;
    
    try {
        // --- 1. Obtener datos del alumno (incluyendo curso_info) ---
        const userResponse = await fetch(`../api/get_user_by_email.php?email=${targetUserEmail}`);
        const userData = await userResponse.json();

        let anio = null;
        let division = null;
        let anioCursoNum = 0;
        let anioDisplay = 'N/A';

        if (userData.success && userData.user && userData.user.curso_info) {
             try {
                 const cursoInfoParsed = JSON.parse(userData.user.curso_info);
                 if (cursoInfoParsed && cursoInfoParsed.curso) {
                     anio = cursoInfoParsed.curso.anio;
                     division = cursoInfoParsed.curso.division;
                     anioDisplay = anio; 
                     anioCursoNum = parseInt(anio) || 0;
                 }
             } catch (e) { 
                 console.error("Error parseando curso_info:", e); 
                 throw new Error("Datos de curso incompletos o inválidos.");
             }
        } else {
            throw new Error("No se encontró información de curso para el alumno.");
        }

        const is7mo = anio === '7mo';

        // --- 2. Obtener TODAS las Materias para el Curso ---
        const subjectsResponse = await fetch(`../api/get_subjects_by_course.php?anio=${anio}&division=${division}`);
        const subjectsData = await subjectsResponse.json();
        
        if (!subjectsData.success || !Array.isArray(subjectsData.materias) || subjectsData.materias.length === 0) {
            tablaMateriasBody.innerHTML = `<tr><td colspan="8">No se encontraron materias para el curso ${anio} ${division}.</td></tr>`;
            tablaPendientesBody.innerHTML = '<tr><td colspan="12">No hay materias pendientes de aprobación.</td></tr>';
            return;
        }

        const allSubjects = subjectsData.materias;
        
        // --- 3. Obtener las Notas Existentes del Alumno ---
        const gradesResponse = await fetch('../api/get_grades.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alumno_email: alumnoEmail })
        });
        
        if (!gradesResponse.ok) {
            const errorText = await gradesResponse.text();
            throw new Error(`Error en la API de notas. ${errorText.substring(0, 50)}...`);
        }
        
        const notasDelAlumno = await gradesResponse.json(); 
        
        const gradesMap = {};
        if (Array.isArray(notasDelAlumno)) {
            notasDelAlumno.forEach(nota => {
                gradesMap[nota.materia] = nota; 
            });
        }
        
        // --- 4. Rellenar las Tablas con TODAS las Materias ---
        tablaMateriasBody.innerHTML = '';
        tablaPendientesBody.innerHTML = '';
        let hayPendientes = false;
        let hayObservaciones = false;

        allSubjects.forEach(materiaNombre => {
            const nota = gradesMap[materiaNombre] || {}; 
            
            // --- CÁLCULO DE ESTADO Y NOTA FINAL ---
            const nota1 = parseFloat(nota.calificacion_1c) || 0;
            const nota2 = parseFloat(nota.calificacion_2c) || 0;
            const inasistencias1C = parseInt(nota.inasistencias_1c) || 0;
            const inasistencias2C = parseInt(nota.inasistencias_2c) || 0;

            let notaAgosto = parseFloat(nota.intensificacion_1c_agosto) || 0;
            const notaDic = parseFloat(nota.diciembre) || 0;
            const notaFeb = parseFloat(nota.febrero) || 0;
            let notaFinalMateria = parseFloat(nota.final) || 0; 
            let estadoMateria = 'pendiente';

            // Sumar inasistencias
            if (inasistencias1C > 0 || inasistencias2C > 0) { // Sumar si tienen datos
                 totalInasistencias1C += inasistencias1C;
                 totalInasistencias2C += inasistencias2C;
            }
            
            let finalDisplay = '';
            let agostoDisplayPrincipal = notaAgosto > 0 ? notaAgosto.toFixed(2) : '';

            if (nota1 >= NOTA_APROBACION && nota2 >= NOTA_APROBACION) {
                // Promoción Directa
                notaFinalMateria = (nota1 + nota2) / 2;
                finalDisplay = notaFinalMateria.toFixed(2);
                estadoMateria = 'aprobado'; 
            } else if (nota1 > 0 || nota2 > 0 || notaDic > 0 || notaFeb > 0 || notaAgosto > 0) {
                // Estado de Instancia
                estadoMateria = 'desaprobado'; 

                // Determinar la nota final a mostrar (solo si aprueba una instancia)
                if (notaFeb >= NOTA_APROBACION) {
                    finalDisplay = notaFeb.toFixed(2);
                    estadoMateria = 'aprobado'; 
                } else if (notaDic >= NOTA_APROBACION) {
                    finalDisplay = notaDic.toFixed(2);
                    estadoMateria = 'aprobado'; 
                } 
                // La lógica de promoción por Intensificación 1C + 2C (1ro a 6to) se maneja en el profesor.js.
                // Aquí solo mostramos el resultado final si existe.
                
                // Si desaprobó en la última instancia registrada, se muestra esa nota en la final para el registro
                if (finalDisplay === '' && notaFinalMateria > 0) {
                    finalDisplay = notaFinalMateria.toFixed(2);
                }


                // REGLA CLAVE: Si es 7mo, el Intensificación 1C no se muestra en la columna principal
                if (is7mo) {
                    agostoDisplayPrincipal = ''; // Se oculta en tabla principal
                }
            } 
            
            const finalClass = (estadoMateria === 'desaprobado' && finalDisplay !== '') ? 'desaprobado-pendiente' : '';


            // --- Poblar Tabla Principal (Materias Cursadas) ---
            const filaPrincipal = document.createElement('tr');
            filaPrincipal.innerHTML = `
                <td>
                    <textarea class="mate1" readonly style="resize: none; overflow: hidden; height: auto;">${materiaNombre}</textarea>
                </td>
                <td><input type="text" class="mate1" value="${anioDisplay}" readonly></td>
                <td><input type="number" step="0.01" class="mate1" value="${nota1 > 0 ? nota1.toFixed(2) : ''}" readonly></td>
                <td><input type="number" step="0.01" class="mate1" value="${nota2 > 0 ? nota2.toFixed(2) : ''}" readonly></td>
                <td><input type="number" step="0.01" class="mate1" value="${agostoDisplayPrincipal}" readonly></td>
                <td><input type="number" step="0.01" class="mate1" value="${notaDic > 0 ? notaDic.toFixed(2) : ''}" readonly></td>
                <td><input type="number" step="0.01" class="mate1" value="${notaFeb > 0 ? notaFeb.toFixed(2) : ''}" readonly></td>
                <td><input type="number" step="0.01" class="mate1 ${finalClass}" value="${finalDisplay}" readonly></td>
            `;
            tablaMateriasBody.appendChild(filaPrincipal);
        
            // --- Poblar Tabla Pendientes si corresponde ---
            if (estadoMateria === 'desaprobado') {
                hayPendientes = true;
                const filaPendiente = document.createElement('tr');
                const fechaCarga = nota.fecha_carga ? new Date(nota.fecha_carga).getFullYear() : 'N/A';
                
                // Nota: La tabla de pendientes SIEMPRE muestra la nota de agosto si existe
                const agostoPendientesDisplay = notaAgosto > 0 ? notaAgosto.toFixed(2) : '';

                filaPendiente.innerHTML = `
                     <td><textarea class="mate1" readonly style="resize: none; overflow: hidden; height: auto;">${materiaNombre}</textarea></td>
                     <td><input type="text" class="mate1" value="${anioDisplay}" readonly></td>
                     <td><input type="text" class="mate1" value="${fechaCarga}" readonly></td>
                     <td><input type="number" step="0.01" class="mate1" value="" readonly></td> 
                     <td><input type="number" step="0.01" class="mate1" value="" readonly></td> 
                     <td><input type="number" step="0.01" class="mate1" value="" readonly></td> 
                     <td><input type="number" step="0.01" class="mate1" value="${agostoPendientesDisplay}" readonly></td> 
                     <td><input type="number" step="0.01" class="mate1" value="${notaDic > 0 ? notaDic.toFixed(2) : ''}" readonly></td> 
                     <td><input type="number" step="0.01" class="mate1" value="${notaFeb > 0 ? notaFeb.toFixed(2) : ''}" readonly></td> 
                     <td><input type="number" step="0.01" class="mate1 ${finalClass}" value="${finalDisplay}" readonly></td> 
                     <td><input type="text" class="mate1" value="" readonly></td> 
                     <td><input type="text" class="mate1" value="${nota.observaciones || ''}" readonly></td> 
                `;
                tablaPendientesBody.appendChild(filaPendiente);
                
                 // *** MODIFICADO: Mostrar Observaciones como <p> ***
                 if (nota.observaciones && nota.observaciones.trim() !== '') {
                     if (!hayObservaciones) {
                         // Limpia el "Sin observaciones." por defecto
                         if (obsContainer) obsContainer.innerHTML = ''; 
                     }
                     hayObservaciones = true;
                     const obsParagraph = document.createElement('p'); // Crea un <p>
                     obsParagraph.className = 'obs-text'; // Asigna la nueva clase
                     obsParagraph.textContent = `${materiaNombre}: ${nota.observaciones}`;
                     if (obsContainer) obsContainer.appendChild(obsParagraph);
                 }
            }
        });

        if (!hayPendientes) {
            tablaPendientesBody.innerHTML = '<tr><td colspan="12">No hay materias pendientes de aprobación.</td></tr>';
        }
        
        // *** MODIFICADO: Asegura que el contenedor de obs. tenga el Párrafo por defecto ***
        if (obsContainer && !hayObservaciones) {
            obsContainer.innerHTML = '<p class="obs-text" style="font-style: italic; color: grey;">Sin observaciones.</p>';
        }

        // --- 5. Llenar mini-tabla de INASISTENCIAS ---
        if (inasistenciasContainer) {
            inasistenciasContainer.innerHTML = `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="width: 30%;">Concepto</th>
                            <th>1° Cuatrimestre</th>
                            <th>2° Cuatrimestre</th>
                            <th>Total Anual</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="text-align: left;">Inasistencias</td>
                            <td><b>${totalInasistencias1C}</b></td>
                            <td><b>${totalInasistencias2C}</b></td>
                            <td><b>${totalInasistencias1C + totalInasistencias2C}</b></td>
                        </tr>
                    </tbody>
                </table>
            `;
        }


    } catch (e) {
        console.error("Error al cargar notas del alumno:", e);
        // Mostrar error amigable al usuario en ambas tablas
        tablaMateriasBody.innerHTML = `<tr><td colspan="8">Error al cargar calificaciones: ${e.message}</td></tr>`;
        tablaPendientesBody.innerHTML = `<tr><td colspan="12">Error al cargar materias pendientes: ${e.message}</td></tr>`;
         // *** MODIFICADO: Muestra el error en el párrafo ***
         if (obsContainer) obsContainer.innerHTML = '<p class="obs-text" style="color: red;">Error al cargar observaciones.</p>';
    }
}

// --- Cargar datos personales del alumno---
async function cargarDatosPersonales() {
    const tabla = document.querySelector("#tabla-datos-generales");
    const targetEmail = targetUserEmail;

    if (!tabla) return;

    const inputCiclo = tabla.rows[0].cells[0].querySelector("input");
    const inputNombre = tabla.rows[0].cells[1].querySelector("input");
    const inputDni = tabla.rows[0].cells[2].querySelector("input");
    const inputEspecialidad = tabla.rows[0].cells[3].querySelector("input");
    const inputAnio = tabla.rows[1].cells[0].querySelector("input");
    const inputDivision = tabla.rows[1].cells[1].querySelector("input");
    const inputTurno = tabla.rows[1].cells[2].querySelector("input");
    const inputPreceptor = tabla.rows[1].cells[3].querySelector("input");

    if (inputCiclo) inputCiclo.value = new Date().getFullYear();

    try {
        const response = await fetch(`../api/get_user_by_email.php?email=${targetEmail}`);
        const data = await response.json();

        if (data.success && data.user) {
            const user = data.user;

            if (inputNombre) inputNombre.value = user.fullname || "";
            if (inputDni) inputDni.value = user.dni || "";

            if (user.curso_info) {
                const info = JSON.parse(user.curso_info);
                const curso = info.curso || {};

                // Llenar datos del curso del alumno (AÑO, DIVISIÓN, ESPECIALIDAD)
                if (inputAnio) inputAnio.value = curso.anio || '';
                if (inputDivision) inputDivision.value = curso.division || '';
                if (inputEspecialidad) inputEspecialidad.value = curso.especialidad || '';

                // --- OBTENER TURNO Y PRECEPTOR (requiere Año y División) ---
                if (curso.anio && curso.division) {
                    try {
                        const cursoInfoResponse = await fetch(`../api/get_course_info.php?anio=${curso.anio}&division=${curso.division}`);
                        const cursoInfoData = await cursoInfoResponse.json();

                        if (cursoInfoData.success) {
                            if (inputTurno) inputTurno.value = cursoInfoData.turno || 'No definido';
                            if (inputPreceptor) inputPreceptor.value = cursoInfoData.preceptor_name || 'No asignado';
                        } else {
                            if (inputTurno) inputTurno.value = 'Error';
                            if (inputPreceptor) inputPreceptor.value = 'Error';
                            console.warn("No se pudo obtener info completa del curso:", cursoInfoData.message);
                        }
                    } catch (e) {
                        console.error("Error al llamar a get_course_info.php:", e);
                        if (inputTurno) inputTurno.value = 'Error conexión';
                        if (inputPreceptor) inputPreceptor.value = 'Error conexión';
                    }
                } else {
                    if (inputTurno) inputTurno.value = 'N/A';
                    if (inputPreceptor) inputPreceptor.value = 'N/A';
                }
            } else {
                if (inputAnio) inputAnio.value = 'N/A';
                if (inputDivision) inputDivision.value = 'N/A';
                if (inputEspecialidad) inputEspecialidad.value = 'N/A';
                if (inputTurno) inputTurno.value = 'N/A';
                if (inputPreceptor) inputPreceptor.value = 'N/A';
            }
        } else {
            console.error("No se pudieron cargar los datos del alumno:", data.message);
            if (inputNombre) inputNombre.value = "Error al cargar";
            if (inputDni) inputDni.value = "Error";
        }
    } catch (e) {
        console.error("Error de red al cargar datos personales:", e);
        if (inputNombre) inputNombre.value = "Error de conexión";
    }
}


document.addEventListener("DOMContentLoaded", () => {
    setupNotifications(); // Configurar notificaciones
    cargarDatosPersonales(); // Cargar cabecera
    cargarNotasDelAlumno(); // Cargar tablas de notas
});