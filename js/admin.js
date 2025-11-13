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

    cargarSelects(); // Carga los selects de asignación
    cargarMaterias(); // Carga la tabla y el select de materias
    cargarSolicitudes(); // Carga las solicitudes pendientes
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
   CRUD DE MATERIAS & FILTRADO DINÁMICO (dependiente de curso)
   ------------------------------------------ */
let allMateriasCache = [];

async function getEspecialidadFromCurso(anio, division) {
    if (!anio || !division) return null;
    try {
        // Usa la API para obtener la especialidad del curso desde la DB
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
 * Carga las materias disponibles para asignación, filtrando por la especialidad seleccionada.
 * @param {Array} materiasCache - El caché de todas las materias.
 */
async function loadMateriasForCourse(materiasCache) {
    const anioSelected = document.getElementById("anioSelectProfesor").value;
    const divisionSelected = document.getElementById("divisionSelectProfesor").value;
    const especialidadSelected = document.getElementById("especialidadSelectProfesor").value;
    const materiaSelectAdmin = document.getElementById("materiaSelectAdmin");

    if (!materiaSelectAdmin) return;

    materiaSelectAdmin.innerHTML = '<option value="">Cargando materias...</option>';

    if (!anioSelected || !divisionSelected || !especialidadSelected) {
        materiaSelectAdmin.innerHTML = `<option value="">Seleccione Año, División y Especialidad</option>`;
        return;
    }

    const especialidadFiltro = especialidadSelected;
    const isCicloBasico = especialidadFiltro === 'Ciclo Básico';

    let filteredMateriasForSelect = materiasCache;

    if (isCicloBasico) {
        // Lógica para Ciclo Básico (1ro a 3ro): Incluye materias de Ciclo Básico, Tronco Común y NULL/No definido.
        filteredMateriasForSelect = materiasCache.filter(m =>
            m.especialidad === 'Ciclo Básico' || m.especialidad === 'Tronco Común' || !m.especialidad
        );
    } else {
        // Lógica para ESPECIALIZACIONES (Informática, MMO, Química, Electromecánica):
        // Muestra SOLAMENTE las materias que coincidan EXACTAMENTE con la especialidad seleccionada.
        // O TAMBIÉN las de Tronco Común (áulicas)
        filteredMateriasForSelect = materiasCache.filter(m =>
            m.especialidad === especialidadFiltro || m.especialidad === 'Tronco Común' || !m.especialidad
        );
    }

    materiaSelectAdmin.innerHTML = '<option value="">Seleccione una materia</option>';
    if (filteredMateriasForSelect.length === 0) {
        const msg = `No hay materias definidas para ${especialidadFiltro} o Tronco Común.`;
        materiaSelectAdmin.innerHTML = `<option value="">${msg}</option>`;
    } else {
        // Ordena las materias alfabéticamente antes de mostrarlas (para mejor UX)
        filteredMateriasForSelect.sort((a, b) => a.nombre.localeCompare(b.nombre));

        filteredMateriasForSelect.forEach(materia => {
            const option = `<option value="${materia.nombre}">${materia.nombre}</option>`;
            materiaSelectAdmin.innerHTML += option;
        });
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
        filteredMateriasForTable.sort((a, b) => a.nombre.localeCompare(b.nombre)); // Ordenar tabla
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
        if (filteredMateriasForTable.length === 0) {
            tbodyGestion.innerHTML = `<tr><td colspan="4">No se encontraron materias para '${filtroEspecialidadTabla || 'Todas'}'.</td></tr>`;
        }
    }

    // 3. Llenar select de asignación (Filtro dinámico de materias por curso)
    if (materiaSelectAdmin) {
        loadMateriasForCourse(allMateriasCache);
    }
}

// --- Setup para el filtro de la TABLA DE GESTIÓN (Gestionar Materias) ---
function setupMateriaTableFiltering() {
    const filtroEspecialidadMateria = document.getElementById("filtroEspecialidadMateria");
    if (filtroEspecialidadMateria) {
        filtroEspecialidadMateria.addEventListener('change', () => cargarMaterias()); // Llama a cargarMaterias para recargar la tabla
    }
}

// --- Setup para el filtro del SELECT de Asignar Profesor (MATERIAS) ---
function setupMateriaFiltering() {
    const anioSelect = document.getElementById("anioSelectProfesor");
    const divisionSelect = document.getElementById("divisionSelectProfesor");
    const especialidadSelect = document.getElementById("especialidadSelectProfesor");

    if (!anioSelect || !divisionSelect || !especialidadSelect) return;

    const applyFilter = async () => {
        const anio = anioSelect.value;
        const division = divisionSelect.value;

        if (!anio || !division) {
            especialidadSelect.value = ''; // Limpiar especialidad si el curso no es completo
            loadMateriasForCourse(allMateriasCache);
            return;
        }

        // 1. Obtener la especialidad real del curso de la DB
        const especialidad = await getEspecialidadFromCurso(anio, division);

        // 2. Aplicar la especialidad obtenida al selector (si se encontró)
        if (especialidad && especialidadSelect.querySelector(`option[value="${especialidad}"]`)) {
            especialidadSelect.value = especialidad;
        } else {
            especialidadSelect.value = ''; // Limpiar si no se encuentra o no existe la opción
            console.warn(`Especialidad "${especialidad}" no encontrada para ${anio} ${division} o no es una opción válida.`);
        }
        // 3. Forzar la recarga del filtro de materias
        loadMateriasForCourse(allMateriasCache);

    };

    anioSelect.addEventListener('change', applyFilter);
    divisionSelect.addEventListener('change', applyFilter);
    // Permitir cambio manual de especialidad, pero recargar materias
    especialidadSelect.addEventListener('change', () => loadMateriasForCourse(allMateriasCache));

    // No ejecutar al inicio para evitar llamadas innecesarias sin selección
    // applyFilter();
    loadMateriasForCourse(allMateriasCache); // Cargar con valores iniciales (probablemente vacío)
}


function openCreateMateriaModal() {
    document.getElementById('materiaForm').reset();
    openModal('materiaModal');
}

async function handleCreateMateria(event) {
    event.preventDefault();
    const nombre = document.getElementById('materiaNombre').value.trim();
    // Usar '' si se selecciona "Ninguna / Tronco Común" para guardar NULL en la DB
    const especialidad = document.getElementById('materiaEspecialidad').value || null;

    if (!nombre) {
        openAlertModal("El nombre de la materia no puede estar vacío.");
        return;
    }


    try {
        const response = await fetch('../api/create_materia.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, especialidad }) // Enviar NULL si es Tronco Común
        });
        const data = await response.json();

        if (data.success) {
            closeModal('materiaModal');
            openAlertModal("Materia creada correctamente.");
            allMateriasCache = []; // Limpiar caché para forzar recarga
            cargarMaterias();
        } else {
            openAlertModal(data.message || "Error desconocido al crear materia.");
        }
    } catch (e) {
        openAlertModal("Error de conexión con el servidor al crear materia.");
    }
}

function openDeleteMateriaModal(id, nombre) {
    document.getElementById('deleteMessage').textContent = `¿Estás seguro de que quieres eliminar la materia "${nombre}" (ID: ${id})? Esta acción no se puede deshacer.`;

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.textContent = 'Eliminar Materia';
    confirmBtn.className = 'btn btn-danger';

    // Clonar y reemplazar para evitar listeners duplicados
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
            allMateriasCache = []; // Limpiar caché
            cargarMaterias();
        } else {
            openAlertModal(data.message || 'Error al eliminar la materia.');
        }
    } catch (e) {
        openAlertModal("Error de conexión con el servidor al eliminar materia.");
    }
}

/* ------------------------------------------
   FILTRO DE PROFESORES POR CURSO (TABLA)
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
        const response = await fetch(`../api/get_profesores_by_course.php?anio=${anio}&division=${division}`);
        const profesores = await response.json();

        tbodyProfesores.innerHTML = '';

        if (profesores && Array.isArray(profesores) && profesores.length > 0) {
            const profesoresMap = new Map();
            profesores.forEach(p => {
                if (!profesoresMap.has(p.email)) {
                    profesoresMap.set(p.email, { fullname: p.fullname, materias: new Set() }); // Usar Set para evitar duplicados si hay error en datos
                }
                profesoresMap.get(p.email).materias.add(p.materia);
            });

            // Ordenar profesores por nombre
            const sortedProfesores = Array.from(profesoresMap.values()).sort((a, b) => a.fullname.localeCompare(b.fullname));


            sortedProfesores.forEach(profesor => {
                const row = document.createElement("tr");
                // Convertir Set a Array, ordenar materias y unir
                const materiasDisplay = Array.from(profesor.materias).sort().join(', ');

                row.innerHTML = `
                    <td>${profesor.fullname}</td>
                    <td>${materiasDisplay}</td>
                `;
                tbodyProfesores.appendChild(row);
            });

        } else if (profesores && Array.isArray(profesores)) {
            tbodyProfesores.innerHTML = '<tr><td colspan="2">No hay profesores asignados a este curso.</td></tr>';
        } else {
            // Si la respuesta no es un array (posible error de PHP)
            console.error("Respuesta inesperada al cargar profesores:", profesores);
            tbodyProfesores.innerHTML = '<tr><td colspan="2">Error al procesar la respuesta del servidor.</td></tr>';
        }


    } catch (e) {
        console.error("Error al cargar profesores filtrados:", e);
        tbodyProfesores.innerHTML = '<tr><td colspan="2">Error de conexión con el servidor.</td></tr>';
    }
}


/**
 * Carga los alumnos del curso seleccionado en el select de "Asignar Alumno".
 */
async function loadAlumnosForCourse() {
    const anio = document.getElementById("anioInput").value;
    const division = document.getElementById("divisionInput").value;
    const alumnoSelect = document.getElementById("alumnoSelect");

    if (!alumnoSelect) return; // Salir si el select no existe

    alumnoSelect.innerHTML = '<option value="">Cargando alumnos...</option>';

    if (!anio || !division) {
        alumnoSelect.innerHTML = '<option value="">Seleccione Año y División</option>';
        return;
    }

    try {
        // Usamos la API existente que filtra por curso y rol=Alumno
        const response = await fetch(`../api/get_users_by_course.php?anio=${anio}&division=${division}&role=Alumno`);
        const alumnos = await response.json();

        alumnoSelect.innerHTML = '<option value="">Seleccione un alumno</option>';

        if (alumnos && Array.isArray(alumnos) && alumnos.length > 0) {
            // Ordenar alumnos alfabéticamente
            alumnos.sort((a, b) => (a.fullname || '').localeCompare(b.fullname || ''));

            alumnos.forEach(alumno => {
                // Se agrega el email para distinguirlos, ya que el valor es el email
                alumnoSelect.innerHTML += `<option value="${alumno.email}">${alumno.fullname || 'Nombre no disponible'} (${alumno.email})</option>`;
            });
        } else if (alumnos && Array.isArray(alumnos)) {
            alumnoSelect.innerHTML = `<option value="">No hay alumnos en ${anio} ${division}</option>`;
        } else {
            console.error("Respuesta inesperada al cargar alumnos:", alumnos);
            alumnoSelect.innerHTML = `<option value="">Error al cargar alumnos</option>`;
        }
    } catch (e) {
        console.error("Error al cargar alumnos por curso:", e);
        alumnoSelect.innerHTML = '<option value="">Error de conexión</option>';
    }
}

// =======================================================
// === NUEVO CÓDIGO AÑADIDO/REEMPLAZADO EMPIEZA AQUÍ ===
// =======================================================

/* ------------------------------------------
   FUNCIÓN DE LÓGICA DE NEGOCIO: ESPECIALIDAD Y TURNO AUTOMÁTICO (EN ASIGNAR ALUMNO)
   ------------------------------------------ */

function setupEspecialidadAuto() {
    const anioSelect = document.getElementById('anioInput'); // Formulario Asignar Alumno
    const divisionSelect = document.getElementById('divisionInput'); // Formulario Asignar Alumno
    const especialidadSelect = document.getElementById('especialidadInput'); // Formulario Asignar Alumno
    const turnoSelect = document.getElementById('turnoInputAlumno'); // <-- Selector de Turno en Asignar Alumno

    if (!anioSelect || !divisionSelect || !especialidadSelect || !turnoSelect) {
        console.warn("Faltan elementos para la lógica de especialidad/turno automático en Asignar Alumno.");
        return;
    }

    const updateEspecialidadYTurno = async () => {
        const anio = anioSelect.value;
        const division = divisionSelect.value;

        // Limpiar si no hay selección completa
        if (!anio || !division) {
            especialidadSelect.value = '';
            turnoSelect.value = ''; // Limpiar turno también
            return;
        }

        try {
            // Llamar a la API para obtener la información completa del curso (turno y especialidad)
            const response = await fetch(`../api/get_course_info.php?anio=${anio}&division=${division}`);
            const data = await response.json();

            if (data.success) {
                // Asignar Especialidad si existe en la respuesta y es una opción válida en el select
                if (data.especialidad !== undefined && especialidadSelect.querySelector(`option[value="${data.especialidad}"]`)) {
                    especialidadSelect.value = data.especialidad;
                } else {
                    especialidadSelect.value = ''; // Limpiar si no se encuentra o no existe la opción
                }

                // Asignar Turno si existe en la respuesta y es una opción válida en el select
                if (data.turno !== undefined && turnoSelect.querySelector(`option[value="${data.turno}"]`)) {
                    turnoSelect.value = data.turno;
                } else {
                    turnoSelect.value = ''; // Limpiar si no se encuentra o no existe la opción
                }

            } else {
                // Si la API falla o el curso no existe en la tabla `cursos`
                especialidadSelect.value = '';
                turnoSelect.value = '';
                console.warn(data.message || `Curso ${anio} ${division} no encontrado en tabla 'cursos'.`);
                // Opcional: Mostrar un mensaje al usuario
                // openAlertModal(`El curso ${anio} ${division} no está definido en la base de datos.`);
            }
        } catch (e) {
            console.error("Error al obtener la información del curso (Especialidad/Turno):", e);
            especialidadSelect.value = '';
            turnoSelect.value = '';
        }
    };

    // Asocia la función al evento 'change' de ambos selectores
    anioSelect.addEventListener('change', updateEspecialidadYTurno);
    divisionSelect.addEventListener('change', updateEspecialidadYTurno);
}


/* ------------------------------------------
   FORMULARIOS DE ASIGNACIÓN (CARGA INICIAL DE SELECTS)
   ------------------------------------------ */
async function cargarSelects() { // Se eliminó el parámetro loadAllProfessors, ahora siempre carga todos
    const profesorSelect = document.getElementById("profesorSelect");
    const alumnoSelect = document.getElementById("alumnoSelect");
    const preceptorSelectAdmin = document.getElementById("preceptorSelectAdmin");

    // Vaciar selects antes de llenarlos
    if (profesorSelect) profesorSelect.innerHTML = '<option value="">Cargando...</option>';
    if (alumnoSelect) alumnoSelect.innerHTML = '<option value="">Cargando...</option>';
    if (preceptorSelectAdmin) preceptorSelectAdmin.innerHTML = '<option value="">Cargando...</option>';


    try {
        const response = await fetch('../api/get_users.php'); // Obtener TODOS los usuarios
        const users = await response.json();

        // Llenar selects con opciones iniciales
        if (profesorSelect) profesorSelect.innerHTML = '<option value="">Seleccione un profesor</option>';
        if (alumnoSelect) alumnoSelect.innerHTML = '<option value="">Seleccione un alumno</option>';
        if (preceptorSelectAdmin) preceptorSelectAdmin.innerHTML = '<option value="">Seleccione un preceptor</option>';

        // Filtrar y ordenar usuarios por rol y nombre
        const profesores = users.filter(u => u.role === 'Profesor').sort((a, b) => (a.fullname || '').localeCompare(b.fullname || ''));
        const alumnos = users.filter(u => u.role === 'Alumno').sort((a, b) => (a.fullname || '').localeCompare(b.fullname || ''));
        const preceptores = users.filter(u => u.role === 'Preceptor').sort((a, b) => (a.fullname || '').localeCompare(b.fullname || ''));


        // Llenar los selects
        if (profesorSelect) {
            profesores.forEach(user => {
                profesorSelect.innerHTML += `<option value="${user.email}">${user.fullname || user.email}</option>`;
            });
        }
        if (alumnoSelect) {
            alumnos.forEach(user => {
                alumnoSelect.innerHTML += `<option value="${user.email}">${user.fullname || user.email}</option>`;
            });
        }

        if (preceptorSelectAdmin) {
            preceptores.forEach(user => {
                preceptorSelectAdmin.innerHTML += `<option value="${user.email}">${user.fullname || user.email}</option>`;
            });
        }

    } catch (e) {
        console.error("Error al cargar selects de asignación:", e);
        if (profesorSelect) profesorSelect.innerHTML = '<option value="">Error al cargar</option>';
        if (alumnoSelect) alumnoSelect.innerHTML = '<option value="">Error al cargar</option>';
        if (preceptorSelectAdmin) preceptorSelectAdmin.innerHTML = '<option value="">Error al cargar</option>';
    }
}

// --- Listener para asignar Profesor (Incluye Turno) ---
document.getElementById('asignarProfesorForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const profesor = document.getElementById("profesorSelect").value;
    const materia = document.getElementById("materiaSelectAdmin").value;
    const anio = document.getElementById("anioSelectProfesor").value;
    const division = document.getElementById("divisionSelectProfesor").value;
    const turno = document.getElementById("turnoSelectProfesor").value; // Captura turno

    if (!profesor || !materia || !anio || !division || !turno) {
        alert("Complete Profesor, Materia, Año, División y Turno.");
        return;
    }


    const asignacion_info = { materia: materia, anio: anio, division: division, turno: turno }; // Añadir turno

    try {
        const response = await fetch('../api/assign_subject.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: profesor, data: asignacion_info })
        });
        const data = await response.json();

        if (data.success) {
            alert(data.message);
            cargarProfesoresFiltrados(); // Actualiza la tabla de profesores por curso
        } else {
            alert(data.message || "Error al asignar materia.");
        }
    } catch (e) {
        alert("Error de conexión con el servidor al asignar materia.");
        console.error(e);
    }
});

// --- Listener para asignar Alumno (Incluye Turno) ---
document.getElementById('asignarAlumnoForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const alumno = document.getElementById("alumnoSelect").value;
    const anio = document.getElementById("anioInput").value;
    const division = document.getElementById("divisionInput").value;
    const especialidad = document.getElementById("especialidadInput").value;
    const turno = document.getElementById("turnoInputAlumno").value; // Captura del turno

    if (!alumno || !anio || !division || !especialidad || !turno) {
        alert("Complete todos los campos del alumno, incluyendo el Turno.");
        return;
    }

    const curso_info = { anio, division, especialidad, turno }; // Incluir turno

    try {
        const response = await fetch('../api/assign_course.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: alumno, data: curso_info })
        });
        const data = await response.json();

        if (data.success) {
            alert(data.message);
            // Opcional: Limpiar formulario o actualizar alguna vista si es necesario
            document.getElementById('asignarAlumnoForm').reset();
            // loadAlumnosForCourse(); // Recargar select de alumnos podría ser útil
        } else {
            alert(data.message || "Error al asignar curso.");
        }
    } catch (e) {
        alert("Error de conexión con el servidor al asignar alumno.");
        console.error(e);
    }
});

// --- Función y Listener para asignar Preceptor (Incluye Turno) ---
async function asignarPreceptorAdmin(event) {
    event.preventDefault();
    const preceptor = document.getElementById("preceptorSelectAdmin").value;
    const anio = document.getElementById("anioInputPreceptorAdmin").value;
    const division = document.getElementById("divisionInputPreceptorAdmin").value;
    const turno = document.getElementById("turnoInputPreceptorAdmin").value; // Captura del turno

    if (!preceptor || !anio || !division || !turno) {
        return alert("Complete todos los campos para asignar el preceptor, incluyendo el Turno.");
    }

    // Incluye el turno, aunque el backend actual no lo use directamente para actualizar al alumno
    const asignacion_info = { preceptor_email: preceptor, anio, division, turno };

    try {
        const response = await fetch('../api/assign_preceptor.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: asignacion_info })
        });
        const data = await response.json();

        if (data.success) {
            alert(data.message + ` (${data.alumnos_actualizados} alumnos actualizados)`);
            // Opcional: Limpiar formulario
            document.getElementById('asignarPreceptorForm').reset();
        } else {
            alert(data.message || "Error al asignar preceptor.");
        }
    } catch (e) {
        alert("Error de conexión con el servidor al asignar preceptor.");
        console.error(e);
    }
}
// Listener para el formulario de asignar preceptor
document.getElementById('asignarPreceptorForm').addEventListener('submit', asignarPreceptorAdmin);


/* ------------------------------------------
   INICIALIZACIÓN GENERAL (DOMContentLoaded)
   ------------------------------------------ */
function logout() {
    sessionStorage.removeItem("activeUser");
    window.location.href = "principal.html";
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa campos y elementos
    document.getElementById('searchInput').value = '';
    document.getElementById('solicitudesContent').style.display = 'none';

    // Cargas iniciales
    cargarUsuarios(); // Carga tabla usuarios, selects, materias, solicitudes

    // Configurar lógica automática y filtros
    setupEspecialidadAuto(); // Para Asignar Alumno (Especialidad y Turno)
    setupMateriaTableFiltering(); // Para Tabla Gestionar Materias
    setupMateriaFiltering(); // Para Select Materia en Asignar Profesor

    // Configurar listeners para filtros de tablas/selects dinámicos
    document.getElementById("filtroAnioProf").addEventListener('change', cargarProfesoresFiltrados);
    document.getElementById("filtroDivisionProf").addEventListener('change', cargarProfesoresFiltrados);
    document.getElementById("anioInput").addEventListener('change', loadAlumnosForCourse); // Para Select Alumno en Asignar Alumno
    document.getElementById("divisionInput").addEventListener('change', loadAlumnosForCourse); // Para Select Alumno en Asignar Alumno

    // Llenar selects de Año/División en formularios y filtros
    const anioOptions = ['1ro', '2do', '3ro', '4to', '5to', '6to', '7mo'];
    const divisionOptions = ['1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va', '9na'];

    const fillSelect = (id, options, defaultText) => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = `<option value="">${defaultText}</option>`; // Texto por defecto
            options.forEach(opt => {
                select.innerHTML += `<option value="${opt}">${opt}</option>`;
            });
        }
    };

    fillSelect('anioSelectProfesor', anioOptions, 'Seleccionar año');
    fillSelect('divisionSelectProfesor', divisionOptions, 'Seleccionar división');
    fillSelect('anioInput', anioOptions, 'Seleccionar año'); // Form Asignar Alumno
    fillSelect('divisionInput', divisionOptions, 'Seleccionar división'); // Form Asignar Alumno
    fillSelect('anioInputPreceptorAdmin', anioOptions, 'Seleccionar año'); // Form Asignar Preceptor
    fillSelect('divisionInputPreceptorAdmin', divisionOptions, 'Seleccionar división'); // Form Asignar Preceptor
    fillSelect('filtroAnioProf', anioOptions, 'Filtrar Año'); // Filtro Tabla Profesores
    fillSelect('filtroDivisionProf', divisionOptions, 'Filtrar División'); // Filtro Tabla Profesores

    // Cargas iniciales de datos filtrados (pueden mostrar mensaje "Seleccione...")
    cargarProfesoresFiltrados();
    loadAlumnosForCourse();

    // --- Validación de Inputs ---

    // 1. Modal de Usuario: Nombre Completo
    const userFullnameInput = document.getElementById('userFullname');
    if (userFullnameInput) {
        userFullnameInput.maxLength = 50; // Límite de 50 caracteres
        userFullnameInput.addEventListener('input', function (e) {
            // Solo permite letras, acentos, ñ, espacios y apóstrofes
            e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s']/g, '');
        });
    }

    // 2. Modal de Usuario: DNI (Formateo 99.999.999)
    const userDniInput = document.getElementById('userDni');
    if (userDniInput) {
        userDniInput.addEventListener('input', formatearDNI);
    }

    // 3. Modal de Usuario: Email (forzar minúsculas)
    const userEmailInput = document.getElementById('userEmail');
    if (userEmailInput) {
        userEmailInput.addEventListener('input', function (e) {
            e.target.value = e.target.value.toLowerCase();
        });
    }

    // 4. Modal de Materia: Nombre de Materia
    const materiaNombreInput = document.getElementById('materiaNombre');
    if (materiaNombreInput) {
        materiaNombreInput.addEventListener('input', function (e) {
            // Permite letras, acentos, ñ, números, espacios, (), . y -
            e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s'0-9().-]/g, '');
        });
    }
    // --- FIN DE VALIDACIÓN ---
});

/**
 * Función reutilizable para formatear DNI (xx.xxx.xxx)
 */
function formatearDNI(e) {
    let val = e.target.value.replace(/[^0-9]/g, ''); // 1. Solo números
    val = val.substring(0, 8); // 2. Limitar a 8 dígitos

    let formattedVal = '';
    if (val.length > 5) {
        // Formato 12.345.678
        formattedVal = val.substring(0, 2) + '.' + val.substring(2, 5) + '.' + val.substring(5);
    } else if (val.length > 2) {
        // Formato 12.345
        formattedVal = val.substring(0, 2) + '.' + val.substring(2);
    } else {
        // Formato 12
        formattedVal = val;
    }
    e.target.value = formattedVal;
}

// --- LÓGICA PARA EL DROPDOWN DE USUARIO ---

// Esta función se activa al hacer clic en "Información Personal"
function showPersonalInfo() {
    // Reutiliza los datos del usuario activo que ya están en 'activeUser'
    if (activeUser) {
        alert(
            'Información Personal:\n\n' +
            'Email: ' + (activeUser.email || 'No disponible') + '\n' +
            'Nombre: ' + (activeUser.fullname || 'No disponible') + '\n' +
            'DNI: ' + (activeUser.dni || 'No disponible') + '\n' +
            'Rol: ' + (activeUser.role || 'No disponible')
        );
    } else {
        alert('No se pudieron cargar los datos del usuario.');
    }
}

// Esta lógica se ejecuta cuando la página carga para poner el email en el header
document.addEventListener('DOMContentLoaded', () => {
    const emailDisplay = document.getElementById('user-email-display');
    if (emailDisplay && activeUser && activeUser.email) {
        // Acortamos el email si es muy largo para que quepa en el header
        let emailName = activeUser.email.split('@')[0];
        if (emailName.length > 20) {
            emailName = emailName.substring(0, 17) + '...';
        }
        emailDisplay.textContent = emailName;
    }
    // NOTA: El resto del 'DOMContentLoaded' original de cada archivo se mantiene.
    // Este código se añade al 'DOMContentLoaded' que ya existe en admin.js y preceptor.js
    // y es el único 'DOMContentLoaded' en alumno.js y profesor.js (adaptado).
    // (En la respuesta final, esto ya está fusionado correctamente en los archivos js/profesor.js y js/alumno.js)
});

// La función logout() ya existe en todos los archivos, por lo que el botón "Cerrar Sesión" funcionará.