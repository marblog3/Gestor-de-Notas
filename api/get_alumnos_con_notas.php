<?php
// api/get_alumnos_con_notas.php
header('Content-Type: application/json');
require 'db_config.php';

try {
    $pdo = connectDB();
    
    // Consulta para obtener emails de alumnos que tienen notas (DISTINCT)
    // y unirlos con la tabla 'usuarios' para obtener el nombre completo.
    $sql = "
        SELECT DISTINCT n.alumno_email, u.fullname
        FROM notas n
        JOIN usuarios u ON n.alumno_email = u.email
        ORDER BY u.fullname ASC
    ";
    
    $stmt = $pdo->query($sql);
    $alumnos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'alumnos' => $alumnos]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de base de datos al obtener alumnos con notas: ' . $e->getMessage()]);
}
?>