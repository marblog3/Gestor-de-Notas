<?php
// api/assign_course.php
header('Content-Type: application/json');
require_once 'db_config.php';

try {
    $pdo = connectDB();
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['email']) || !isset($data['data'])) {
        echo json_encode(['success' => false, 'message' => 'Faltan datos de alumno o curso.']);
        exit;
    }

    $email = $data['email'];
    // Envolvemos los datos del curso en un objeto 'curso' para consistencia
    $curso_info_data = ['curso' => $data['data']]; 
    $curso_info_json = json_encode($curso_info_data);

    $stmt = $pdo->prepare("UPDATE usuarios SET curso_info = :curso_info WHERE email = :email");
    
    $params = [
        ':curso_info' => $curso_info_json,
        ':email' => $email
    ];

    if ($stmt->execute($params)) {
        echo json_encode(['success' => true, 'message' => 'Alumno asignado al curso correctamente.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar la base de datos.']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>