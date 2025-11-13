// Gestor-de-Notas/js/alumno.js (COMPLETO Y FINAL)

// --- VARIABLES GLOBALES ---
const reviewingEmail = sessionStorage.getItem("reviewingUserEmail");
const reviewerRole = sessionStorage.getItem("reviewerRole");
const activeUserJSON = sessionStorage.getItem("activeUser");

let targetUserEmail = activeUserJSON ? JSON.parse(activeUserJSON).email : null;
let activeUser = activeUserJSON ? JSON.parse(activeUserJSON) : {};

let gradesMap = {};
let allCourseSubjects = [];
let allMateriasCache = []; // Caché para TODAS las materias

const isEditable = (reviewerRole === 'Preceptor');

if (reviewingEmail && isEditable) {
    targetUserEmail = reviewingEmail;
}
if (!targetUserEmail) {
    window.location.href = "principal.html";
}

// --- MANEJO DE HISTORIAL Y SESIÓN ---
window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.go(1);
    if (isEditable) {
        window.location.href = "preceptor.html";
    } else {
        window.location.href = "principal.html";
    }
};

function logout() {
    sessionStorage.removeItem("activeUser");
    sessionStorage.removeItem("reviewingUserEmail");
    sessionStorage.removeItem("reviewerRole");
    window.location.replace("principal.html");
}

function openAlertModal(message) {
    alert(message);
}

function closeAlertModal() {
    // No hace nada
}

async function cargarTodasLasMaterias() {
    if (allMateriasCache.length > 0) return;
    try {
        const response = await fetch('../api/get_materias.php');
        allMateriasCache = await response.json();
        allMateriasCache.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } catch (e) {
        console.error("Error al cargar caché de materias:", e);
    }
}

// --- LÓGICA DE VISTA PREVIA (NUEVO) ---

/**
 * Oculta inputs y selects, y muestra spans con texto.
 */
function aplicarVistaPrevia() {
    // 1. Ocultar inputs/selects y mostrar texto
    document.querySelectorAll('.nota-editable, .nota-editable-final').forEach(input => {
        const span = document.createElement('span');
        span.textContent = input.value;
        span.className = 'preview-text';
        span.style.textAlign = input.style.textAlign || 'center';
        input.style.display = 'none';
        if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('preview-text')) {
            input.parentNode.insertBefore(span, input.nextSibling);
        }
    });
    document.querySelectorAll('textarea.obs-input').forEach(textarea => {
        const p = document.createElement('p');
        p.textContent = textarea.value;
        p.className = 'obs-text-preview';
        textarea.style.display = 'none';
         if (!textarea.nextElementSibling || !textarea.nextElementSibling.classList.contains('obs-text-preview')) {
            textarea.parentNode.insertBefore(p, textarea.nextSibling);
         }
    });
    document.querySelectorAll('select.materia-pendiente-select').forEach(select => {
        const span = document.createElement('span');
        const selectedText = select.options[select.selectedIndex].text;
        span.textContent = selectedText;
        span.className = 'preview-text';
        
        if (select.closest('td')) {
             span.style.textAlign = 'left';
             select.closest('td').style.textAlign = 'left';
        }

        select.style.display = 'none';
         if (!select.nextElementSibling || !select.nextElementSibling.classList.contains('preview-text')) {
            select.parentNode.insertBefore(span, select.nextSibling);
         }
    });

    // 2. Añadir clase de vista previa al contenedor
    const boletin = document.querySelector('.boletin-container');
    if (boletin) boletin.classList.add("vista-previa");
}

/**
 * Quita spans de texto y muestra inputs/selects para edición.
 */
function quitarVistaPrevia() {
    // 1. Quitar la clase de vista previa
    const boletin = document.querySelector('.boletin-container');
    if (boletin) boletin.classList.remove("vista-previa");

    // 2. Remover los spans/p de vista previa
    document.querySelectorAll('.preview-text, .obs-text-preview').forEach(el => el.remove());
    
    // 3. Volver a mostrar los inputs
    document.querySelectorAll('.nota-editable, .nota-editable-final, textarea.obs-input, select.materia-pendiente-select').forEach(el => {
        el.style.display = ''; // Reestablece el display
    });
}

// --- LÓGICA DE BOTONES GUARDAR/MODIFICAR (PRECEPTOR) ---

/**
 * Habilita todos los campos de notas y observaciones para la edición del preceptor.
 */
function habilitarEdicion() {
    // === INICIO DE CORRECCIÓN ===
    quitarVistaPrevia();
    // === FIN DE CORRECCIÓN ===

    // Habilitar campos (el código que ya tenías)
    document.querySelectorAll('.nota-editable, .nota-editable-final, .obs-input, .materia-pendiente-select').forEach(el => {
        el.readOnly = false;
        el.disabled = false;
    });
    
    // Habilitar botón Guardar y ocultar Modificar
    const guardarBtn = document.getElementById('guardarBtn');
    if (guardarBtn) {
        guardarBtn.disabled = false;
        guardarBtn.style.backgroundColor = '#27ae60';
        guardarBtn.style.display = 'inline-block';
    }
    
    const modificarBtn = document.getElementById('modificarBtn');
    if (modificarBtn) {
        modificarBtn.style.display = 'none';
    }

    const agregarFilaBtn = document.getElementById('agregarFilaPendienteBtn');
    if (agregarFilaBtn) {
        agregarFilaBtn.style.display = 'inline-block';
    }
    
    openAlertModal("Modo de edición activado. Ahora puedes modificar las notas y observaciones.");

    // *** Lógica de promedio automático ***
    const NOTA_APROBACION = 7;
    document.querySelectorAll('#tabla-materias tbody tr').forEach(fila => {
        const inputs = fila.querySelectorAll("input[data-field='calificacion_1c'], input[data-field='calificacion_2c']");
        const finalInput = fila.querySelector("input[data-field='final']");

        if (!finalInput) return;

        const recalcularPromedio = () => {
            const nota1 = parseFloat(fila.querySelector("[data-field='calificacion_1c']")?.value) || 0;
            const nota2 = parseFloat(fila.querySelector("[data-field='calificacion_2c']")?.value) || 0;
            
            if (nota1 >= NOTA_APROBACION && nota2 >= NOTA_APROBACION) {
                const promedio = (nota1 + nota2) / 2;
                finalInput.value = promedio.toFixed(2);
            }
        };

        inputs.forEach(input => {
            input.addEventListener('change', recalcularPromedio);
            input.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    recalcularPromedio();
                    const currentCell = input.closest('td');
                    const nextCell = currentCell.nextElementSibling;
                    if (nextCell) {
                        const nextInput = nextCell.querySelector('input');
                         if(nextInput && !nextInput.readOnly) {
                             nextInput.focus();
                             nextInput.select();
                         }
                    }
                }
            });
        });
    });
}

/**
 * Agrega una nueva fila editable a la tabla de materias pendientes.
 */
/**
 * Agrega una nueva fila editable a la tabla de materias pendientes.
 * (MODIFICADA para Req. 1, 2 y 3)
 */
function agregarFilaPendiente(hidden = false) {
    if (!isEditable) return;

    const tablaPendientesBody = document.querySelector("#tabla-pendientes tbody");
    
    const noPendientesRow = tablaPendientesBody.querySelector('.no-pendientes');
    if (noPendientesRow) {
        noPendientesRow.remove();
    }

    // === INICIO DE LA CORRECCIÓN ===
    // Aquí usamos "allMateriasCache" (todas las materias) en lugar de "allCourseSubjects"
    let options = '<option value="">Seleccionar materia...</option>';
    allMateriasCache.forEach(materia => {
        options += `<option value="${materia.nombre}">${materia.nombre}</option>`;
    });
    // === FIN DE LA CORRECCIÓN ===

    const editableClass = 'nota-editable';
    const finalEditableClass = 'nota-editable-final';
    const obsEditableClass = 'obs-input';
    
    const filaPendiente = document.createElement('tr');
    filaPendiente.className = 'fila-nueva-pendiente'; 
    if (hidden) {
        filaPendiente.style.display = 'none'; // Ocultar filas pre-cargadas
    }

    // El resto de la función sigue igual
    filaPendiente.innerHTML = `
        <td><select class="materia-pendiente-select" data-field="materia">${options}</select></td>
        <td><input type="text" class="${editableClass}" value="" placeholder="Año" data-field="anio_cursado"></td>
        <td><input type="text" class="mate1" value="${new Date().getFullYear()}" readonly data-field="ciclo_lectivo"></td>
        
        <td><input type="number" step="0.01" class="${editableClass}" value="" data-field="marzo"></td> 
        <td><input type="number" step="0.01" class="${editableClass}" value="" data-field="junio"></td> 
        <td><input type="number" step="0.01" class="${editableClass}" value="" data-field="julio"></td> 
        <td><input type="number" step="0.01" class="${editableClass}" value="" data-field="intensificacion_1c_agosto"></td> 
        <td><input type="number" step="0.01" class="${editableClass}" value="" data-field="diciembre"></td> 
        <td><input type="number" step="0.01" class="${editableClass}" value="" data-field="febrero"></td> 
        <td><input type="number" step="0.01" class="${finalEditableClass}" value="" data-field="final"></td> 
        <td><input type="text" class="${editableClass}" value="" placeholder="Modelo" data-field="modelo"></td> 
        <td><textarea class="${obsEditableClass}" data-field="observaciones" placeholder="Obs. pendiente..."></textarea></td> 
    `;
    
    if (!hidden) {
        filaPendiente.querySelectorAll('.nota-editable, .nota-editable-final, .obs-input, .materia-pendiente-select').forEach(el => {
            el.readOnly = false;
            el.disabled = false;
        });
        const cicloLectivoInput = filaPendiente.querySelector("[data-field='ciclo_lectivo']");
        if (cicloLectivoInput) {
            cicloLectivoInput.readOnly = true;
            cicloLectivoInput.disabled = true;
        }
    }

    tablaPendientesBody.appendChild(filaPendiente);
    return filaPendiente;
}

/**
 * Muestra una fila de pendiente oculta y la habilita.
 */
function mostrarYActivarFilaPendiente() {
    const filaOculta = document.querySelector("#tabla-pendientes tbody tr.fila-nueva-pendiente[style*='display: none']");
    if (filaOculta) {
        filaOculta.style.display = 'table-row';
        filaOculta.querySelectorAll('.nota-editable, .nota-editable-final, .obs-input, .materia-pendiente-select').forEach(el => {
            el.readOnly = false;
            el.disabled = false;
        });
        const cicloLectivoInput = filaOculta.querySelector("[data-field='ciclo_lectivo']");
        if (cicloLectivoInput) {
            cicloLectivoInput.readOnly = true;
            cicloLectivoInput.disabled = true;
        }
    } else {
        agregarFilaPendiente(false);
    }
}


/**
 * Guarda todos los datos del boletín (notas y observaciones) en la base de datos.
 */
async function guardarDatosEnServidor() {
    if (!isEditable) return; 

    const alumnoEmail = targetUserEmail;
    let grades = []; 
    let materiasProcesadas = new Set(); 

    const tablaDatos = document.querySelector("#tabla-datos-generales");
    const anioVal = tablaDatos.rows[1].cells[0].querySelector('input').value;
    const divVal = tablaDatos.rows[1].cells[1].querySelector('input').value;
    const cursoAnioStr = `${anioVal} ${divVal}`;

    // 1. Recorrer la TABLA DE MATERIAS PRINCIPAL
    document.querySelectorAll("#tabla-materias tbody tr").forEach(fila => {
        const materia = fila.dataset.materia;
        if (!materia) return; 

        const originalNota = JSON.parse(JSON.stringify(gradesMap[materia] || {}));

        originalNota.alumno_email = alumnoEmail;
        originalNota.materia = materia;
        originalNota.profesor_email = activeUser.email;
        originalNota.curso_anio = originalNota.curso_anio || cursoAnioStr;
        
        originalNota.inasistencias_1c = originalNota.inasistencias_1c || 0;
        originalNota.inasistencias_2c = originalNota.inasistencias_2c || 0;
        
        originalNota.calificacion_1c = fila.querySelector("[data-field='calificacion_1c']")?.value || null;
        originalNota.calificacion_2c = fila.querySelector("[data-field='calificacion_2c']")?.value || null;
        originalNota.intensificacion_1c_agosto = fila.querySelector("[data-field='intensificacion_1c_agosto']")?.value || null;
        originalNota.diciembre = fila.querySelector("[data-field='diciembre']")?.value || null;
        originalNota.febrero = fila.querySelector("[data-field='febrero']")?.value || null;
        originalNota.final = fila.querySelector("[data-field='final']")?.value || null;

        grades.push(originalNota);
        materiasProcesadas.add(materia);
    });
    
    // 2. Procesar FILAS NUEVAS y EXISTENTES de la tabla de pendientes
    document.querySelectorAll("#tabla-pendientes tbody tr").forEach(fila => {
        let materia;
        let esFilaNueva = false;

        if (fila.classList.contains('fila-nueva-pendiente')) {
            const materiaSelect = fila.querySelector("[data-field='materia']");
            materia = materiaSelect.value;
            esFilaNueva = true;
        } else {
            materia = fila.dataset.materia;
        }

        if (!materia || materia === "" || materiasProcesadas.has(materia)) {
            return;
        }
        
        let notaObj = JSON.parse(JSON.stringify(gradesMap[materia] || {}));
        
        notaObj.alumno_email = alumnoEmail;
        notaObj.materia = materia;
        notaObj.profesor_email = activeUser.email;
        notaObj.inasistencias_1c = notaObj.inasistencias_1c || 0;
        notaObj.inasistencias_2c = notaObj.inasistencias_2c || 0;

        if (esFilaNueva) {
            notaObj.curso_anio = fila.querySelector("[data-field='anio_cursado']")?.value || null;
        } else {
            notaObj.curso_anio = notaObj.curso_anio || fila.querySelector("[data-field='anio_cursado']")?.value || null;
        }

        notaObj.marzo = fila.querySelector("[data-field='marzo']")?.value || null;
        notaObj.junio = fila.querySelector("[data-field='junio']")?.value || null;
        notaObj.julio = fila.querySelector("[data-field='julio']")?.value || null;
        notaObj.intensificacion_1c_agosto = fila.querySelector("[data-field='intensificacion_1c_agosto']")?.value || null;
        notaObj.diciembre = fila.querySelector("[data-field='diciembre']")?.value || null;
        notaObj.febrero = fila.querySelector("[data-field='febrero']")?.value || null;
        notaObj.final = fila.querySelector("[data-field='final']")?.value || null;
        notaObj.modelo = fila.querySelector("[data-field='modelo']")?.value || null;
        notaObj.observaciones = fila.querySelector("[data-field='observaciones']")?.value || null;
        
        if (esFilaNueva) {
            grades.push(notaObj); 
        } else {
            let index = grades.findIndex(g => g.materia === materia);
            if (index !== -1) {
                grades[index] = notaObj; 
            } else {
                grades.push(notaObj);
            }
        }
        materiasProcesadas.add(materia);
    });


    // 3. Añadir observaciones generales
    document.querySelectorAll("#observaciones-container textarea.obs-input").forEach(input => {
        const materiaKey = input.dataset.materia;
        const texto = input.value.trim();

        if (materiaKey && texto) {
            let notaObj = grades.find(g => g.materia === materiaKey);
            if (notaObj) {
                if (!materiaKey.startsWith('Observacion_')) {
                    notaObj.observaciones = texto;
                } else {
                    notaObj.observaciones = texto;
                }
            } else {
                let obsNota = JSON.parse(JSON.stringify(gradesMap[materiaKey] || {}));

                obsNota.alumno_email = alumnoEmail;
                obsNota.materia = materiaKey;
                obsNota.profesor_email = activeUser.email;
                obsNota.curso_anio = cursoAnioStr;
                obsNota.observaciones = texto;
                obsNota.inasistencias_1c = obsNota.inasistencias_1c || 0;
                obsNota.inasistencias_2c = obsNota.inasistencias_2c || 0;
                
                if (!materiasProcesadas.has(materiaKey)) {
                    grades.push(obsNota);
                }
            }
        }
    });

    let data;

    // 4. Enviar a la API
    try {
        const response = await fetch('../api/save_grades.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grades: grades,
                materia: "Boletín General (Editado por Preceptor)", 
                profesor_email: activeUser.email,
                profesor_nombre: activeUser.fullname,
                activeUserRole: activeUser.role,
                anioCurso: anioVal,
                divisionCurso: divVal
            })
        });

        const textResponse = await response.text();
        try {
            data = JSON.parse(textResponse);
        } catch (jsonError) {
            console.error("Respuesta no válida del servidor:", textResponse);
            openAlertModal(`Error: El servidor devolvió una respuesta inesperada. Revise la consola.`);
            return;
        }

    } catch (e) {
        openAlertModal("Error de conexión con el servidor al guardar notas.");
        console.error(e);
        return; 
    }
    
    if (data && data.success) {
        try {
            openAlertModal("Notas guardadas correctamente.");
            
            // === INICIO DE CORRECCIÓN (VISTA PREVIA) ===
            aplicarVistaPrevia(); // Llamar a la función helper
            // === FIN DE CORRECCIÓN (VISTA PREVIA) ===

            // Deshabilitar campos (buena práctica)
            document.querySelectorAll('.nota-editable, .nota-editable-final, .obs-input, .materia-pendiente-select').forEach(el => {
                el.readOnly = true;
                el.disabled = true;
            });
            
            // (Manejo de botones)
            const guardarBtn = document.getElementById('guardarBtn');
            const modificarBtn = document.getElementById('modificarBtn');
            const agregarFilaBtn = document.getElementById('agregarFilaPendienteBtn');
            
            if (guardarBtn) {
                guardarBtn.style.display = 'none';
                guardarBtn.disabled = true;
                guardarBtn.style.backgroundColor = '#999';
            }
            if (modificarBtn) {
                modificarBtn.style.display = 'inline-block';
            }
            if (agregarFilaBtn) {
                agregarFilaBtn.style.display = 'none';
            }
            
            // *** IMPORTANTE: NO RECARGAR LA PÁGINA AQUÍ ***
            // await cargarNotasDelAlumno(); // <-- SE ELIMINA PARA MANTENER LA VISTA PREVIA
            
            // Actualizar el gradesMap en memoria para que la próxima edición tenga los datos guardados
            grades.forEach(nota => {
                gradesMap[nota.materia] = nota;
            });
        
        } catch (e) {
            console.error("Error al procesar la vista previa:", e);
            openAlertModal("Notas guardadas, pero ocurrió un error al actualizar la vista. Recargando...");
            // Si falla la vista previa, recargamos para al menos mostrar los datos guardados
            await cargarNotasDelAlumno();
        }
    } else if (data) {
        openAlertModal(`Error al guardar: ${data.message}`);
    }
}


// --- SCRIPT DE EXPORTACIÓN A EXCEL (AÑADIDO) ---
const exportarBtn = document.getElementById("exportarBtn");

function getTextOrValue(element) {
    if (!element) return "";
    
    // --- LÓGICA DE VISTA PREVIA PARA EXPORTAR ---
    const boletin = document.querySelector('.boletin-container');
    if (boletin && boletin.classList.contains('vista-previa')) {
        // Si estamos en vista previa, buscar el span/p
        const previewEl = element.nextElementSibling;
        if (previewEl && (previewEl.classList.contains('preview-text') || previewEl.classList.contains('obs-text-preview'))) {
            return previewEl.textContent;
        }
        // Fallback para <td> de materia (que no tiene input)
        if (element.tagName === 'TD' && element.classList.contains('materia-pendiente-cell')) {
            return element.innerHTML.replace(/<br\s*\/?>/gi, '\n');
        }
    }
    
    // Lógica original si no estamos en vista previa
    if (element.value !== undefined) {
        if (element.tagName === 'SELECT') {
            return element.options[element.selectedIndex]?.text || "";
        }
        return element.value;
    }
    return element.textContent || "";
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
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3C3D40' } };
    const headerFillLight = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDDDDD' } };
    const centerAlignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    const leftAlignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    const border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    const boldFont = { bold: true, color: { argb: 'FFFFFFFF' } };
    const boldFontBlack = { bold: true };

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
    
    worksheet.addRow(headerGen.slice(0, 4));
    worksheet.addRow(dataGen.slice(0, 4));
    worksheet.addRow(headerGen.slice(4));
    worksheet.addRow(dataGen.slice(4));

    [worksheet.getRow(3), worksheet.getRow(5)].forEach(row => {
        row.eachCell(cell => { cell.font = boldFontBlack; cell.fill = headerFillLight; cell.alignment = centerAlignment; cell.border = border; });
    });
    [worksheet.getRow(4), worksheet.getRow(6)].forEach(row => {
        row.eachCell(cell => { cell.alignment = centerAlignment; cell.border = border; });
    });
    
    worksheet.addRow([]);

    // --- Tabla de Materias Cursadas (8 COLUMNAS) ---
    const thsMaterias = Array.from(tablaMaterias.querySelectorAll('thead tr th'));
    const headersRow1 = thsMaterias.slice(0, 2).map(th => th.textContent.trim());
    headersRow1.push(thsMaterias[2].textContent.trim());
    headersRow1.push('');
    headersRow1.push(thsMaterias[3].textContent.trim());
    headersRow1.push('', '');
    headersRow1.push(thsMaterias[4].textContent.trim());
    
    const headersRow2 = ['',''];
    headersRow2.push(thsMaterias[5].textContent.trim());
    headersRow2.push(thsMaterias[6].textContent.trim());
    headersRow2.push(thsMaterias[7].textContent.trim());
    headersRow2.push(thsMaterias[8].textContent.trim());
    headersRow2.push(thsMaterias[9].textContent.trim());
    headersRow2.push('');
    
    worksheet.addRow(headersRow1);
    worksheet.addRow(headersRow2);
    
    worksheet.mergeCells('A8:A9');
    worksheet.mergeCells('B8:B9');
    worksheet.mergeCells('C8:D8');
    worksheet.mergeCells('E8:E9');
    worksheet.mergeCells('F8:G8');
    worksheet.mergeCells('H8:H9');

    [worksheet.getRow(8), worksheet.getRow(9)].forEach(row => {
        row.eachCell(cell => { cell.font = boldFont; cell.fill = headerFill; cell.alignment = centerAlignment; cell.border = border; });
    });


    const filasMaterias = tablaMaterias.querySelectorAll('tbody tr');
    filasMaterias.forEach(fila => {
        const celdas = Array.from(fila.querySelectorAll('input, textarea')).map(input => getTextOrValue(input));
        const row = worksheet.addRow(celdas);
        row.eachCell((cell, colNumber) => {
            if (colNumber === 1) cell.alignment = leftAlignment; 
            else cell.alignment = centerAlignment; 
            
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

    // --- Tabla de Materias Pendientes (12 COLUMNAS) ---
    worksheet.addRow(['MATERIAS PENDIENTES DE APROBACIÓN Y ACREDITACIÓN - INTENSIFICACIÓN']).eachCell(cell => {
        cell.font = { bold: true, size: 14 }; cell.alignment = { horizontal: 'center' };
    });
    worksheet.mergeCells(worksheet.lastRow.number, 1, worksheet.lastRow.number, 12); 

    const thsPendientes = Array.from(tablaPendientes.querySelectorAll('thead tr th'));
    const headersPendientes1 = thsPendientes.slice(0, 3).map(th => th.textContent.trim());
    headersPendientes1.push(thsPendientes[3].textContent.trim());
    headersPendientes1.push('','','','','');
    headersPendientes1.push(thsPendientes[4].textContent.trim());
    headersPendientes1.push(thsPendientes[5].textContent.trim());
    headersPendientes1.push(thsPendientes[6].textContent.trim());
    
    const headersPendientes2 = ['','',''];
    headersPendientes2.push(...thsPendientes.slice(7).map(th => th.textContent.trim()));
    headersPendientes2.push('','','');
    
    worksheet.addRow(headersPendientes1);
    worksheet.addRow(headersPendientes2);

    worksheet.mergeCells(worksheet.lastRow.number - 1, 1, worksheet.lastRow.number, 1);
    worksheet.mergeCells(worksheet.lastRow.number - 1, 2, worksheet.lastRow.number, 2);
    worksheet.mergeCells(worksheet.lastRow.number - 1, 3, worksheet.lastRow.number, 3);
    worksheet.mergeCells(worksheet.lastRow.number - 1, 4, worksheet.lastRow.number - 1, 9);
    worksheet.mergeCells(worksheet.lastRow.number - 1, 10, worksheet.lastRow.number, 10);
    worksheet.mergeCells(worksheet.lastRow.number - 1, 11, worksheet.lastRow.number, 11);
    worksheet.mergeCells(worksheet.lastRow.number - 1, 12, worksheet.lastRow.number, 12);

    [worksheet.getRow(worksheet.lastRow.number - 1), worksheet.getRow(worksheet.lastRow.number)].forEach(row => {
        row.eachCell(cell => { cell.font = boldFont; cell.fill = headerFill; cell.alignment = centerAlignment; cell.border = border; });
    });


    const filasPendientes = tablaPendientes.querySelectorAll('tbody tr');
    let hayPendientesReales = false;
    filasPendientes.forEach(fila => {
        
        let celdas = [];
        const materiaCell = fila.cells[0];
        if (materiaCell.querySelector('select')) {
            celdas.push(getTextOrValue(materiaCell.querySelector('select')));
        } else {
            celdas.push(materiaCell.innerHTML.replace(/<br\s*\/?>/gi, '\n'));
        }

        Array.from(fila.querySelectorAll('input, textarea')).forEach((input) => {
            celdas.push(getTextOrValue(input));
        });
        
        if (celdas[0] && celdas[0] !== "" && celdas[0] !== "Seleccionar materia...") {
            hayPendientesReales = true;
            const row = worksheet.addRow(celdas);
            row.eachCell((cell, colNumber) => {
                 if ([1, 12].includes(colNumber)) {
                    cell.alignment = leftAlignment;
                    cell.value = cell.value.toString(); 
                 }
                 else cell.alignment = centerAlignment;
                 
                cell.border = border;
                if (colNumber >= 4 && colNumber <= 10) {
                    const numValue = parseFloat(cell.value);
                    if (!isNaN(numValue)) { cell.value = numValue; cell.numFmt = '0.00'; }
                    else { cell.value = ''; }
                }
            });
        }
    });

    if (!hayPendientesReales) {
        const noPendientesRow = worksheet.addRow(['No hay materias pendientes de aprobación.']);
        worksheet.mergeCells(noPendientesRow.number, 1, noPendientesRow.number, 12);
        noPendientesRow.getCell(1).alignment = { horizontal: 'center' };
        noPendientesRow.getCell(1).font = { italic: true };
        noPendientesRow.getCell(1).border = border;
    }

    worksheet.addRow([]);

    // --- Observaciones ---
    const obsContainer = document.getElementById("observaciones-container");
    const obsRows = Array.from(obsContainer.querySelectorAll('p.obs-text, textarea.obs-input, p.obs-text-preview'));
    
    if (obsRows.length > 0) {
        worksheet.addRow(['OBSERVACIONES']).eachCell(cell => { cell.font = { bold: true, size: 14 }; cell.alignment = centerAlignment; });
        worksheet.mergeCells(worksheet.lastRow.number, 1, worksheet.lastRow.number, 12);

        let hasRealObs = false;
        
        obsRows.forEach((element) => {
            const obsText = getTextOrValue(element);
            if (obsText && obsText.trim() !== "" && obsText.trim() !== "Sin observaciones.") {
                hasRealObs = true;
                const row = worksheet.addRow([obsText]);
                worksheet.mergeCells(row.number, 1, row.number, 12); 
                row.getCell(1).border = border;
                row.getCell(1).alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
            }
        });
        
        if (!hasRealObs) {
             const row = worksheet.addRow(["Sin observaciones."]);
             worksheet.mergeCells(row.number, 1, row.number, 12); 
             row.getCell(1).border = border;
             row.getCell(1).font = { italic: true };
             row.getCell(1).alignment = { horizontal: 'center' };
        }
    }

    // Ajustar anchos de columnas
    worksheet.columns.forEach((column, i) => {
        let maxLength = 10;
        column.eachCell({ includeEmpty: true }, cell => {
            let columnLength = cell.value ? cell.value.toString().length : 10;
            if (cell.value && cell.value.toString().includes('\n')) {
                 columnLength = cell.value.toString().split('\n').reduce((max, line) => Math.max(max, line.length), 0);
            }
            if (columnLength > maxLength) maxLength = columnLength;
        });
        column.width = maxLength < 12 ? 12 : maxLength + 2;
        if (i === 0) column.width = 35; // Columna Materia (Principal)
        if (headerPendientes[i] === 'MATERIA') column.width = 35;
        if (headerPendientes[i] === 'OBSERVACIONES') column.width = 40;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), `Boletin_${estudiante.replace(/\s+/g, '_')}.xlsx`);
}

// --- Lógica de Notificaciones (Oculta para preceptor) ---
async function setupNotifications() {
    const notiIcon = document.getElementById("notification-icon");

    if (isEditable) {
        if (notiIcon) notiIcon.style.display = 'none';
        return;
    }

    if (!notiIcon || !targetUserEmail) return;

    const notiWrapper = notiIcon.querySelector(".icon-wrapper");
    const notiDot = notiIcon.querySelector(".notification-dot");
    const notiPanel = notiIcon.querySelector(".notification-panel");
    const notiList = document.getElementById("notification-list");

    let hasNewNotifications = false;
    notiList.innerHTML = '<li>Cargando...</li>';

    try {
        const response = await fetch(`../api/get_notificaciones.php?email=${targetUserEmail}`);
        const data = await response.json();

        if (data.success && data.notificaciones.length > 0) {
            notiList.innerHTML = '';
            let unreadCount = 0;
            data.notificaciones.forEach(notif => {
                if (notif.leida == 0) unreadCount++;
                const li = document.createElement("li");
                li.textContent = notif.mensaje;
                notiList.appendChild(li);
            });
            if (unreadCount > 0) {
                notiDot.classList.add("show");
                hasNewNotifications = true;
            } else {
                 notiDot.classList.remove("show");
            }
        } else {
            notiList.innerHTML = '<li class="empty">No hay notificaciones nuevas.</li>';
            notiDot.classList.remove("show");
        }
    } catch (e) {
        console.error("Error al cargar notificaciones:", e);
        notiList.innerHTML = '<li class="empty">Error al cargar notificaciones.</li>';
    }

    notiWrapper.addEventListener("click", async (event) => {
        event.stopPropagation();
        notiPanel.classList.toggle("show");

        if (notiPanel.classList.contains("show") && hasNewNotifications) {
            notiDot.classList.remove("show");
            hasNewNotifications = false;

            try {
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

    document.addEventListener("click", (event) => {
        if (notiPanel && notiIcon && !notiIcon.contains(event.target)) {
            notiPanel.classList.remove("show");
        }
    });
}


// --- Cargar Notas (CORREGIDO - CON INASISTENCIAS Y LÓGICA DE TABLAS) ---
async function cargarNotasDelAlumno() {
    const alumnoEmail = targetUserEmail;
    const tablaMateriasBody = document.querySelector("#tabla-materias tbody");
    const tablaPendientesBody = document.querySelector("#tabla-pendientes tbody");
    const obsContainer = document.getElementById("observaciones-container");
    const inasistenciasContainer = document.getElementById("inasistencias-totales-container");
    
    let totalInasistencias1C = 0;
    let totalInasistencias2C = 0;

    gradesMap = {};
    allCourseSubjects = [];
    
    tablaMateriasBody.innerHTML = '<tr><td colspan="8">Cargando calificaciones...</td></tr>';
    tablaPendientesBody.innerHTML = '<tr><td colspan="12">Cargando materias pendientes...</td></tr>';
    if (obsContainer) obsContainer.innerHTML = '';
    if (inasistenciasContainer) inasistenciasContainer.innerHTML = ''; 

    const NOTA_APROBACION = 7;
    
    try {
        // --- 1. Obtener datos del alumno y su curso actual ---
        const userResponse = await fetch(`../api/get_user_by_email.php?email=${targetUserEmail}`);
        const userData = await userResponse.json();

        let anio = null;
        let division = null;
        let anioDisplay = 'N/A';
        let is7mo = false; 

        if (userData.success && userData.user && userData.user.curso_info) {
             try {
                 const cursoInfoParsed = JSON.parse(userData.user.curso_info);
                 if (cursoInfoParsed && cursoInfoParsed.curso) {
                     anio = cursoInfoParsed.curso.anio;
                     division = cursoInfoParsed.curso.division;
                     anioDisplay = anio; 
                     is7mo = anio === '7mo'; 
                 }
             } catch (e) { 
                 console.error("Error parseando curso_info:", e); 
                 throw new Error("Datos de curso incompletos o inválidos.");
             }
        } else {
            throw new Error("No se encontró información de curso para el alumno.");
        }

        // --- 2. Obtener la lista de materias del curso actual ---
        const subjectsResponse = await fetch(`../api/get_subjects_by_course.php?anio=${anio}&division=${division}`);
        const subjectsData = await subjectsResponse.json();
        
        if (!subjectsData.success || !Array.isArray(subjectsData.materias)) {
             throw new Error('Error al cargar la lista de materias del curso.');
        }
        allCourseSubjects = subjectsData.materias;

        // --- 3. Obtener TODAS las notas del alumno (de todos los años) ---
        const gradesResponse = await fetch('../api/get_grades.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alumno_email: alumnoEmail })
        });
        
        if (!gradesResponse.ok) throw new Error('Error al cargar notas.');
        
        const notasDelAlumno = await gradesResponse.json(); 
        
        let generalObs = [];
        gradesMap = {}; // Limpiar mapa

        if (Array.isArray(notasDelAlumno)) {
            notasDelAlumno.forEach(nota => {
                if (nota.materia.startsWith('Observacion_')) {
                    generalObs.push(nota);
                } else {
                    gradesMap[nota.materia] = nota; 

                    if (nota.materia && !nota.materia.startsWith('Observacion_')) {
                        // Sumar inasistencias solo si la materia es del curso actual
                        if (allCourseSubjects.includes(nota.materia)) {
                           totalInasistencias1C += parseInt(nota.inasistencias_1c) || 0;
                           totalInasistencias2C += parseInt(nota.inasistencias_2c) || 0;
                        }
                    }
                }
            });
        }
        
        tablaMateriasBody.innerHTML = '';
        tablaPendientesBody.innerHTML = '';
        if (obsContainer) obsContainer.innerHTML = '';
        
        // --- 4. Renderizar OBSERVACIONES ---
        if (obsContainer) {
            const obsTable = document.createElement('table');
            obsTable.className = 'tabla-observaciones';
            let obsBody = '<tbody>';
            const totalObsRows = 8;
            let obsCount = 0;
            
            let existingObs = [];
            // Solo mostrar observaciones de materias DEL AÑO ACTUAL en este cuadro
            allCourseSubjects.forEach(materiaNombre => {
                 const nota = gradesMap[materiaNombre] || {};
                 const obs = nota.observaciones || '';
                 if (obs && obs.trim() !== '' && allCourseSubjects.includes(materiaNombre)) {
                     existingObs.push({ key: materiaNombre, texto: `(${materiaNombre}) ${obs}` });
                 }
            });
            generalObs.forEach(nota => {
                 const obs = nota.observaciones || '';
                 if (obs && obs.trim() !== '') {
                     existingObs.push({ key: nota.materia, texto: obs });
                 }
            });

            existingObs.forEach(obsData => {
                 if (obsCount < totalObsRows) {
                     let cellContent = '';
                     // Siempre deshabilitado al cargar
                     cellContent = `<textarea class="obs-input" data-materia="${obsData.key}" disabled>${obsData.texto}</textarea>`;
                     obsBody += `<tr><td>${cellContent}</td></tr>`;
                     obsCount++;
                 }
            });

            if (isEditable) {
                 for (let i = obsCount; i < totalObsRows; i++) {
                     const genericKey = `Observacion_${i + 1}`;
                     obsBody += `<tr><td><textarea class="obs-input" data-materia="${genericKey}" placeholder="Nueva observación..." disabled></textarea></td></tr>`;
                 }
            }
            
            if (obsCount === 0 && !isEditable) {
                 obsBody += `<tr><td><p class="obs-text" style="font-style: italic; color: grey;">Sin observaciones.</p></td></tr>`;
            }
            
            obsBody += '</tbody>';
            obsTable.innerHTML = obsBody;
            obsContainer.appendChild(obsTable);
        }
        
        // --- 5. RENDERIZAR TABLA PRINCIPAL (SÓLO MATERIAS DEL AÑO) ---
        allCourseSubjects.sort();
        
        if (allCourseSubjects.length === 0) {
             tablaMateriasBody.innerHTML = `<tr><td colspan="8">No se encontraron materias para el curso ${anio} ${division}.</td></tr>`;
        }
        
        allCourseSubjects.forEach(materiaNombre => {
            const nota = gradesMap[materiaNombre] || {}; 
            
            const nota1 = parseFloat(nota.calificacion_1c) || 0;
            const nota2 = parseFloat(nota.calificacion_2c) || 0;
            let notaAgosto = parseFloat(nota.intensificacion_1c_agosto) || 0;
            const notaDic = parseFloat(nota.diciembre) || 0;
            const notaFeb = parseFloat(nota.febrero) || 0;
            
            const notaMarzo = parseFloat(nota.marzo) || 0;
            const notaJunio = parseFloat(nota.junio) || 0;
            const notaJulio = parseFloat(nota.julio) || 0;

            let notaFinalMateria = parseFloat(nota.final) || 0; 
            let estadoMateria = 'pendiente';
            let finalDisplay = '';
            let agostoDisplayPrincipal = notaAgosto > 0 ? notaAgosto.toFixed(2) : '';

            if (nota1 >= NOTA_APROBACION && nota2 >= NOTA_APROBACION) {
                notaFinalMateria = (nota1 + nota2) / 2;
                finalDisplay = notaFinalMateria.toFixed(2);
                estadoMateria = 'aprobado'; 
            } else {
                estadoMateria = 'desaprobado'; 
                if (notaMarzo >= NOTA_APROBACION) {
                    finalDisplay = notaMarzo.toFixed(2);
                    estadoMateria = 'aprobado';
                } else if (notaJunio >= NOTA_APROBACION) {
                    finalDisplay = notaJunio.toFixed(2);
                    estadoMateria = 'aprobado';
                } else if (notaJulio >= NOTA_APROBACION) {
                    finalDisplay = notaJulio.toFixed(2);
                    estadoMateria = 'aprobado';
                } else if (notaAgosto >= NOTA_APROBACION && !is7mo) {
                    if(nota1 < NOTA_APROBACION && nota2 >= NOTA_APROBACION) {
                        finalDisplay = ((notaAgosto + nota2) / 2).toFixed(2);
                    } else {
                        finalDisplay = notaAgosto.toFixed(2);
                    }
                    estadoMateria = 'aprobado';
                } else if (notaDic >= NOTA_APROBACION) {
                    finalDisplay = notaDic.toFixed(2);
                    estadoMateria = 'aprobado'; 
                } else if (notaFeb >= NOTA_APROBACION) {
                    finalDisplay = notaFeb.toFixed(2);
                    estadoMateria = 'aprobado'; 
                }
                
                if (estadoMateria === 'desaprobado' && notaFinalMateria > 0) {
                    finalDisplay = notaFinalMateria.toFixed(2);
                }
                if (is7mo) agostoDisplayPrincipal = '';
            } 
            
            const finalClass = (estadoMateria === 'desaprobado' && finalDisplay !== '') ? 'desaprobado-pendiente' : '';
            const editableClass = isEditable ? 'nota-editable' : 'mate1';
            const finalEditableClass = isEditable ? 'nota-editable-final' : 'mate1';
            const readonlyAttr = 'readonly';
            const disabledAttr = 'disabled="disabled"';

            const filaPrincipal = document.createElement('tr');
            filaPrincipal.dataset.materia = materiaNombre;
            
            filaPrincipal.innerHTML = `
                <td><textarea class="mate1" readonly style="resize: none; overflow: hidden; height: auto;">${materiaNombre}</textarea></td>
                <td><input type="text" class="mate1" value="${anioDisplay}" readonly></td>
                <td><input type="number" step="0.01" class="${editableClass}" value="${nota1 > 0 ? nota1.toFixed(2) : ''}" ${readonlyAttr} ${disabledAttr} data-field="calificacion_1c"></td>
                <td><input type="number" step="0.01" class="${editableClass}" value="${nota2 > 0 ? nota2.toFixed(2) : ''}" ${readonlyAttr} ${disabledAttr} data-field="calificacion_2c"></td>
                <td class="td-intensif-1c"><input type="number" step="0.01" class="${editableClass}" value="${agostoDisplayPrincipal}" ${readonlyAttr} ${disabledAttr} data-field="intensificacion_1c_agosto"></td>
                <td><input type="number" step="0.01" class="${editableClass}" value="${notaDic > 0 ? notaDic.toFixed(2) : ''}" ${readonlyAttr} ${disabledAttr} data-field="diciembre"></td>
                <td><input type="number" step="0.01" class="${editableClass}" value="${notaFeb > 0 ? notaFeb.toFixed(2) : ''}" ${readonlyAttr} ${disabledAttr} data-field="febrero"></td>
                <td><input type="number" step="0.01" class="${finalEditableClass} ${finalClass}" value="${finalDisplay}" ${readonlyAttr} ${disabledAttr} data-field="final"></td>
            `;
            tablaMateriasBody.appendChild(filaPrincipal);
        }); 
        
        // --- 6. RENDERIZAR TABLA PENDIENTES (DE ESTE AÑO Y ANTERIORES) ---
        let hayPendientes = false;
        
        Object.keys(gradesMap).sort().forEach(materiaNombre => {
            if (materiaNombre.startsWith('Observacion_') || materiaNombre === "Boletín General (Editado por Preceptor)") {
                return;
            }

            const nota = gradesMap[materiaNombre];
            
            const nota1 = parseFloat(nota.calificacion_1c) || 0;
            const nota2 = parseFloat(nota.calificacion_2c) || 0;
            let notaAgosto = parseFloat(nota.intensificacion_1c_agosto) || 0;
            const notaDic = parseFloat(nota.diciembre) || 0;
            const notaFeb = parseFloat(nota.febrero) || 0;
            const notaMarzo = parseFloat(nota.marzo) || 0;
            const notaJunio = parseFloat(nota.junio) || 0;
            const notaJulio = parseFloat(nota.julio) || 0;
            const modelo = nota.modelo || '';
            let notaFinalMateria = parseFloat(nota.final) || 0; 
            
            let estadoMateria = 'pendiente';
            let finalDisplay = '';

            if (nota1 >= NOTA_APROBACION && nota2 >= NOTA_APROBACION) {
                estadoMateria = 'aprobado'; 
            } else {
                estadoMateria = 'desaprobado'; 
                if (notaMarzo >= NOTA_APROBACION) {
                    finalDisplay = notaMarzo.toFixed(2);
                    estadoMateria = 'aprobado';
                } else if (notaJunio >= NOTA_APROBACION) {
                    finalDisplay = notaJunio.toFixed(2);
                    estadoMateria = 'aprobado';
                } else if (notaJulio >= NOTA_APROBACION) {
                    finalDisplay = notaJulio.toFixed(2);
                    estadoMateria = 'aprobado';
                } else if (notaAgosto >= NOTA_APROBACION && !(nota.curso_anio && nota.curso_anio.startsWith('7mo'))) {
                    if(nota1 < NOTA_APROBACION && nota2 >= NOTA_APROBACION) {
                        finalDisplay = ((notaAgosto + nota2) / 2).toFixed(2);
                    } else {
                        finalDisplay = notaAgosto.toFixed(2);
                    }
                    estadoMateria = 'aprobado';
                } else if (notaDic >= NOTA_APROBACION) {
                    finalDisplay = notaDic.toFixed(2);
                    estadoMateria = 'aprobado'; 
                } else if (notaFeb >= NOTA_APROBACION) {
                    finalDisplay = notaFeb.toFixed(2);
                    estadoMateria = 'aprobado'; 
                }
                
                if (estadoMateria === 'desaprobado' && notaFinalMateria > 0) {
                    finalDisplay = notaFinalMateria.toFixed(2);
                }
            }
            
            const esMateriaDelCurso = allCourseSubjects.includes(materiaNombre);
            
            if ( (esMateriaDelCurso && estadoMateria === 'desaprobado') || (!esMateriaDelCurso && estadoMateria !== 'aprobado') ) {
                hayPendientes = true;
                const filaPendiente = document.createElement('tr');
                filaPendiente.dataset.materia = materiaNombre;
                
                const anioPendiente = (nota.curso_anio) ? nota.curso_anio.split(' ')[0] : (esMateriaDelCurso ? anioDisplay : 'N/A');
                const fechaCarga = nota.fecha_carga ? new Date(nota.fecha_carga).getFullYear() : 'N/A';
                const obsPendiente = nota.observaciones || '';
                
                const finalClass = (estadoMateria === 'desaprobado' && finalDisplay !== '') ? 'desaprobado-pendiente' : '';
                const editableClass = isEditable ? 'nota-editable' : 'mate1';
                const finalEditableClass = isEditable ? 'nota-editable-final' : 'mate1';
                const obsEditableClass = isEditable ? 'obs-input' : 'mate1';
                const readonlyAttr = 'readonly';
                const disabledAttr = 'disabled="disabled"';

                let materiaFormateada = materiaNombre.replace(/, /g, ',<br>').replace(/ y /g, '<br>y ');

                filaPendiente.innerHTML = `
                    <td class="materia-pendiente-cell">${materiaFormateada}</td>
                    <td><input type="text" class="${editableClass}" value="${anioPendiente}" ${readonlyAttr} ${disabledAttr} data-field="anio_cursado"></td>
                    <td><input type="text" class="mate1" value="${fechaCarga}" readonly data-field="ciclo_lectivo"></td>
                    
                    <td><input type="number" step="0.01" class="${editableClass}" value="${notaMarzo > 0 ? notaMarzo.toFixed(2) : ''}" ${readonlyAttr} ${disabledAttr} data-field="marzo"></td> 
                    <td><input type="number" step="0.01" class="${editableClass}" value="${notaJunio > 0 ? notaJunio.toFixed(2) : ''}" ${readonlyAttr} ${disabledAttr} data-field="junio"></td> 
                    <td><input type="number" step="0.01" class="${editableClass}" value="${notaJulio > 0 ? notaJulio.toFixed(2) : ''}" ${readonlyAttr} ${disabledAttr} data-field="julio"></td> 
                    <td><input type="number" step="0.01" class="${editableClass}" value="${notaAgosto > 0 ? notaAgosto.toFixed(2) : ''}" ${readonlyAttr} ${disabledAttr} data-field="intensificacion_1c_agosto"></td> 
                    <td><input type="number" step="0.01" class="${editableClass}" value="${notaDic > 0 ? notaDic.toFixed(2) : ''}" ${readonlyAttr} ${disabledAttr} data-field="diciembre"></td> 
                    <td><input type="number" step="0.01" class="${editableClass}" value="${notaFeb > 0 ? notaFeb.toFixed(2) : ''}" ${readonlyAttr} ${disabledAttr} data-field="febrero"></td> 
                    <td><input type="number" step="0.01" class="${finalEditableClass} ${finalClass}" value="${finalDisplay}" ${readonlyAttr} ${disabledAttr} data-field="final"></td> 
                    <td><input type="text" class="${editableClass}" value="${modelo}" ${readonlyAttr} ${disabledAttr} data-field="modelo"></td> 
                    <td><textarea class="${obsEditableClass}" ${readonlyAttr} ${disabledAttr} data-field="observaciones">${obsPendiente}</textarea></td> 
                `;
                tablaPendientesBody.appendChild(filaPendiente);
            }
        }); 
        // --- FIN RENDERIZADO ---

        if (!hayPendientes && !isEditable) { 
            tablaPendientesBody.innerHTML = '<tr class="no-pendientes"><td colspan="12">No hay materias pendientes de aprobación.</td></tr>';
        } else if (isEditable) {
             for (let i = 0; i < 5; i++) {
                 agregarFilaPendiente(true); // Cargar 5 filas ocultas
             }
             document.querySelectorAll('.fila-nueva-pendiente .nota-editable, .fila-nueva-pendiente .nota-editable-final, .fila-nueva-pendiente .obs-input, .fila-nueva-pendiente .materia-pendiente-select').forEach(el => {
                el.readOnly = true;
                el.disabled = true;
            });
        }

        // --- LÓGICA DE INASISTENCIAS ---
        if (inasistenciasContainer) {
            let totalInasistencias = totalInasistencias1C + totalInasistencias2C;
            inasistenciasContainer.innerHTML = `
                <table class="tabla-2" style="width: 100%; max-width: 800px; margin: 0; text-align: center;">
                    <thead>
                        <tr>
                            <th class="th-2" style="min-width: 150px;">1° Cuatrimestre</th>
                            <th class="th-2" style="min-width: 150px;">2° Cuatrimestre</th>
                            <th class="th-2" style="min-width: 150px;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="font-size: 20px;">${totalInasistencias1C}</td>
                            <td style="font-size: 20px;">${totalInasistencias2C}</td>
                            <td style="font-size: 20px;"><b>${totalInasistencias}</b></td>
                        </tr>
                    </tbody>
                </table>
            `;
        }

        // === INICIO DE CORRECCIÓN (VISTA PREVIA POR DEFECTO) ===
        if (isEditable) {
            aplicarVistaPrevia();
        }
        // === FIN DE CORRECCIÓN ===
        
    } catch (e) {
        console.error("Error al cargar notas del alumno:", e);
        tablaMateriasBody.innerHTML = `<tr><td colspan="8">Error al cargar calificaciones: ${e.message}</td></tr>`;
        tablaPendientesBody.innerHTML = `<tr><td colspan="12">Error al cargar materias pendientes: ${e.message}</td></tr>`;
         if (obsContainer) obsContainer.innerHTML = '<p class="obs-text" style="color: red;">Error al cargar observaciones.</p>';
         if (inasistenciasContainer) inasistenciasContainer.innerHTML = '<p style="text-align: center; color: red;">Error al cargar inasistencias.</p>';
    }
}

// --- === CORRECCIÓN N° 1: FUNCIÓN DE DATOS PERSONALES RESTAURADA === ---
async function cargarDatosPersonales() {
    const tabla = document.querySelector("#tabla-datos-generales");
    const targetEmail = targetUserEmail;

    if (!tabla) return;

    // Referencias a los inputs en el HTML
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

                if (inputAnio) inputAnio.value = curso.anio || '';
                if (inputDivision) inputDivision.value = curso.division || '';
                if (inputEspecialidad) inputEspecialidad.value = curso.especialidad || '';

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


// --- DOMContentLoaded (MODIFICADO) ---
document.addEventListener("DOMContentLoaded", async () => { 

    if (isEditable) {
        const guardarBtn = document.getElementById('guardarBtn');
        const modificarBtn = document.getElementById('modificarBtn');
        const agregarFilaBtn = document.getElementById('agregarFilaPendienteBtn');
        
        // --- INICIO DE CORRECCIÓN (VISTA PREVIA POR DEFECTO) ---
        // 1. Poner el contenedor en modo Vista Previa
        const boletin = document.querySelector('.boletin-container');
        if (boletin) boletin.classList.add("vista-previa");

        // 2. Configurar botones para el estado inicial
        if (guardarBtn) {
            guardarBtn.style.display = 'none'; 
            guardarBtn.disabled = true;
            guardarBtn.style.backgroundColor = '#999'; 
            guardarBtn.addEventListener('click', guardarDatosEnServidor);
        }
        if (modificarBtn) {
            modificarBtn.style.display = 'inline-block'; // Mostrar Modificar
            modificarBtn.addEventListener('click', habilitarEdicion);
        }
        if (agregarFilaBtn) {
             agregarFilaBtn.style.display = 'none'; // Ocultar
             agregarFilaBtn.addEventListener('click', mostrarYActivarFilaPendiente);
        }
        // --- FIN DE CORRECCIÓN ---
    }
    
    // --- AÑADIDO: Listener para el botón de exportar ---
    const exportarBtn = document.getElementById("exportarBtn");
    if (exportarBtn) {
        exportarBtn.addEventListener("click", exportarAExcel);
    }
    
    const emailDisplay = document.getElementById('user-email-display');
    if (emailDisplay && activeUser && activeUser.email) {
        let emailName = activeUser.email.split('@')[0];
        if (isEditable) {
            emailName = activeUser.email.split('@')[0];
        } else {
             emailName = targetUserEmail.split('@')[0];
        }
        if (emailName.length > 20) {
            emailName = emailName.substring(0, 17) + '...';
        }
        emailDisplay.textContent = emailName;
    }

    await cargarTodasLasMaterias();
    setupNotifications(); 
    cargarDatosPersonales();
    cargarNotasDelAlumno();
});

// --- Función de Info Personal (Lógica de tu Meta 3) ---
function showPersonalInfo() {
    let userToShow = activeUser;
    if (!isEditable) {
        userToShow = activeUser; 
    }
    
    alert(
        'Información Personal:\n\n' +
        'Email: ' + (userToShow.email || 'No disponible') + '\n' +
        'Nombre: ' + (userToShow.fullname || 'No disponible') + '\n' +
        'DNI: ' + (userToShow.dni || 'No disponible') + '\n' +
        'Rol: ' + (userToShow.role || 'No disponible')
    );
}