<?php
header('Content-Type: application/json');
require 'db_config.php';

try {
    $pdo = connectDB();
    $stmt = $pdo->query("SELECT id, fullname, dni, email, requested_at FROM usuarios_en_espera ORDER BY requested_at ASC");
    $pendingUsers = $stmt->fetchAll();

    echo json_encode($pendingUsers);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener solicitudes: ' . $e->getMessage()]);
}
?>