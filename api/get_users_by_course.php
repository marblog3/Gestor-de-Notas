<?php
// api/get_users_by_course.php
header('Content-Type: application/json');
require 'db_config.php';

$anio = $_GET['anio'] ?? null;
$division = $_GET['division'] ?? null;
// El rol es opcional; por defecto, buscará solo Alumnos, ya que se usa para poblar el select de alumnos.
$role = $_GET['role'] ?? 'Alumno'; 

if (!$anio || !$division) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan parámetros de Año y División.']);
    exit;
}

try {
    $pdo = connectDB();
    
    // Consulta SQL que usa JSON_CONTAINS para buscar la estructura del curso.
    // Busca usuarios con el rol especificado (por defecto 'Alumno') Y donde el JSON curso_info 
    // contenga un objeto 'curso' con el año y la división especificados.
    $sql = "
        SELECT fullname, dni, email, role, curso_info 
        FROM usuarios 
        WHERE role = :role 
        AND JSON_CONTAINS(
            curso_info, 
            JSON_OBJECT('curso', JSON_OBJECT('anio', :anio, 'division', :division)),
            '$.curso'
        )
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