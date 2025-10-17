<?php
// api/delete_materia.php
header('Content-Type: application/json');
require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID de materia es requerido.']);
    exit;
}

$id = $input['id'];

try {
    $pdo = connectDB();
    $stmt = $pdo->prepare("DELETE FROM materias WHERE id = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Materia eliminada correctamente.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Materia no encontrada.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    // Nota: Se podría añadir lógica para manejar errores de clave foránea si la materia está asignada.
    echo json_encode(['success' => false, 'message' => 'Error al eliminar materia: ' . $e->getMessage()]);
}
?>