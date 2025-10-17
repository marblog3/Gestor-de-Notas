<?php
// api/get_profesores_by_course.php
header('Content-Type: application/json');
require 'db_config.php';

$anio = $_GET['anio'] ?? null;
$division = $_GET['division'] ?? null;

if (!$anio || !$division) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan parámetros de Año y División.']);
    exit;
}

try {
    $pdo = connectDB();
    
    // La consulta es compleja: busca profesores donde su array JSON de materias
    // contiene AL MENOS una materia que coincide con el año Y la división.
    $sql = "
        SELECT fullname, email, curso_info 
        FROM usuarios 
        WHERE role = 'Profesor'
        AND JSON_SEARCH(
            curso_info, 
            'one', 
            :anio, 
            NULL, 
            '$[*].anio'
        ) IS NOT NULL
        AND JSON_SEARCH(
            curso_info, 
            'one', 
            :division, 
            NULL, 
            '$[*].division'
        ) IS NOT NULL
        ORDER BY fullname ASC
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':anio' => $anio,
        ':division' => $division
    ]);
    
    $profesores_crudo = $stmt->fetchAll();
    $resultado_final = [];

    // Procesamiento en PHP: Necesitamos aplanar el JSON para obtener la materia específica
    foreach ($profesores_crudo as $profesor) {
        $asignaciones = json_decode($profesor['curso_info'], true);
        
        foreach ($asignaciones as $asignacion) {
            // Filtramos solo las materias que coinciden exactamente con el curso
            if (isset($asignacion['anio']) && $asignacion['anio'] === $anio && 
                isset($asignacion['division']) && $asignacion['division'] === $division) {
                
                $resultado_final[] = [
                    'fullname' => $profesor['fullname'],
                    'email' => $profesor['email'],
                    'materia' => $asignacion['materia'] 
                ];
            }
        }
    }

    echo json_encode($resultado_final);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>