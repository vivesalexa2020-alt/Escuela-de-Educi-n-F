<?php

declare(strict_types=1);

namespace Aplicacion\Controladores;

use DateTimeImmutable;
use Aplicacion\Nucleo\Controller;
use Aplicacion\Modelos\Gasto;
use Aplicacion\Modelos\Meta;
use Aplicacion\Modelos\Progreso;

/**
 * Controlador de datos del alumno: gastos, metas y progreso.
 *
 * Todas las acciones requieren una sesión activa y operan
 * únicamente sobre los datos del usuario autenticado.
 */
class DatosController extends Controller
{
    /** @var string[] */
    private const CATEGORIAS = [
        'Comida',
        'Transporte',
        'Entretenimiento',
        'Compras',
        'Servicios',
        'Otros',
    ];

    public function handle(): void
    {
        $usuarioId = (int) ($_SESSION['usuario']['id'] ?? 0);
        if ($usuarioId <= 0) {
            $this->json([
                'ok'          => false,
                'needs_login' => true,
                'error'       => 'Inicia sesión para guardar tus datos por estudiante.',
            ], 401);
        }

        $data = $this->input();
        $action = (string) ($data['action'] ?? ($_GET['action'] ?? ''));

        switch ($action) {
            case 'cargar':
                $this->cargar($usuarioId);
                break;
            case 'crear_gasto':
                $this->crearGasto($usuarioId, $data);
                break;
            case 'eliminar_gasto':
                $this->eliminarGasto($usuarioId, $data);
                break;
            case 'borrar_gastos':
                $this->borrarGastos($usuarioId);
                break;
            case 'crear_meta':
                $this->crearMeta($usuarioId, $data);
                break;
            case 'eliminar_meta':
                $this->eliminarMeta($usuarioId, $data);
                break;
            case 'guardar_ahorro':
                $this->guardarAhorro($usuarioId, $data);
                break;
            case 'completar_leccion':
                $this->completarLeccion($usuarioId, $data);
                break;
            case 'migrar':
                $this->migrar($usuarioId, $data);
                break;
            default:
                $this->json(['ok' => false, 'error' => 'Acción no válida.'], 400);
        }
    }

    private function cargar(int $usuarioId): void
    {
        $meta = new Meta();

        $this->json([
            'ok'        => true,
            'gastos'    => (new Gasto())->listar($usuarioId),
            'metas'     => $meta->listar($usuarioId, Meta::TIPO_META),
            'ahorro'    => $meta->obtenerAhorro($usuarioId)
                ?? ['nombre' => '', 'objetivo' => 0, 'actual' => 0],
            'lecciones' => (new Progreso())->nivelesCompletados($usuarioId),
        ]);
    }

    /** @param array<string, mixed> $data */
    private function crearGasto(int $usuarioId, array $data): void
    {
        $concepto = trim((string) ($data['concepto'] ?? ''));
        $importe = (float) ($data['importe'] ?? 0);
        $categoria = (string) ($data['categoria'] ?? 'Otros');
        $fecha = trim((string) ($data['fecha'] ?? ''));

        if ($concepto === '' || $importe <= 0 || $importe > 1000000) {
            $this->json(['ok' => false, 'error' => 'Escribe un concepto y una cantidad válida.'], 400);
        }
        if (!in_array($categoria, self::CATEGORIAS, true)) {
            $categoria = 'Otros';
        }
        if (!$this->fechaValida($fecha)) {
            $fecha = date('Y-m-d');
        }

        $gasto = (new Gasto())->crear(
            $usuarioId,
            mb_substr($concepto, 0, 80),
            $importe,
            $categoria,
            $fecha
        );

        $this->json(['ok' => true, 'gasto' => $gasto]);
    }

    /** @param array<string, mixed> $data */
    private function eliminarGasto(int $usuarioId, array $data): void
    {
        $id = (int) ($data['id'] ?? 0);
        if ($id <= 0) {
            $this->json(['ok' => false, 'error' => 'Gasto no válido.'], 400);
        }

        (new Gasto())->eliminar($usuarioId, $id);
        $this->json(['ok' => true]);
    }

    private function borrarGastos(int $usuarioId): void
    {
        (new Gasto())->borrarTodos($usuarioId);
        $this->json(['ok' => true]);
    }

    /** @param array<string, mixed> $data */
    private function crearMeta(int $usuarioId, array $data): void
    {
        $nombre = trim((string) ($data['nombre'] ?? ''));
        $objetivo = (float) ($data['objetivo'] ?? 0);
        $actual = (float) ($data['actual'] ?? 0);

        if (
            $nombre === '' ||
            $objetivo <= 0 ||
            $objetivo > 100000000 ||
            $actual < 0 ||
            $actual > 100000000
        ) {
            $this->json(['ok' => false, 'error' => 'Escribe un nombre y montos válidos.'], 400);
        }

        $meta = (new Meta())->crear(
            $usuarioId,
            mb_substr($nombre, 0, 80),
            $objetivo,
            $actual,
            Meta::TIPO_META
        );

        $this->json(['ok' => true, 'meta' => $meta]);
    }

    /** @param array<string, mixed> $data */
    private function eliminarMeta(int $usuarioId, array $data): void
    {
        $id = (int) ($data['id'] ?? 0);
        if ($id <= 0) {
            $this->json(['ok' => false, 'error' => 'Meta no válida.'], 400);
        }

        (new Meta())->eliminar($usuarioId, $id);
        $this->json(['ok' => true]);
    }

    /** @param array<string, mixed> $data */
    private function guardarAhorro(int $usuarioId, array $data): void
    {
        $nombre = trim((string) ($data['nombre'] ?? ''));
        $objetivo = (float) ($data['objetivo'] ?? 0);
        $actual = (float) ($data['actual'] ?? 0);

        if (
            $nombre === '' ||
            $objetivo <= 0 ||
            $objetivo > 100000000 ||
            $actual < 0 ||
            $actual > 100000000
        ) {
            $this->json(['ok' => false, 'error' => 'Revisa el nombre y las cantidades de tu meta.'], 400);
        }

        $ahorro = (new Meta())->guardarAhorro(
            $usuarioId,
            mb_substr($nombre, 0, 80),
            $objetivo,
            $actual
        );

        $this->json(['ok' => true, 'ahorro' => $ahorro]);
    }

    /** @param array<string, mixed> $data */
    private function completarLeccion(int $usuarioId, array $data): void
    {
        $numero = (int) ($data['numero'] ?? 0);
        if ($numero < 1 || $numero > 3) {
            $this->json(['ok' => false, 'error' => 'Lección no válida.'], 400);
        }

        $progreso = new Progreso();
        $progreso->completar($usuarioId, $numero);

        $this->json([
            'ok'        => true,
            'lecciones' => $progreso->nivelesCompletados($usuarioId),
        ]);
    }

    /**
     * Importa los datos guardados en el navegador cuando el alumno
     * crea/usa su cuenta por primera vez. No sobrescribe datos existentes.
     *
     * @param array<string, mixed> $data
     */
    private function migrar(int $usuarioId, array $data): void
    {
        $gasto = new Gasto();
        $meta = new Meta();
        $progreso = new Progreso();

        $yaTieneDatos = $gasto->listar($usuarioId) !== []
            || $meta->listar($usuarioId, Meta::TIPO_META) !== []
            || $meta->obtenerAhorro($usuarioId) !== null
            || $progreso->nivelesCompletados($usuarioId) !== [];

        if ($yaTieneDatos) {
            $this->json(['ok' => true, 'migrado' => false]);
        }

        foreach ((array) ($data['gastos'] ?? []) as $item) {
            $item = (array) $item;
            $concepto = trim((string) ($item['concepto'] ?? ''));
            $importe = (float) ($item['importe'] ?? 0);
            if ($concepto === '' || $importe <= 0 || $importe > 1000000) {
                continue;
            }
            $categoria = (string) ($item['categoria'] ?? 'Otros');
            if (!in_array($categoria, self::CATEGORIAS, true)) {
                $categoria = 'Otros';
            }
            $fecha = trim((string) ($item['fecha'] ?? ''));
            if (!$this->fechaValida($fecha)) {
                $fecha = date('Y-m-d');
            }
            $gasto->crear($usuarioId, mb_substr($concepto, 0, 80), $importe, $categoria, $fecha);
        }

        foreach ((array) ($data['metas'] ?? []) as $item) {
            $item = (array) $item;
            $nombre = trim((string) ($item['nombre'] ?? ''));
            $objetivo = (float) ($item['objetivo'] ?? 0);
            $actual = (float) ($item['actual'] ?? 0);
            if ($nombre === '' || $objetivo <= 0 || $objetivo > 100000000) {
                continue;
            }
            $meta->crear(
                $usuarioId,
                mb_substr($nombre, 0, 80),
                $objetivo,
                max(0, min($actual, 100000000)),
                Meta::TIPO_META
            );
        }

        $ahorro = (array) ($data['ahorro'] ?? []);
        $nombreAhorro = trim((string) ($ahorro['nombre'] ?? ''));
        $objetivoAhorro = (float) ($ahorro['objetivo'] ?? 0);
        if ($nombreAhorro !== '' && $objetivoAhorro > 0 && $objetivoAhorro <= 100000000) {
            $meta->guardarAhorro(
                $usuarioId,
                mb_substr($nombreAhorro, 0, 80),
                $objetivoAhorro,
                max(0, min((float) ($ahorro['actual'] ?? 0), 100000000))
            );
        }

        foreach ((array) ($data['lecciones'] ?? []) as $nivel) {
            $nivel = (int) $nivel;
            if ($nivel >= 1 && $nivel <= 3) {
                $progreso->completar($usuarioId, $nivel);
            }
        }

        $this->json(['ok' => true, 'migrado' => true]);
    }

    private function fechaValida(string $fecha): bool
    {
        $fechaObj = DateTimeImmutable::createFromFormat('Y-m-d', $fecha);

        return $fechaObj !== false && $fechaObj->format('Y-m-d') === $fecha;
    }
}
