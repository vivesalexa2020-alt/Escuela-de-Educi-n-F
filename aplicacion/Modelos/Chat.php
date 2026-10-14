<?php

declare(strict_types=1);

namespace Aplicacion\Modelos;

/**
 * Modelo de FinanBot: comunicación con Google Gemini.
 */
class Chat
{
    /**
     * Cadena de modelos de respaldo: si uno está saturado (503/429) o falla,
     * se intenta con el siguiente.
     *
     * @var string[]
     */
    private array $modelos = [
        'gemini-flash-lite-latest',
        'gemini-flash-latest',
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
    ];

    /**
     * @param array<int, array<string, mixed>> $historial
     * @return array{ok: bool, reply?: string, error?: string}
     */
    public function preguntar(string $mensaje, array $historial = []): array
    {
        $contents = $this->construirContenidos($mensaje, $historial);

        $payload = [
            'system_instruction' => ['parts' => [['text' => $this->instrucciones()]]],
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 800,
            ],
        ];

        $apiKey = trim((string) (defined('GEMINI_API_KEY') ? GEMINI_API_KEY : ''));
        $payloadJson = json_encode($payload);

        $responseData = null;
        $httpCode = 0;
        $curlError = '';

        foreach ($this->modelos as $modelo) {
            $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/'
                . $modelo . ':generateContent?key=' . urlencode($apiKey);

            for ($intento = 1; $intento <= 2; $intento++) {
                $ch = curl_init($endpoint);
                curl_setopt_array($ch, [
                    CURLOPT_POST => true,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                    CURLOPT_POSTFIELDS => $payloadJson,
                    CURLOPT_TIMEOUT => 25,
                    CURLOPT_SSL_VERIFYPEER => false,
                ]);

                $responseRaw = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $curlError = curl_error($ch);
                curl_close($ch);

                if ($responseRaw !== false) {
                    $responseData = json_decode($responseRaw, true);
                    if ($httpCode === 200 && !empty($responseData['candidates'])) {
                        break 2;
                    }
                }

                if ($httpCode === 503 || $httpCode === 429) {
                    usleep(1200000);
                } else {
                    break;
                }
            }
        }

        if ($responseData === null && $curlError !== '') {
            return ['ok' => false, 'error' => 'Error de conexión con el servicio de IA: ' . $curlError];
        }

        if ($httpCode !== 200 || !empty($responseData['error'])) {
            return [
                'ok' => false,
                'error' => $responseData['error']['message']
                    ?? 'El servicio de IA se encuentra ocupado en este momento. Intenta de nuevo en unos segundos.',
            ];
        }

        $reply = null;
        if (!empty($responseData['candidates'][0]['content']['parts'])) {
            foreach ($responseData['candidates'][0]['content']['parts'] as $part) {
                if (!empty($part['text'])) {
                    $reply = $part['text'];
                    break;
                }
            }
        }

        if (empty($reply)) {
            return ['ok' => false, 'error' => 'No se recibió una respuesta válida del tutor en este momento.'];
        }

        return ['ok' => true, 'reply' => trim($reply)];
    }

    /**
     * @param array<int, array<string, mixed>> $historial
     * @return array<int, array<string, mixed>>
     */
    private function construirContenidos(string $mensaje, array $historial): array
    {
        $contents = [];

        foreach ($historial as $item) {
            if (!empty($item['text']) && is_string($item['text'])) {
                $role = (isset($item['role']) && $item['role'] === 'model') ? 'model' : 'user';
                $contents[] = [
                    'role' => $role,
                    'parts' => [['text' => trim($item['text'])]],
                ];
            }
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $mensaje]],
        ];

        if (count($contents) > 10) {
            $contents = array_slice($contents, -10);
        }

        return $contents;
    }

    private function instrucciones(): string
    {
        return "Eres FinanBot, el tutor inteligente y amigable de EduFin, una escuela virtual de educación financiera para principiantes.\n\n"
            . "Tu misión es guiar a los estudiantes en temas clave:\n"
            . "1. Control de gastos hormiga y cómo identificarlos.\n"
            . "2. Hábitos de ahorro personal y metas realistas.\n"
            . "3. Presupuesto personal (regla 50/30/20, necesidades vs. deseos).\n"
            . "4. Fondo de emergencias y su importancia.\n"
            . "5. Conceptos iniciales de inversión (riesgo, rendimiento, interés compuesto).\n\n"
            . "Directrices de respuesta:\n"
            . "- Sé empático, claro, motivador y breve.\n"
            . "- Usa ejemplos de la vida diaria (comprar café, ahorrar para un celular, etc.).\n"
            . "- Respuestas concisas: máximo 2 a 3 párrafos cortos o puntos con viñetas fáciles de leer.\n"
            . "- Si te preguntan algo ajeno a finanzas personales o la escuela, responde cordialmente recordando tu función de tutor financiero y redirige al tema.";
    }
}
