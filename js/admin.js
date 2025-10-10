
// Verifica si hay sesión activa al cargar la página
const activeUser = sessionStorage.getItem("activeUser");
if (!activeUser) {
    // Si no hay sesión activa → redirige al login
    window.location.href = "principal.html";
}


//!-- Script para evitar volver atrás con el historial -->

window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.go(1);
    window.location.href = "principal.html";
};




/* ------------------------------------------
 MANEJO DE MODALES
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

/* ------------------------------------------
   LÓGICA DE GESTIÓN DE USUARIOS
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
    const user = JSON.parse(localStorage.getItem(email));
    if (!user) return;

    document.getElementById('userForm').reset();
    document.getElementById('modalTitle').textContent = 'Editar Usuario';
    document.getElementById('emailError').style.display = 'none';

    document.getElementById('originalEmail').value = email;
    document.getElementById('userFullname').value = user.fullname || '';
    document.getElementById('userDni').value = user.dni || '';
    document.getElementById('userEmail').value = email;
    document.getElementById('userEmail').readOnly = true;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userPassword').placeholder = "Dejar en blanco para no cambiar";
    document.getElementById('userPassword').required = false;

    document.getElementById('userForm').onsubmit = handleEditUser;
    openModal('userModal');
}

function openDeleteModal(email) {
    document.getElementById('deleteMessage').textContent = `¿Estás seguro de que quieres eliminar al usuario ${email}?`;
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.onclick = () => handleDeleteUser(email);
    openModal('deleteModal');
}

function handleCreateUser(event) {
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
    if (localStorage.getItem(email)) {
        emailError.textContent = "Este correo ya está registrado.";
        emailError.style.display = 'block';
        return;
    }

    emailError.style.display = 'none';
    const user = { email, fullname, dni, password: btoa(password), role };
    localStorage.setItem(email, JSON.stringify(user));
    closeModal('userModal');
    cargarUsuarios();
}

function handleEditUser(event) {
    event.preventDefault();
    const originalEmail = document.getElementById('originalEmail').value;
    const newPassword = document.getElementById('userPassword').value;
    const newRole = document.getElementById('userRole').value;
    const newFullname = document.getElementById('userFullname').value;
    const newDni = document.getElementById('userDni').value;

    const user = JSON.parse(localStorage.getItem(originalEmail));
    user.role = newRole;
    user.fullname = newFullname;
    user.dni = newDni;
    if (newPassword) {
        user.password = btoa(newPassword);
    }
    localStorage.setItem(originalEmail, JSON.stringify(user));
    closeModal('userModal');
    cargarUsuarios();
}

function handleDeleteUser(email) {
    localStorage.removeItem(email);
    closeModal('deleteModal');
    cargarUsuarios();
}

/* ------------------------------------------
   CARGA DE DATOS Y BÚSQUEDA
   ------------------------------------------ */
function cargarUsuarios() {
    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "";
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key === "pendingUsers" || key.startsWith("asignacion")) continue;
        try {
            const user = JSON.parse(localStorage.getItem(key));
            if (!user || !user.role) continue;

            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${user.fullname || 'No especificado'}</td>
            <td>${user.dni || 'No especificado'}</td>
            <td>${user.email || user.username}</td>
            <td>${user.role}</td>
            <td>
                <button class="accion-boton-1" onclick="openEditModal('${key}')">Editar</button>
                <button class="accion-boton" onclick="openDeleteModal('${key}')">Eliminar</button>
            </td>
            `;
            tbody.appendChild(row);
        } catch (e) { console.error("Error parsing user data for key:", key) }
    }
    cargarSelects();

    // --- SOLUCIÓN DEFINITIVA ---
    // Sincroniza la tabla con el buscador inmediatamente después de cargar los datos.
    searchUsers();
}

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
   MANEJO DE SOLICITUDES PENDIENTES
   ------------------------------------------ */
function toggleSolicitudes() {
    const content = document.getElementById("solicitudesContent");
    const flecha = document.getElementById("flecha");

    const isHidden = content.style.display === "none" || content.style.display === "";
    content.style.display = isHidden ? "block" : "none";
    flecha.textContent = isHidden ? "⬆" : "⬇";
}

function cargarSolicitudes() {
    const pendingList = document.getElementById("pendingList");
    pendingList.innerHTML = "";
    const pendingUsers = JSON.parse(localStorage.getItem("pendingUsers")) || [];
    pendingUsers.forEach((user, index) => {
        const date = new Date(user.requestedAt).toLocaleString();
        const li = document.createElement("li");
        li.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                    <div>
                        <b>${user.fullname} (${user.dni})</b><br>
                        <span style="font-size:14px;color:#333">${user.username} (Rol: ${user.role})</span><br>
                        <span style="font-size:12px;color:#666">${date}</span>
                    </div>
                    <div class="contenedor-botones">
                        <button onclick="openApprovalModal(${index})">Aprobar</button>
                        <button onclick="rechazarUsuario(${index})">Rechazar</button>
                    </div>
                </div>`;
        pendingList.appendChild(li);
    });
}

function openApprovalModal(index) {
    const pendingUsers = JSON.parse(localStorage.getItem("pendingUsers")) || [];
    const userReq = pendingUsers[index];

    document.getElementById('approveEmail').textContent = userReq.username;
    document.getElementById('approveName').textContent = userReq.fullname;
    document.getElementById('approveDni').textContent = userReq.dni;
    document.getElementById('approvePassword').value = '';

    const confirmBtn = document.getElementById('confirmApproveBtn');
    confirmBtn.onclick = () => handleApproveUser(index);

    openModal('approvalModal');
}

function handleApproveUser(index) {
    const password = document.getElementById('approvePassword').value;
    const role = document.getElementById('approveRoleSelect').value;

    if (!password || !role) {
        alert("Debe asignar una contraseña y un rol.");
        return;
    }

    const pendingUsers = JSON.parse(localStorage.getItem("pendingUsers")) || [];
    const userReq = pendingUsers[index];

    const newUser = {
        email: userReq.username,
        fullname: userReq.fullname,
        dni: userReq.dni,
        password: btoa(password),
        role
    };

    // Guardar en localStorage
    localStorage.setItem(newUser.email, JSON.stringify(newUser));

    // Eliminar de pendientes
    pendingUsers.splice(index, 1);
    localStorage.setItem("pendingUsers", JSON.stringify(pendingUsers));

    alert(`Usuario ${newUser.fullname} aprobado como ${role}.`);

    closeModal('approvalModal');
    cargarUsuarios();
    cargarSolicitudes();
}


function rechazarUsuario(index) {
    if (!confirm("¿Seguro que quieres rechazar esta solicitud?")) return;
    const pendingUsers = JSON.parse(localStorage.getItem("pendingUsers")) || [];
    pendingUsers.splice(index, 1);
    localStorage.setItem("pendingUsers", JSON.stringify(pendingUsers));
    cargarSolicitudes();
}

/*FORMULARIOS DE ASIGNACIÓN*/
function cargarSelects() {
    const profesorSelect = document.getElementById("profesorSelect");
    const alumnoSelect = document.getElementById("alumnoSelect");
    profesorSelect.innerHTML = '<option value="">Seleccione un profesor</option>';
    alumnoSelect.innerHTML = '<option value="">Seleccione un alumno</option>';

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key === "pendingUsers" || key.startsWith("asignacion")) continue;

        try {
            const user = JSON.parse(localStorage.getItem(key));
            if (user && user.role) {
                if (user.role === "Profesor") {
                    profesorSelect.innerHTML += `<option value="${user.email}">${user.fullname || user.email}</option>`;
                }
                if (user.role === "Alumno") {
                    alumnoSelect.innerHTML += `<option value="${user.email}">${user.fullname || user.email}</option>`;
                }
            }
        } catch (e) { }
    }
}

document.getElementById('asignarProfesorForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const profesor = document.getElementById("profesorSelect").value;
    const materia = document.getElementById("materiaInput").value;
    if (!profesor || !materia) return alert("Seleccione profesor y materia");

    const asignacionKey = `asignacion_prof_${profesor}`;
    const asignaciones = JSON.parse(localStorage.getItem(asignacionKey)) || [];
    if (!asignaciones.includes(materia)) {
        asignaciones.push(materia);
        localStorage.setItem(asignacionKey, JSON.stringify(asignaciones));
        alert(`Materia '${materia}' asignada a ${profesor}.`);
    } else {
        alert("Esta materia ya está asignada a este profesor.");
    }
});

document.getElementById('asignarAlumnoForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const alumno = document.getElementById("alumnoSelect").value;
    const anio = document.getElementById("anioInput").value;
    const division = document.getElementById("divisionInput").value;
    const especialidad = document.getElementById("especialidadInput").value;
    if (!alumno || !anio || !division || !especialidad) return alert("Complete todos los campos del alumno.");

    const curso = `${anio} ${division} ${especialidad}`;
    const asignacionKey = `asignacion_alu_${alumno}`;
    localStorage.setItem(asignacionKey, JSON.stringify({ curso }));
    alert(`Alumno ${alumno} asignado al curso ${curso}.`);
});


/* NICIALIZACIÓN Y OTROS*/
function logout() {
    sessionStorage.removeItem("activeUser");
    window.location.href = "principal.html";
}

document.addEventListener('DOMContentLoaded', () => {
    // Usamos un pequeño retraso para combatir el autocompletado agresivo de algunos navegadores
    setTimeout(() => {
        document.getElementById('searchInput').value = '';
    }, 100);

    document.getElementById('solicitudesContent').style.display = 'none';

    cargarUsuarios();
    cargarSolicitudes();
});
a