// Gestor-de-Notas-main/api/get_course_info.php

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
    
    // 1. Obtener info básica del curso (Especialidad, Turno)
    $stmt_curso = $pdo->prepare("SELECT especialidad, turno FROM cursos WHERE anio = ? AND division = ?");
    $stmt_curso->execute([$anio, $division]);
    $curso = $stmt_curso->fetch(PDO::FETCH_ASSOC);

    if (!$curso) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Curso no encontrado.']);
        exit;
    }
    
    // 2. Buscar el email del preceptor (del curso_info de algún alumno)
    $preceptor_name = 'No asignado';
    $stmt_preceptor_email = $pdo->prepare("
        SELECT JSON_UNQUOTE(JSON_EXTRACT(curso_info, '$.preceptor_email')) AS preceptor_email
        FROM usuarios 
        WHERE role = 'Alumno'
        AND JSON_UNQUOTE(JSON_EXTRACT(curso_info, '$.curso.anio')) = :anio
        AND JSON_UNQUOTE(JSON_EXTRACT(curso_info, '$.curso.division')) = :division
        AND JSON_UNQUOTE(JSON_EXTRACT(curso_info, '$.preceptor_email')) IS NOT NULL
        LIMIT 1
    ");
    $stmt_preceptor_email->execute([':anio' => $anio, ':division' => $division]);
    $preceptor_result = $stmt_preceptor_email->fetch(PDO::FETCH_ASSOC);
    
    if ($preceptor_result && $preceptor_result['preceptor_email']) {
        // 3. Obtener el nombre completo del preceptor
        $stmt_preceptor_name = $pdo->prepare("SELECT fullname FROM usuarios WHERE email = ? AND role = 'Preceptor'");
        $stmt_preceptor_name->execute([$preceptor_result['preceptor_email']]);
        $preceptor_name = $stmt_preceptor_name->fetchColumn() ?? 'Preceptor no encontrado';
    }
    
    $response = [
        'success' => true,
        'especialidad' => $curso['especialidad'],
        'turno' => $curso['turno'],
        'preceptor_name' => $preceptor_name
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>