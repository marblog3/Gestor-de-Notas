<?php
header('Content-Type: application/json');
require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['username'], $input['password'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan credenciales.']);
    exit;
}

$email = $input['username'];
$password = $input['password'];

// Admin Fijo para la transición
if ($email === "admin@eest5.com" && $password === "admin123") {
    echo json_encode(['success' => true, 'user' => ['email' => $email, 'role' => 'Administrador', 'fullname' => 'Admin Fijo', 'dni' => '99999999']]);
    exit;
}

try {
    $pdo = connectDB();
    $stmt = $pdo->prepare("SELECT fullname, dni, email, password, role FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Eliminar el hash de la contraseña antes de enviarlo al frontend
        unset($user['password']);
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas o usuario inactivo.']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de servidor.']);
}
?>