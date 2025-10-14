<?php
header('Content-Type: application/json');
require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email'], $input['curso_info'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos de alumno o curso.']);
    exit;
}

$email = $input['email'];
$curso_info = $input['curso_info']; // {anio, division, especialidad}

try {
    $pdo = connectDB();
    
    // El formato JSON debe ser: {"curso": {"anio": "...", "division": "...", "especialidad": "..."}}
    $json_data = json_encode(['curso' => $curso_info], JSON_UNESCAPED_UNICODE);
    
    $stmt_update = $pdo->prepare("UPDATE usuarios SET curso_info = ? WHERE email = ? AND role = 'Alumno'");
    $stmt_update->execute([$json_data, $email]);

    if ($stmt_update->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => "Curso asignado a $email."]);
    } else {
        echo json_encode(['success' => false, 'message' => "Error: El usuario no existe o no es un Alumno."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al guardar asignación (DB): ' . $e->getMessage()]);
}
?>