
USE `sistema_gestion_eest5`;


CREATE TABLE IF NOT EXISTS `usuarios_en_espera` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `fullname` VARCHAR(100) NOT NULL COMMENT 'Nombre completo del solicitante.',
    `dni` VARCHAR(15) NOT NULL UNIQUE COMMENT 'DNI del solicitante.',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Correo institucional (username).',
    `requested_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de la solicitud.',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Usuarios que han solicitado registro y esperan aprobación del Admin.';


CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `fullname` VARCHAR(100) NOT NULL COMMENT 'Nombre completo del usuario.',
    `dni` VARCHAR(15) NOT NULL UNIQUE COMMENT 'DNI del usuario.',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Correo institucional (username).',
    `password` VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada (usar password_hash de PHP).',
    `role` ENUM('Administrador', 'Profesor', 'Preceptor', 'Alumno') NOT NULL COMMENT 'Rol asignado al usuario.',
    `curso_info` JSON NULL COMMENT 'Almacena asignaciones: curso (Alumno) o materias (Profesor/Preceptor).',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Usuarios activos en el sistema con roles asignados.';

CREATE TABLE IF NOT EXISTS `notas` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `alumno_email` VARCHAR(100) NOT NULL COMMENT 'Email del alumno.',
    `materia` VARCHAR(100) NOT NULL,
    `profesor_email` VARCHAR(100) NOT NULL COMMENT 'Email del profesor que cargó la nota.',
    `fecha_carga` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `curso_anio` INT(2) NULL,
    
    -- Calificaciones y períodos de intensificación
    `nota_1Cuat` DECIMAL(4, 2) NULL,
    `nota_2Cuat` DECIMAL(4, 2) NULL,
    `intensificacion` DECIMAL(4, 2) NULL,
    `diciembre` DECIMAL(4, 2) NULL,
    `febrero` DECIMAL(4, 2) NULL,
    `final` DECIMAL(4, 2) NULL,
    `observaciones` TEXT NULL,
    
    PRIMARY KEY (`id`),
    -- Índice para búsquedas rápidas de notas por alumno y materia
    INDEX `idx_alumno_materia` (`alumno_email`, `materia`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Calificaciones detalladas de los estudiantes.';

SET @PASSWORD_HASH = '$2y$10$mlO8dk8E7FGu4itL.45JpOLl7mVsBg8VkXvRI8ewxiEs5tZGG1B9G'; 


SET @CURSO_ANIO = '7mo';
SET @CURSO_DIVISION = '4ta';
SET @CURSO_ESPECIALIDAD = 'Informática';

SET @CURSO_INFO_ALUMNO = JSON_OBJECT(
    'curso', 
    JSON_OBJECT(
        'anio', @CURSO_ANIO, 
        'division', @CURSO_DIVISION, 
        'especialidad', @CURSO_ESPECIALIDAD
    )
);

INSERT INTO `usuarios` (fullname, dni, email, password, role, curso_info)
VALUES 
('Gimenez Cesar', '20123456', 'cgimenez@eest5.com', @PASSWORD_HASH, 'Profesor', '[
  {"materia": "Instalación, mantenimiento y reparación de redes informáticas", "anio": "7mo", "division": "4ta"},
  {"materia": "Instalación, mantenimiento y reparación de sistemas computacionales", "anio": "7mo", "division": "4ta"},
  {"materia": "Evaluación de proyectos", "anio": "7mo", "division": "4ta"},
  {"materia": "Prácticas profesionalizantes del sector informática", "anio": "7mo", "division": "4ta"}
]'),
('Guido Gandolfo', '21123456', 'ggandolfo@eest5.com', @PASSWORD_HASH, 'Profesor', '[
  {"materia": "Instalación, mantenimiento y reparación de redes informáticas", "anio": "7mo", "division": "4ta"},
  {"materia": "Proyecto, diseño e implementación de sistemas computacionales", "anio": "7mo", "division": "4ta"},
  {"materia": "Base de datos", "anio": "7mo", "division": "4ta"},
  {"materia": "Prácticas profesionalizantes del sector informática", "anio": "7mo", "division": "4ta"}
]'),
('Lo Bue Octavio', '22123456', 'olobue@eest5.com', @PASSWORD_HASH, 'Profesor', '[
  {"materia": "Modelos y sistemas", "anio": "7mo", "division": "4ta"}
]'),
('Matias Pacheco', '23123456', 'apacheco@eest5.com', @PASSWORD_HASH, 'Profesor', '[
  {"materia": "Emprendimientos productivos y desarrollo local", "anio": "7mo", "division": "4ta"}
]'),
('Ricardo Garcia', '24123456', 'rgarcia@eest5.com', @PASSWORD_HASH, 'Profesor', '[
  {"materia": "Instalación, mantenimiento y reparación de sistemas computacionales", "anio": "7mo", "division": "4ta"}
]'),
('Matias Paladino', '25123456', 'mfpaladinovela@eest5.com', @PASSWORD_HASH, 'Profesor', '[
  {"materia": "Proyecto, diseño e implementación de sistemas computacionales", "anio": "7mo", "division": "4ta"}
]');


INSERT INTO `usuarios` (fullname, dni, email, password, role, curso_info)
VALUES ('Marianela', '30123456', 'marianela@eest5.com', @PASSWORD_HASH, 'Preceptor', NULL);


INSERT INTO `usuarios` (fullname, dni, email, password, role, curso_info)
VALUES 
('ABACA ABIGAIL LUCIA', '40000001', 'alabaca@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('ALVAREZ IVAN DANIEL', '40000002', 'idalvarez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('AVENDAÑO SANTA CRUZ DYLAN ENRIQUE', '40000003', 'deavendano@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('BALBONI CORONEL DYLAN LEONEL', '40000004', 'dlbalbonicoronel@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('BELAWSKY LAUTARO EZEQUIEL', '40000005', 'lebelawsky@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('BENITEZ DINORA SELENE NADINE', '40000006', 'dsnbenitez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('BENITEZ RAMIREZ MARIA VIANNEY', '40000007', 'mvbenitezramirez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('CANTERO MILAGROS EDITH', '40000008', 'mcantero@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('CANTERO DOMINGUEZ EDUARDO', '40000009', 'ecanterodominguez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('CHURRUARIN FRANCO BAUTISTA', '40000010', 'fbchurruarin@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('CRISTEFF NICANOR IGNACIO', '40000011', 'nicristeff@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('GOMEZ FACUNDO DAVID', '40000012', 'fdgomez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('GOMEZ KEVIN GABRIEL', '40000013', 'kggomez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('MOLERO AGUSTIN LEONEL', '40000014', 'almolero@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('MOREYRA ROCIO AILEN', '40000015', 'ramoreyra@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('QUIROGA AMBAR NAHIARA', '40000016', 'aquiroga@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('RUIZ PACHECO MARIANO', '40000017', 'mruizpacheco@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('SANCHEZ DYLAN EMANUEL', '40000018', 'desanchez@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO),
('SONCO INFANTE FABIO', '40000019', 'fsoncoinfante@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO);



CREATE TABLE IF NOT EXISTS `materias` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre completo de la materia.',
    `especialidad` VARCHAR(100) NULL COMMENT 'Especialidad a la que pertenece (NULL si es común).',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Catálogo de todas las materias de la escuela.';

SET @CURSO_ANIO_MMDO = '7mo';
SET @CURSO_DIVISION_MMDO = '1ra';
SET @CURSO_ESPECIALIDAD_MMDO = 'Maestro Mayor de Obra';

SET @CURSO_INFO_ALUMNO_MMDO = JSON_OBJECT(
    'curso', 
    JSON_OBJECT(
        'anio', @CURSO_ANIO_MMDO, 
        'division', @CURSO_DIVISION_MMDO, 
        'especialidad', @CURSO_ESPECIALIDAD_MMDO
    )
);


INSERT INTO `usuarios` (fullname, dni, email, password, role, curso_info)
VALUES 
('Arquitecto Soto', '60123451', 'asotommdo@eest5.com', @PASSWORD_HASH, 'Profesor', '[
  {"materia": "Diseño de Estructuras", "anio": "7mo", "division": "1ra"},
  {"materia": "Cálculo y Presupuesto", "anio": "7mo", "division": "1ra"}
]'),
('Ingeniero Peralta', '60123452', 'iperaltammdo@eest5.com', @PASSWORD_HASH, 'Profesor', '[
  {"materia": "Construcciones Avanzadas", "anio": "7mo", "division": "1ra"}
]');


INSERT INTO `usuarios` (fullname, dni, email, password, role, curso_info)
VALUES 
('ALUMNO MMDO UNO', '70000001', 'a1mmdo@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO_MMDO),
('ALUMNO MMDO DOS', '70000002', 'a2mmdo@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO_MMDO),
('ALUMNO MMDO TRES', '70000003', 'a3mmdo@eest5.com', @PASSWORD_HASH, 'Alumno', @CURSO_INFO_ALUMNO_MMDO);


INSERT INTO `usuarios` (fullname, dni, email, password, role, curso_info)
VALUES 
('Preceptor Martin', '80123451', 'pmartin@eest5.com', @PASSWORD_HASH, 'Preceptor', NULL),
('Preceptor Ana', '80123452', 'afernandez@eest5.com', @PASSWORD_HASH, 'Preceptor', NULL);


CREATE TABLE IF NOT EXISTS `cursos` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `anio` VARCHAR(5) NOT NULL,
    `division` VARCHAR(5) NOT NULL,
    `especialidad` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_curso` (`anio`, `division`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Catálogo de años/divisiones existentes en la escuela.';

INSERT INTO `cursos` (anio, division, especialidad)
VALUES
('7mo', '1ra', 'Maestro Mayor de Obra'),
('7mo', '2da', 'Química'),
('7mo', '3ra', 'Electromecánica'),
('7mo', '4ta', 'Informática');