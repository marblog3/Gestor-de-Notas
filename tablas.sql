USE `sistema_gestion_eest5`;



CREATE TABLE IF NOT EXISTS `usuarios_en_espera` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `fullname` VARCHAR(100) NOT NULL COMMENT 'Nombre completo del solicitante.',
    `dni` VARCHAR(15) NOT NULL UNIQUE COMMENT 'DNI del solicitante.',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Correo institucional (username).',
    `requested_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de la solicitud.',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `fullname` VARCHAR(100) NOT NULL COMMENT 'Nombre completo del usuario.',
    `dni` VARCHAR(15) NOT NULL UNIQUE COMMENT 'DNI del usuario.',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Correo institucional (username).',
    `password` VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada (usar password_hash de PHP).',
    `role` ENUM('Administrador', 'Profesor', 'Preceptor', 'Alumno') NOT NULL COMMENT 'Rol asignado al usuario.',
    `curso_info` JSON NULL COMMENT 'Almacena asignaciones: curso (Alumno) o materias (Profesor/Preceptor).',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `notas` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `alumno_email` VARCHAR(100) NOT NULL COMMENT 'Email del alumno.',
    `materia` VARCHAR(100) NOT NULL,
    `profesor_email` VARCHAR(100) NOT NULL COMMENT 'Email del profesor que cargó la nota.',
    `fecha_carga` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `curso_anio` VARCHAR(5) NULL,

    `nota_1Cuat` DECIMAL(4, 2) NULL,
    `nota_2Cuat` DECIMAL(4, 2) NULL,
    `intensificacion` DECIMAL(4, 2) NULL,
    `diciembre` DECIMAL(4, 2) NULL,
    `febrero` DECIMAL(4, 2) NULL,
    `final` DECIMAL(4, 2) NULL,
    `observaciones` TEXT NULL,

    PRIMARY KEY (`id`),
    INDEX `idx_alumno_materia` (`alumno_email`, `materia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `materias` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre completo de la materia.',
    `especialidad` VARCHAR(100) NULL COMMENT 'Especialidad a la que pertenece (NULL si es común / Tronco Común).',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `cursos` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `anio` VARCHAR(5) NOT NULL,
    `division` VARCHAR(5) NOT NULL,
    `especialidad` VARCHAR(100) NOT NULL,
    `turno` ENUM('Mañana', 'Tarde', 'Vespertino') NOT NULL DEFAULT 'Mañana',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_curso` (`anio`, `division`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



SET @PASSWORD_HASH = '$2y$10$mlO8dk8E7FGu4itL.45JpOLl7mVsBg8VkXvRI8ewxiEs5tZGG1B9G';



INSERT INTO `cursos` (anio, division, especialidad, turno)
VALUES
('1ro', '1ra', 'Ciclo Básico', 'Mañana'), ('1ro', '2da', 'Ciclo Básico', 'Mañana'),
('1ro', '3ra', 'Ciclo Básico', 'Tarde'), ('1ro', '4ta', 'Ciclo Básico', 'Tarde'),
('1ro', '5ta', 'Ciclo Básico', 'Mañana'), ('1ro', '6ta', 'Ciclo Básico', 'Tarde'),
('1ro', '7ma', 'Ciclo Básico', 'Mañana'), ('1ro', '8va', 'Ciclo Básico', 'Tarde'),
('1ro', '9na', 'Ciclo Básico', 'Mañana'),

('2do', '1ra', 'Ciclo Básico', 'Mañana'), ('2do', '2da', 'Ciclo Básico', 'Tarde'),
('2do', '3ra', 'Ciclo Básico', 'Mañana'), ('2do', '4ta', 'Ciclo Básico', 'Tarde'),
('2do', '5ta', 'Ciclo Básico', 'Mañana'), ('2do', '6ta', 'Ciclo Básico', 'Tarde'),
('2do', '7ma', 'Ciclo Básico', 'Mañana'), ('2do', '8va', 'Ciclo Básico', 'Tarde'),

('3ro', '1ra', 'Ciclo Básico', 'Mañana'), ('3ro', '2da', 'Ciclo Básico', 'Tarde'),
('3ro', '3ra', 'Ciclo Básico', 'Mañana'), ('3ro', '4ta', 'Ciclo Básico', 'Tarde'),
('3ro', '5ta', 'Ciclo Básico', 'Mañana'), ('3ro', '6ta', 'Ciclo Básico', 'Tarde');


INSERT INTO `cursos` (anio, division, especialidad, turno)
VALUES

('4to', '1ra', 'Maestro Mayor de Obra', 'Mañana'), ('4to', '5ta', 'Maestro Mayor de Obra', 'Tarde'),
('5to', '1ra', 'Maestro Mayor de Obra', 'Mañana'), ('5to', '5ta', 'Maestro Mayor de Obra', 'Tarde'),
('6to', '1ra', 'Maestro Mayor de Obra', 'Mañana'),
('7mo', '1ra', 'Maestro Mayor de Obra', 'Mañana'),


('4to', '2da', 'Química', 'Tarde'), 
('5to', '2da', 'Química', 'Tarde'),
('6to', '2da', 'Química', 'Tarde'), 
('7mo', '2da', 'Química', 'Tarde'),


('4to', '3ra', 'Electromecánica', 'Mañana'), ('4to', '7ma', 'Electromecánica', 'Tarde'), 
('5to', '3ra', 'Electromecánica', 'Mañana'), 
('6to', '3ra', 'Electromecánica', 'Mañana'), 
('7mo', '3ra', 'Electromecánica', 'Mañana'), 


('4to', '4ta', 'Informática', 'Tarde'), ('4to', '6ta', 'Informática', 'Mañana'), 
('5to', '4ta', 'Informática', 'Tarde'), ('5to', '6ta', 'Informática', 'Mañana'), 
('6to', '4ta', 'Informática', 'Tarde'), 
('7mo', '4ta', 'Informática', 'Tarde');



INSERT INTO `materias` (nombre, especialidad)
VALUES
-- 10 Materias Áulicas (Tronco Común) - Para Ciclo Básico y Superior
('Matemática', 'Tronco Común'), ('Lengua y Literatura', 'Tronco Común'),
('Física', 'Tronco Común'), ('Química', 'Tronco Común'),
('Educación Física', 'Tronco Común'), ('Geografía', 'Tronco Común'),
('Historia', 'Tronco Común'), ('Inglés', 'Tronco Común'),
('Biología', 'Tronco Común'), ('Arte', 'Tronco Común'),
-- 3 Talleres (Ciclo Básico)
('Taller de Carpintería', 'Ciclo Básico'), ('Taller de Herrería', 'Ciclo Básico'),
('Taller de Electricidad Básica', 'Ciclo Básico'),
-- Materias Superiores y Especialidades (14 Especializadas + 1 Áulica Superior Común = 15)
('Análisis Matemático', 'Tronco Común'),
('Programación Avanzada', 'Informática'), 
('Estructura de Datos', 'Informática'),
('Base de datos', 'Informática'),
('Instalación, mantenimiento y reparación de redes informáticas', 'Informática'), 
('Instalación, mantenimiento y reparación de sistemas computacionales', 'Informática'),
('Proyecto, diseño e implementación de sistemas computacionales', 'Informática'),
('Evaluación de proyectos', 'Informática'),
('Emprendimientos productivos y desarrollo local', 'Informática'),
('Prácticas profesionalizantes del sector informática', 'Informática'),
('Modelos y sistemas', 'Informática'),
('Diseño de Estructuras', 'Maestro Mayor de Obra'),
('Cálculo y Presupuesto', 'Maestro Mayor de Obra'),
('Construcciones Avanzadas', 'Maestro Mayor de Obra'),
('Operaciones Unitarias', 'Química'),
('Circuitos Eléctricos', 'Electromecánica');


INSERT INTO `usuarios` (fullname, dni, email, password, role)
VALUES 
('Administrador Principal', '10000000', 'admin@eest5.com', @PASSWORD_HASH, 'Administrador'),
('Preceptor Martin Gomez', '80123451', 'pmartin@eest5.com', @PASSWORD_HASH, 'Preceptor'),
('Preceptor Ana Fernandez', '80123452', 'afernandez@eest5.com', @PASSWORD_HASH, 'Preceptor'),
('Preceptor Mariela Martinez', '80123453', 'mmartinez@eest5.com', @PASSWORD_HASH, 'Preceptor'),
('Preceptor Ricardo Rodriguez', '80123454', 'rrodriguez@eest5.com', @PASSWORD_HASH, 'Preceptor'),
('Preceptor Marianela', '80123455', 'marianela@eest5.com', @PASSWORD_HASH, 'Preceptor');

INSERT INTO `usuarios` (fullname, dni, email, password, role, curso_info)
VALUES
('Prof. Laura Perez', '11000001', 'lperez@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Matemática", "anio": "1ro", "division": "1ra"}, {"materia": "Matemática", "anio": "4to", "division": "4ta"}, {"materia": "Matemática", "anio": "7mo", "division": "1ra"}]'),
('Prof. Federico Sosa', '11000002', 'fsosabio@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Biología", "anio": "2do", "division": "1ra"}, {"materia": "Biología", "anio": "4to", "division": "4ta"}]'),
('Prof. Marcos Lopez', '11000003', 'mlopez@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Taller de Carpintería", "anio": "1ro", "division": "1ra"}, {"materia": "Taller de Carpintería", "anio": "2do", "division": "2da"}]'),
('Prof. Andrea Diaz', '11000004', 'adiaz@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Lengua y Literatura", "anio": "1ro", "division": "1ra"}, {"materia": "Lengua y Literatura", "anio": "5to", "division": "4ta"}]'),
('Prof. Javier Ruiz', '11000005', 'jruiz@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Física", "anio": "3ro", "division": "1ra"}, {"materia": "Física", "anio": "6to", "division": "4ta"}]'),
('Prof. Veronica Castro', '11000006', 'vcastro@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Programación Avanzada", "anio": "4to", "division": "4ta"}, {"materia": "Estructura de Datos", "anio": "5to", "division": "4ta"}]'),
('Prof. Daniel Nuñez', '11000007', 'dnunez@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Base de datos", "anio": "6to", "division": "4ta"}]'),
-- Parejas Pedagógicas 7mo 4ta
('Gimenez Cesar', '20123456', 'cgimenez@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Instalación, mantenimiento y reparación de redes informáticas", "anio": "7mo", "division": "4ta"}, {"materia": "Instalación, mantenimiento y reparación de sistemas computacionales", "anio": "7mo", "division": "4ta"}, {"materia": "Prácticas profesionalizantes del sector informática", "anio": "7mo", "division": "4ta"}]'),
('Guido Gandolfo', '21123456', 'ggandolfo@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Instalación, mantenimiento y reparación de redes informáticas", "anio": "7mo", "division": "4ta"}, {"materia": "Proyecto, diseño e implementación de sistemas computacionales", "anio": "7mo", "division": "4ta"}, {"materia": "Prácticas profesionalizantes del sector informática", "anio": "7mo", "division": "4ta"}]'),
('Ricardo Garcia', '24123456', 'rgarcia@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Instalación, mantenimiento y reparación de sistemas computacionales", "anio": "7mo", "division": "4ta"}]'),
('Matias Paladino', '25123456', 'mfpaladinovela@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Proyecto, diseño e implementación de sistemas computacionales", "anio": "7mo", "division": "4ta"}]'),
-- Profesores Adicionales
('Arq. Hernán Soto', '60123451', 'asotommdo@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Diseño de Estructuras", "anio": "7mo", "division": "1ra"}, {"materia": "Cálculo y Presupuesto", "anio": "7mo", "division": "1ra"}]'),
('Lic. Sofía Robles', '60123452', 'sroblesquimica@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Operaciones Unitarias", "anio": "7mo", "division": "2da"}, {"materia": "Química", "anio": "4to", "division": "2da"}]'),
('Ing. Juan Valdez', '60123453', 'jvaldezelectro@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Circuitos Eléctricos", "anio": "7mo", "division": "3ra"}]'),
('Prof. Elena Campos', '60123454', 'ecampos@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Historia", "anio": "1ro", "division": "1ra"}, {"materia": "Historia", "anio": "5to", "division": "2da"}]'),
('Prof. Oscar Ibarra', '60123455', 'oibarra@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Emprendimientos productivos y desarrollo local", "anio": "7mo", "division": "4ta"}]'),
('Prof. Mariana Chavez', '60123456', 'mchavez@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Evaluación de proyectos", "anio": "7mo", "division": "4ta"}]'),
('Prof. Pablo Ruiz', '60123457', 'pruiz@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Modelos y sistemas", "anio": "7mo", "division": "4ta"}]'),
('Prof. Susana Gil', '60123458', 'sgil@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Geografía", "anio": "1ro", "division": "1ra"}, {"materia": "Geografía", "anio": "4to", "division": "1ra"}]'),
('Ing. Roberto Paz', '60123459', 'rpaz@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Taller de Electricidad Básica", "anio": "3ro", "division": "1ra"}]');



CREATE FUNCTION `GET_CURSO_JSON`(a VARCHAR(5), d VARCHAR(5), e VARCHAR(100)) RETURNS JSON
    DETERMINISTIC
    RETURN JSON_OBJECT('curso', JSON_OBJECT('anio', a, 'division', d, 'especialidad', e));



SET @CURSO_INFO_7MO_4TA = GET_CURSO_JSON('7mo', '4ta', 'Informática');
SET @CURSO_INFO_7MO_1RA = GET_CURSO_JSON('7mo', '1ra', 'Maestro Mayor de Obra');



INSERT INTO `usuarios` (fullname, dni, email, password, role, curso_info)
VALUES

('ABACA ABIGAIL LUCIA', '40000001', 'alabaca@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('ALVAREZ IVAN DANIEL', '40000002', 'idalvarez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('AVENDAÑO SANTA CRUZ DYLAN ENRIQUE', '40000003', 'deavendano@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('BALBONI CORONEL DYLAN LEONEL', '40000004', 'dlbalbonicoronel@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('BELAWSKY LAUTARO EZEQUIEL', '40000005', 'lebelawsky@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('BENITEZ DINORA SELENE NADINE', '40000006', 'dsnbenitez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('BENITEZ RAMIREZ MARIA VIANNEY', '40000007', 'mvbenitezramirez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('CANTERO MILAGROS EDITH', '40000008', 'mcantero@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('CANTERO DOMINGUEZ EDUARDO', '40000009', 'ecanterodominguez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('CHURRUARIN FRANCO BAUTISTA', '40000010', 'fbchurruarin@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('CRISTEFF NICANOR IGNACIO', '40000011', 'nicristeff@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('GOMEZ FACUNDO DAVID', '40000012', 'fdgomez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('GOMEZ KEVIN GABRIEL', '40000013', 'kggomez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('MOLERO AGUSTIN LEONEL', '40000014', 'almolero@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('MOREYRA ROCIO AILEN', '40000015', 'ramoreyra@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('QUIROGA AMBAR NAHIARA', '40000016', 'aquiroga@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('RUIZ PACHECO MARIANO', '40000017', 'mruizpacheco@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('SANCHEZ DYLAN EMANUEL', '40000018', 'desanchez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
('SONCO INFANTE FABIO', '40000019', 'fsoncoinfante@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_4TA),
-- 7mo 1ra (15 Alumnos - MMDO)
('MARTINEZ JUAN CRUZ', '70000001', 'jmartinez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_1RA),
('ORTIZ SOFIA PAZ', '70000002', 'sportiz@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_1RA),
('PEREZ MATEO ARIEL', '70000003', 'mperez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_1RA),
('RAMIREZ EMILIA LUZ', '70000004', 'eramirez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_1RA),
('SOSA FACUNDO MAXIMO', '70000005', 'fmaximo@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_1RA),
('TORRES VALENTINA BELEN', '70000006', 'vtorres@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_1RA),
('VAZQUEZ LUIS ENRIQUE', '70000007', 'lvazquez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_1RA),
('ACOSTA RODRIGO MARTIN', '70000008', 'racosta@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_1RA),
('BLANCO CAMILA ROCIÓ', '70000009', 'cblanco@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_1RA),
('CASTRO DYLAN NAHUEL', '70000010', 'dcastro@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_1RA),
('DIAZ JULIETA ABIGAIL', '70000011', 'jdiaz@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_1RA),
('ESPINOZA LUCAS GABRIEL', '70000012', 'lespinoza@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_1RA),
('FERNANDEZ AGUSTIN EZEQUIEL', '70000013', 'afernandezmmdo@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_1RA),
('GOMEZ SANTIAGO ALAN', '70000014', 'sgomezmmdo@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_1RA),
('HERRERA MARIA BELEN', '70000015', 'mherrera@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_7MO_1RA);



SET @dni_counter = 90000000; 

INSERT INTO `usuarios` (fullname, dni, email, password, role, curso_info)
SELECT 
    CONCAT(
        'ALUMNO ', 
        LPAD(T.i, 2, '0'), 
        ' - ', 
        C.anio, C.division
    ), 
    LPAD(@dni_counter := @dni_counter + 1, 8, '0'),
    CONCAT('a', @dni_counter, '@eest5.com'), 
    @PASSWORD_HASH, 
    'Alumno', 
    GET_CURSO_JSON(C.anio, C.division, C.especialidad)
FROM (
    SELECT anio, division, especialidad, FLOOR(8 + (RAND() * 12)) as student_limit
    FROM cursos 
    WHERE NOT (anio = '7mo' AND division = '4ta') AND NOT (anio = '7mo' AND division = '1ra')
    ORDER BY anio, division
) AS C
JOIN (
   
    SELECT (A.n + B.n + 1) AS i
    FROM (SELECT 0 AS n UNION ALL SELECT 10 AS n) AS A, 
         (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS B
) AS T
WHERE T.i <= C.student_limit;