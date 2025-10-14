<?php
// Configuración de la Base de Datos XAMPP
define('DB_HOST', 'localhost');
define('DB_NAME', 'sistema_gestion_eest5');
define('DB_USER', 'root');
define('DB_PASS', ''); // Dejar vacío si no has configurado una contraseña en XAMPP

function connectDB() {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    try {
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        // En un entorno de producción, solo registrar el error, no mostrarlo.
        die("Error de conexión a la base de datos: " . $e->getMessage());
    }
}
?>