-- ========================================================
-- Base de datos: finanzalab_db
-- Proyecto: FinanzaLab (Escuela de Educación Financiera)
-- ========================================================

CREATE DATABASE IF NOT EXISTS `finanzalab_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `finanzalab_db`;

-- 1. Tabla de Usuarios (para inicio de sesión y perfiles de alumnos)
CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Gastos Hormiga (Herramienta 01)
CREATE TABLE IF NOT EXISTS `gastos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NULL,
    `concepto` VARCHAR(100) NOT NULL,
    `importe` DECIMAL(10, 2) NOT NULL,
    `categoria` ENUM('Comida y bebidas', 'Antojos', 'Transporte', 'Suscripciones', 'Otros') NOT NULL DEFAULT 'Otros',
    `fecha` DATE NOT NULL,
    `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Metas de Ahorro (Herramienta 02)
CREATE TABLE IF NOT EXISTS `metas_ahorro` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `objetivo` DECIMAL(10, 2) NOT NULL,
    `actual` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `estado` ENUM('en_progreso', 'completada') DEFAULT 'en_progreso',
    `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Lecciones / Niveles de la Escuela
CREATE TABLE IF NOT EXISTS `lecciones` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `numero_nivel` INT NOT NULL UNIQUE,
    `titulo` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `actividad` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla de Progreso Académico
CREATE TABLE IF NOT EXISTS `progreso_lecciones` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `numero_nivel` INT NOT NULL,
    `completada` BOOLEAN DEFAULT TRUE,
    `fecha_completada` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Carga de contenidos iniciales de las lecciones
-- --------------------------------------------------------
INSERT INTO `lecciones` (`numero_nivel`, `titulo`, `descripcion`, `actividad`) VALUES
(1, 'Identifica tus gastos hormiga', 'Los gastos hormiga son pequeñas compras frecuentes que pueden acumular una cantidad importante de dinero. Aprende a reconocerlas sin dejar de cubrir tus necesidades.', 'Anota tres compras pequeñas que hayas realizado recientemente. Regístralas en la herramienta de gastos y observa cuánto suman.'),
(2, 'Construye tu hábito de ahorro', 'Ahorrar consiste en reservar dinero para una meta futura. La cantidad debe adaptarse a tus posibilidades y a tus gastos esenciales.', 'Crea una meta en la herramienta de ahorro. Escribe para qué quieres ahorrar y cuánto necesitas reunir.'),
(3, 'Conoce las inversiones', 'Invertir significa colocar dinero en una opción que puede generar rendimientos, pero también puede ocasionar pérdidas. Antes de decidir, conoce sus condiciones y riesgos.', 'Escribe la diferencia entre ahorrar e invertir. Recuerda que ningún rendimiento está garantizado.')
ON DUPLICATE KEY UPDATE `titulo` = VALUES(`titulo`), `descripcion` = VALUES(`descripcion`), `actividad` = VALUES(`actividad`);
