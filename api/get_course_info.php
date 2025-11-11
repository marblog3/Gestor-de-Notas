<?php
header('Content-Type: application/json');
require 'db_config.php';

$anio = $_GET['anio'] ?? null;
$division = $_GET['division'] ?? null;

if (!$anio || !$division) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan parámetros de Año y División.']);
    exit;
}

try {
    $pdo = connectDB();

    // 1. Obtener info básica del curso (Especialidad, Turno) desde la tabla `cursos`
    $stmt_curso = $pdo->prepare("SELECT especialidad, turno FROM cursos WHERE anio = ? AND division = ?");
    $stmt_curso->execute([$anio, $division]);
    $curso = $stmt_curso->fetch(PDO::FETCH_ASSOC);

    // Si el curso no existe en la tabla `cursos`, detenemos y devolvemos error
    if (!$curso) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => "Curso ${anio} ${division} no encontrado en la tabla 'cursos'."]);
        exit;
    }

    $turno = $curso['turno'];
    $especialidad = $curso['especialidad'];
    $preceptor_name = 'No asignado'; // Valor por defecto

    // 2. Buscar el email del preceptor (del campo curso_info de ALGÚN alumno de ese curso)
    $stmt_preceptor_email = $pdo->prepare("
        SELECT JSON_UNQUOTE(JSON_EXTRACT(curso_info, '$.preceptor_email')) AS preceptor_email
        FROM usuarios
        WHERE role = 'Alumno'
        AND JSON_UNQUOTE(JSON_EXTRACT(curso_info, '$.curso.anio')) = :anio
        AND JSON_UNQUOTE(JSON_EXTRACT(curso_info, '$.curso.division')) = :division
        AND JSON_UNQUOTE(JSON_EXTRACT(curso_info, '$.preceptor_email')) IS NOT NULL
        AND JSON_UNQUOTE(JSON_EXTRACT(curso_info, '$.preceptor_email')) != ''
        LIMIT 1
    ");
    $stmt_preceptor_email->execute([':anio' => $anio, ':division' => $division]);
    $preceptor_result = $stmt_preceptor_email->fetch(PDO::FETCH_ASSOC);

    if ($preceptor_result && !empty($preceptor_result['preceptor_email'])) {
        $preceptor_email = $preceptor_result['preceptor_email'];

        // 3. Obtener el nombre completo del preceptor usando su email
        $stmt_preceptor_name = $pdo->prepare("SELECT fullname FROM usuarios WHERE email = ? AND role = 'Preceptor'");
        $stmt_preceptor_name->execute([$preceptor_email]);
        $preceptor_fullname = $stmt_preceptor_name->fetchColumn();

        if ($preceptor_fullname) {
            $preceptor_name = $preceptor_fullname;
        } else {
            // Si el email existe en el alumno pero no hay un usuario preceptor con ese email
            $preceptor_name = "Preceptor (${preceptor_email}) no encontrado";
        }
    } else {
        // No se encontró ningún alumno con preceptor_email asignado para este curso
        $preceptor_name = 'Preceptor no asignado al curso';
    }

    // Respuesta final
    $response = [
        'success' => true,
        'especialidad' => $especialidad,
        'turno' => $turno,
        'preceptor_name' => $preceptor_name
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>