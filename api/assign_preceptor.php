<?php
// api/assign_preceptor.php
header('Content-Type: application/json');
require_once 'db_config.php';

try {
    $pdo = connectDB();
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['data']['preceptor_email']) || !isset($data['data']['anio']) || !isset($data['data']['division'])) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos para la asignación.']);
        exit;
    }

    $preceptor_email = $data['data']['preceptor_email'];
    $anio = $data['data']['anio'];
    $division = $data['data']['division'];

    $pdo->beginTransaction();
    $alumnos_actualizados = 0;

    // 1. Obtener todos los alumnos para buscar la coincidencia de curso
    $stmt_alumnos = $pdo->prepare("SELECT email, curso_info FROM usuarios WHERE role = 'Alumno'");
    $stmt_alumnos->execute();
    $alumnos = $stmt_alumnos->fetchAll(PDO::FETCH_ASSOC);

    // 2. Iterar sobre cada alumno para verificar si coinciden el año y la división
    $stmt_update = $pdo->prepare("UPDATE usuarios SET curso_info = :curso_info WHERE email = :email");

    foreach ($alumnos as $alumno) {
        $curso_info = $alumno['curso_info'] ? json_decode($alumno['curso_info'], true) : [];
        
        // Asumimos que la información del curso está en curso_info['curso']
        $curso = $curso_info['curso'] ?? null;

        if ($curso && $curso['anio'] === $anio && $curso['division'] === $division) {
            
            // Si coincide, asignamos el preceptor al curso_info del alumno
            $curso_info['preceptor_email'] = $preceptor_email; 
            
            $new_curso_info_json = json_encode($curso_info);
            
            $update_params = [
                ':curso_info' => $new_curso_info_json,
                ':email' => $alumno['email']
            ];

            $stmt_update->execute($update_params);
            $alumnos_actualizados++;
        }
    }

    $pdo->commit();

    echo json_encode(['success' => true, 'message' => "Asignación completada. Se actualizaron {$alumnos_actualizados} alumnos.", 'alumnos_actualizados' => $alumnos_actualizados]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>