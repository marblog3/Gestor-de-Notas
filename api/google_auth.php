<?php
// api/google_auth.php

// Encabezado para la respuesta JSON
header('Content-Type: application/json');

// Incluir el archivo de configuración de la base de datos
require_once 'db_config.php'; //

try {
    // Establecer conexión utilizando la función de db_config.php
    $pdo = connectDB(); //

    // Obtener los datos JSON enviados desde el frontend
    $data = json_decode(file_get_contents('php://input'), true);

    // Validar recepción de datos
    if (!isset($data['email']) || !isset($data['fullname'])) {
        echo json_encode(['success' => false, 'message' => 'Datos de entrada incompletos.']);
        exit;
    }

    $email = $data['email'];
    $fullname = $data['fullname'];

    // 1. VERIFICAR SI EL USUARIO YA EXISTE EN LA TABLA 'usuarios'
    // Si existe aquí, se considera un usuario activo y aprobado.
    $stmt = $pdo->prepare("SELECT email, fullname, role, dni FROM usuarios WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $user = $stmt->fetch();

    if ($user) {
        // El usuario existe: Iniciar sesión.
        echo json_encode(['success' => true, 'action' => 'login', 'user' => $user]);
        exit;
    }

    // 2. SI NO EXISTE, VERIFICAR SI YA TIENE UNA SOLICITUD EN 'usuarios_en_espera'
    // Esto evita la duplicación de solicitudes de registro.
    $stmt = $pdo->prepare("SELECT email FROM usuarios_en_espera WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->fetch()) {
        // Ya existe una solicitud pendiente.
        echo json_encode(['success' => true, 'action' => 'pending', 'message' => 'Ya existe una solicitud pendiente para este usuario.']);
        exit;
    }

    // 3. SI NO EXISTE EN NINGUNA TABLA, CREAR UNA NUEVA SOLICITUD PENDIENTE
    // Se inserta en la tabla usuarios_en_espera.
    $dni_generic = "No provisto";
    $stmt = $pdo->prepare("INSERT INTO usuarios_en_espera (fullname, dni, email, requested_at) VALUES (:fullname, :dni, :email, NOW())");
    $stmt->bindParam(':fullname', $fullname);
    $stmt->bindParam(':dni', $dni_generic);
    $stmt->bindParam(':email', $email);

    if ($stmt->execute()) {
        // Solicitud de registro creada con éxito.
        echo json_encode(['success' => true, 'action' => 'pending', 'message' => 'Solicitud de registro enviada para aprobación.']);
    } else {
        // Error al insertar la solicitud.
        echo json_encode(['success' => false, 'message' => 'Error al crear la solicitud de registro.']);
    }

} catch (PDOException $e) {
    // Capturar cualquier error de la base de datos y reportarlo.
    // En un entorno de producción, este mensaje debería ser más genérico.
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error general del servidor: ' . $e->getMessage()]);
}
?>