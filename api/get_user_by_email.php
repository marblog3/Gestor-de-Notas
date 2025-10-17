<?php
header('Content-Type: application/json');
require 'db_config.php';

// 1. Obtener el email del usuario de los parámetros GET
// alumno.js usa una URL con el parámetro ?email=
$email = $_GET['email'] ?? null;

if (!$email) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Email de usuario no especificado.']);
    exit;
}

try {
    $pdo = connectDB();

    // 2. Consultar la tabla de usuarios
    // Es CRUCIAL que selecciones el campo 'curso_info'
    $stmt = $pdo->prepare("SELECT fullname, dni, email, role, curso_info FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        // Éxito: devolver los datos del usuario.
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        // Usuario no encontrado
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado.']);
    }

} catch (PDOException $e) {
    // Error de conexión o consulta a la base de datos
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la DB: ' . $e->getMessage()]);
}
?>