<?php

header('Content-Type: application/json');
require 'send_email.php'; // Incluye la función que creamos en el paso 1

// Obtener datos del POST
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['profesor_nombre']) || !isset($input['materia'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos (profesor o materia).']);
    exit;
}

$profesor = $input['profesor_nombre'];
$materia = $input['materia'];

// Usar la función de PHPMailer
$resultado = sendGradeNotificationEmail($profesor, $materia);

if ($resultado) {
    echo json_encode(['success' => true, 'message' => 'Notificación enviada correctamente por correo.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Hubo un error al enviar el correo.']);
}
?>