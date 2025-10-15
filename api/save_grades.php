<?php
header('Content-Type: application/json');
require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['grades'], $input['materia'], $input['profesor_email'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos de notas o profesor.']);
    exit;
}

$grades = $input['grades']; // Array de notas por alumno
$materia = $input['materia'];
$profesor_email = $input['profesor_email'];

try {
    $pdo = connectDB();
    $pdo->beginTransaction();

    foreach ($grades as $grade_record) {
        $alumno_email = $grade_record['alumno_email'];
        $final = $grade_record['final'] ?? null;
        
        // Buscar si ya existe una nota para este alumno en esta materia
        $stmt_check = $pdo->prepare("SELECT id FROM notas WHERE alumno_email = ? AND materia = ?");
        $stmt_check->execute([$alumno_email, $materia]);
        $existing_id = $stmt_check->fetchColumn();

        // Construir la lista de campos y valores dinámicamente
        $fields = ['profesor_email', 'fecha_carga', 'nota_1Cuat', 'nota_2Cuat', 'intensificacion', 'diciembre', 'febrero', 'final', 'observaciones'];
        $values = [
            $profesor_email, 
            date('Y-m-d H:i:s'),
            $grade_record['nota_1Cuat'] ?? null,
            $grade_record['nota_2Cuat'] ?? null,
            $grade_record['intensificacion'] ?? null,
            $grade_record['diciembre'] ?? null,
            $grade_record['febrero'] ?? null,
            $final,
            $grade_record['observaciones'] ?? null
        ];

        if ($existing_id) {
            // UPDATE: Actualiza la nota
            $set_clauses = implode(', ', array_map(fn($f) => "$f = ?", $fields));
            $sql = "UPDATE notas SET $set_clauses WHERE id = ?";
            $params = array_merge($values, [$existing_id]);
        } else {
            // INSERT: Inserta la nueva nota
            $fields_insert = array_merge(['alumno_email', 'materia'], $fields);
            $placeholders = implode(', ', array_fill(0, count($fields_insert), '?'));
            $field_names = implode(', ', $fields_insert);
            $sql = "INSERT INTO notas ($field_names) VALUES ($placeholders)";
            $params = array_merge([$alumno_email, $materia], $values);
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Notas guardadas y actualizadas correctamente.']);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al guardar notas (DB): ' . $e->getMessage()]);
}
?>