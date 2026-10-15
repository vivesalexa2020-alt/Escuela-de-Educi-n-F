<?php

declare(strict_types=1);

namespace Aplicacion\Nucleo;

/**
 * Enrutador muy simple basado en método HTTP + ruta.
 */
class Router
{
    /** @var array<string, array<string, string>> */
    private array $routes = [
        'GET'  => [],
        'POST' => [],
    ];

    public function get(string $path, string $handler): void
    {
        $this->routes['GET'][$this->normalize($path)] = $handler;
    }

    public function post(string $path, string $handler): void
    {
        $this->routes['POST'][$this->normalize($path)] = $handler;
    }

    public function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $route = $this->currentRoute($uri);

        $handler = $this->routes[$method][$route] ?? null;

        if ($handler === null) {
            $this->notFound();
            return;
        }

        [$class, $action] = explode('@', $handler, 2);
        $controllerClass = 'Aplicacion\\Controladores\\' . $class;

        if (!class_exists($controllerClass) || !method_exists($controllerClass, $action)) {
            $this->notFound();
            return;
        }

        $controller = new $controllerClass();
        $controller->{$action}();
    }

    /**
     * Quita la URL base (por ejemplo /EduFin) del recurso solicitado.
     */
    private function currentRoute(string $uri): string
    {
        $base = rtrim(BASE_URL, '/');
        if ($base !== '' && strncmp($uri, $base, strlen($base)) === 0) {
            $uri = substr($uri, strlen($base));
        }
        return $this->normalize($uri);
    }

    private function normalize(string $path): string
    {
        $path = '/' . trim($path, '/');
        return $path === '/' ? '/' : rtrim($path, '/');
    }

    private function notFound(): void
    {
        http_response_code(404);
        header('Content-Type: text/html; charset=utf-8');
        echo '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">'
            . '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
            . '<title>404 - EduFin</title>'
            . '<style>body{font-family:\'Outfit\',system-ui,sans-serif;background:#F0F4FC;color:#0D1E3A;'
            . 'display:flex;height:100vh;align-items:center;justify-content:center;text-align:center}'
            . 'h1{font-size:3rem;margin-bottom:8px;color:#FF1E40}'
            . 'a{color:#0066FF;font-weight:600;text-decoration:none}a:hover{text-decoration:underline}</style></head><body><div>'
            . '<h1>404</h1><p style="margin-bottom:14px;color:#64748B">La página que buscas no existe.</p>'
            . '<p><a href="' . BASE_URL . '">Volver al inicio</a></p>'
            . '</div></body></html>';
    }
}
