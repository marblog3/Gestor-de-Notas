<?php
// api/get_especialidad.php
header('Content-Type: application/json');
require 'db_config.php';

$anio = $_GET['anio'] ?? null;
$division = $_GET['division'] ?? null;

if (!$anio || !$division) {
    echo json_encode(['success' => false, 'message' => 'Faltan Año y División.']);
    exit;
}

try {
    $pdo = connectDB();
    
    $stmt = $pdo->prepare("SELECT especialidad FROM cursos WHERE anio = ? AND division = ?");
    $stmt->execute([$anio, $division]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode(['success' => true, 'especialidad' => $result['especialidad']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Especialidad no encontrada para el curso especificado.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de base de datos.']);
}
?>