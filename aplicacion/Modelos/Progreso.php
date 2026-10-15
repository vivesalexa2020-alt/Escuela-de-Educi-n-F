<?php

declare(strict_types=1);

namespace Aplicacion\Modelos;

use Aplicacion\Nucleo\Database;
use PDO;

/**
 * Modelo del progreso académico del alumno (lecciones completadas).
 */
class Progreso
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    /** @return int[] */
    public function nivelesCompletados(int $usuarioId): array
    {
        $stmt = $this->db->prepare(
            'SELECT numero_nivel
             FROM progreso_lecciones
             WHERE usuario_id = ?
             ORDER BY numero_nivel'
        );
        $stmt->execute([$usuarioId]);

        return array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
    }

    public function completar(int $usuarioId, int $numeroNivel): void
    {
        $stmt = $this->db->prepare(
            'INSERT INTO progreso_lecciones (usuario_id, numero_nivel, completada)
             VALUES (?, ?, 1)
             ON DUPLICATE KEY UPDATE completada = 1'
        );
        $stmt->execute([$usuarioId, $numeroNivel]);
    }

    public function reiniciar(int $usuarioId): void
    {
        $stmt = $this->db->prepare('DELETE FROM progreso_lecciones WHERE usuario_id = ?');
        $stmt->execute([$usuarioId]);
    }
}
