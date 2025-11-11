<?php
header('Content-Type: application/json');
require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? null;

if (!$email) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email de alumno no proporcionado.']);
    exit;
}

try {
    $pdo = connectDB();
    
    // Marca TODAS las notificaciones de este alumno como leídas
    $stmt = $pdo->prepare("UPDATE notificaciones SET leida = 1 WHERE alumno_email = ? AND leida = 0");
    $stmt->execute([$email]);
    $count = $stmt->rowCount();

    echo json_encode(['success' => true, 'marcadas_leidas' => $count]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>