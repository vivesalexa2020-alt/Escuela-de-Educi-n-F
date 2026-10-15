<?php

declare(strict_types=1);

namespace Aplicacion\Modelos;

use Aplicacion\Nucleo\Database;
use PDO;

/**
 * Modelo de metas de ahorro (por alumno).
 *
 * Usa una sola tabla `metas_ahorro` con la columna `tipo`:
 *  - "meta":   metas del listado de la página Metas (varias por alumno).
 *  - "ahorro": la meta única de la página Mi ahorro.
 */
class Meta
{
    public const TIPO_AHORRO = 'ahorro';
    public const TIPO_META = 'meta';

    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    /** @return array<int, array<string, mixed>> */
    public function listar(int $usuarioId, string $tipo): array
    {
        $stmt = $this->db->prepare(
            'SELECT id, nombre, objetivo, actual
             FROM metas_ahorro
             WHERE usuario_id = ? AND tipo = ?
             ORDER BY id DESC'
        );
        $stmt->execute([$usuarioId, $tipo]);

        return array_map([$this, 'formatear'], $stmt->fetchAll());
    }

    public function crear(
        int $usuarioId,
        string $nombre,
        float $objetivo,
        float $actual,
        string $tipo
    ): array {
        $stmt = $this->db->prepare(
            'INSERT INTO metas_ahorro (usuario_id, nombre, objetivo, actual, tipo)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$usuarioId, $nombre, $objetivo, $actual, $tipo]);

        return [
            'id'       => (int) $this->db->lastInsertId(),
            'nombre'   => $nombre,
            'objetivo' => $objetivo,
            'actual'   => $actual,
        ];
    }

    public function eliminar(int $usuarioId, int $id): bool
    {
        $stmt = $this->db->prepare(
            'DELETE FROM metas_ahorro WHERE id = ? AND usuario_id = ?'
        );
        $stmt->execute([$id, $usuarioId]);

        return $stmt->rowCount() > 0;
    }

    /** @return array<string, mixed>|null */
    public function obtenerAhorro(int $usuarioId): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT id, nombre, objetivo, actual
             FROM metas_ahorro
             WHERE usuario_id = ? AND tipo = ?
             ORDER BY id DESC
             LIMIT 1'
        );
        $stmt->execute([$usuarioId, self::TIPO_AHORRO]);
        $row = $stmt->fetch();

        return $row ? $this->formatear($row) : null;
    }

    public function guardarAhorro(
        int $usuarioId,
        string $nombre,
        float $objetivo,
        float $actual
    ): array {
        $existente = $this->obtenerAhorro($usuarioId);

        if ($existente !== null) {
            $stmt = $this->db->prepare(
                'UPDATE metas_ahorro
                 SET nombre = ?, objetivo = ?, actual = ?
                 WHERE id = ? AND usuario_id = ?'
            );
            $stmt->execute([$nombre, $objetivo, $actual, $existente['id'], $usuarioId]);

            return [
                'id'       => $existente['id'],
                'nombre'   => $nombre,
                'objetivo' => $objetivo,
                'actual'   => $actual,
            ];
        }

        return $this->crear($usuarioId, $nombre, $objetivo, $actual, self::TIPO_AHORRO);
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    private function formatear(array $row): array
    {
        return [
            'id'       => (int) $row['id'],
            'nombre'   => $row['nombre'],
            'objetivo' => (float) $row['objetivo'],
            'actual'   => (float) $row['actual'],
        ];
    }
}
