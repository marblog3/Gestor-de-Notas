<?php
header('Content-Type: application/json');
require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email'])) {
    echo json_encode(['success' => false, 'message' => 'Correo de usuario requerido.']);
    exit;
}

$email = $input['email'];

try {
    $pdo = connectDB();
    $stmt = $pdo->prepare("DELETE FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Usuario eliminado.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al eliminar usuario: ' . $e->getMessage()]);
}
?>