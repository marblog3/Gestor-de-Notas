<?php
header('Content-Type: application/json');

// Incluir el archivo de configuración de la base de datos
require 'db_config.php'; 

// Inicializar la respuesta en caso de fallo
$response = ['error' => 'Error de servidor desconocido.', 'grades' => []];
$http_code = 500;

try {
    // 1. Decodificar la entrada JSON
    $input = json_decode(file_get_contents('php://input'), true);

    // Se espera que el alumno.js envíe el email del alumno
    $alumno_email = $input['alumno_email'] ?? null;
    
    if (!$alumno_email) {
        $response = ['error' => 'Email del alumno no recibido.', 'grades' => []];
        $http_code = 400; // Bad Request
    } else {
        // 2. Conectar a la base de datos
        $pdo = connectDB(); 

        // 3. Preparar la consulta SQL
        // Solo necesitamos las notas del alumno que está logueado
        $sql = "SELECT * FROM notas WHERE alumno_email = ?";
        $params = [$alumno_email];

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $grades = $stmt->fetchAll();

        // 4. Preparar la respuesta exitosa
        $response = $grades; 
        $http_code = 200;
    }

} catch (PDOException $e) {
    // Captura errores de la base de datos (ej. tabla 'notas' no existe)
    $response = ['error' => 'Error de base de datos: ' . $e->getMessage()];
    $http_code = 500;

} catch (Exception $e) {
    // Captura cualquier otro error general (ej. falla al leer db_config.php)
    $response = ['error' => 'Error interno: ' . $e->getMessage()];
    $http_code = 500;
}

// 5. Devolver la respuesta en formato JSON
http_response_code($http_code);

// Si es un error 200, devolvemos directamente el array de notas.
// Si no es 200, devolvemos el objeto con el mensaje de error.
if ($http_code === 200) {
    echo json_encode($response);
} else {
    echo json_encode($response);
}

?>