<?php
header('Content-Type: application/json');
require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id_pendiente'], $input['email'], $input['fullname'], $input['dni'], $input['password'], $input['role'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos.']);
    exit;
}

$id_pendiente = $input['id_pendiente'];
$email = $input['email'];
$fullname = $input['fullname'];
$dni = $input['dni'];
$role = $input['role'];
$password_hash = password_hash($input['password'], PASSWORD_DEFAULT); // ¡Siempre hashear!

try {
    $pdo = connectDB();
    $pdo->beginTransaction();

    // 1. Insertar en la tabla de usuarios activos
    $stmt_insert = $pdo->prepare("INSERT INTO usuarios (fullname, dni, email, password, role) VALUES (?, ?, ?, ?, ?)");
    $stmt_insert->execute([$fullname, $dni, $email, $password_hash, $role]);

    // 2. Eliminar de la tabla de usuarios en espera
    $stmt_delete = $pdo->prepare("DELETE FROM usuarios_en_espera WHERE id = ?");
    $stmt_delete->execute([$id_pendiente]);

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Usuario aprobado y activado.']);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de aprobación (DB): ' . $e->getMessage()]);
}
?>