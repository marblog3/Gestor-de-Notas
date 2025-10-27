
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

-- =================================================================
-- REINICIALIZACIÓN DE DATOS (PARA EVITAR EL ERROR #1062)
-- =================================================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `usuarios_en_espera`;
TRUNCATE TABLE `usuarios`;
TRUNCATE TABLE `notas`;
TRUNCATE TABLE `materias`;
TRUNCATE TABLE `cursos`;
SET FOREIGN_KEY_CHECKS = 1;

-- =================================================================
-- INSERCIÓN DE DATOS DE PRUEBA
-- =================================================================

SET @PASSWORD_HASH = '$2y$10$mlO8dk8E7FGu4itL.45JpOLl7mVsBg8VkXvRI8ewxiEs5tZGG1B9G';

-- 1. CURSOS (INSERCIÓN UNIFICADA)
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
('3ro', '5ta', 'Ciclo Básico', 'Mañana'), ('3ro', '6ta', 'Ciclo Básico', 'Tarde'),

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

-- 2. MATERIAS
INSERT INTO `materias` (nombre, especialidad)
VALUES
('Matemática', 'Tronco Común'), ('Lengua y Literatura', 'Tronco Común'),
('Física', 'Tronco Común'), ('Química', 'Tronco Común'),
('Educación Física', 'Tronco Común'), ('Geografía', 'Tronco Común'),
('Historia', 'Tronco Común'), ('Inglés', 'Tronco Común'),
('Biología', 'Tronco Común'), ('Arte', 'Tronco Común'),
('Taller de Carpintería', 'Ciclo Básico'), ('Taller de Herrería', 'Ciclo Básico'),
('Taller de Electricidad Básica', 'Ciclo Básico'),
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

-- 3. USUARIOS ADMINISTRATIVOS
INSERT INTO `usuarios` (fullname, dni, email, password, role)
VALUES 
('Administrador Principal', '10000000', 'admin@eest5.com', @PASSWORD_HASH, 'Administrador'),
('Preceptor Martin Gomez', '80123451', 'pmartin@eest5.com', @PASSWORD_HASH, 'Preceptor'),
('Preceptor Ana Fernandez', '80123452', 'afernandez@eest5.com', @PASSWORD_HASH, 'Preceptor'),
('Preceptor Mariela Martinez', '80123453', 'mmartinez@eest5.com', @PASSWORD_HASH, 'Preceptor'),
('Preceptor Ricardo Rodriguez', '80123454', 'rrodriguez@eest5.com', @PASSWORD_HASH, 'Preceptor'),
('Preceptor Marianela', '80123455', 'marianela@eest5.com', @PASSWORD_HASH, 'Preceptor');

-- 4. USUARIOS PROFESORES
INSERT INTO `usuarios` (fullname, dni, email, password, role, curso_info)
VALUES
('Prof. Laura Perez', '11000001', 'lperez@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Matemática", "anio": "1ro", "division": "1ra"}, {"materia": "Matemática", "anio": "4to", "division": "4ta"}, {"materia": "Matemática", "anio": "7mo", "division": "1ra"}]'),
('Prof. Federico Sosa', '11000002', 'fsosabio@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Biología", "anio": "2do", "division": "1ra"}, {"materia": "Biología", "anio": "4to", "division": "4ta"}]'),
('Prof. Marcos Lopez', '11000003', 'mlopez@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Taller de Carpintería", "anio": "1ro", "division": "1ra"}, {"materia": "Taller de Carpintería", "anio": "2do", "division": "2da"}]'),
('Prof. Andrea Diaz', '11000004', 'adiaz@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Lengua y Literatura", "anio": "1ro", "division": "1ra"}, {"materia": "Lengua y Literatura", "anio": "5to", "division": "4ta"}]'),
('Prof. Javier Ruiz', '11000005', 'jruiz@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Física", "anio": "3ro", "division": "1ra"}, {"materia": "Física", "anio": "6to", "division": "4ta"}]'),
('Prof. Veronica Castro', '11000006', 'vcastro@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Programación Avanzada", "anio": "4to", "division": "4ta"}, {"materia": "Estructura de Datos", "anio": "5to", "division": "4ta"}]'),
('Prof. Daniel Nuñez', '11000007', 'dnunez@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Base de datos", "anio": "6to", "division": "4ta"}]'),
('Gimenez Cesar', '20123456', 'cgimenez@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Instalación, mantenimiento y reparación de redes informáticas", "anio": "7mo", "division": "4ta"}, {"materia": "Instalación, mantenimiento y reparación de sistemas computacionales", "anio": "7mo", "division": "4ta"}, {"materia": "Prácticas profesionalizantes del sector informática", "anio": "7mo", "division": "4ta"}]'),
('Guido Gandolfo', '21123456', 'ggandolfo@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Instalación, mantenimiento y reparación de redes informáticas", "anio": "7mo", "division": "4ta"}, {"materia": "Proyecto, diseño e implementación de sistemas computacionales", "anio": "7mo", "division": "4ta"}, {"materia": "Prácticas profesionalizantes del sector informática", "anio": "7mo", "division": "4ta"}]'),
('Ricardo Garcia', '24123456', 'rgarcia@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Instalación, mantenimiento y reparación de sistemas computacionales", "anio": "7mo", "division": "4ta"}]'),
('Matias Paladino', '25123456', 'mfpaladinovela@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Proyecto, diseño e implementación de sistemas computacionales", "anio": "7mo", "division": "4ta"}]'),
('Arq. Hernán Soto', '60123451', 'asotommdo@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Diseño de Estructuras", "anio": "7mo", "division": "1ra"}, {"materia": "Cálculo y Presupuesto", "anio": "7mo", "division": "1ra"}]'),
('Lic. Sofía Robles', '60123452', 'sroblesquimica@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Operaciones Unitarias", "anio": "7mo", "division": "2da"}, {"materia": "Química", "anio": "4to", "division": "2da"}]'),
('Ing. Juan Valdez', '60123453', 'jvaldezelectro@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Circuitos Eléctricos", "anio": "7mo", "division": "3ra"}]'),
('Prof. Elena Campos', '60123454', 'ecampos@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Historia", "anio": "1ro", "division": "1ra"}, {"materia": "Historia", "anio": "5to", "division": "2da"}]'),
('Prof. Oscar Ibarra', '60123455', 'oibarra@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Emprendimientos productivos y desarrollo local", "anio": "7mo", "division": "4ta"}]'),
('Prof. Mariana Chavez', '60123456', 'mchavez@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Evaluación de proyectos", "anio": "7mo", "division": "4ta"}]'),
('Prof. Pablo Ruiz', '60123457', 'pruiz@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Modelos y sistemas", "anio": "7mo", "division": "4ta"}]'),
('Prof. Susana Gil', '60123458', 'sgil@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Geografía", "anio": "1ro", "division": "1ra"}, {"materia": "Geografía", "anio": "4to", "division": "1ra"}]'),
('Ing. Roberto Paz', '60123459', 'rpaz@eest5.com', @PASSWORD_HASH, 'Profesor', '[{"materia": "Taller de Electricidad Básica", "anio": "3ro", "division": "1ra"}]');


-- 5. FUNCIÓN Y VARIABLES DE CURSO
CREATE FUNCTION `GET_CURSO_JSON`(a VARCHAR(5), d VARCHAR(5), e VARCHAR(100)) RETURNS JSON
    DETERMINISTIC
    RETURN JSON_OBJECT('curso', JSON_OBJECT('anio', a, 'division', d, 'especialidad', e));

SET @CURSO_INFO_7MO_4TA = GET_CURSO_JSON('7mo', '4ta', 'Informática');
SET @CURSO_INFO_7MO_1RA = GET_CURSO_JSON('7mo', '1ra', 'Maestro Mayor de Obra');

-- 6. ALUMNOS ESTATICOS (7MO)
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


-- 7. ALUMNOS DINÁMICOS (CON NOMBRES DE nombres.txt)
-- Total de 558 alumnos para llenar los 42 cursos restantes.

SET @dni_counter = 90000000; 

INSERT INTO `usuarios` (fullname, dni, email, password, role, curso_info)
VALUES
-- =================================================================
-- GRUPO 1: CICLO BÁSICO (1ro, 2do, 3ro) - 23 CURSOS
-- =================================================================

-- 1ro 1ra, Ciclo Básico (14 Alumnos) - Nombres 1-14
('Bianca Carrillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '1ra', 'Ciclo Básico')),
('Bruno Ortiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '1ra', 'Ciclo Básico')),
('Noelia Núñez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '1ra', 'Ciclo Básico')),
('Franco Romero', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '1ra', 'Ciclo Básico')),
('Lara Rivas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '1ra', 'Ciclo Básico')),
('Antonella Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '1ra', 'Ciclo Básico')),
('Delfina Rojas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '1ra', 'Ciclo Básico')),
('Leandro Moreno', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '1ra', 'Ciclo Básico')),
('Emma Cano', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '1ra', 'Ciclo Básico')),
('Alondra Escobar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '1ra', 'Ciclo Básico')),
('Camila Villar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '1ra', 'Ciclo Básico')),
('Ailén Ibarra', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '1ra', 'Ciclo Básico')),
('Alma Escobar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '1ra', 'Ciclo Básico')),
('Ignacio Salazar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '1ra', 'Ciclo Básico')),

-- 1ro 2da, Ciclo Básico (14 Alumnos) - Nombres 15-28
('Santiago Vargas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '2da', 'Ciclo Básico')),
('Zoe Cabrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '2da', 'Ciclo Básico')),
('Federico Santana', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '2da', 'Ciclo Básico')),
('Elena Díaz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '2da', 'Ciclo Básico')),
('Valentina Cortés', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '2da', 'Ciclo Básico')),
('Leandro Fernández', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '2da', 'Ciclo Básico')),
('Catalina Flores', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '2da', 'Ciclo Básico')),
('Camila Delgado', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '2da', 'Ciclo Básico')),
('Juan Pineda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '2da', 'Ciclo Básico')),
('Ignacio Méndez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '2da', 'Ciclo Básico')),
('Lautaro Ruiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '2da', 'Ciclo Básico')),
('Lautaro Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '2da', 'Ciclo Básico')),
('Alan Torres', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '2da', 'Ciclo Básico')),
('Emiliano Carrillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '2da', 'Ciclo Básico')),

-- 1ro 3ra, Ciclo Básico (14 Alumnos) - Nombres 29-42
('Milagros Vera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '3ra', 'Ciclo Básico')),
('Micaela Ruiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '3ra', 'Ciclo Básico')),
('Facundo Pérez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '3ra', 'Ciclo Básico')),
('Lucas Ortiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '3ra', 'Ciclo Básico')),
('Aitana Pérez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '3ra', 'Ciclo Básico')),
('Camila Leiva', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '3ra', 'Ciclo Básico')),
('Camila Rodríguez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '3ra', 'Ciclo Básico')),
('Kevin Núñez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '3ra', 'Ciclo Básico')),
('Emma Blanco', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '3ra', 'Ciclo Básico')),
('Antonella Godoy', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '3ra', 'Ciclo Básico')),
('Joaquín Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '3ra', 'Ciclo Básico')),
('Gonzalo Ibarra', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '3ra', 'Ciclo Básico')),
('Catalina Godoy', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '3ra', 'Ciclo Básico')),
('Diego Espinoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '3ra', 'Ciclo Básico')),

-- 1ro 4ta, Ciclo Básico (14 Alumnos) - Nombres 43-56
('Tomás Pérez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '4ta', 'Ciclo Básico')),
('Malena Díaz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '4ta', 'Ciclo Básico')),
('Victoria González', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '4ta', 'Ciclo Básico')),
('Lucía Rivas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '4ta', 'Ciclo Básico')),
('Josefina Espinoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '4ta', 'Ciclo Básico')),
('Emma Díaz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '4ta', 'Ciclo Básico')),
('Morena Varela', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '4ta', 'Ciclo Básico')),
('Abril Morales', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '4ta', 'Ciclo Básico')),
('Pablo Luna', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '4ta', 'Ciclo Básico')),
('Julia Espinoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '4ta', 'Ciclo Básico')),
('Lautaro Castillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '4ta', 'Ciclo Básico')),
('Martina Flores', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '4ta', 'Ciclo Básico')),
('Mía Romero', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '4ta', 'Ciclo Básico')),
('Facundo Villar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '4ta', 'Ciclo Básico')),

-- 1ro 5ta, Ciclo Básico (14 Alumnos) - Nombres 57-70
('Aitana Varela', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '5ta', 'Ciclo Básico')),
('Lara Méndez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '5ta', 'Ciclo Básico')),
('Emma Paredes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '5ta', 'Ciclo Básico')),
('Andrés Moreno', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '5ta', 'Ciclo Básico')),
('Martina Cano', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '5ta', 'Ciclo Básico')),
('Bruno Figueroa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '5ta', 'Ciclo Básico')),
('Lara Escobar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '5ta', 'Ciclo Básico')),
('Victoria Pérez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '5ta', 'Ciclo Básico')),
('Gonzalo Cabrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '5ta', 'Ciclo Básico')),
('Andrés Mendoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '5ta', 'Ciclo Básico')),
('Adrián Méndez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '5ta', 'Ciclo Básico')),
('Julieta Sosa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '5ta', 'Ciclo Básico')),
('Julieta Figueroa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '5ta', 'Ciclo Básico')),
('Lucía Díaz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '5ta', 'Ciclo Básico')),

-- 1ro 6ta, Ciclo Básico (14 Alumnos) - Nombres 71-84
('Julia Flores', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '6ta', 'Ciclo Básico')),
('Juan Miranda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '6ta', 'Ciclo Básico')),
('Aitana Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '6ta', 'Ciclo Básico')),
('Matías Rico', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '6ta', 'Ciclo Básico')),
('Milena Luna', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '6ta', 'Ciclo Básico')),
('Mateo Torres', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '6ta', 'Ciclo Básico')),
('Valentina Peralta', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '6ta', 'Ciclo Básico')),
('Noelia Escobar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '6ta', 'Ciclo Básico')),
('Emma Pineda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '6ta', 'Ciclo Básico')),
('Ailén Escobar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '6ta', 'Ciclo Básico')),
('Jazmín Campos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '6ta', 'Ciclo Básico')),
('Santiago Núñez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '6ta', 'Ciclo Básico')),
('Nicolás Navarrete', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '6ta', 'Ciclo Básico')),
('Camila Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '6ta', 'Ciclo Básico')),

-- 1ro 7ma, Ciclo Básico (14 Alumnos) - Nombres 85-98
('Mía Mora', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '7ma', 'Ciclo Básico')),
('Martina Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '7ma', 'Ciclo Básico')),
('Josefina Cortés', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '7ma', 'Ciclo Básico')),
('Joaquín Ruiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '7ma', 'Ciclo Básico')),
('Paula Cortés', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '7ma', 'Ciclo Básico')),
('Martina Figueroa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '7ma', 'Ciclo Básico')),
('Ignacio Carrillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '7ma', 'Ciclo Básico')),
('Ambar Figueroa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '7ma', 'Ciclo Básico')),
('Tomás Ortiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '7ma', 'Ciclo Básico')),
('Thiago Cortés', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '7ma', 'Ciclo Básico')),
('Martina Leiva', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '7ma', 'Ciclo Básico')),
('Abril Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '7ma', 'Ciclo Básico')),
('Lucas Peña', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '7ma', 'Ciclo Básico')),
('Abril Leiva', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '7ma', 'Ciclo Básico')),

-- 1ro 8va, Ciclo Básico (14 Alumnos) - Nombres 99-112
('Lautaro Correa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '8va', 'Ciclo Básico')),
('Juan Carrillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '8va', 'Ciclo Básico')),
('Elías Morales', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '8va', 'Ciclo Básico')),
('Tomás Delgado', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '8va', 'Ciclo Básico')),
('Facundo Navarrete', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '8va', 'Ciclo Básico')),
('Lucas Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '8va', 'Ciclo Básico')),
('Julia Molina', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '8va', 'Ciclo Básico')),
('Matías Villar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '8va', 'Ciclo Básico')),
('Paula Ortiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '8va', 'Ciclo Básico')),
('Cristian Castro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '8va', 'Ciclo Básico')),
('Victoria Castillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '8va', 'Ciclo Básico')),
('Aitana Campos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '8va', 'Ciclo Básico')),
('Delfina Godoy', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '8va', 'Ciclo Básico')),
('Valeria Luna', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '8va', 'Ciclo Básico')),

-- 1ro 9na, Ciclo Básico (14 Alumnos) - Nombres 113-126
('Ambar Medina', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '9na', 'Ciclo Básico')),
('Lautaro Carrillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '9na', 'Ciclo Básico')),
('Candela Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '9na', 'Ciclo Básico')),
('Paula Figueroa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '9na', 'Ciclo Básico')),
('Federico Montoya', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '9na', 'Ciclo Básico')),
('Juan Fernández', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '9na', 'Ciclo Básico')),
('Maximiliano Rodríguez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '9na', 'Ciclo Básico')),
('Luciano Roldán', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '9na', 'Ciclo Básico')),
('Maximiliano Blanco', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '9na', 'Ciclo Básico')),
('Gonzalo Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '9na', 'Ciclo Básico')),
('Isabella Rico', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '9na', 'Ciclo Básico')),
('Esteban Escobar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '9na', 'Ciclo Básico')),
('Emiliano Campos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '9na', 'Ciclo Básico')),
('Alondra Villar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('1ro', '9na', 'Ciclo Básico')),

-- 2do 1ra, Ciclo Básico (14 Alumnos) - Nombres 127-140
('Aitana Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '1ra', 'Ciclo Básico')),
('Joaquín Rojas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '1ra', 'Ciclo Básico')),
('Noelia Acosta', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '1ra', 'Ciclo Básico')),
('Renata Delgado', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '1ra', 'Ciclo Básico')),
('Matías Aguilar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '1ra', 'Ciclo Básico')),
('Rodrigo Godoy', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '1ra', 'Ciclo Básico')),
('Valeria Sosa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '1ra', 'Ciclo Básico')),
('Tomás Méndez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '1ra', 'Ciclo Básico')),
('Renata Paredes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '1ra', 'Ciclo Básico')),
('Victoria Luna', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '1ra', 'Ciclo Básico')),
('Ambar Fuentes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '1ra', 'Ciclo Básico')),
('Josefina Montoya', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '1ra', 'Ciclo Básico')),
('Martina Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '1ra', 'Ciclo Básico')),
('Agustín Acosta', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '1ra', 'Ciclo Básico')),

-- 2do 2da, Ciclo Básico (14 Alumnos) - Nombres 141-154
('Alondra Rivas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '2da', 'Ciclo Básico')),
('Lara Ortiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '2da', 'Ciclo Básico')),
('Cristian Castro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '2da', 'Ciclo Básico')),
('Olivia Acosta', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '2da', 'Ciclo Básico')),
('Gonzalo Flores', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '2da', 'Ciclo Básico')),
('Lucía Cano', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '2da', 'Ciclo Básico')),
('Isabella Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '2da', 'Ciclo Básico')),
('Morena Suárez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '2da', 'Ciclo Básico')),
('Luciano Castillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '2da', 'Ciclo Básico')),
('Rodrigo Acosta', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '2da', 'Ciclo Básico')),
('Valentina Vargas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '2da', 'Ciclo Básico')),
('Sebastián Cabrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '2da', 'Ciclo Básico')),
('Emma Medina', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '2da', 'Ciclo Básico')),
('Aitana Villar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '2da', 'Ciclo Básico')),

-- 2do 3ra, Ciclo Básico (13 Alumnos) - Nombres 155-167
('Valentín Montoya', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '3ra', 'Ciclo Básico')),
('Andrés Campos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '3ra', 'Ciclo Básico')),
('Federico Paredes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '3ra', 'Ciclo Básico')),
('Gonzalo Mora', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '3ra', 'Ciclo Básico')),
('Lara Campos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '3ra', 'Ciclo Básico')),
('Victoria Figueroa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '3ra', 'Ciclo Básico')),
('Facundo Escobar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '3ra', 'Ciclo Básico')),
('Cristian Correa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '3ra', 'Ciclo Básico')),
('Federico Vargas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '3ra', 'Ciclo Básico')),
('Bianca Quiroga', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '3ra', 'Ciclo Básico')),
('Rodrigo Miranda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '3ra', 'Ciclo Básico')),
('Morena Torres', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '3ra', 'Ciclo Básico')),
('Daniela Roldán', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '3ra', 'Ciclo Básico')),

-- 2do 4ta, Ciclo Básico (13 Alumnos) - Nombres 168-180
('Ignacio Luna', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '4ta', 'Ciclo Básico')),
('Tomás Rico', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '4ta', 'Ciclo Básico')),
('Alma Santana', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '4ta', 'Ciclo Básico')),
('Camila Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '4ta', 'Ciclo Básico')),
('Julia Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '4ta', 'Ciclo Básico')),
('Franco Pineda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '4ta', 'Ciclo Básico')),
('Maximiliano Valdez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '4ta', 'Ciclo Básico')),
('Ignacio Acosta', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '4ta', 'Ciclo Básico')),
('Rodrigo Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '4ta', 'Ciclo Básico')),
('Delfina Quiroga', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '4ta', 'Ciclo Básico')),
('Gonzalo Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '4ta', 'Ciclo Básico')),
('Tomás Mora', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '4ta', 'Ciclo Básico')),
('Kevin Santana', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '4ta', 'Ciclo Básico')),

-- 2do 5ta, Ciclo Básico (13 Alumnos) - Nombres 181-193
('Mía Moreno', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '5ta', 'Ciclo Básico')),
('Pablo Soto', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '5ta', 'Ciclo Básico')),
('Elías Reyes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '5ta', 'Ciclo Básico')),
('Alma Castro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '5ta', 'Ciclo Básico')),
('Valeria Fuentes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '5ta', 'Ciclo Básico')),
('Agustín Cabrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '5ta', 'Ciclo Básico')),
('Ignacio Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '5ta', 'Ciclo Básico')),
('Lautaro Miranda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '5ta', 'Ciclo Básico')),
('Morena Cortés', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '5ta', 'Ciclo Básico')),
('Tomás Navarro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '5ta', 'Ciclo Básico')),
('Tomás Castro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '5ta', 'Ciclo Básico')),
('Facundo Cortés', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '5ta', 'Ciclo Básico')),
('Rodrigo Cortés', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '5ta', 'Ciclo Básico')),

-- 2do 6ta, Ciclo Básico (13 Alumnos) - Nombres 194-206
('Thiago Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '6ta', 'Ciclo Básico')),
('Valentina Silva', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '6ta', 'Ciclo Básico')),
('Cristian Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '6ta', 'Ciclo Básico')),
('Joaquín Correa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '6ta', 'Ciclo Básico')),
('Malena Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '6ta', 'Ciclo Básico')),
('Esteban Torres', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '6ta', 'Ciclo Básico')),
('Martina Pineda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '6ta', 'Ciclo Básico')),
('Mía Montoya', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '6ta', 'Ciclo Básico')),
('Alan Pérez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '6ta', 'Ciclo Básico')),
('Gabriel Flores', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '6ta', 'Ciclo Básico')),
('Santiago Núñez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '6ta', 'Ciclo Básico')),
('Joaquín Leiva', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '6ta', 'Ciclo Básico')),
('Alan Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '6ta', 'Ciclo Básico')),

-- 2do 7ma, Ciclo Básico (13 Alumnos) - Nombres 207-219
('Olivia Torres', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '7ma', 'Ciclo Básico')),
('Mateo Romero', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '7ma', 'Ciclo Básico')),
('Alan Romero', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '7ma', 'Ciclo Básico')),
('Malena Suárez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '7ma', 'Ciclo Básico')),
('Facundo Roldán', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '7ma', 'Ciclo Básico')),
('Ambar Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '7ma', 'Ciclo Básico')),
('Franco Flores', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '7ma', 'Ciclo Básico')),
('Lucía Rivas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '7ma', 'Ciclo Básico')),
('Valentín Escobar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '7ma', 'Ciclo Básico')),
('Joaquín Mendoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '7ma', 'Ciclo Básico')),
('Ignacio Luna', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '7ma', 'Ciclo Básico')),
('Sebastián Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '7ma', 'Ciclo Básico')),
('Zoe Figueroa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '7ma', 'Ciclo Básico')),

-- 2do 8va, Ciclo Básico (13 Alumnos) - Nombres 220-232
('Damián Díaz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '8va', 'Ciclo Básico')),
('Olivia Morales', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '8va', 'Ciclo Básico')),
('Thiago Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '8va', 'Ciclo Básico')),
('Emiliano Peña', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '8va', 'Ciclo Básico')),
('Micaela Fuentes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '8va', 'Ciclo Básico')),
('Cristian Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '8va', 'Ciclo Básico')),
('Nicolás Aguilar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '8va', 'Ciclo Básico')),
('Rodrigo Castillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '8va', 'Ciclo Básico')),
('Diego Torres', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '8va', 'Ciclo Básico')),
('Abril Acosta', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '8va', 'Ciclo Básico')),
('Ignacio Luna', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '8va', 'Ciclo Básico')),
('Joaquín Fernández', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '8va', 'Ciclo Básico')),
('Kevin Navarro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('2do', '8va', 'Ciclo Básico')),

-- 3ro 1ra, Ciclo Básico (13 Alumnos) - Nombres 233-245
('Lautaro Rojas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '1ra', 'Ciclo Básico')),
('Alma Suárez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '1ra', 'Ciclo Básico')),
('Victoria Mendoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '1ra', 'Ciclo Básico')),
('Alan Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '1ra', 'Ciclo Básico')),
('Nicolás López', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '1ra', 'Ciclo Básico')),
('Lara Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '1ra', 'Ciclo Básico')),
('Jazmín Acosta', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '1ra', 'Ciclo Básico')),
('Bianca Carrillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '1ra', 'Ciclo Básico')),
('Lucía Varela', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '1ra', 'Ciclo Básico')),
('Alma Núñez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '1ra', 'Ciclo Básico')),
('Delfina Luna', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '1ra', 'Ciclo Básico')),
('Thiago Díaz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '1ra', 'Ciclo Básico')),
('Renata Escobar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '1ra', 'Ciclo Básico')),

-- 3ro 2da, Ciclo Básico (13 Alumnos) - Nombres 246-258
('Nicolás Figueroa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '2da', 'Ciclo Básico')),
('Simón Correa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '2da', 'Ciclo Básico')),
('Isabella Ruiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '2da', 'Ciclo Básico')),
('Lautaro Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '2da', 'Ciclo Básico')),
('Federico Ibarra', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '2da', 'Ciclo Básico')),
('Gabriel Villar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '2da', 'Ciclo Básico')),
('Martina Mora', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '2da', 'Ciclo Básico')),
('Abril Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '2da', 'Ciclo Básico')),
('Diego Godoy', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '2da', 'Ciclo Básico')),
('Martina Pineda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '2da', 'Ciclo Básico')),
('Ignacio Silva', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '2da', 'Ciclo Básico')),
('Valeria Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '2da', 'Ciclo Básico')),
('Bruno Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '2da', 'Ciclo Básico')),

-- 3ro 3ra, Ciclo Básico (13 Alumnos) - Nombres 259-271
('Olivia Peña', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '3ra', 'Ciclo Básico')),
('Sofía Godoy', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '3ra', 'Ciclo Básico')),
('Facundo Cabrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '3ra', 'Ciclo Básico')),
('Milagros Roldán', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '3ra', 'Ciclo Básico')),
('Thiago Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '3ra', 'Ciclo Básico')),
('Nicolás Vera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '3ra', 'Ciclo Básico')),
('Adrián Cabrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '3ra', 'Ciclo Básico')),
('Martina Salas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '3ra', 'Ciclo Básico')),
('Nicolás Aguilar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '3ra', 'Ciclo Básico')),
('Julia Reyes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '3ra', 'Ciclo Básico')),
('Josefina Roldán', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '3ra', 'Ciclo Básico')),
('Lucas Peña', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '3ra', 'Ciclo Básico')),
('Bianca Salas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '3ra', 'Ciclo Básico')),

-- 3ro 4ta, Ciclo Básico (13 Alumnos) - Nombres 272-284
('Cristian Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '4ta', 'Ciclo Básico')),
('Leandro Blanco', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '4ta', 'Ciclo Básico')),
('Leandro Suárez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '4ta', 'Ciclo Básico')),
('Lautaro Delgado', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '4ta', 'Ciclo Básico')),
('Lucía Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '4ta', 'Ciclo Básico')),
('Rodrigo Méndez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '4ta', 'Ciclo Básico')),
('Josefina Mendoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '4ta', 'Ciclo Básico')),
('Nicolás Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '4ta', 'Ciclo Básico')),
('Tomás Escobar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '4ta', 'Ciclo Básico')),
('Tomás Núñez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '4ta', 'Ciclo Básico')),
('Andrés Peña', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '4ta', 'Ciclo Básico')),
('Alexis Castro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '4ta', 'Ciclo Básico')),
('Martina Paredes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '4ta', 'Ciclo Básico')),

-- 3ro 5ta, Ciclo Básico (13 Alumnos) - Nombres 285-297
('Joaquín Varela', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '5ta', 'Ciclo Básico')),
('Alma Valdez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '5ta', 'Ciclo Básico')),
('Agustín López', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '5ta', 'Ciclo Básico')),
('Milagros Luna', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '5ta', 'Ciclo Básico')),
('Lucía Rivas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '5ta', 'Ciclo Básico')),
('Malena Ortiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '5ta', 'Ciclo Básico')),
('Joaquín Varela', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '5ta', 'Ciclo Básico')),
('Mía Silva', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '5ta', 'Ciclo Básico')),
('Juan Ibarra', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '5ta', 'Ciclo Básico')),
('Federico Vargas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '5ta', 'Ciclo Básico')),
('Lautaro Salas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '5ta', 'Ciclo Básico')),
('Bianca Cano', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '5ta', 'Ciclo Básico')),
('Cristian Rojas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '5ta', 'Ciclo Básico')),

-- 3ro 6ta, Ciclo Básico (13 Alumnos) - Nombres 298-310
('Valentín Cabrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '6ta', 'Ciclo Básico')),
('Aitana Figueroa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '6ta', 'Ciclo Básico')),
('Victoria Pérez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '6ta', 'Ciclo Básico')),
('Lautaro González', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '6ta', 'Ciclo Básico')),
('Leandro Roldán', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '6ta', 'Ciclo Básico')),
('Tomás Salas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '6ta', 'Ciclo Básico')),
('Alan Silva', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '6ta', 'Ciclo Básico')),
('Rodrigo Ortiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '6ta', 'Ciclo Básico')),
('Victoria Pérez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '6ta', 'Ciclo Básico')),
('Lara Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '6ta', 'Ciclo Básico')),
('Julia Torres', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '6ta', 'Ciclo Básico')),
('Ailén Carrillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '6ta', 'Ciclo Básico')),
('Abril Escobar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('3ro', '6ta', 'Ciclo Básico')),

-- 4to 1ra, Maestro Mayor de Obra (13 Alumnos) - Nombres 311-323
('Tomás Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '1ra', 'Maestro Mayor de Obra')),
('Josefina Rivas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '1ra', 'Maestro Mayor de Obra')),
('Bruno Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '1ra', 'Maestro Mayor de Obra')),
('Aitana Rojas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '1ra', 'Maestro Mayor de Obra')),
('Gonzalo Varela', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '1ra', 'Maestro Mayor de Obra')),
('Elías Rico', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '1ra', 'Maestro Mayor de Obra')),
('Alexis Roldán', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '1ra', 'Maestro Mayor de Obra')),
('Lucía Soto', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '1ra', 'Maestro Mayor de Obra')),
('Rodrigo Castro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '1ra', 'Maestro Mayor de Obra')),
('Ignacio Valdez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '1ra', 'Maestro Mayor de Obra')),
('Martina Salazar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '1ra', 'Maestro Mayor de Obra')),
('Mateo Ibarra', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '1ra', 'Maestro Mayor de Obra')),
('Delfina Cortés', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '1ra', 'Maestro Mayor de Obra')),

-- 4to 5ta, Maestro Mayor de Obra (13 Alumnos) - Nombres 324-336
('Rodrigo Peña', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '5ta', 'Maestro Mayor de Obra')),
('Juan Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '5ta', 'Maestro Mayor de Obra')),
('Nicolás Figueroa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '5ta', 'Maestro Mayor de Obra')),
('Catalina Flores', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '5ta', 'Maestro Mayor de Obra')),
('Zoe Godoy', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '5ta', 'Maestro Mayor de Obra')),
('Valentín Escobar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '5ta', 'Maestro Mayor de Obra')),
('Ignacio Núñez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '5ta', 'Maestro Mayor de Obra')),
('Victoria Espinoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '5ta', 'Maestro Mayor de Obra')),
('Cristian Díaz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '5ta', 'Maestro Mayor de Obra')),
('Ignacio Núñez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '5ta', 'Maestro Mayor de Obra')),
('Gonzalo Díaz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '5ta', 'Maestro Mayor de Obra')),
('Camila Escobar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '5ta', 'Maestro Mayor de Obra')),
('Antonella Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '5ta', 'Maestro Mayor de Obra')),

-- 5to 1ra, Maestro Mayor de Obra (13 Alumnos) - Nombres 337-349
('Bruno Carrillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '1ra', 'Maestro Mayor de Obra')),
('Alan Espinoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '1ra', 'Maestro Mayor de Obra')),
('Milena Díaz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '1ra', 'Maestro Mayor de Obra')),
('Daniela Morales', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '1ra', 'Maestro Mayor de Obra')),
('Tomás Luna', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '1ra', 'Maestro Mayor de Obra')),
('Abril Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '1ra', 'Maestro Mayor de Obra')),
('Simón Díaz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '1ra', 'Maestro Mayor de Obra')),
('Lara Carrillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '1ra', 'Maestro Mayor de Obra')),
('Matías Rodríguez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '1ra', 'Maestro Mayor de Obra')),
('Emma Medina', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '1ra', 'Maestro Mayor de Obra')),
('Delfina Mendoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '1ra', 'Maestro Mayor de Obra')),
('Antonella Soto', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '1ra', 'Maestro Mayor de Obra')),
('Micaela Roldán', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '1ra', 'Maestro Mayor de Obra')),

-- 5to 5ta, Maestro Mayor de Obra (13 Alumnos) - Nombres 350-362
('Renata Correa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '5ta', 'Maestro Mayor de Obra')),
('Martina Mendoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '5ta', 'Maestro Mayor de Obra')),
('Valentín Núñez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '5ta', 'Maestro Mayor de Obra')),
('Matías Miranda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '5ta', 'Maestro Mayor de Obra')),
('Lara Godoy', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '5ta', 'Maestro Mayor de Obra')),
('Federico Reina', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '5ta', 'Maestro Mayor de Obra')),
('Morena Pineda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '5ta', 'Maestro Mayor de Obra')),
('Pablo Cano', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '5ta', 'Maestro Mayor de Obra')),
('Andrés Rico', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '5ta', 'Maestro Mayor de Obra')),
('Valentina Fernández', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '5ta', 'Maestro Mayor de Obra')),
('Catalina Carrillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '5ta', 'Maestro Mayor de Obra')),
('Martina Reina', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '5ta', 'Maestro Mayor de Obra')),
('Josefina Espinoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '5ta', 'Maestro Mayor de Obra')),

-- 6to 1ra, Maestro Mayor de Obra (13 Alumnos) - Nombres 363-375
('Malena Delgado', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '1ra', 'Maestro Mayor de Obra')),
('Federico Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '1ra', 'Maestro Mayor de Obra')),
('Benjamín Suárez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '1ra', 'Maestro Mayor de Obra')),
('Bruno Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '1ra', 'Maestro Mayor de Obra')),
('Ignacio Roldán', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '1ra', 'Maestro Mayor de Obra')),
('Emiliano Salas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '1ra', 'Maestro Mayor de Obra')),
('Elena Villar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '1ra', 'Maestro Mayor de Obra')),
('Facundo Navarro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '1ra', 'Maestro Mayor de Obra')),
('Renata Paredes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '1ra', 'Maestro Mayor de Obra')),
('Zoe Cortés', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '1ra', 'Maestro Mayor de Obra')),
('Lautaro Mendoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '1ra', 'Maestro Mayor de Obra')),
('Benjamín Fernández', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '1ra', 'Maestro Mayor de Obra')),
('Kevin Ortiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '1ra', 'Maestro Mayor de Obra')),

-- 7mo 1ra, Maestro Mayor de Obra (13 Alumnos) - Nombres 376-388
('Rodrigo Salas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '1ra', 'Maestro Mayor de Obra')),
('Renata Salazar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '1ra', 'Maestro Mayor de Obra')),
('Mauricio Paredes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '1ra', 'Maestro Mayor de Obra')),
('Victoria Aguilar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '1ra', 'Maestro Mayor de Obra')),
('Lara Escobar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '1ra', 'Maestro Mayor de Obra')),
('Damián Miranda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '1ra', 'Maestro Mayor de Obra')),
('Aitana Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '1ra', 'Maestro Mayor de Obra')),
('Malena Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '1ra', 'Maestro Mayor de Obra')),
('Luciano Fernández', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '1ra', 'Maestro Mayor de Obra')),
('Sofía Pineda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '1ra', 'Maestro Mayor de Obra')),
('Leandro Varela', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '1ra', 'Maestro Mayor de Obra')),
('Abril Fernández', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '1ra', 'Maestro Mayor de Obra')),
('Ignacio Pérez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '1ra', 'Maestro Mayor de Obra')),

-- 4to 2da, Química (13 Alumnos) - Nombres 389-401
('Zoe Rivas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '2da', 'Química')),
('Lucas Varela', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '2da', 'Química')),
('Emma Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '2da', 'Química')),
('Olivia Reina', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '2da', 'Química')),
('Gonzalo Quiroga', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '2da', 'Química')),
('Lara López', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '2da', 'Química')),
('Matías Reina', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '2da', 'Química')),
('Antonella Leiva', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '2da', 'Química')),
('Nicolás Castro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '2da', 'Química')),
('Lautaro Aguilar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '2da', 'Química')),
('Delfina Romero', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '2da', 'Química')),
('Leandro Rico', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '2da', 'Química')),
('Morena Aguilar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '2da', 'Química')),

-- 5to 2da, Química (13 Alumnos) - Nombres 402-414
('Luciano Torres', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '2da', 'Química')),
('Bruno Castro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '2da', 'Química')),
('Aitana Castro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '2da', 'Química')),
('Delfina Montoya', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '2da', 'Química')),
('Emma Núñez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '2da', 'Química')),
('Valentina Luna', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '2da', 'Química')),
('Olivia Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '2da', 'Química')),
('Ignacio Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '2da', 'Química')),
('Franco Suárez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '2da', 'Química')),
('Milagros Castro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '2da', 'Química')),
('Rodrigo Rivas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '2da', 'Química')),
('Micaela Valdez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '2da', 'Química')),
('Bruno Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '2da', 'Química')),

-- 6to 2da, Química (12 Alumnos) - Nombres 415-426
('Olivia Díaz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '2da', 'Química')),
('Antonella Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '2da', 'Química')),
('Mía Mendoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '2da', 'Química')),
('Nicolás Cano', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '2da', 'Química')),
('Alma Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '2da', 'Química')),
('Franco Correa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '2da', 'Química')),
('Emma Castillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '2da', 'Química')),
('Emma Peralta', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '2da', 'Química')),
('Agustín Vargas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '2da', 'Química')),
('Ailén Moreno', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '2da', 'Química')),
('Mateo Salazar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '2da', 'Química')),
('Maximiliano Pérez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '2da', 'Química')),

-- 7mo 2da, Química (12 Alumnos) - Nombres 427-438
('Nicolás López', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '2da', 'Química')),
('Mauricio Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '2da', 'Química')),
('Camila Morales', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '2da', 'Química')),
('Santiago Varela', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '2da', 'Química')),
('Cristian Fernández', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '2da', 'Química')),
('Nicolás Núñez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '2da', 'Química')),
('Franco Carrillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '2da', 'Química')),
('Facundo Silva', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '2da', 'Química')),
('Mauricio Castillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '2da', 'Química')),
('Valeria Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '2da', 'Química')),
('Paula Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '2da', 'Química')),
('Jazmín Reyes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '2da', 'Química')),

-- 4to 3ra, Electromecánica (12 Alumnos) - Nombres 439-450
('Alan Soto', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '3ra', 'Electromecánica')),
('Lautaro Salazar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '3ra', 'Electromecánica')),
('Alan Flores', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '3ra', 'Electromecánica')),
('Ignacio Rodríguez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '3ra', 'Electromecánica')),
('Micaela Vargas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '3ra', 'Electromecánica')),
('Martina Torres', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '3ra', 'Electromecánica')),
('Zoe Blanco', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '3ra', 'Electromecánica')),
('Maximiliano Montoya', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '3ra', 'Electromecánica')),
('Aitana Soto', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '3ra', 'Electromecánica')),
('Tomás Mendoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '3ra', 'Electromecánica')),
('Thiago Ortiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '3ra', 'Electromecánica')),
('Valentín Fuentes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '3ra', 'Electromecánica')),

-- 4to 7ma, Electromecánica (12 Alumnos) - Nombres 451-462
('Bruno Suárez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '7ma', 'Electromecánica')),
('Lautaro Silva', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '7ma', 'Electromecánica')),
('Lucía Soto', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '7ma', 'Electromecánica')),
('Gonzalo Blanco', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '7ma', 'Electromecánica')),
('Tomás Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '7ma', 'Electromecánica')),
('Diego Núñez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '7ma', 'Electromecánica')),
('Matías Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '7ma', 'Electromecánica')),
('Isabella Rivas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '7ma', 'Electromecánica')),
('Benjamín Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '7ma', 'Electromecánica')),
('Pablo Carrillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '7ma', 'Electromecánica')),
('Federico Vargas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '7ma', 'Electromecánica')),
('Lautaro López', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '7ma', 'Electromecánica')),

-- 5to 3ra, Electromecánica (12 Alumnos) - Nombres 463-474
('Emma Gómez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '3ra', 'Electromecánica')),
('Ailén Acosta', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '3ra', 'Electromecánica')),
('Facundo Castro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '3ra', 'Electromecánica')),
('Renata Sosa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '3ra', 'Electromecánica')),
('Ignacio Morales', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '3ra', 'Electromecánica')),
('Lara Torres', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '3ra', 'Electromecánica')),
('Mauricio Reyes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '3ra', 'Electromecánica')),
('Paula Moreno', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '3ra', 'Electromecánica')),
('Morena Espinoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '3ra', 'Electromecánica')),
('Renata Castro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '3ra', 'Electromecánica')),
('Bruno Fernández', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '3ra', 'Electromecánica')),
('Julieta Delgado', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '3ra', 'Electromecánica')),

-- 6to 3ra, Electromecánica (12 Alumnos) - Nombres 475-486
('Camila Acosta', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '3ra', 'Electromecánica')),
('Valentín Blanco', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '3ra', 'Electromecánica')),
('Mía Méndez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '3ra', 'Electromecánica')),
('Esteban Moreno', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '3ra', 'Electromecánica')),
('Julieta Figueroa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '3ra', 'Electromecánica')),
('Bruno Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '3ra', 'Electromecánica')),
('Catalina Salazar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '3ra', 'Electromecánica')),
('Mía Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '3ra', 'Electromecánica')),
('Nicolás Ibarra', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '3ra', 'Electromecánica')),
('Leandro Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '3ra', 'Electromecánica')),
('Kevin Luna', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '3ra', 'Electromecánica')),
('Mía Pineda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '3ra', 'Electromecánica')),

-- 7mo 3ra, Electromecánica (12 Alumnos) - Nombres 487-498
('Adrián Ortiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '3ra', 'Electromecánica')),
('Martina Ortiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '3ra', 'Electromecánica')),
('Olivia Morales', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '3ra', 'Electromecánica')),
('Emiliano Rico', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '3ra', 'Electromecánica')),
('Mauricio Sosa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '3ra', 'Electromecánica')),
('Ambar Ortiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '3ra', 'Electromecánica')),
('Martina Romero', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '3ra', 'Electromecánica')),
('Gonzalo Sosa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '3ra', 'Electromecánica')),
('Alondra Santana', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '3ra', 'Electromecánica')),
('Daniela Salazar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '3ra', 'Electromecánica')),
('Catalina Acosta', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '3ra', 'Electromecánica')),
('Nicolás Vargas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('7mo', '3ra', 'Electromecánica')),

-- 4to 4ta, Informática (12 Alumnos) - Nombres 499-510
('Mateo Vega', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '4ta', 'Informática')),
('Ailén Sosa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '4ta', 'Informática')),
('Adrián Cabrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '4ta', 'Informática')),
('Federico Correa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '4ta', 'Informática')),
('Lara Fuentes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '4ta', 'Informática')),
('Elena Pineda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '4ta', 'Informática')),
('Delfina Paredes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '4ta', 'Informática')),
('Franco Valdez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '4ta', 'Informática')),
('Emiliano Quiroga', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '4ta', 'Informática')),
('Esteban Miranda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '4ta', 'Informática')),
('Isabella Fernández', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '4ta', 'Informática')),
('Lara Navarro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '4ta', 'Informática')),

-- 4to 6ta, Informática (12 Alumnos) - Nombres 511-522
('Noelia Vera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '6ta', 'Informática')),
('Elena Romero', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '6ta', 'Informática')),
('Julieta Fuentes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '6ta', 'Informática')),
('Gabriel Aguilar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '6ta', 'Informática')),
('Alma Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '6ta', 'Informática')),
('Delfina Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '6ta', 'Informática')),
('Martina Ibarra', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '6ta', 'Informática')),
('Julieta Salas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '6ta', 'Informática')),
('Ambar Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '6ta', 'Informática')),
('Malena Flores', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '6ta', 'Informática')),
('Lautaro Herrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '6ta', 'Informática')),
('Micaela Suárez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('4to', '6ta', 'Informática')),

-- 5to 4ta, Informática (12 Alumnos) - Nombres 523-534
('Esteban Castro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '4ta', 'Informática')),
('Olivia Benítez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '4ta', 'Informática')),
('Valentín Medina', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '4ta', 'Informática')),
('Facundo Villar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '4ta', 'Informática')),
('Simón Figueroa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '4ta', 'Informática')),
('Lucía Figueroa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '4ta', 'Informática')),
('Isabella Ramos', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '4ta', 'Informática')),
('Camila Fuentes', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '4ta', 'Informática')),
('Zoe Navarrete', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '4ta', 'Informática')),
('Alexis Cabrera', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '4ta', 'Informática')),
('Rodrigo Pineda', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '4ta', 'Informática')),
('Zoe Varela', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '4ta', 'Informática')),

-- 5to 6ta, Informática (12 Alumnos) - Nombres 535-546
('Victoria Medina', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '6ta', 'Informática')),
('Alan Leiva', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '6ta', 'Informática')),
('Alondra Cano', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '6ta', 'Informática')),
('Simón Romero', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '6ta', 'Informática')),
('Martina Espinoza', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '6ta', 'Informática')),
('Lautaro Ortiz', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '6ta', 'Informática')),
('Alan Salazar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '6ta', 'Informática')),
('Agustín Cortés', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '6ta', 'Informática')),
('Bruno Torres', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '6ta', 'Informática')),
('Facundo Rojas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '6ta', 'Informática')),
('Mía Méndez', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '6ta', 'Informática')),
('Cristian Castillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('5to', '6ta', 'Informática')),

-- 6to 4ta, Informática (12 Alumnos) - Nombres 547-558
('Mía Acosta', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '4ta', 'Informática')),
('Lautaro Carrillo', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '4ta', 'Informática')),
('Federico Correa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '4ta', 'Informática')),
('Catalina Escobar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '4ta', 'Informática')),
('Benjamín Cortés', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '4ta', 'Informática')),
('Bruno Castro', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '4ta', 'Informática')),
('Adrián Villar', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '4ta', 'Informática')),
('Ignacio Sosa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '4ta', 'Informática')),
('Valentina Flores', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '4ta', 'Informática')),
('Elías Salas', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '4ta', 'Informática')),
('Martina Figueroa', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '4ta', 'Informática')),
('Zoe Peralta', LPAD(@dni_counter := @dni_counter + 1, 8, '0'), CONCAT('a', @dni_counter, '@eest5.com'), @PASSWORD_HASH, 'Alumno', GET_CURSO_JSON('6to', '4ta', 'Informática'));