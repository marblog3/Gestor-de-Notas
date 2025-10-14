<?php
header('Content-Type: application/json');
require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email'], $input['materia'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos de profesor o materia.']);
    exit;
}

$email = $input['email'];
$materia = $input['materia'];

try {
    $pdo = connectDB();
    
    // 1. Obtener el JSON actual de curso_info
    $stmt_fetch = $pdo->prepare("SELECT curso_info FROM usuarios WHERE email = ? AND role = 'Profesor'");
    $stmt_fetch->execute([$email]);
    $user = $stmt_fetch->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Profesor no encontrado.']);
        exit;
    }
    
    // 2. Decodificar, añadir la materia y codificar de nuevo
    $current_info = json_decode($user['curso_info'] ?? '{"materias": []}', true);
    
    if (!isset($current_info['materias'])) {
        $current_info['materias'] = [];
    }
    
    if (in_array($materia, $current_info['materias'])) {
        echo json_encode(['success' => false, 'message' => 'Esta materia ya está asignada a este profesor.']);
        exit;
    }

    $current_info['materias'][] = $materia;
    $new_curso_info = json_encode($current_info, JSON_UNESCAPED_UNICODE);
    
    // 3. Actualizar el campo curso_info
    $stmt_update = $pdo->prepare("UPDATE usuarios SET curso_info = ? WHERE email = ?");
    $stmt_update->execute([$new_curso_info, $email]);

    echo json_encode(['success' => true, 'message' => "Materia '$materia' asignada a $email."]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al guardar asignación (DB): ' . $e->getMessage()]);
}
?>