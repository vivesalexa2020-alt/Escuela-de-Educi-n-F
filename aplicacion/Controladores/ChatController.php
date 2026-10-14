<?php

declare(strict_types=1);

namespace Aplicacion\Controladores;

use Aplicacion\Nucleo\Controller;
use Aplicacion\Modelos\Chat;

/**
 * Controlador del asistente FinanBot.
 */
class ChatController extends Controller
{
    public function handle(): void
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            $this->json(['ok' => false, 'error' => 'Método no permitido. Solo se aceptan peticiones POST.'], 405);
        }

        $apiKey = trim((string) (defined('GEMINI_API_KEY') ? GEMINI_API_KEY : ''));
        if ($apiKey === '' || $apiKey === 'TU_API_KEY_AQUI') {
            $this->json([
                'ok' => false,
                'needs_key' => true,
                'error' => 'Aún no has configurado tu API Key. Abre config/config.php y reemplaza TU_API_KEY_AQUI con tu clave de Google Gemini.',
            ], 400);
        }

        $data = $this->input();
        $mensaje = trim((string) ($data['message'] ?? ''));

        if ($mensaje === '') {
            $this->json(['ok' => false, 'error' => 'El mensaje no puede estar vacío.'], 400);
        }

        $historial = is_array($data['history'] ?? null) ? $data['history'] : [];

        $resultado = (new Chat())->preguntar($mensaje, $historial);
        $this->json($resultado, $resultado['ok'] ? 200 : 500);
    }
}
