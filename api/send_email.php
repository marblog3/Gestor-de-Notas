<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// La ruta se ajusta a la estructura indicada en el punto 1
require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';


/**
 * Envía un correo electrónico al destinatario con la contraseña generada.
 * @param string $toEmail El correo del destinatario.
 * @param string $toName El nombre del destinatario.
 * @param string $password La contraseña generada.
 * @return bool True si el correo fue enviado exitosamente, False en caso contrario.
 */
function sendWelcomeEmail($toEmail, $toName, $password) {
    $mail = new PHPMailer(true);

    try {
        // Configuración del Servidor SMTP (Gmail/Google Workspace)
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; 
        $mail->SMTPAuth   = true;
        // REEMPLACE SU_CONTRASEÑA_DE_APLICACION_AQUI
        $mail->Username   = 'mvbenitezramirez@eest5.com'; // Su correo electrónico de remitente
        $mail->Password   = 'sqhu djes ywee jhfm'; 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; 
        $mail->Port       = 587; 

        // Remitente y Destinatario
        $mail->setFrom('mvbenitezramirez@eest5.com', 'Admin E.E.S.T.N°5');
        $mail->addAddress($toEmail, $toName);
        
        // Contenido del Email
        $mail->isHTML(false); 
        $mail->CharSet = 'UTF-8';
        $mail->Subject = 'Tu Cuenta Institucional ha sido Aprobada';
        $mail->Body    = "Hola {$toName},\n\n"
                       . "Tu solicitud de registro para el Sistema de Gestión de Notas de la E.E.S.T.N°5 ha sido aprobada por el administrador.\n\n"
                       . "A continuación, se encuentran tus credenciales de acceso:\n"
                       . "  - Correo: {$toEmail}\n"
                       . "  - Contraseña Inicial: {$password}\n\n"
                       . "Por favor, inicia sesión lo antes posible y utiliza la opción 'Olvidaste la Contraseña?' para cambiarla por una personal y segura (funcionalidad pendiente de implementar, por ahora comunícate con el administrador para cambiarla).\n\n"
                       . "¡Bienvenido al sistema!\n\n"
                       . "Atentamente,\n"
                       . "El Equipo de Administración de la E.E.S.T.N°5";

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Error al enviar email a {$toEmail}. Mailer Error: {$mail->ErrorInfo}");
        return false;
    }
}

/**
 * Envía un aviso de carga de notas al preceptor/admin.
 */
function sendGradeNotificationEmail($profesorName, $materia) {
    $mail = new PHPMailer(true);

    // Correo de destino (según tu js original era este)
    $toEmail = 'mvbenitezramirez@eest5.com'; 
    $toName = 'Administración / Preceptoría';

    try {
        // Configuración SMTP (Misma que sendWelcomeEmail)
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'mvbenitezramirez@eest5.com'; 
        $mail->Password   = 'sqhu djes ywee jhfm'; // Tu contraseña de aplicación
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Remitente
        $mail->setFrom('mvbenitezramirez@eest5.com', 'Sistema de Gestión E.E.S.T.N°5');
        $mail->addAddress($toEmail, $toName);

        // Contenido
        $mail->isHTML(false);
        $mail->CharSet = 'UTF-8';
        $mail->Subject = "Notificación de carga de notas: $materia";
        $mail->Body    = "Hola,\n\n"
                       . "Este es un aviso para informarle que el profesor/a $profesorName ha cargado/actualizado las notas para la materia: $materia.\n\n"
                       . "Saludos cordiales,\n"
                       . "Sistema de Gestión E.E.S.T.N°5";

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Error al enviar notificación de notas. Mailer Error: {$mail->ErrorInfo}");
        return false;
    }
}
?>