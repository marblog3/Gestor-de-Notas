<?php
header('Content-Type: application/json');
require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['fullname'], $input['dni'], $input['username'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos.']);
    exit;
}

$fullname = $input['fullname'];
$dni = $input['dni'];
$email = $input['username']; // El username es el email

try {
    $pdo = connectDB();
    
    // 1. Verificar si ya existe en usuarios activos
    $stmt = $pdo->prepare("SELECT email FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Este correo ya está registrado y activo.']);
        exit;
    }

    // 2. Insertar en usuarios en espera
    $stmt = $pdo->prepare("INSERT INTO usuarios_en_espera (fullname, dni, email) VALUES (?, ?, ?)");
    $stmt->execute([$fullname, $dni, $email]);

    echo json_encode(['success' => true, 'message' => 'Solicitud enviada. Esperando aprobación.']);

} catch (PDOException $e) {
    if ($e->getCode() == '23000') { // Error de clave duplicada (UNIQUE constraint)
        echo json_encode(['success' => false, 'message' => 'El DNI o correo ya está en espera de aprobación.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al registrar: ' . $e->getMessage()]);
    }
}
?>