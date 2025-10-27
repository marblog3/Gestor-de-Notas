// api/get_subjects_by_course.php
<?php
header('Content-Type: application/json');
require 'db_config.php';

$anio = $_GET['anio'] ?? null;
$division = $_GET['division'] ?? null;

if (!$anio || !$division) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan Año y División.']);
    exit;
}

try {
    $pdo = connectDB();
    
    // 1. Obtener la especialidad del curso
    $stmt_curso = $pdo->prepare("SELECT especialidad FROM cursos WHERE anio = ? AND division = ?");
    $stmt_curso->execute([$anio, $division]);
    $curso = $stmt_curso->fetch(PDO::FETCH_ASSOC);

    if (!$curso) {
        $especialidad = 'Tronco Común'; // Fallback
    } else {
        $especialidad = $curso['especialidad'];
    }
    
    // 2. Seleccionar materias que sean de la especialidad O de Tronco Común/NULL (áulicas)
    $stmt_materias = $pdo->prepare("
        SELECT nombre 
        FROM materias 
        WHERE especialidad = :especialidad OR especialidad = 'Tronco Común' OR especialidad IS NULL
        ORDER BY nombre ASC
    ");
    $stmt_materias->execute([':especialidad' => $especialidad]);
    $materias = $stmt_materias->fetchAll(PDO::FETCH_COLUMN, 0);

    echo json_encode(['success' => true, 'materias' => $materias]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>