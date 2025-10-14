<?php
header('Content-Type: application/json');
require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email'], $input['password'], $input['role'], $input['fullname'], $input['dni'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan campos requeridos.']);
    exit;
}

$email = $input['email'];
$password_hash = password_hash($input['password'], PASSWORD_DEFAULT);
$role = $input['role'];
$fullname = $input['fullname'];
$dni = $input['dni'];

try {
    $pdo = connectDB();
    $stmt = $pdo->prepare("INSERT INTO usuarios (fullname, dni, email, password, role) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$fullname, $dni, $email, $password_hash, $role]);

    echo json_encode(['success' => true, 'message' => 'Usuario creado exitosamente.']);

} catch (PDOException $e) {
    $message = 'Error al crear usuario.';
    if ($e->getCode() == '23000') {
        $message = 'El DNI o el correo institucional ya está registrado.';
    }
    echo json_encode(['success' => false, 'message' => $message]);
}
?>