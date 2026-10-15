<?php

/**
 * Front controller de EduFin.
 * Todas las peticiones que no correspondan a un archivo real pasan por aquí.
 */

declare(strict_types=1);

use Aplicacion\Nucleo\Router;

require dirname(__DIR__) . '/aplicacion/bootstrap.php';

$router = new Router();

// ---- Páginas ----
$router->get('/', 'PageController@home');
$router->get('/reticula', 'PageController@reticula');
$router->get('/materiales', 'PageController@materiales');
$router->get('/gastos-hormiga', 'PageController@gastosHormiga');
$router->get('/mi-ahorro', 'PageController@miAhorro');
$router->get('/metas', 'PageController@metas');
$router->get('/logros', 'PageController@logros');
$router->get('/configuracion', 'PageController@configuracion');

// ---- API ----
$router->get('/api/auth', 'AuthController@handle');
$router->post('/api/auth', 'AuthController@handle');
$router->post('/api/chat', 'ChatController@handle');
$router->get('/api/datos', 'DatosController@handle');
$router->post('/api/datos', 'DatosController@handle');

$router->dispatch();
