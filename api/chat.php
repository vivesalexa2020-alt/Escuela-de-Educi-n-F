<?php
/**
 * FinanBot - Endpoint de chat con Google Gemini API
 * Proyecto: FinanzaLab
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Solo aceptar solicitudes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'error' => 'Método no permitido. Solo se aceptan peticiones POST.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Cargar la configuración
$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Falta el archivo api/config.php. Por favor créalo o copia api/config.example.php.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once $configFile;

if (!defined('GEMINI_API_KEY') || empty(trim(GEMINI_API_KEY)) || GEMINI_API_KEY === 'TU_API_KEY_AQUI') {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'needs_key' => true,
        'error' => 'Aún no has configurado tu API Key. Abre api/config.php y reemplaza TU_API_KEY_AQUI con tu clave de Google Gemini.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Leer el cuerpo de la petición JSON
$inputRaw = file_get_contents('php://input');
$input = json_decode($inputRaw, true);

if (!is_array($input) || empty(trim($input['message'] ?? ''))) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'El mensaje no puede estar vacío.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$userMessage = trim($input['message']);

// Construir historial de mensajes
$contents = [];
if (!empty($input['history']) && is_array($input['history'])) {
    foreach ($input['history'] as $item) {
        if (!empty($item['text']) && is_string($item['text'])) {
            $role = (isset($item['role']) && $item['role'] === 'model') ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [
                    ['text' => trim($item['text'])]
                ]
            ];
        }
    }
}

// Añadir el mensaje actual
$contents[] = [
    'role' => 'user',
    'parts' => [
        ['text' => $userMessage]
    ]
];

// Limitar historial a los últimos 10 mensajes para ahorrar tokens y mantener rapidez
if (count($contents) > 10) {
    $contents = array_slice($contents, -10);
}

// Instrucciones del sistema (Personalidad y conocimientos de FinanBot)
$systemInstruction = [
    'parts' => [
        [
            'text' => "Eres FinanBot, el tutor inteligente y amigable de FinanzaLab, una escuela virtual de educación financiera para principiantes.\n\n"
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
                    . "- Si te preguntan algo ajeno a finanzas personales o la escuela, responde cordialmente recordando tu función de tutor financiero y redirige al tema."
        ]
    ]
];

// Payload para Google Gemini API
$payload = [
    'system_instruction' => $systemInstruction,
    'contents' => $contents,
    'generationConfig' => [
        'temperature' => 0.7,
        'maxOutputTokens' => 800
    ]
];

$apiKey = trim(GEMINI_API_KEY);
$endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . urlencode($apiKey);

$ch = curl_init($endpoint);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_TIMEOUT => 20,
    CURLOPT_SSL_VERIFYPEER => false // Facilita compatibilidad con certificados locales en XAMPP
]);

$responseRaw = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($responseRaw === false || !empty($curlError)) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Error de conexión con el servicio de IA: ' . $curlError
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$responseData = json_decode($responseRaw, true);

if ($httpCode !== 200 || !empty($responseData['error'])) {
    $errorMsg = $responseData['error']['message'] ?? 'Error desconocido al consultar Gemini.';
    http_response_code($httpCode >= 400 ? $httpCode : 500);
    echo json_encode([
        'ok' => false,
        'error' => 'Google Gemini API error: ' . $errorMsg
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Extraer el texto generado
$reply = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? null;

if (empty($reply)) {
    echo json_encode([
        'ok' => false,
        'error' => 'No se recibió respuesta válida del modelo.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'ok' => true,
    'reply' => trim($reply)
], JSON_UNESCAPED_UNICODE);
