// sistema-de-gestion-de-notas/js/admin.js

// Verifica si hay sesión activa al cargar la página
const activeUserJSON = sessionStorage.getItem("activeUser");
if (!activeUserJSON) {
    window.location.href = "principal.html";
}
const activeUser = JSON.parse(activeUserJSON);

//!-- Script para evitar volver atrás con el historial -->
window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.go(1);
    window.location.href = "principal.html";
};


/* ------------------------------------------
 MANEJO DE MODALES (SE MANTIENE LOCAL)
 ------------------------------------------ */
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

function openAlertModal(message) {
    document.getElementById('alertMessage').textContent = message;
    openModal('alertModal');
}

/* ------------------------------------------
   CRUD DE USUARIOS ACTIVOS
   ------------------------------------------ */
function openCreateModal() {
    document.getElementById('userForm').reset();
    document.getElementById('modalTitle').textContent = 'Crear Nuevo Usuario';
    document.getElementById('userEmail').readOnly = false;
    document.getElementById('emailError').style.display = 'none';
    document.getElementById('userPassword').placeholder = "Ingrese la contraseña";
    document.getElementById('userPassword').required = true;
    document.getElementById('userForm').onsubmit = handleCreateUser;
    openModal('userModal');
}

function openEditModal(email) {
    // La lógica de obtener el usuario se realiza dentro de la función async de edición
    document.getElementById('userForm').reset();
    document.getElementById('modalTitle').textContent = 'Editar Usuario';
    document.getElementById('emailError').style.display = 'none';
    document.getElementById('originalEmail').value = email;
    document.getElementById('userEmail').value = email;
    document.getElementById('userEmail').readOnly = true;
    document.getElementById('userPassword').placeholder = "Dejar en blanco para no cambiar";
    document.getElementById('userPassword').required = false;

    // Cargar datos actuales del usuario (fetch)
    fetch(`../api/get_user_by_email.php?email=${email}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const user = data.user;
                document.getElementById('userFullname').value = user.fullname || '';
                document.getElementById('userDni').value = user.dni || '';
                document.getElementById('userRole').value = user.role;
            } else {
                alert("Error al cargar datos del usuario para edición.");
                closeModal('userModal');
            }
        });

    document.getElementById('userForm').onsubmit = handleEditUser;
    openModal('userModal');
}

function openDeleteModal(email) {
    document.getElementById('deleteMessage').textContent = `¿Estás seguro de que quieres eliminar al usuario ${email}?`;
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.textContent = 'Eliminar';
    confirmBtn.className = 'btn btn-danger';

    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.onclick = () => handleDeleteUser(email);
    
    openModal('deleteModal');
}

async function handleCreateUser(event) {
    event.preventDefault();
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    const fullname = document.getElementById('userFullname').value;
    const dni = document.getElementById('userDni').value;
    const emailError = document.getElementById('emailError');

    if (!email.endsWith("@eest5.com")) {
        emailError.textContent = "Debe ser un correo @eest5.com.";
        emailError.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('../api/create_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role, fullname, dni })
        });
        const data = await response.json();

        if (data.success) {
            closeModal('userModal');
            cargarUsuarios();
        } else {
            emailError.textContent = data.message;
            emailError.style.display = 'block';
        }
    } catch (e) {
        alert("Error de conexión con el servidor.");
    }
}

async function handleEditUser(event) {
    event.preventDefault();
    const originalEmail = document.getElementById('originalEmail').value;
    const newPassword = document.getElementById('userPassword').value;
    const newRole = document.getElementById('userRole').value;
    const newFullname = document.getElementById('userFullname').value;
    const newDni = document.getElementById('userDni').value;

    try {
        const response = await fetch('../api/edit_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: originalEmail, newPassword, newRole, newFullname, newDni })
        });
        const data = await response.json();

        if (data.success) {
            closeModal('userModal');
            cargarUsuarios();
        } else {
            alert(data.message);
        }
    } catch (e) {
        alert("Error de conexión con el servidor.");
    }
}

async function handleDeleteUser(email) {
    try {
        const response = await fetch('../api/delete_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();

        if (data.success) {
            closeModal('deleteModal');
            cargarUsuarios();
        } else {
            alert(data.message);
        }
    } catch (e) {
        alert("Error de conexión con el servidor.");
    }
}

/* ------------------------------------------
   CARGA DE DATOS Y BÚSQUEDA (CON FILTRO)
   ------------------------------------------ */
let allUsersCache = []; // Cache global de usuarios

async function cargarUsuarios() {
    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "<tr><td colspan='5'>Cargando usuarios...</td></tr>";

    try {
        const response = await fetch('../api/get_users.php');
        allUsersCache = await response.json(); // Cargar cache
        
        if (!allUsersCache || allUsersCache.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5'>No hay usuarios activos registrados.</td></tr>";
        }
        
        searchUsers(); // Muestra todos los usuarios y aplica cualquier filtro de búsqueda activo
        
    } catch (e) {
        tbody.innerHTML = "<tr><td colspan='5'>Error al cargar usuarios del servidor.</td></tr>";
        console.error("Error al cargar usuarios:", e);
    }

    cargarSelects();
    cargarMaterias(); 
    cargarSolicitudes();
}

// Búsqueda local (Mantiene la función)
function searchUsers() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toUpperCase();
    const tbody = document.querySelector("#usersTable tbody");
    
    tbody.innerHTML = "";
    let resultsFound = false;

    allUsersCache.forEach(user => {
        // Concatenar campos clave para la búsqueda
        const userText = `${user.fullname} ${user.dni} ${user.email} ${user.role}`.toUpperCase();
        
        if (userText.indexOf(filter) > -1) {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${user.fullname || 'No especificado'}</td>
            <td>${user.dni || 'No especificado'}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <button class="accion-boton-1" onclick="openEditModal('${user.email}')">Editar</button>
                <button class="accion-boton" onclick="openDeleteModal('${user.email}')">Eliminar</button>
            </td>
            `;
            tbody.appendChild(row);
            resultsFound = true;
        }
    });
    
    if (!resultsFound) {
        tbody.innerHTML = "<tr><td colspan='5'>No se encontraron resultados.</td></tr>";
    }
}

// Listener para el input de búsqueda
document.getElementById('searchInput').addEventListener('keyup', searchUsers);


/* ------------------------------------------
   MANEJO DE SOLICITUDES PENDIENTES
   ------------------------------------------ */
function toggleSolicitudes() {
    const content = document.getElementById("solicitudesContent");
    const flecha = document.getElementById("flecha");

    const isHidden = content.style.display === "none" || content.style.display === "";
    content.style.display = isHidden ? "block" : "none";
    flecha.textContent = isHidden ? "⬆" : "⬇";
}

async function cargarSolicitudes() {
    const pendingList = document.getElementById("pendingList");
    pendingList.innerHTML = "<li>Cargando solicitudes pendientes...</li>";

    try {
        const response = await fetch('../api/get_pending.php');
        const pendingUsers = await response.json();
        
        pendingList.innerHTML = "";

        if (!pendingUsers || pendingUsers.length === 0) {
             pendingList.innerHTML = '<li>No hay solicitudes pendientes.</li>';
             return;
        }

        pendingUsers.forEach((userReq, index) => {
            const date = new Date(userReq.requested_at).toLocaleString();
            const li = document.createElement("li");
            li.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                    <div>
                        <b>${userReq.fullname} (${userReq.dni})</b><br>
                        <span style="font-size:14px;color:#333">${userReq.email}</span><br>
                        <span style="font-size:12px;color:#666">${date}</span>
                    </div>
                    <div class="contenedor-botones">
                        <button onclick="openApprovalModal('${userReq.id}', '${userReq.email}', '${userReq.fullname}', '${userReq.dni}')">Aprobar</button>
                        <button onclick="openRejectModal('${userReq.id}', '${userReq.fullname}')">Rechazar</button>
                    </div>
                </div>`;
            pendingList.appendChild(li);
        });
    } catch (e) {
        pendingList.innerHTML = '<li>Error al cargar solicitudes del servidor.</li>';
        console.error("Error al cargar solicitudes:", e);
    }
}


function openApprovalModal(id, email, fullname, dni) {
    document.getElementById('approveEmail').textContent = email;
    document.getElementById('approveName').textContent = fullname;
    document.getElementById('approveDni').textContent = dni;

    const confirmBtn = document.getElementById('confirmApproveBtn');
    confirmBtn.onclick = () => handleApproveUser(id, email, fullname, dni);

    openModal('approvalModal');
}

async function handleApproveUser(id, email, fullname, dni) {
    const role = document.getElementById('approveRoleSelect').value;
    const approveBtn = document.getElementById('confirmApproveBtn');

    if (!role) {
        openAlertModal("Debe asignar un rol.");
        return;
    }
    
    approveBtn.disabled = true;

    try {
        const response = await fetch('../api/approve_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_pendiente: id, email, fullname, dni, role })
        });
        
        const data = await response.json();

        if (!response.ok && data.message) {
            throw new Error(data.message);
        }

        if (data.success) {
            const autoPassword = data.auto_password || 'N/A (Verifique logs/email)';
            openAlertModal(`Usuario ${fullname} aprobado como ${role}. Contraseña generada: ${autoPassword}. La contraseña fue enviada al correo.`);
            
            closeModal('approvalModal');
            cargarUsuarios();
            cargarSolicitudes();
        } else {
            openAlertModal(data.message || 'Error al aprobar usuario (DB).');
        }

    } catch (e) {
        openAlertModal(`Error al aprobar: ${e.message}`);
        console.error("Fallo en la aprobación:", e);
    } finally {
        approveBtn.disabled = false;
    }
}

// --- FUNCIONES PARA RECHAZAR SOLICITUD ---
function openRejectModal(id, fullname) {
    document.getElementById('deleteMessage').textContent = `¿Estás seguro de que quieres rechazar la solicitud de ${fullname}?`;
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.textContent = 'Rechazar';
    confirmBtn.className = 'btn btn-danger';

    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.onclick = () => handleRejectUser(id);

    openModal('deleteModal');
}

async function handleRejectUser(id) {
    try {
        const response = await fetch('../api/delete_pending.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_pendiente: id })
        });
        const data = await response.json();

        closeModal('deleteModal');

        if (data.success) {
            openAlertModal("Solicitud rechazada correctamente.");
            cargarSolicitudes();
        } else {
            openAlertModal(data.message || 'Error al rechazar la solicitud.');
        }
    } catch (e) {
        closeModal('deleteModal');
        openAlertModal("Error de conexión con el servidor.");
        console.error(e);
    }
}

/* ------------------------------------------
   CRUD DE MATERIAS & FILTRADO DINÁMICO
   ------------------------------------------ */
let allMateriasCache = []; 

async function getEspecialidadFromCurso(anio, division) {
    if (!anio || !division) return null;
    try {
        const response = await fetch(`../api/get_especialidad.php?anio=${anio}&division=${division}`);
        const data = await response.json();
        
        if (data.success) {
            return data.especialidad;
        }
        return null;
    } catch (e) {
        console.error("Fallo al obtener especialidad:", e);
        return null;
    }
}


/**
 * Carga y filtra las materias para el panel de Gestión (tabla) y el select de Asignación.
 */
async function cargarMaterias() {
    const tbodyGestion = document.querySelector("#materiasTable tbody");
    const materiaSelectAdmin = document.getElementById("materiaSelectAdmin");
    
    // 1. Cargar caché si está vacía
    if (allMateriasCache.length === 0) {
        if (tbodyGestion) tbodyGestion.innerHTML = "<tr><td colspan='4'>Cargando materias...</td></tr>"; 
        if (materiaSelectAdmin) materiaSelectAdmin.innerHTML = '<option value="">Cargando materias...</option>';
        try {
            const response = await fetch('../api/get_materias.php');
            allMateriasCache = await response.json();
        } catch (e) {
            if (tbodyGestion) tbodyGestion.innerHTML = "<tr><td colspan='4'>Error al cargar materias.</td></tr>";
            if (materiaSelectAdmin) materiaSelectAdmin.innerHTML = '<option value="">Error al cargar</option>';
            return;
        }
    }

    // --- Lógica de filtrado para la TABLA DE GESTIÓN (Por Especialidad) ---
    const filtroEspecialidadTabla = document.getElementById("filtroEspecialidadMateria").value;
    
    let filteredMateriasForTable = allMateriasCache;
    if (filtroEspecialidadTabla && filtroEspecialidadTabla.trim() !== '') {
        filteredMateriasForTable = allMateriasCache.filter(m => 
            m.especialidad === filtroEspecialidadTabla || 
            (filtroEspecialidadTabla === 'Tronco Común' && (!m.especialidad || m.especialidad === 'Tronco Común')) ||
            (filtroEspecialidadTabla === 'Ciclo Básico' && m.especialidad === 'Ciclo Básico')
        );
    }
    
    // 2. Llenar la tabla de gestión (Gestionar Materias)
    if (tbodyGestion) { 
        tbodyGestion.innerHTML = "";
        filteredMateriasForTable.forEach(materia => { 
            const especialidadTexto = materia.especialidad && materia.especialidad.trim() !== '' 
                                      ? materia.especialidad 
                                      : 'Tronco Común'; 
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${materia.id}</td>
            <td>${materia.nombre}</td>
            <td style="text-align: center;">${especialidadTexto}</td> 
            <td>
                <button class="accion-boton" onclick="openDeleteMateriaModal('${materia.id}', '${materia.nombre}')">Eliminar</button>
            </td>
            `;
            tbodyGestion.appendChild(row);
        });
    }

    // 3. Llenar select de asignación (Filtro por curso: llama a setupMateriaFiltering para la lógica)
    if (materiaSelectAdmin) {
        materiaSelectAdmin.innerHTML = '<option value="">Seleccione una materia</option>';
        
        const anioSelected = document.getElementById("anioSelectProfesor").value;
        const divisionSelected = document.getElementById("divisionSelectProfesor").value;
        const especialidadFiltro = await getEspecialidadFromCurso(anioSelected, divisionSelected);

        if (!anioSelected || !divisionSelected) {
             materiaSelectAdmin.innerHTML = `<option value="">Seleccione Año y División</option>`;
             return;
        }
        
        let filteredMateriasForSelect = allMateriasCache;
        if (especialidadFiltro) {
            filteredMateriasForSelect = allMateriasCache.filter(m => 
                m.especialidad === especialidadFiltro || m.especialidad === 'Tronco Común' || !m.especialidad
            );
        }

        if (filteredMateriasForSelect.length === 0) {
            const msg = especialidadFiltro
                ? `No hay materias para ${especialidadFiltro}.` 
                : `No hay materias creadas.`;
            materiaSelectAdmin.innerHTML = `<option value="">${msg}</option>`;
        } else {
             filteredMateriasForSelect.forEach(materia => {
                const option = `<option value="${materia.nombre}">${materia.nombre}</option>`;
                materiaSelectAdmin.innerHTML += option;
            });
        }
    }
}

// --- Setup para el filtro de la TABLA DE GESTIÓN (Gestionar Materias) ---
function setupMateriaTableFiltering() {
    const filtroEspecialidadMateria = document.getElementById("filtroEspecialidadMateria");
    if (filtroEspecialidadMateria) {
        filtroEspecialidadMateria.addEventListener('change', () => cargarMaterias()); // Llama a cargarMaterias para recargar la tabla
    }
}

// --- Setup para el filtro del SELECT de Asignar Profesor ---
function setupMateriaFiltering() {
    const anioSelect = document.getElementById("anioSelectProfesor");
    const divisionSelect = document.getElementById("divisionSelectProfesor");

    if (!anioSelect || !divisionSelect) return; 

    const applyFilter = async () => {
        const anio = anioSelect.value;
        const division = divisionSelect.value;
        
        // Si no hay curso seleccionado, se recarga el select de asignación con la lista completa.
        if (!anio || !division) {
             cargarMaterias();
             return;
        }

        const especialidad = await getEspecialidadFromCurso(anio, division);

        if (especialidad) {
            // Recarga el select de asignación filtrado por especialidad
            cargarMaterias(); 
        } else {
             cargarMaterias();
        }
    };

    anioSelect.addEventListener('change', applyFilter);
    divisionSelect.addEventListener('change', applyFilter);
    applyFilter(); 
}

function openCreateMateriaModal() {
    document.getElementById('materiaForm').reset();
    openModal('materiaModal');
}

async function handleCreateMateria(event) {
    event.preventDefault();
    const nombre = document.getElementById('materiaNombre').value.trim();
    const especialidad = document.getElementById('materiaEspecialidad').value; 

    try {
        const response = await fetch('../api/create_materia.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, especialidad }) 
        });
        const data = await response.json();

        if (data.success) {
            closeModal('materiaModal');
            openAlertModal("Materia creada correctamente.");
            allMateriasCache = []; 
            cargarMaterias(); 
        } else {
            openAlertModal(data.message);
        }
    } catch (e) {
        openAlertModal("Error de conexión con el servidor.");
    }
}

function openDeleteMateriaModal(id, nombre) {
    document.getElementById('deleteMessage').textContent = `¿Estás seguro de que quieres eliminar la materia "${nombre}"?`;
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.textContent = 'Eliminar';
    confirmBtn.className = 'btn btn-danger'; 

    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.onclick = () => handleDeleteMateria(id);
    
    openModal('deleteModal');
}

async function handleDeleteMateria(id) {
    try {
        const response = await fetch('../api/delete_materia.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await response.json();

        closeModal('deleteModal'); 

        if (data.success) {
            openAlertModal("Materia eliminada correctamente.");
            allMateriasCache = [];
            cargarMaterias(); 
        } else {
            openAlertModal(data.message || 'Error al eliminar la materia.');
        }
    } catch (e) {
        openAlertModal("Error de conexión con el servidor.");
    }
}

/* ------------------------------------------
   FILTRO DE PROFESORES POR CURSO (NUEVA FUNCIÓN)
   ------------------------------------------ */

async function cargarProfesoresFiltrados() {
    const anio = document.getElementById("filtroAnioProf").value;
    const division = document.getElementById("filtroDivisionProf").value;
    const tbodyProfesores = document.querySelector("#profesoresFiltradosTable tbody");

    tbodyProfesores.innerHTML = '<tr><td colspan="2">Cargando...</td></tr>';

    if (!anio || !division) {
        tbodyProfesores.innerHTML = '<tr><td colspan="2">Seleccione un Año y una División.</td></tr>';
        return;
    }

    try {
        // 1. Llama a la API que filtra profesores por su JSON de curso_info
        const response = await fetch(`../api/get_profesores_by_course.php?anio=${anio}&division=${division}`);
        const profesores = await response.json();

        tbodyProfesores.innerHTML = '';
        
        if (profesores.length > 0) {
            // Agrupación para manejar las Parejas Pedagógicas
            const profesoresMap = new Map();
            profesores.forEach(p => {
                if (!profesoresMap.has(p.email)) {
                    profesoresMap.set(p.email, { fullname: p.fullname, materias: [] });
                }
                profesoresMap.get(p.email).materias.push(p.materia);
            });

            profesoresMap.forEach(profesor => {
                const row = document.createElement("tr");
                const materiasDisplay = profesor.materias.length > 1 
                    ? `Pareja Pedagógica: ${profesor.materias.join(', ')}`
                    : profesor.materias.join(', ');
                
                row.innerHTML = `
                    <td>${profesor.fullname}</td>
                    <td>${materiasDisplay}</td>
                `;
                tbodyProfesores.appendChild(row);
            });

        } else {
            tbodyProfesores.innerHTML = '<tr><td colspan="2">No hay profesores asignados a este curso.</td></tr>';
        }

    } catch (e) {
        console.error("Error al cargar profesores filtrados:", e);
        tbodyProfesores.innerHTML = '<tr><td colspan="2">Error de conexión con el servidor.</td></tr>';
    }

    // Aplicar Filtro:
    let filteredMaterias = allMateriasCache;
    if (filterEspecialidad) {
        // Filtra por la especialidad obtenida O por 'Tronco Común'
        filteredMaterias = allMateriasCache.filter(m => 
            m.especialidad === filterEspecialidad || m.especialidad === 'Tronco Común' || !m.especialidad
        );
    }

    // 4. Llenar la tabla de gestión (SOLO si existe el tbody - sin filtro para esta tabla)
    if (tbody && !filterEspecialidad) { // Solo actualiza la tabla de gestión en la carga inicial (sin filtro)
        tbody.innerHTML = "";
        allMateriasCache.forEach(materia => {
            const especialidadTexto = materia.especialidad && materia.especialidad.trim() !== '' 
                                      ? materia.especialidad 
                                      : 'Tronco Común'; 
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${materia.id}</td>
            <td>${materia.nombre}</td>
            <td style="text-align: center;">${especialidadTexto}</td> 
            <td>
                <button class="accion-boton" onclick="openDeleteMateriaModal('${materia.id}', '${materia.nombre}')">Eliminar</button>
            </td>
            `;
            tbody.appendChild(row);
        });
    }


    // Llenar select de asignación (usa el filtro)
    if (materiaSelectAdmin) {
        materiaSelectAdmin.innerHTML = '<option value="">Seleccione una materia</option>';
        
        // Comprobar si se ha seleccionado un curso completo (para mostrar "Seleccione Año y División")
        const anioSelected = document.getElementById("anioSelectProfesor").value;
        const divisionSelected = document.getElementById("divisionSelectProfesor").value;

        if (!anioSelected || !divisionSelected) {
             materiaSelectAdmin.innerHTML = `<option value="">Seleccione Año y División</option>`;
             return;
        }


        if (filteredMaterias.length === 0) {
            const msg = filterEspecialidad 
                ? `No hay materias para ${filterEspecialidad}.` 
                : `No hay materias creadas.`;
            materiaSelectAdmin.innerHTML = `<option value="">${msg}</option>`;
        } else {
             filteredMaterias.forEach(materia => {
                const option = `<option value="${materia.nombre}">${materia.nombre}</option>`;
                materiaSelectAdmin.innerHTML += option;
            });
        }
    }
}

function setupMateriaFiltering() {
    // IDs de los selectores en el formulario 'Asignar profesor a materia'
    const anioSelect = document.getElementById("anioSelectProfesor");
    const divisionSelect = document.getElementById("divisionSelectProfesor");

    if (!anioSelect || !divisionSelect) return; 

    const applyFilter = async () => {
        const anio = anioSelect.value;
        const division = divisionSelect.value;
        
        if (!anio || !division) {
             // Si falta el año o la división, cargar todas las materias (comportamiento por defecto al inicio)
             cargarMaterias(null);
             return;
        }

        // 1. Obtener la especialidad de la DB
        const especialidad = await getEspecialidadFromCurso(anio, division);

        // 2. Aplicar filtro usando la especialidad obtenida
        if (especialidad) {
            cargarMaterias(especialidad); 
        } else {
             // Si no hay especialidad o no se encontró el curso
             cargarMaterias("NoMatch");
        }
    };

    // Disparar el filtro al cambiar cualquiera de los selectores
    anioSelect.addEventListener('change', applyFilter);
    divisionSelect.addEventListener('change', applyFilter);
    
    // Ejecutar filtro al inicio (usa los valores por defecto al cargar)
    applyFilter(); 
}


/* ------------------------------------------
   FORMULARIOS DE ASIGNACIÓN (ACTUALIZADOS)
   ------------------------------------------ */
async function cargarSelects() {
    const profesorSelect = document.getElementById("profesorSelect");
    const alumnoSelect = document.getElementById("alumnoSelect");
    const preceptorSelectAdmin = document.getElementById("preceptorSelectAdmin");

    profesorSelect.innerHTML = '<option value="">Seleccione un profesor</option>';
    alumnoSelect.innerHTML = '<option value="">Seleccione un alumno</option>';
    if (preceptorSelectAdmin) preceptorSelectAdmin.innerHTML = '<option value="">Seleccione un preceptor</option>';

    try {
        const response = await fetch('../api/get_users.php');
        const users = await response.json();
        
        users.forEach(user => {
            if (user.role === "Profesor") {
                profesorSelect.innerHTML += `<option value="${user.email}">${user.fullname || user.email}</option>`;
            }
            if (user.role === "Alumno") {
                alumnoSelect.innerHTML += `<option value="${user.email}">${user.fullname || user.email}</option>`;
            }
            if (user.role === "Preceptor" && preceptorSelectAdmin) {
                preceptorSelectAdmin.innerHTML += `<option value="${user.email}">${user.fullname || user.email}</option>`;
            }
        });
    } catch (e) {
        console.error("Error al cargar selects de asignación:", e);
    }
}

document.getElementById('asignarProfesorForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const profesor = document.getElementById("profesorSelect").value;
    const materia = document.getElementById("materiaSelectAdmin").value; 
    const anio = document.getElementById("anioSelectProfesor").value;
    const division = document.getElementById("divisionSelectProfesor").value;
    // const turno = document.getElementById("turnoSelectProfesor").value; // El turno no se guarda en asignaciones de profesor
    
    if (!profesor || !materia || !anio || !division) return alert("Complete Profesor, Materia, Año y División.");

    const asignacion_info = { materia: materia, anio: anio, division: division };

    try {
        const response = await fetch('../api/assign_subject.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: profesor, data: asignacion_info }) 
        });
        const data = await response.json();

        if (data.success) {
            alert(data.message);
            cargarProfesoresFiltrados(); // Actualiza la tabla de profesores
        } else {
            alert(data.message || "Error al asignar materia.");
        }
    } catch (e) {
        alert("Error de conexión con el servidor.");
    }
});

document.getElementById('asignarAlumnoForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const alumno = document.getElementById("alumnoSelect").value;
    const anio = document.getElementById("anioInput").value;
    const division = document.getElementById("divisionInput").value;
    const especialidad = document.getElementById("especialidadInput").value;
    const turno = document.getElementById("turnoInputAlumno").value; // Captura del turno
    
    if (!alumno || !anio || !division || !especialidad || !turno) return alert("Complete todos los campos del alumno.");

    // Se asume que assign_course.php solo necesita anio, division, especialidad
    const curso_info = { anio, division, especialidad, turno }; 
    
    try {
        const response = await fetch('../api/assign_course.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: alumno, data: curso_info }) 
        });
        const data = await response.json();

        if (data.success) {
            alert(data.message);
        } else {
            alert(data.message || "Error al asignar curso.");
        }
    } catch (e) {
        alert("Error de conexión con el servidor.");
    }
});

async function asignarPreceptorAdmin(event) {
    event.preventDefault();
    const preceptor = document.getElementById("preceptorSelectAdmin").value;
    const anio = document.getElementById("anioInputPreceptorAdmin").value;
    const division = document.getElementById("divisionInputPreceptorAdmin").value;
    const turno = document.getElementById("turnoInputPreceptorAdmin").value; // Captura del turno

    if (!preceptor || !anio || !division || !turno) {
        return alert("Complete todos los campos para asignar el preceptor.");
    }

    // Se pasa el turno, aunque la lógica del backend no lo usa directamente en el update de alumno (solo preceptor_email)
    const asignacion_info = { preceptor_email: preceptor, anio, division, turno };

    try {
        // assign_preceptor.php se encarga de buscar a todos los alumnos del curso y actualizar su JSON
        const response = await fetch('../api/assign_preceptor.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: asignacion_info })
        });
        const data = await response.json();

        if (data.success) {
            alert(data.message);
        } else {
            alert(data.message || "Error al asignar preceptor.");
        }
    } catch (e) {
        alert("Error de conexión con el servidor.");
    }
}



/* INICIALIZACIÓN Y OTROS */
function logout() {
    sessionStorage.removeItem("activeUser");
    window.location.href = "principal.html";
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa todos los componentes
    document.getElementById('searchInput').value = '';
    document.getElementById('solicitudesContent').style.display = 'none';

    cargarUsuarios(); // Carga usuarios y llama a cargarMaterias() y cargarSolicitudes()
    
    // Configurar el filtrado de la tabla de GESTIONAR MATERIAS
    setupMateriaTableFiltering(); 

    // Configurar el filtrado dinámico de materias para el SELECT de asignación
    setupMateriaFiltering();
    
    // Configurar listeners para el filtro de profesores por curso
    document.getElementById("filtroAnioProf").addEventListener('change', cargarProfesoresFiltrados);
    document.getElementById("filtroDivisionProf").addEventListener('change', cargarProfesoresFiltrados);

    // Inicializar los selects de Año y División para los filtros de profesor
    const anioOptions = ['1ro', '2do', '3ro', '4to', '5to', '6to', '7mo'];
    const divisionOptions = ['1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va', '9na'];
    
    const fillSelect = (id, options) => {
        const select = document.getElementById(id);
        if (select) {
            const currentVal = select.value;
            select.innerHTML = `<option value="">Seleccionar ${id.includes('Anio') ? 'Año' : 'División'}</option>`;
            options.forEach(opt => {
                select.innerHTML += `<option value="${opt}" ${opt === currentVal ? 'selected' : ''}>${opt}</option>`;
            });
        }
    };

    fillSelect('anioSelectProfesor', anioOptions);
    fillSelect('divisionSelectProfesor', divisionOptions);
    fillSelect('anioInput', anioOptions);
    fillSelect('divisionInput', divisionOptions);
    fillSelect('anioInputPreceptorAdmin', anioOptions);
    fillSelect('divisionInputPreceptorAdmin', divisionOptions);
    fillSelect('filtroAnioProf', anioOptions);
    fillSelect('filtroDivisionProf', divisionOptions);

    // Cargar la tabla de profesores al inicio
    cargarProfesoresFiltrados(); 
});