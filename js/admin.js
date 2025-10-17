// Verifica si hay sesión activa al cargar la página
const activeUser = sessionStorage.getItem("activeUser");
if (!activeUser) {
    window.location.href = "principal.html";
}


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
   CRUD DE USUARIOS ACTIVOS (MIGRADO A DB)
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
    confirmBtn.textContent = 'Eliminar'; // Restablecemos el texto
    confirmBtn.className = 'btn btn-danger'; // Restablecemos la clase

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
   CARGA DE DATOS Y BÚSQUEDA (MIGRADO A DB)
   ------------------------------------------ */
async function cargarUsuarios() {
    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "<tr><td colspan='5'>Cargando usuarios...</td></tr>";

    try {
        const response = await fetch('../api/get_users.php');
        const users = await response.json();

        tbody.innerHTML = ""; // Limpiar el mensaje de carga
        if (!users || users.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5'>No hay usuarios activos registrados.</td></tr>";
        }

        users.forEach(user => {
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
        });
    } catch (e) {
        tbody.innerHTML = "<tr><td colspan='5'>Error al cargar usuarios del servidor.</td></tr>";
    }

    cargarSelects();
    cargarMaterias(); // También carga materias para el select
    searchUsers();
}

// Búsqueda local (mantenemos la función original)
function searchUsers() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toUpperCase();
    const table = document.getElementById('usersTable');
    const tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let visible = false;
        const tds = tr[i].getElementsByTagName('td');
        for (let j = 0; j < tds.length; j++) {
            const td = tds[j];
            if (td) {
                if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                    visible = true;
                    break;
                }
            }
        }
        tr[i].style.display = visible ? "" : "none";
    }
}

/* ------------------------------------------
   MANEJO DE SOLICITUDES PENDIENTES (MIGRADO A DB)
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
            // El ID de la DB se usa como identificador único
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
    document.getElementById('approvePassword').value = '';

    const confirmBtn = document.getElementById('confirmApproveBtn');
    confirmBtn.onclick = () => handleApproveUser(id, email, fullname, dni);

    openModal('approvalModal');
}

async function handleApproveUser(id, email, fullname, dni) {
    const password = document.getElementById('approvePassword').value;
    const role = document.getElementById('approveRoleSelect').value;
    const approveBtn = document.getElementById('confirmApproveBtn');

    if (!password || !role) {
        openAlertModal("Debe asignar una contraseña y un rol.");
        return;
    }
    
    approveBtn.disabled = true;

    try {
        const response = await fetch('../api/approve_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_pendiente: id, email, fullname, dni, password, role })
        });
        const data = await response.json();

        if (data.success) {
            openAlertModal(`Usuario ${fullname} aprobado como ${role}.`);
            
            closeModal('approvalModal');
            cargarUsuarios();
            cargarSolicitudes();
        } else {
        
            openAlertModal(data.message || 'Error al aprobar usuario.');
        }

    } catch (e) {
        openAlertModal("Error de conexión al servidor al aprobar.");
        console.error(e);
    } finally {
        approveBtn.disabled = false;
    }
}

// --- NUEVAS FUNCIONES PARA RECHAZAR CON MODALES ---

// 1. Abre el modal de confirmación
function openRejectModal(id, fullname) {
    // Reutilizamos el 'deleteModal' que ya existe
    document.getElementById('deleteMessage').textContent = `¿Estás seguro de que quieres rechazar la solicitud de ${fullname}?`;
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.textContent = 'Rechazar'; // Cambiamos el texto del botón
    confirmBtn.className = 'btn btn-danger'; // Aseguramos el estilo de peligro

    // Limpiamos eventos anteriores y asignamos la nueva acción de rechazo
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.onclick = () => handleRejectUser(id);

    openModal('deleteModal');
}

// 2. Ejecuta la lógica de rechazo después de confirmar
async function handleRejectUser(id) {
    try {
        const response = await fetch('../api/delete_pending.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_pendiente: id })
        });
        const data = await response.json();

        closeModal('deleteModal'); // Cerramos el modal de confirmación

        if (data.success) {
            // Mostramos el nuevo modal de notificación de éxito
            openAlertModal("Solicitud rechazada correctamente.");
            cargarSolicitudes(); // Recargamos la lista
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
   NUEVO CRUD DE MATERIAS
   ------------------------------------------ */
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
            cargarMaterias(); 
        } else {
            openAlertModal(data.message || 'Error al eliminar la materia.');
        }
    } catch (e) {
        openAlertModal("Error de conexión con el servidor.");
    }
}


async function cargarMaterias() {
    const tbody = document.querySelector("#materiasTable tbody");
    const materiaSelectAdmin = document.getElementById("materiaSelectAdmin");
    
    if (tbody) tbody.innerHTML = "<tr><td colspan='4'>Cargando materias...</td></tr>"; 
    if (materiaSelectAdmin) materiaSelectAdmin.innerHTML = '<option value="">Cargando materias...</option>';

    try {
        const response = await fetch('../api/get_materias.php');
        const materias = await response.json();

        if (tbody) tbody.innerHTML = "";
        if (materiaSelectAdmin) materiaSelectAdmin.innerHTML = '<option value="">Seleccione una materia</option>';
        
        materias.forEach(materia => {
            if (tbody) {
                // Lógica de visualización para la Especialidad (Tronco Común si es vacía)
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
            }
            // Llenar select para asignación
            const option = `<option value="${materia.nombre}">${materia.nombre}</option>`;
            if (materiaSelectAdmin) materiaSelectAdmin.innerHTML += option;
        });

    } catch (e) {
        if (tbody) tbody.innerHTML = "<tr><td colspan='4'>Error al cargar materias.</td></tr>";
        if (materiaSelectAdmin) materiaSelectAdmin.innerHTML = '<option value="">Error al cargar</option>';
    }
}


/* ------------------------------------------
   FORMULARIOS DE ASIGNACIÓN (CORRECCIONES CLAVE)
   ------------------------------------------ */
async function cargarSelects() {
    const profesorSelect = document.getElementById("profesorSelect");
    const alumnoSelect = document.getElementById("alumnoSelect");
    const preceptorSelectAdmin = document.getElementById("preceptorSelectAdmin"); // NUEVO SELECT

    profesorSelect.innerHTML = '<option value="">Seleccione un profesor</option>';
    alumnoSelect.innerHTML = '<option value="">Seleccione un alumno</option>';
    if (preceptorSelectAdmin) preceptorSelectAdmin.innerHTML = '<option value="">Seleccione un preceptor</option>'; // Inicializar

    try {
        // Reutilizamos el endpoint que trae todos los usuarios activos
        const response = await fetch('../api/get_users.php');
        const users = await response.json();
        
        users.forEach(user => {
            if (user.role === "Profesor") {
                profesorSelect.innerHTML += `<option value="${user.email}">${user.fullname || user.email}</option>`;
            }
            if (user.role === "Alumno") {
                alumnoSelect.innerHTML += `<option value="${user.email}">${user.fullname || user.email}</option>`;
            }
            // Poblar el nuevo select de Preceptores
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

    if (!profesor || !materia) return alert("Seleccione profesor y materia");

    // Estructura de datos que incluye año y división vacíos para el backend
    const asignacion_info = { materia: materia, anio: '', division: '' };

    try {
        const response = await fetch('../api/assign_subject.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: profesor, data: asignacion_info }) 
        });
        const data = await response.json();

        if (data.success) {
            alert(data.message);
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
    
    if (!alumno || !anio || !division || !especialidad) return alert("Complete todos los campos del alumno.");

    const curso_info = { anio, division, especialidad };
    
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

// NUEVA FUNCIÓN DE ASIGNACIÓN DE PRECEPTOR PARA EL ADMINISTRADOR
async function asignarPreceptorAdmin(event) {
    event.preventDefault();
    const preceptor = document.getElementById("preceptorSelectAdmin").value;
    const anio = document.getElementById("anioInputPreceptorAdmin").value;
    const division = document.getElementById("divisionInputPreceptorAdmin").value;

    if (!preceptor || !anio || !division) {
        return alert("Complete todos los campos para asignar el preceptor.");
    }

    const asignacion_info = { preceptor_email: preceptor, anio, division };

    try {
        // Usamos el mismo endpoint que actualiza a todos los alumnos del curso
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
        alert("Error de conexión con el servidor al asignar preceptor.");
        console.error(e);
    }
}

// Listener para el nuevo formulario de Asignar Preceptor
document.getElementById('asignarPreceptorForm').addEventListener('submit', asignarPreceptorAdmin);


/* INICIALIZACIÓN Y OTROS */
function logout() {
    sessionStorage.removeItem("activeUser");
    window.location.href = "principal.html";
}

document.addEventListener('DOMContentLoaded', () => {
    // Esto asegura que la búsqueda se resetee al cargar la página
    setTimeout(() => {
        document.getElementById('searchInput').value = '';
    }, 100);

    document.getElementById('solicitudesContent').style.display = 'none';

    cargarUsuarios();
    cargarSolicitudes();
});

/* ------------------------------------------
   LÓGICA DE FILTRADO POR CURSO (NUEVA)
   ------------------------------------------ */

// Variable global para almacenar todos los alumnos cargados
let allAlumnos = []; 

// Función modificada para cargar todos los usuarios, guardando los alumnos en allAlumnos
async function cargarUsuarios() {
    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "<tr><td colspan='5'>Cargando usuarios...</td></tr>";
    
    try {
        const response = await fetch('../api/get_users.php');
        const users = await response.json();
        
        // Limpiamos la lista global de alumnos y la llenamos para el filtro
        allAlumnos = users.filter(u => u.role === "Alumno");
        
        // Cargar todos los usuarios en la tabla de Admin por defecto (incluye Profesores/Preceptores)
        displayUsersInAdminTable(users);

    } catch (e) {
        tbody.innerHTML = "<tr><td colspan='5'>Error al cargar usuarios del servidor.</td></tr>";
    }

    cargarSelects();
    cargarMaterias();
}

// Función que dibuja la tabla de usuarios con el formato del Admin
function displayUsersInAdminTable(users) {
    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "";

    if (!users || users.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5'>No hay usuarios activos registrados.</td></tr>";
        return;
    }

    users.forEach(user => {
        const row = document.createElement("tr");
        const acciones = user.role === 'Alumno' ? 
            `<button class="accion-boton-1" onclick="revisarBoletinAdmin('${user.email}')">Ver Boletín</button>` :
            `<button class="accion-boton-1" onclick="openEditModal('${user.email}')">Editar</button>
             <button class="accion-boton" onclick="openDeleteModal('${user.email}')">Eliminar</button>`;

        row.innerHTML = `
        <td>${user.fullname || 'No especificado'}</td>
        <td>${user.dni || 'No especificado'}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${acciones}</td>
        `;
        tbody.appendChild(row);
    });
}

// Función para simular la redirección a la vista del alumno
function revisarBoletinAdmin(alumnoEmail) {
    // 1. Guardar el email del alumno que el Admin quiere ver
    sessionStorage.setItem("reviewingUserEmail", alumnoEmail);
    
    // 2. Guardar el rol del revisor (Administrador)
    sessionStorage.setItem("reviewerRole", "Administrador"); 

    // 3. Redirigir a la vista de boletín (alumno.html)
    window.location.href = "alumno.html";
}


/* ------------------------------------------
   FUNCIÓN DE FILTRADO PARA ASIGNAR ALUMNO A CURSO (NUEVA LÓGICA)
   ------------------------------------------ */
async function cargarAlumnosPorCurso(anio, division) {
    const alumnoSelect = document.getElementById("alumnoSelect");
    alumnoSelect.innerHTML = '<option value="">Cargando...</option>';

    if (!anio || !division) {
        alumnoSelect.innerHTML = '<option value="">Seleccione Año y División</option>';
        return;
    }

    try {
        const response = await fetch(`../api/get_users_by_course.php?anio=${anio}&division=${division}`);
        const alumnos = await response.json();

        alumnoSelect.innerHTML = '<option value="">Seleccione un alumno</option>';

        if (alumnos.length > 0) {
            alumnos.forEach(alumno => {
                alumnoSelect.innerHTML += `<option value="${alumno.email}">${alumno.fullname || alumno.email}</option>`;
            });
        } else {
            alumnoSelect.innerHTML = '<option value="">No hay alumnos en este curso</option>';
        }

    } catch (e) {
        console.error("Error al cargar alumnos por curso:", e);
        alumnoSelect.innerHTML = '<option value="">Error al cargar alumnos</option>';
    }
}


document.getElementById('anioInput').addEventListener('change', updateAlumnoSelect);
document.getElementById('divisionInput').addEventListener('change', updateAlumnoSelect);

function updateAlumnoSelect() {
    const anio = document.getElementById('anioInput').value;
    const division = document.getElementById('divisionInput').value;
    if (anio && division) {
        cargarAlumnosPorCurso(anio, division);
    } else {
        document.getElementById("alumnoSelect").innerHTML = '<option value="">Seleccione Año y División</option>';
    }
}

