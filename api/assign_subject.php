<?php
// api/assign_subject.php
header('Content-Type: application/json');
require_once 'db_config.php';

try {
    $pdo = connectDB();
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['email']) || !isset($data['data'])) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos.']);
        exit;
    }

    $email = $data['email'];
    $new_assignment = $data['data']; // Esto será {materia, anio, division}

    // 1. Obtener el curso_info actual del profesor
    $stmt = $pdo->prepare("SELECT curso_info FROM usuarios WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado.']);
        exit;
    }

    // 2. Decodificar el JSON existente o crear un array vacío
    $assignments = $user['curso_info'] ? json_decode($user['curso_info'], true) : [];
    if (!is_array($assignments)) { // Si no era un array, lo forzamos a serlo
        $assignments = [];
    }
    
    // 3. Agregar la nueva asignación al array
    $assignments[] = $new_assignment;

    // 4. Codificar el array de nuevo a JSON y actualizar la base de datos
    $new_curso_info_json = json_encode($assignments);

    $stmt = $pdo->prepare("UPDATE usuarios SET curso_info = :curso_info WHERE email = :email");
    $params = [
        ':curso_info' => $new_curso_info_json,
        ':email' => $email
    ];

    if ($stmt->execute($params)) {
        echo json_encode(['success' => true, 'message' => 'Materia asignada al profesor correctamente.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar la base de datos.']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>
