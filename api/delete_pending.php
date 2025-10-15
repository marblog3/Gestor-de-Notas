<?php
header('Content-Type: application/json');
require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id_pendiente'])) {
    echo json_encode(['success' => false, 'message' => 'ID de solicitud pendiente es requerido.']);
    exit;
}

$id_pendiente = $input['id_pendiente'];

try {
    $pdo = connectDB();
    $stmt = $pdo->prepare("DELETE FROM usuarios_en_espera WHERE id = ?");
    $stmt->execute([$id_pendiente]);

    echo json_encode(['success' => true, 'message' => 'Solicitud rechazada y eliminada.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al rechazar solicitud: ' . $e->getMessage()]);
}
?>