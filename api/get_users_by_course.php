<?php
header('Content-Type: application/json');
require 'db_config.php';

$anio = $_GET['anio'] ?? null;
$division = $_GET['division'] ?? null;
$role = $_GET['role'] ?? 'Alumno'; 

if (!$anio || !$division) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan parámetros de Año y División.']);
    exit;
}

try {
    $pdo = connectDB();
    
    // Consulta SQL que usa JSON_EXTRACT para buscar coincidencias exactas en las claves anio y division.
    // Esto es más robusto que JSON_CONTAINS cuando hay otras claves en el objeto JSON (como especialidad).
    $sql = "
        SELECT fullname, dni, email, role, curso_info 
        FROM usuarios 
        WHERE role = :role 
        
        AND JSON_UNQUOTE(JSON_EXTRACT(curso_info, '$.curso.anio')) = :anio
        AND JSON_UNQUOTE(JSON_EXTRACT(curso_info, '$.curso.division')) = :division
        
        ORDER BY fullname ASC
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':role' => $role,
        ':anio' => $anio,
        ':division' => $division
    ]);
    
    $users = $stmt->fetchAll();

    echo json_encode($users);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>