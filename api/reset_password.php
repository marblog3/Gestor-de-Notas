<?php
// api/reset_password.php
header('Content-Type: application/json');
require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email'], $input['oldPassword'], $input['newPassword'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos.']);
    exit;
}

$email = $input['email'];
$oldPassword = $input['oldPassword'];
$newPassword = $input['newPassword'];

try {
    $pdo = connectDB();
    
    // 1. Verificar si el usuario existe y obtener la contraseña hasheada
    $stmt = $pdo->prepare("SELECT password FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado.']);
        exit;
    }

    // 2. Verificar que la contraseña anterior (dada por el Admin) sea correcta
    if (!password_verify($oldPassword, $user['password'])) {
        echo json_encode(['success' => false, 'message' => 'La contraseña anterior es incorrecta o no coincide con la dada por el Admin.']);
        exit;
    }
    
    // 3. Hashear y actualizar la nueva contraseña
    $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

    $stmt_update = $pdo->prepare("UPDATE usuarios SET password = ? WHERE email = ?");
    $stmt_update->execute([$newPasswordHash, $email]);

    echo json_encode(['success' => true, 'message' => 'Contraseña actualizada con éxito.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de servidor: ' . $e->getMessage()]);
}
?>