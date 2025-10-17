<?php
// api/create_materia.php
header('Content-Type: application/json');
require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['nombre'])) {
    echo json_encode(['success' => false, 'message' => 'El nombre de la materia es requerido.']);
    exit;
}

$nombre = trim($input['nombre']);
$especialidad = $input['especialidad'] ?? ''; // Recibe la especialidad

try {
    $pdo = connectDB();
    // Insertar el nombre Y la especialidad
    $stmt = $pdo->prepare("INSERT INTO materias (nombre, especialidad) VALUES (?, ?)");
    $stmt->execute([$nombre, $especialidad]);

    echo json_encode(['success' => true, 'message' => 'Materia creada exitosamente.']);

} catch (PDOException $e) {
    $message = 'Error al crear materia.';
    if ($e->getCode() == '23000') { // Violación de clave única
        $message = 'Esta materia ya existe.';
    }
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $message]);
}
?>