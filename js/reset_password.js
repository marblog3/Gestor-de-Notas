// js/reset_password.js

async function handleResetPassword() {
    const email = document.getElementById('reset-email').value.trim();
    const oldPassword = document.getElementById('reset-old-password').value;
    const newPassword = document.getElementById('reset-new-password').value;
    const confirmPassword = document.getElementById('reset-confirm-password').value;
    const errorMsg = document.getElementById('reset-error-msg');

    errorMsg.innerHTML = '';

    if (!email || !oldPassword || !newPassword || !confirmPassword) {
        errorMsg.innerHTML = 'Complete todos los campos.';
        return;
    }

    if (newPassword !== confirmPassword) {
        errorMsg.innerHTML = 'La nueva contraseña y su confirmación no coinciden.';
        return;
    }

    // Validación mínima de longitud para seguridad
    if (newPassword.length < 8) {
        errorMsg.innerHTML = 'La nueva contraseña debe tener al menos 8 caracteres.';
        return;
    }

    try {
        const response = await fetch('../api/reset_password.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, oldPassword, newPassword })
        });
        const data = await response.json();

        if (data.success) {
            alert('Contraseña restablecida con éxito. Ya puedes iniciar sesión con tu nueva contraseña.');
            window.location.href = 'principal.html';
        } else {
            errorMsg.innerHTML = data.message || 'Error al restablecer la contraseña.';
        }
    } catch (e) {
        errorMsg.innerHTML = 'Error de conexión con el servidor.';
        console.error(e);
    }
}