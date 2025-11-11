<?php
header('Content-Type: application/json');
require 'db_config.php';

$anio = $_GET['anio'] ?? null;
$division = $_GET['division'] ?? null;

if (!$anio || !$division) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan Año y División.']);
    exit;
}

try {
    $pdo = connectDB();
    
    // 1. Consulta para obtener las asignaciones de todos los profesores
    //    que tienen al menos una materia asignada a este AÑO Y DIVISIÓN.
    $sql = "
        SELECT curso_info 
        FROM usuarios 
        WHERE role = 'Profesor'
        AND curso_info IS NOT NULL 
    ";
    
    $stmt = $pdo->query($sql);
    $profesores_asignaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $materias_del_curso = new \stdClass(); // Usamos un objeto para asegurar nombres únicos (más eficiente que array_unique)

    // 2. Procesamiento en PHP: Iterar sobre las asignaciones de todos los profesores
    foreach ($profesores_asignaciones as $profesor) {
        $asignaciones = json_decode($profesor['curso_info'], true);
        
        if (is_array($asignaciones)) {
            foreach ($asignaciones as $asignacion) {
                // Verificamos que la materia esté asignada EXACTAMENTE a este curso
                if (isset($asignacion['anio']) && $asignacion['anio'] === $anio && 
                    isset($asignacion['division']) && $asignacion['division'] === $division &&
                    !empty($asignacion['materia'])) {
                    
                    // Almacenamos el nombre de la materia como una clave para asegurar unicidad
                    $materias_del_curso->{$asignacion['materia']} = true; 
                }
            }
        }
    }

    // 3. Obtener la lista final y ordenarla
    $lista_materias = array_keys(get_object_vars($materias_del_curso));
    sort($lista_materias); // Ordenar alfabéticamente

    echo json_encode(['success' => true, 'materias' => $lista_materias]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>