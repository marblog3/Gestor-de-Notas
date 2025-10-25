<?php
// api/approve_user.php
header('Content-Type: application/json');
require 'db_config.php';
require 'send_email.php'; 

// Función para generar una contraseña segura
function generateSecurePassword($length = 12) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    $password = '';
    $charCount = strlen($chars);
    for ($i = 0; $i < $length; $i++) {
        $password .= $chars[rand(0, $charCount - 1)];
    }
    return $password;
}


$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id_pendiente'], $input['email'], $input['fullname'], $input['dni'], $input['role'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos.']);
    exit;
}

$id_pendiente = $input['id_pendiente'];
$email = $input['email'];
$fullname = $input['fullname'];
$dni = $input['dni'];
$role = $input['role'];

// 1. Generar y hashear la contraseña
$auto_password = generateSecurePassword(12);
$password_hash = password_hash($auto_password, PASSWORD_DEFAULT);


try {
    $pdo = connectDB();
    $pdo->beginTransaction();

    // 2. Insertar el usuario en la tabla de usuarios activos
    $stmt = $pdo->prepare("INSERT INTO usuarios (fullname, dni, email, password, role) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$fullname, $dni, $email, $password_hash, $role]);

    // 3. Eliminar la solicitud pendiente
    $stmt = $pdo->prepare("DELETE FROM usuarios_en_espera WHERE id = ?");
    $stmt->execute([$id_pendiente]);

    // 4. Enviar el correo electrónico
    $email_sent = sendWelcomeEmail($email, $fullname, $auto_password);

    $pdo->commit();

    if ($email_sent) {
        echo json_encode(['success' => true, 'message' => 'Usuario aprobado y email enviado.', 'auto_password' => $auto_password]);
    } else {
        http_response_code(202); 
        echo json_encode(['success' => true, 'message' => 'Usuario aprobado, pero el envío de email falló. La contraseña es: ' . $auto_password, 'auto_password' => $auto_password]);
    }

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $message = 'Error de base de datos al aprobar usuario.';
    if ($e->getCode() == '23000') {
         $message = 'El DNI o el correo ya están activos.';
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $message]);

} catch (Exception $e) {
     http_response_code(500);
     echo json_encode(['success' => false, 'message' => 'Error interno: ' . $e->getMessage()]);
}
?>