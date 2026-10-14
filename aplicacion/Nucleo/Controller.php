<?php

declare(strict_types=1);

namespace Aplicacion\Nucleo;

/**
 * Controlador base: renderizado de vistas y respuestas JSON.
 */
abstract class Controller
{
    /**
     * Renderiza una vista dentro del layout principal.
     *
     * @param array<string, mixed> $data
     */
    protected function view(string $name, array $data = [], string $layout = 'app'): void
    {
        $base = BASE_URL;
        $active = $data['active'] ?? '';
        $title = $data['title'] ?? 'EduFin';
        $pageScripts = $data['pageScripts'] ?? [];

        extract($data, EXTR_SKIP);

        ob_start();
        require VIEW_PATH . '/paginas/' . $name . '.php';
        $content = ob_get_clean();

        require VIEW_PATH . '/plantillas/' . $layout . '.php';
    }

    /**
     * Envía una respuesta JSON y termina.
     *
     * @param array<string, mixed> $data
     */
    protected function json(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Devuelve el cuerpo de la petición ya decodificado (JSON o POST normal).
     *
     * @return array<string, mixed>
     */
    protected function input(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?: '', true);
        return is_array($data) ? $data : $_POST;
    }
}
