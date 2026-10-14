<?php

declare(strict_types=1);

namespace Aplicacion\Modelos;

use Aplicacion\Nucleo\Database;
use PDO;

/**
 * Modelo de usuarios (alumnos).
 */
class Usuario
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    public function buscarPorEmail(string $email): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT id, nombre, email, password, avatar FROM usuarios WHERE email = ?'
        );
        $stmt->execute([$email]);
        $usuario = $stmt->fetch();

        return $usuario ?: null;
    }

    public function crear(string $nombre, string $email, string $password): array
    {
        $hash = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $this->db->prepare(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)'
        );
        $stmt->execute([$nombre, $email, $hash]);

        return [
            'id' => (int) $this->db->lastInsertId(),
            'nombre' => $nombre,
            'email' => $email,
            'avatar' => null,
        ];
    }

    public function actualizarPassword(int $id, string $password): void
    {
        $stmt = $this->db->prepare('UPDATE usuarios SET password = ? WHERE id = ?');
        $stmt->execute([password_hash($password, PASSWORD_BCRYPT), $id]);
    }

    public function actualizarAvatar(int $id, ?string $avatar): void
    {
        $stmt = $this->db->prepare('UPDATE usuarios SET avatar = ? WHERE id = ?');
        $stmt->execute([$avatar, $id]);
    }

    public static function verificarPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }
}
