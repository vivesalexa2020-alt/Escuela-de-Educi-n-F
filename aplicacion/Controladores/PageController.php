<?php

declare(strict_types=1);

namespace Aplicacion\Controladores;

use Aplicacion\Nucleo\Controller;

/**
 * Controlador de páginas (vistas).
 */
class PageController extends Controller
{
    public function home(): void
    {
        $this->view('home', [
            'title' => 'EduFin - Escuela Financiera',
            'active' => 'inicio',
        ]);
    }

    public function reticula(): void
    {
        $this->view('reticula', [
            'title' => 'Retícula Académica - EduFin',
            'active' => 'reticula',
        ]);
    }

    public function materiales(): void
    {
        $this->view('materiales', [
            'title' => 'Materiales - EduFin',
            'active' => 'materiales',
        ]);
    }

    public function gastosHormiga(): void
    {
        $this->view('gastos-hormiga', [
            'title' => 'Gastos Hormiga - EduFin',
            'active' => 'gastos-hormiga',
        ]);
    }

    public function miAhorro(): void
    {
        $this->view('mi-ahorro', [
            'title' => 'Mi Ahorro - EduFin',
            'active' => 'mi-ahorro',
        ]);
    }

    public function metas(): void
    {
        $this->view('metas', [
            'title' => 'Metas - EduFin',
            'active' => 'metas',
        ]);
    }

    public function logros(): void
    {
        $this->view('logros', [
            'title' => 'Logros - EduFin',
            'active' => 'logros',
        ]);
    }

    public function configuracion(): void
    {
        $this->view('configuracion', [
            'title' => 'Configuración - EduFin',
            'active' => 'configuracion',
        ]);
    }
}
