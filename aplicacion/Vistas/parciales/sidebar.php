<?php
/**
 * Barra lateral con el logotipo y el menú de navegación.
 *
 * @var string $active
 * @var string $base
 */
$menu = [
    ['id' => 'inicio',        'url' => '',               'icon' => 'fa-house',          'label' => 'Inicio'],
    ['id' => 'reticula',      'url' => 'reticula',       'icon' => 'fa-graduation-cap', 'label' => 'Retícula académica'],
    ['id' => 'materiales',    'url' => 'materiales',     'icon' => 'fa-book-open',      'label' => 'Materiales'],
    ['id' => 'gastos',        'url' => 'gastos-hormiga', 'icon' => 'fa-wallet',         'label' => 'Gastos hormiga'],
    ['id' => 'ahorro',        'url' => 'mi-ahorro',      'icon' => 'fa-piggy-bank',     'label' => 'Mi ahorro'],
    ['id' => 'metas',         'url' => 'metas',          'icon' => 'fa-bullseye',       'label' => 'Metas'],
    ['id' => 'logros',        'url' => 'logros',         'icon' => 'fa-trophy',         'label' => 'Logros'],
    ['id' => 'configuracion', 'url' => 'configuracion',  'icon' => 'fa-gear',           'label' => 'Configuración'],
];
?>
    <!-- ==================== SIDEBAR ==================== -->
    <aside class="sidebar">
        <div class="logo">
            <img src="<?= $base ?>img/logo2.jpeg" alt="EduFin Logo" style="width: 40px; height: 40px; object-fit: contain; border-radius: 8px;">
            <div>EduFin<span>Escuela Financiera</span></div>
        </div>

        <ul class="menu">
            <?php foreach ($menu as $item): ?>
                <li>
                    <a href="<?= $base . $item['url'] ?>"<?= $active === $item['id'] ? ' class="active"' : '' ?>>
                        <i class="fa-solid <?= $item['icon'] ?>"></i> <?= htmlspecialchars($item['label'], ENT_QUOTES, 'UTF-8') ?>
                    </a>
                </li>
            <?php endforeach; ?>
        </ul>

        <div class="sidebar-footer">
            <i class="fa-solid fa-seedling icon-teal"></i>
            <h4>Pequeñas decisiones, grandes resultados.</h4>
            <p>Tu futuro financiero comienza aquí.</p>
        </div>

        <div class="user-profile">
            <div class="user-profile-avatar" id="sidebar-avatar"><i class="fa-solid fa-user"></i></div>
            <div class="user-info">
                <h5 id="sidebar-nombre">Hola, Usuario</h5>
                <p>Nivel 1 - Aprendiz Financiero</p>
            </div>
        </div>
    </aside>
