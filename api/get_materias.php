<?php
// api/get_materias.php
header('Content-Type: application/json');
require 'db_config.php';

try {
    $pdo = connectDB();
    // Selecciona la columna especialidad
    $stmt = $pdo->query("SELECT id, nombre, especialidad FROM materias ORDER BY nombre ASC");
    $materias = $stmt->fetchAll();

    echo json_encode($materias); // Devuelve la lista de materias con sus especialidades

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener materias: ' . $e->getMessage()]);
}
?>