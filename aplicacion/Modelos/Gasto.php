<?php

declare(strict_types=1);

namespace Aplicacion\Modelos;

use Aplicacion\Nucleo\Database;
use PDO;

/**
 * Modelo de gastos hormiga (por alumno).
 */
class Gasto
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    /** @return array<int, array<string, mixed>> */
    public function listar(int $usuarioId): array
    {
        $stmt = $this->db->prepare(
            'SELECT id, concepto, importe, categoria, fecha
             FROM gastos
             WHERE usuario_id = ?
             ORDER BY fecha DESC, id DESC'
        );
        $stmt->execute([$usuarioId]);

        return array_map([$this, 'formatear'], $stmt->fetchAll());
    }

    public function crear(
        int $usuarioId,
        string $concepto,
        float $importe,
        string $categoria,
        string $fecha
    ): array {
        $stmt = $this->db->prepare(
            'INSERT INTO gastos (usuario_id, concepto, importe, categoria, fecha)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$usuarioId, $concepto, $importe, $categoria, $fecha]);

        return [
            'id'        => (int) $this->db->lastInsertId(),
            'concepto'  => $concepto,
            'importe'   => $importe,
            'categoria' => $categoria,
            'fecha'     => $fecha,
        ];
    }

    public function eliminar(int $usuarioId, int $id): bool
    {
        $stmt = $this->db->prepare(
            'DELETE FROM gastos WHERE id = ? AND usuario_id = ?'
        );
        $stmt->execute([$id, $usuarioId]);

        return $stmt->rowCount() > 0;
    }

    public function borrarTodos(int $usuarioId): void
    {
        $stmt = $this->db->prepare('DELETE FROM gastos WHERE usuario_id = ?');
        $stmt->execute([$usuarioId]);
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    private function formatear(array $row): array
    {
        return [
            'id'        => (int) $row['id'],
            'concepto'  => $row['concepto'],
            'importe'   => (float) $row['importe'],
            'categoria' => $row['categoria'],
            'fecha'     => $row['fecha'],
        ];
    }
}
