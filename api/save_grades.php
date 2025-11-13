<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);
require_once 'db_config.php';

try {
    $pdo = connectDB();
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['grades'], $data['materia'], $data['profesor_email'], $data['profesor_nombre'], $data['activeUserRole'], $data['anioCurso'], $data['divisionCurso'])) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos desde el frontend (faltan notas, materia, profesor, nombre_profesor, rol o curso).']);
        exit;
    }

    $grades = $data['grades'];
    $materia = $data['materia'];
    $profesor_email = $data['profesor_email'];
    $profesor_nombre = $data['profesor_nombre']; 
    $activeUserRole = $data['activeUserRole'];
    $anioCurso = $data['anioCurso'];
    $divisionCurso = $data['divisionCurso'];

    $pdo->beginTransaction();

    // === INICIO DE LA MODIFICACIÓN (SQL CON IFNULL) ===
    // Se ha modificado la sección ON DUPLICATE KEY UPDATE.
    // Ahora usa IFNULL(VALUES(columna), columna)
    // Esto significa: "Intenta actualizar al nuevo valor. Si el nuevo valor es NULL,
    // ignóralo y mantén el valor antiguo que ya estaba en la base de datos."
    // ESTO EVITA QUE EL PROFESOR BORRE LAS NOTAS DEL PRECEPTOR Y VICEVERSA.
    $sql_save = "
        INSERT INTO notas (
            alumno_email, materia, profesor_email, fecha_carga, curso_anio,
            parcial1_1c, parcial2_1c, parcial3_1c, parcial4_1c, parcial5_1c,
            valoracion_prel_1c, nota_valoracion_prel_1c, calificacion_1c, inasistencias_1c,
            parcial1_2c, parcial2_2c, parcial3_2c, parcial4_2c, parcial5_2c,
            valoracion_prel_2c, nota_valoracion_prel_2c, calificacion_2c, inasistencias_2c,
            intensificacion_1c_agosto, diciembre, febrero, 
            marzo, junio, julio, modelo, 
            final, observaciones
        ) VALUES (
            :alumno_email, :materia, :profesor_email, NOW(), :curso_anio,
            :p1_1c, :p2_1c, :p3_1c, :p4_1c, :p5_1c,
            :vp1, :nvp1, :c1, :i1,
            :p1_2c, :p2_2c, :p3_2c, :p4_2c, :p5_2c,
            :vp2, :nvp2, :c2, :i2,
            :int_ago, :dic, :feb, 
            :marzo, :junio, :julio, :modelo,
            :fin, :obs
        )
        ON DUPLICATE KEY UPDATE
            profesor_email = VALUES(profesor_email), 
            fecha_carga = NOW(), 
            curso_anio = IFNULL(VALUES(curso_anio), curso_anio),
            
            parcial1_1c = IFNULL(VALUES(parcial1_1c), parcial1_1c), 
            parcial2_1c = IFNULL(VALUES(parcial2_1c), parcial2_1c), 
            parcial3_1c = IFNULL(VALUES(parcial3_1c), parcial3_1c), 
            parcial4_1c = IFNULL(VALUES(parcial4_1c), parcial4_1c), 
            parcial5_1c = IFNULL(VALUES(parcial5_1c), parcial5_1c),
            valoracion_prel_1c = IFNULL(VALUES(valoracion_prel_1c), valoracion_prel_1c), 
            nota_valoracion_prel_1c = IFNULL(VALUES(nota_valoracion_prel_1c), nota_valoracion_prel_1c), 
            calificacion_1c = IFNULL(VALUES(calificacion_1c), calificacion_1c), 
            inasistencias_1c = IFNULL(VALUES(inasistencias_1c), inasistencias_1c),
            
            parcial1_2c = IFNULL(VALUES(parcial1_2c), parcial1_2c), 
            parcial2_2c = IFNULL(VALUES(parcial2_2c), parcial2_2c), 
            parcial3_2c = IFNULL(VALUES(parcial3_2c), parcial3_2c), 
            parcial4_2c = IFNULL(VALUES(parcial4_2c), parcial4_2c), 
            parcial5_2c = IFNULL(VALUES(parcial5_2c), parcial5_2c),
            valoracion_prel_2c = IFNULL(VALUES(valoracion_prel_2c), valoracion_prel_2c), 
            nota_valoracion_prel_2c = IFNULL(VALUES(nota_valoracion_prel_2c), nota_valoracion_prel_2c), 
            calificacion_2c = IFNULL(VALUES(calificacion_2c), calificacion_2c), 
            inasistencias_2c = IFNULL(VALUES(inasistencias_2c), inasistencias_2c),
            
            intensificacion_1c_agosto = IFNULL(VALUES(intensificacion_1c_agosto), intensificacion_1c_agosto), 
            diciembre = IFNULL(VALUES(diciembre), diciembre), 
            febrero = IFNULL(VALUES(febrero), febrero),
            marzo = IFNULL(VALUES(marzo), marzo), 
            junio = IFNULL(VALUES(junio), junio), 
            julio = IFNULL(VALUES(julio), julio), 
            modelo = IFNULL(VALUES(modelo), modelo),
            
            final = IFNULL(VALUES(final), final), 
            observaciones = VALUES(observaciones) 
            /* Observaciones SÍ debe poder borrarse, por eso no usa IFNULL */
    ";
    // === FIN DE MODIFICACIÓN (SQL) ===
    
    $stmt_save = $pdo->prepare($sql_save);

    $sql_notify = "
        INSERT INTO notificaciones (alumno_email, mensaje) 
        VALUES (:alumno_email, :mensaje)
        ON DUPLICATE KEY UPDATE 
            mensaje = VALUES(mensaje), 
            fecha_creacion = NOW(), 
            leida = 0; 
    ";
    $stmt_notify = $pdo->prepare($sql_notify);
    
    foreach ($grades as $grade) {
        if (empty($grade['alumno_email'])) {
            continue;
        }

        $vp1 = ($grade['valoracion_prel_1c'] === '' || $grade['valoracion_prel_1c'] === 'Selecc.') ? null : $grade['valoracion_prel_1c'];
        $vp2 = ($grade['valoracion_prel_2c'] === '' || $grade['valoracion_prel_2c'] === 'Selecc.') ? null : $grade['valoracion_prel_2c'];

        $materia_para_guardar = $grade['materia'] ?? $materia;
        
        // Determinar el 'curso_anio' a guardar
        $curso_anio_para_guardar = $grade['curso_anio'] ?? ($anioCurso . ' ' . $divisionCurso);
        
        $params_save = [
             ':alumno_email' => $grade['alumno_email'],
             ':materia' => $materia_para_guardar,
             ':profesor_email' => $profesor_email,
             ':curso_anio' => $curso_anio_para_guardar,
             ':p1_1c' => $grade['parcial1_1c'] ?? null, 
             ':p2_1c' => $grade['parcial2_1c'] ?? null, 
             ':p3_1c' => $grade['parcial3_1c'] ?? null, 
             ':p4_1c' => $grade['parcial4_1c'] ?? null, 
             ':p5_1c' => $grade['parcial5_1c'] ?? null,
             ':vp1' => $vp1, 
             ':nvp1' => $grade['nota_valoracion_prel_1c'] ?? null, 
             ':c1' => $grade['calificacion_1c'] ?? null, 
             ':i1' => $grade['inasistencias_1c'] ?? null, // Profesor envía NULL, Preceptor 0. Aceptar NULL
             ':p1_2c' => $grade['parcial1_2c'] ?? null, 
             ':p2_2c' => $grade['parcial2_2c'] ?? null, 
             ':p3_2c' => $grade['parcial3_2c'] ?? null, 
             ':p4_2c' => $grade['parcial4_2c'] ?? null, 
             ':p5_2c' => $grade['parcial5_2c'] ?? null,
             ':vp2' => $vp2, 
             ':nvp2' => $grade['nota_valoracion_prel_2c'] ?? null, 
             ':c2' => $grade['calificacion_2c'] ?? null, 
             ':i2' => $grade['inasistencias_2c'] ?? null, // Profesor envía NULL, Preceptor 0. Aceptar NULL
             ':int_ago' => $grade['intensificacion_1c_agosto'] ?? null, 
             ':dic' => $grade['diciembre'] ?? null, 
             ':feb' => $grade['febrero'] ?? null,
             ':marzo' => $grade['marzo'] ?? null,
             ':junio' => $grade['junio'] ?? null,
             ':julio' => $grade['julio'] ?? null,
             ':modelo' => $grade['modelo'] ?? null,
             ':fin' => $grade['final'] ?? null, 
             // Si las observaciones se envían como "", se guardará "" (borrando la obs).
             // Si la clave 'observaciones' no se envía, se guardará NULL, y el IFNULL la protegerá.
             ':obs' => $grade['observaciones'] ?? null
        ];
        
        $stmt_save->execute($params_save);

        $materia_notificacion = $materia_para_guardar;
        
        if (strpos($materia_notificacion, 'Observacion_') === 0) {
            $materia_notificacion = "una observación";
        }

        if (strpos($materia_para_guardar, 'Observacion_') !== 0) {
            $mensaje_notificacion = "¡${profesor_nombre} (${materia_notificacion}) cargó/actualizó tus calificaciones!";
            
            $params_notify = [
                ':alumno_email' => $grade['alumno_email'],
                ':mensaje' => $mensaje_notificacion
            ];
            $stmt_notify->execute($params_notify);
        }
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Notas guardadas y alumnos notificados correctamente.']);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("Error DB en save_grades: " . $e->getMessage());
   echo json_encode(['success' => false, 'message' => 'Error de base de datos al guardar las notas. Detalles: ' . $e->getMessage()]); 
} catch (Exception $e) {
     error_log("Error general en save_grades: " . $e->getMessage());
     echo json_encode(['success' => false, 'message' => 'Error interno del servidor.']);
}
?>