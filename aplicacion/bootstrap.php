<?php
/**
 * Bootstrap de la aplicación EduFin.
 * Define constantes, registra el autoloader e inicia la sesión.
 */

declare(strict_types=1);

define('BASE_PATH', dirname(__DIR__));
define('APP_PATH', BASE_PATH . '/aplicacion');
define('CONFIG_PATH', BASE_PATH . '/config');
define('VIEW_PATH', APP_PATH . '/Vistas');

// Autoloader PSR-4 para el namespace Aplicacion\ -> carpeta aplicacion/
spl_autoload_register(function (string $class): void {
    $prefix = 'Aplicacion\\';
    if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
        return;
    }
    $relative = substr($class, strlen($prefix));
    $file = APP_PATH . '/' . str_replace('\\', '/', $relative) . '.php';
    if (is_file($file)) {
        require $file;
    }
});

// URL base (por ejemplo "/EduFin/" o "/"), necesaria para enlaces y assets.
$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/'));
$base = rtrim($scriptDir, '/') . '/';
if ($base === '//') {
    $base = '/';
}
define('BASE_URL', $base);

// Configuración privada (clave de API). Puede no existir todavía.
if (is_file(CONFIG_PATH . '/config.php')) {
    require CONFIG_PATH . '/config.php';
}

// Configuración de la base de datos.
require CONFIG_PATH . '/database.php';

// Sesión para autenticación de alumnos.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

date_default_timezone_set('America/Mexico_City');
