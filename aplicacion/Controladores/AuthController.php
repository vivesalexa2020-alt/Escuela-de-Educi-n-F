<?php

declare(strict_types=1);

namespace Aplicacion\Controladores;

use Aplicacion\Nucleo\Controller;
use Aplicacion\Modelos\Usuario;

/**
 * Controlador de autenticación de alumnos.
 */
class AuthController extends Controller
{
    public function handle(): void
    {
        $data = $this->input();
        $action = $data['action'] ?? ($_GET['action'] ?? '');

        switch ($action) {
            case 'registro':
                $this->registro($data);
                break;
            case 'login':
                $this->login($data);
                break;
            case 'recuperar':
                $this->recuperar($data);
                break;
            case 'actualizar_avatar':
                $this->actualizarAvatar($data);
                break;
            case 'check':
                $this->check();
                break;
            case 'logout':
                $this->logout();
                break;
            default:
                $this->json(['ok' => false, 'error' => 'Acción no válida.'], 400);
        }
    }

    /** @param array<string, mixed> $data */
    private function registro(array $data): void
    {
        $nombre = trim((string) ($data['nombre'] ?? ''));
        $email = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($nombre === '' || $email === '' || $password === '') {
            $this->json(['ok' => false, 'error' => 'Por favor completa todos los campos requeridos.'], 400);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->json(['ok' => false, 'error' => 'El formato del correo electrónico no es válido.'], 400);
        }
        if (strlen($password) < 6) {
            $this->json(['ok' => false, 'error' => 'La contraseña debe contener al menos 6 caracteres.'], 400);
        }

        $usuarios = new Usuario();
        if ($usuarios->buscarPorEmail($email) !== null) {
            $this->json(['ok' => false, 'error' => 'Ya existe una cuenta con este correo electrónico.'], 409);
        }

        $user = $usuarios->crear($nombre, $email, $password);
        $_SESSION['usuario'] = $user;

        $this->json(['ok' => true, 'mensaje' => '¡Cuenta creada con éxito!', 'user' => $user]);
    }

    /** @param array<string, mixed> $data */
    private function login(array $data): void
    {
        $email = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($email === '' || $password === '') {
            $this->json(['ok' => false, 'error' => 'Ingresa tu correo y contraseña.'], 400);
        }

        $usuario = (new Usuario())->buscarPorEmail($email);
        if ($usuario === null || !password_verify($password, $usuario['password'])) {
            $this->json(['ok' => false, 'error' => 'Correo o contraseña incorrectos.'], 401);
        }

        $user = [
            'id' => (int) $usuario['id'],
            'nombre' => $usuario['nombre'],
            'email' => $usuario['email'],
            'avatar' => $usuario['avatar'] ?? null,
        ];
        $_SESSION['usuario'] = $user;

        $this->json(['ok' => true, 'mensaje' => '¡Bienvenido de vuelta!', 'user' => $user]);
    }

    /** @param array<string, mixed> $data */
    private function recuperar(array $data): void
    {
        $email = trim((string) ($data['email'] ?? ''));
        $nuevaPassword = (string) ($data['password'] ?? '');

        if ($email === '' || $nuevaPassword === '') {
            $this->json(['ok' => false, 'error' => 'Por favor ingresa tu correo y la nueva contraseña.'], 400);
        }
        if (strlen($nuevaPassword) < 6) {
            $this->json(['ok' => false, 'error' => 'La nueva contraseña debe tener al menos 6 caracteres.'], 400);
        }

        $usuarios = new Usuario();
        $usuario = $usuarios->buscarPorEmail($email);
        if ($usuario === null) {
            $this->json(['ok' => false, 'error' => 'No encontramos ninguna cuenta registrada con este correo electrónico.'], 404);
        }

        $usuarios->actualizarPassword((int) $usuario['id'], $nuevaPassword);
        $this->json(['ok' => true, 'mensaje' => '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión con tu nueva contraseña.']);
    }

    /** @param array<string, mixed> $data */
    private function actualizarAvatar(array $data): void
    {
        if (empty($_SESSION['usuario'])) {
            $this->json(['ok' => false, 'error' => 'Debes iniciar sesión para cambiar tu avatar.'], 401);
        }

        $avatar = trim((string) ($data['avatar'] ?? ''));

        if ($avatar === '') {
            $avatar = null;
        } elseif (preg_match('/^icon:(fa-[a-z0-9-]+)$/', $avatar, $m)) {
            $avatar = 'icon:' . $m[1];
        } elseif (preg_match('/^built:#([0-9a-fA-F]{6}):(fa-[a-z0-9-]+)$/', $avatar, $m)) {
            $avatar = 'built:#' . strtolower($m[1]) . ':' . $m[2];
        } elseif (preg_match('/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+\/=\r\n]+$/', $avatar)) {
            if (strlen($avatar) > 1600000) {
                $this->json(['ok' => false, 'error' => 'La imagen es demasiado grande.'], 413);
            }
        } else {
            $this->json(['ok' => false, 'error' => 'El avatar proporcionado no es válido.'], 400);
        }

        (new Usuario())->actualizarAvatar((int) $_SESSION['usuario']['id'], $avatar);
        $_SESSION['usuario']['avatar'] = $avatar;

        $this->json([
            'ok' => true,
            'mensaje' => 'Avatar actualizado.',
            'avatar' => $avatar,
            'user' => $_SESSION['usuario'],
        ]);
    }

    private function check(): void
    {
        if (!empty($_SESSION['usuario'])) {
            $this->json(['ok' => true, 'logged_in' => true, 'user' => $_SESSION['usuario']]);
        }
        $this->json(['ok' => true, 'logged_in' => false]);
    }

    private function logout(): void
    {
        unset($_SESSION['usuario']);
        session_destroy();
        $this->json(['ok' => true, 'mensaje' => 'Sesión cerrada correctamente.']);
    }
}
