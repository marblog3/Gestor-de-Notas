<?php
// api/save_grades.php
header('Content-Type: application/json');
require_once 'db_config.php';

try {
    $pdo = connectDB();
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['grades']) || !isset($data['materia']) || !isset($data['profesor_email'])) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos.']);
        exit;
    }

    $grades = $data['grades'];
    $materia = $data['materia'];
    $profesor_email = $data['profesor_email'];
    $pdo->beginTransaction();

    // Preparamos una única consulta que inserta o actualiza si ya existe la combinación alumno-materia
    $stmt = $pdo->prepare("
        INSERT INTO notas (
            alumno_email, materia, profesor_email, fecha_carga, 
            nota_1Cuat, nota_2Cuat, intensificacion, diciembre, febrero, final, observaciones
        ) VALUES (
            :alumno_email, :materia, :profesor_email, NOW(),
            :nota_1Cuat, :nota_2Cuat, :intensificacion, :diciembre, :febrero, :final, :observaciones
        )
        ON DUPLICATE KEY UPDATE
            profesor_email = VALUES(profesor_email), fecha_carga = NOW(),
            nota_1Cuat = VALUES(nota_1Cuat), nota_2Cuat = VALUES(nota_2Cuat),
            intensificacion = VALUES(intensificacion), diciembre = VALUES(diciembre),
            febrero = VALUES(febrero), final = VALUES(final), observaciones = VALUES(observaciones)
    ");

    foreach ($grades as $grade) {
        $stmt->execute([
            ':alumno_email' => $grade['alumno_email'],
            ':materia' => $materia,
            ':profesor_email' => $profesor_email,
            ':nota_1Cuat' => $grade['nota_1Cuat'] ?: null,
            ':nota_2Cuat' => $grade['nota_2Cuat'] ?: null,
            ':intensificacion' => $grade['intensificacion'] ?: null,
            ':diciembre' => $grade['diciembre'] ?: null,
            ':febrero' => $grade['febrero'] ?: null,
            ':final' => $grade['final'] ?: null, // <-- CAMPO AÑADIDO
            ':observaciones' => $grade['observaciones'] ?: null // <-- CAMPO AÑADIDO
        ]);
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Notas guardadas correctamente.']);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>