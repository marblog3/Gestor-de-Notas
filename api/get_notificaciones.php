<?php
header('Content-Type: application/json');
require 'db_config.php';

// Inicia la sesión para obtener el email del alumno (o pásalo por GET si es más seguro)
$email = $_GET['email'] ?? null;

if (!$email) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email de alumno no proporcionado.']);
    exit;
}

try {
    $pdo = connectDB();
    
    // Busca solo notificaciones NO leídas para este alumno
    $stmt = $pdo->prepare("SELECT id, mensaje, fecha_creacion FROM notificaciones WHERE alumno_email = ? AND leida = 0 ORDER BY fecha_creacion DESC");
    $stmt->execute([$email]);
    $notificaciones = $stmt->fetchAll();

    echo json_encode(['success' => true, 'notificaciones' => $notificaciones]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>