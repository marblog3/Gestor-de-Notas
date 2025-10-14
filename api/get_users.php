<?php
header('Content-Type: application/json');
require 'db_config.php';

try {
    $pdo = connectDB();
    // No seleccionamos la contraseña por seguridad
    $stmt = $pdo->query("SELECT fullname, dni, email, role, curso_info FROM usuarios ORDER BY fullname ASC");
    $users = $stmt->fetchAll();

    echo json_encode($users);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener usuarios: ' . $e->getMessage()]);
}
?>