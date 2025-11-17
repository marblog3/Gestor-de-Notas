// ==========================================
// GLOBAL.JS - Control de Modales y Panel Lateral
// ==========================================

/**
 * Muestra un modal de alerta personalizado.
 */
function showCustomAlert(message, callback) {
    const msgElement = document.getElementById('custom-alert-message');
    const overlay = document.getElementById('custom-alert-overlay');
    
    if(msgElement && overlay) {
        msgElement.textContent = message;
        overlay.style.display = 'flex';
        overlay.callback = callback;
    } else {
        alert(message); // Respaldo por si falla
        if(callback) callback();
    }
}

/**
 * Cierra el modal de alerta.
 */
function closeCustomAlert() {
    const overlay = document.getElementById('custom-alert-overlay');
    if(overlay) {
        overlay.style.display = 'none';
        if (typeof overlay.callback === 'function') {
            overlay.callback();
            overlay.callback = null;
        }
    }
}

// --- Funciones del Panel Lateral ---

function openInfoPanel() {
    // 1. Cargar datos del usuario
    const activeUser = JSON.parse(sessionStorage.getItem("activeUser"));
    
    if (activeUser) {
        if(document.getElementById('panel-user-name')) document.getElementById('panel-user-name').textContent = activeUser.fullname || 'No disponible';
        if(document.getElementById('panel-user-dni')) document.getElementById('panel-user-dni').textContent = activeUser.dni || 'No disponible';
        if(document.getElementById('panel-user-email')) document.getElementById('panel-user-email').textContent = activeUser.email || 'No disponible';
        if(document.getElementById('panel-user-role')) document.getElementById('panel-user-role').textContent = activeUser.role || 'No disponible';
    }

    // 2. Mostrar panel
    document.getElementById('info-panel').classList.add('active');
    document.getElementById('info-panel-overlay').classList.add('active');
}

function closeInfoPanel() {
    document.getElementById('info-panel').classList.remove('active');
    document.getElementById('info-panel-overlay').classList.remove('active');
}

// Compatibilidad con tu código anterior
function showPersonalInfo() {
    openInfoPanel();
}