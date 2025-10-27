<?php
// api/send_email.php

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
                       . "Por favor, inicia sesión lo antes posible y utiliza la opción '¿Olvidaste la Contraseña?' para cambiarla por una personal y segura.\n\n" 
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
?>