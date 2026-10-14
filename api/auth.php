<?php
/**
 * API de autenticación y registro de alumnos
 * Proyecto: EduFin
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

$inputRaw = file_get_contents('php://input');
$data = json_decode($inputRaw, true) ?? $_POST;

$action = $data['action'] ?? ($_GET['action'] ?? '');

switch ($action) {
    case 'registro':
        $nombre = trim($data['nombre'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (empty($nombre) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Por favor completa todos los campos requeridos.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'El formato del correo electrónico no es válido.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'La contraseña debe contener al menos 6 caracteres.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Verificar si el correo ya existe
        $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['ok' => false, 'error' => 'Ya existe una cuenta con este correo electrónico.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Cifrar la contraseña
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        // Insertar usuario
        $insert = $pdo->prepare('INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)');
        $insert->execute([$nombre, $email, $passwordHash]);
        $userId = $pdo->lastInsertId();

        $user = [
            'id' => (int)$userId,
            'nombre' => $nombre,
            'email' => $email,
            'avatar' => null
        ];

        $_SESSION['usuario'] = $user;

        echo json_encode([
            'ok' => true,
            'mensaje' => '¡Cuenta creada con éxito!',
            'user' => $user
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'login':
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Ingresa tu correo y contraseña.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $pdo->prepare('SELECT id, nombre, email, password, avatar FROM usuarios WHERE email = ?');
        $stmt->execute([$email]);
        $usuario = $stmt->fetch();

        if (!$usuario || !password_verify($password, $usuario['password'])) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Correo o contraseña incorrectos.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $user = [
            'id' => (int)$usuario['id'],
            'nombre' => $usuario['nombre'],
            'email' => $usuario['email'],
            'avatar' => $usuario['avatar'] ?? null
        ];

        $_SESSION['usuario'] = $user;

        echo json_encode([
            'ok' => true,
            'mensaje' => '¡Bienvenido de vuelta!',
            'user' => $user
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'recuperar':
        $email = trim($data['email'] ?? '');
        $nuevaPassword = $data['password'] ?? '';

        if (empty($email) || empty($nuevaPassword)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Por favor ingresa tu correo y la nueva contraseña.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (strlen($nuevaPassword) < 6) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'La nueva contraseña debe tener al menos 6 caracteres.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Verificar que el correo exista en la base de datos
        $stmt = $pdo->prepare('SELECT id, nombre FROM usuarios WHERE email = ?');
        $stmt->execute([$email]);
        $usuario = $stmt->fetch();

        if (!$usuario) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'No encontramos ninguna cuenta registrada con este correo electrónico.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Cifrar la nueva contraseña y actualizar
        $passwordHash = password_hash($nuevaPassword, PASSWORD_BCRYPT);
        $update = $pdo->prepare('UPDATE usuarios SET password = ? WHERE id = ?');
        $update->execute([$passwordHash, $usuario['id']]);

        echo json_encode([
            'ok' => true,
            'mensaje' => '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión con tu nueva contraseña.'
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'actualizar_avatar':
        if (empty($_SESSION['usuario'])) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Debes iniciar sesión para cambiar tu avatar.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $avatar = trim((string)($data['avatar'] ?? ''));

        // Permitir volver al icono por defecto
        if ($avatar === '') {
            $avatar = null;
        } elseif (preg_match('/^icon:(fa-[a-z0-9-]+)$/', $avatar, $m)) {
            // Icono de FontAwesome preestablecido
            $avatar = 'icon:' . $m[1];
        } elseif (preg_match('/^built:#([0-9a-fA-F]{6}):(fa-[a-z0-9-]+)$/', $avatar, $m)) {
            // Avatar creado en el constructor: color de fondo + icono
            $avatar = 'built:#' . strtolower($m[1]) . ':' . $m[2];
        } elseif (preg_match('/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+\/=\r\n]+$/', $avatar)) {
            // Foto subida y convertida a base64 (límite ~ 1.5 MB)
            if (strlen($avatar) > 1600000) {
                http_response_code(413);
                echo json_encode(['ok' => false, 'error' => 'La imagen es demasiado grande.'], JSON_UNESCAPED_UNICODE);
                exit;
            }
        } else {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'El avatar proporcionado no es válido.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $update = $pdo->prepare('UPDATE usuarios SET avatar = ? WHERE id = ?');
        $update->execute([$avatar, $_SESSION['usuario']['id']]);

        $_SESSION['usuario']['avatar'] = $avatar;

        echo json_encode([
            'ok' => true,
            'mensaje' => 'Avatar actualizado.',
            'avatar' => $avatar,
            'user' => $_SESSION['usuario']
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'check':
        if (!empty($_SESSION['usuario'])) {
            echo json_encode([
                'ok' => true,
                'logged_in' => true,
                'user' => $_SESSION['usuario']
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                'ok' => true,
                'logged_in' => false
            ], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'logout':
        unset($_SESSION['usuario']);
        session_destroy();
        echo json_encode([
            'ok' => true,
            'mensaje' => 'Sesión cerrada correctamente.'
        ], JSON_UNESCAPED_UNICODE);
        break;

    default:
        http_response_code(400);
        echo json_encode([
            'ok' => false,
            'error' => 'Acción no válida.'
        ], JSON_UNESCAPED_UNICODE);
        break;
}
