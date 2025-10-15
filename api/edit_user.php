<?php
header('Content-Type: application/json');
require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email'], $input['newRole'], $input['newFullname'], $input['newDni'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos de usuario.']);
    exit;
}

$email = $input['email'];
$newRole = $input['newRole'];
$newFullname = $input['newFullname'];
$newDni = $input['newDni'];
$newPassword = $input['newPassword'] ?? null;

$sql = "UPDATE usuarios SET fullname = ?, dni = ?, role = ?";
$params = [$newFullname, $newDni, $newRole];

if ($newPassword) {
    $password_hash = password_hash($newPassword, PASSWORD_DEFAULT);
    $sql .= ", password = ?";
    $params[] = $password_hash;
}

$sql .= " WHERE email = ?";
$params[] = $email;

try {
    $pdo = connectDB();
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'message' => 'Usuario actualizado.']);

} catch (PDOException $e) {
    $message = 'Error al actualizar usuario.';
    if ($e->getCode() == '23000') {
         $message = 'El DNI ingresado ya pertenece a otro usuario.';
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $message]);
}
?>