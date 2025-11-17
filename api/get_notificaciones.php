<?php
header('Content-Type: application/json');
require 'db_config.php';

$email = $_GET['email'] ?? null;

if (!$email) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email de alumno no proporcionado.']);
    exit;
}

try {
    $pdo = connectDB();
    
    // MODIFICADO: Quitamos "AND leida = 0" para traer el historial.
    // Agregamos LIMIT 50 para no sobrecargar la lista.
    $stmt = $pdo->prepare("SELECT id, mensaje, fecha_creacion, leida FROM notificaciones WHERE alumno_email = ? ORDER BY fecha_creacion DESC LIMIT 50");
    $stmt->execute([$email]);
    $notificaciones = $stmt->fetchAll();

    echo json_encode(['success' => true, 'notificaciones' => $notificaciones]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>