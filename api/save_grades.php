<?php
// api/save_grades.php
header('Content-Type: application/json');
require_once 'db_config.php';

try {
    $pdo = connectDB();
    $data = json_decode(file_get_contents('php://input'), true);

    // 1. Validar datos de entrada
    if (!isset($data['grades'], $data['materia'], $data['profesor_email'], $data['activeUserRole'])) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos desde el frontend.']);
        exit;
    }

    $grades = $data['grades'];
    $materia = $data['materia'];
    $profesor_email = $data['profesor_email'];
    $activeUserRole = $data['activeUserRole']; // Rol del usuario que hace la petición

    $pdo->beginTransaction();

    // 2. Si el usuario es un Profesor, verificar la fecha de carga
    if ($activeUserRole === 'Profesor') {
        foreach ($grades as $grade) {
            $stmt_check = $pdo->prepare("SELECT fecha_carga FROM notas WHERE alumno_email = ? AND materia = ?");
            $stmt_check->execute([$grade['alumno_email'], $materia]);
            $existing_note = $stmt_check->fetch();

            if ($existing_note) {
                $fecha_carga = new DateTime($existing_note['fecha_carga']);
                $fecha_limite = new DateTime('-1 month'); // Fecha de hace un mes

                if ($fecha_carga < $fecha_limite) {
                    // Si la nota es más antigua que un mes, no se puede modificar
                    $pdo->rollBack();
                    echo json_encode(['success' => false, 'message' => 'El período de edición de 1 mes ha expirado para una o más notas. No se puede guardar.']);
                    exit;
                }
            }
        }
    }

    // 3. Preparar la consulta de inserción/actualización (tu código actual es perfecto)
    $stmt_save = $pdo->prepare("
        INSERT INTO notas (alumno_email, materia, profesor_email, fecha_carga, nota_1Cuat, nota_2Cuat, intensificacion, diciembre, febrero, final, observaciones) 
        VALUES (:alumno_email, :materia, :profesor_email, NOW(), :nota_1Cuat, :nota_2Cuat, :intensificacion, :diciembre, :febrero, :final, :observaciones)
        ON DUPLICATE KEY UPDATE 
            profesor_email = VALUES(profesor_email), fecha_carga = IF(ISNULL(fecha_carga), NOW(), fecha_carga),
            nota_2Cuat = VALUES(nota_2Cuat), intensificacion = VALUES(intensificacion), diciembre = VALUES(diciembre), 
            febrero = VALUES(febrero), final = VALUES(final), observaciones = VALUES(observaciones)
    ");

    foreach ($grades as $grade) {
        $stmt_save->execute([
            ':alumno_email' => $grade['alumno_email'],
            ':materia' => $materia,
            ':profesor_email' => $profesor_email,
            ':nota_1Cuat' => $grade['nota_1Cuat'] ?: null,
            ':nota_2Cuat' => $grade['nota_2Cuat'] ?: null,
            ':intensificacion' => $grade['intensificacion'] ?: null,
            ':diciembre' => $grade['diciembre'] ?: null,
            ':febrero' => $grade['febrero'] ?: null,
            ':final' => $grade['final'] ?: null,
            ':observaciones' => $grade['observaciones'] ?: null
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