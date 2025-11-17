

async function asignarPreceptorAdmin(event) {
    event.preventDefault();
    const preceptor = document.getElementById("preceptorSelectAdmin").value;
    const anio = document.getElementById("anioInputPreceptorAdmin").value;
    const division = document.getElementById("divisionInputPreceptorAdmin").value;

    if (!preceptor || !anio || !division) {
        return showCustomAlert("Complete todos los campos para asignar el preceptor.");
    }

    // Usaremos el mismo endpoint que creó el Preceptor
    const asignacion_info = { preceptor_email: preceptor, anio, division };

    try {
        const response = await fetch('../api/assign_preceptor.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: asignacion_info })
        });
        const data = await response.json();

        if (data.success) {
            showCustomAlert(data.message);
        } else {
            showCustomAlert(data.message || "Error al asignar preceptor.");
        }
    } catch (e) {
        showCustomAlert("Error de conexión con el servidor al asignar preceptor.");
        console.error(e);
    }
}

// Listener para el nuevo formulario
document.getElementById('asignarPreceptorForm').addEventListener('submit', asignarPreceptorAdmin);